# APEX CMMS — PM Engine Reference

This document describes the Preventive Maintenance (PM) scheduling engine used in Apex CMMS.
It is written for AI consumption: precise, complete, no filler.

---

## 1. PURPOSE

The PM engine generates Work Orders (WOs) automatically based on time elapsed (calendar) or
cumulative meter readings (horometer/horómetro). It handles scheduling, cycle tracking,
missed-interval recovery, and deduplication across concurrent open WOs.

---

## 2. KEY ENTITIES

### PmPlan
Template that defines maintenance rules for a type of equipment.
Fields relevant to the engine:
- `triggerType`: `'calendar'` | `'meter'` | `'hybrid'`
- `intervalMode`: `'fixed'` | `'floating'` (default: floating)
- `intervalValue` + `intervalUnit`: calendar cadence (e.g. 1 month, 3 months, 1 year)
- `meterIntervalValue` + `meterIntervalUnit`: meter cadence (e.g. 500 hours)
- `leadDays`: how many days before due date to generate the WO
- `criticality`: `'low'` | `'medium'` | `'high'` | `'critical'`

### PmTask
Individual checklist item belonging to a PmPlan.
Fields relevant to the engine:
- `pmPlanId`: parent plan
- `frequencyMultiplier`: integer ≥ 1. A task with multiplier=12 only fires on cycles
  where `cycleIndex % 12 === 0`. This is how annual/quarterly tasks are embedded in a
  monthly plan.

### AssetPlan
Junction between a specific Asset and a PmPlan. Tracks state for that pairing.
Fields relevant to the engine:
- `currentCycleIndex`: integer, starts at 1. The next cycle number the engine should generate.
  Updated by `recalcNextDue` after each WO completion to `completedCycleIndex + 1`.
- `nextDueDate`: ISO date string. The next calendar threshold. Updated after each completion.
- `nextDueMeter`: numeric. The next meter threshold. Updated after each completion.
- `measurementPointId`: links to the MeasurementPoint (horómetro) for this asset.
- `lastCompletedAt`: ISO datetime of last WO completion.
- `woCount`: total WOs generated for this plan.
- `active`: boolean. Inactive plans are ignored by the engine entirely.

### MeasurementPoint
Represents a sensor or horómetro attached to an asset.
Fields relevant to the engine:
- `currentValue`: latest known cumulative reading.
- `isCumulative`: true for horómetros (always increasing). The engine only uses
  cumulative points for PM scheduling.

### WorkOrder (WO)
Generated output of the engine.
Fields relevant to the engine:
- `assetPlanId`: links back to the AssetPlan that generated it.
- `pmCycleIndex`: the `effectiveCycle` value at the time of generation. Used by
  `recalcNextDue` to detect cycle jumps.
- `status`: `'open'` | `'assigned'` | `'in_progress'` | `'on_hold'` | `'completed'` |
  `'cancelled'`. Terminal statuses: `completed`, `cancelled`.
- `completedMeterValue`: snapshot of the horómetro reading at the moment the technician
  closed the WO. Immutable historical fact.

---

## 3. TRIGGER TYPES

### calendar
WO fires when `nextDueDate` falls within the scheduling horizon (today + horizonDays)
or is already overdue.

### meter
WO fires when `MeasurementPoint.currentValue >= AssetPlan.nextDueMeter`.

### hybrid
WO fires when EITHER calendar OR meter condition is true — whichever comes first.
Both dimensions are evaluated independently. If meter fires, due dates use today.
If only calendar fires, the calendar date is used.

---

## 4. INTERVAL MODES

### floating (default)
After WO completion, the next threshold is calculated from the actual completion value:
- Meter: `nextDueMeter = completionMeterReading + meterIntervalValue`
- Calendar: `nextDueDate = completedAt + interval`

The schedule "drifts" to always be exactly one interval after the last service.
Resilient to cycle jumps — no cascade risk.

### fixed
After WO completion, the next threshold advances from the previous scheduled threshold:
- Meter: `nextDueMeter = prevNextDueMeter + cyclesConsumed * meterIntervalValue`
- Calendar: `nextDueDate = prevNextDueDate + cyclesConsumed * interval`

Maintains rigid 100/200/300h or Jan/Feb/Mar cadence regardless of when service was done.
`cyclesConsumed` accounts for cycle jumps (see Section 6) — without it, fixed mode would
cascade (generate N WOs in a row until thresholds clear the current value).

---

## 5. CYCLE INDEX AND TASK MODULAR ARITHMETIC

Every AssetPlan maintains `currentCycleIndex` (starts at 1, increments after each WO).

Each PmTask has `frequencyMultiplier`. A task fires on cycle `c` when:
  `c % task.frequencyMultiplier === 0`

Example — plan with tasks:
  Task A: frequencyMultiplier=1  (fires every cycle)
  Task B: frequencyMultiplier=3  (fires every 3rd cycle: 3, 6, 9, 12...)
  Task C: frequencyMultiplier=12 (fires every 12th cycle: 12, 24, 36...)

Cycle 1:  [A]
Cycle 3:  [A, B]
Cycle 12: [A, B, C]  ← annual inspection

This allows one PmPlan to embed monthly, quarterly, and annual maintenance in a single
cadence without creating separate plans.

### Cycle weight
`calcCycleWeight(planTasks, cycleIndex)` = max frequencyMultiplier among tasks that fire
at `cycleIndex`. A cycle with only multiplier-1 tasks has weight 1. A cycle-12 with the
annual task has weight 12. Weight is used for anti-stacking comparison.

---

## 6. EFFECTIVE CYCLE (MISSED INTERVAL RECOVERY)

`calcEffectiveCycleIndex(assetPlan, plan, today, currentMeterValue, planTasks)` returns
the cycle the engine SHOULD generate — not necessarily `currentCycleIndex`.

When a WO is left open for an extended period, or maintenance is delayed, multiple
intervals may have elapsed. The engine must not blindly use `currentCycleIndex` because
that could skip a heavier maintenance cycle (e.g. the annual x12).

### Algorithm

1. Compute `base = currentCycleIndex`.

2. For meter/hybrid plans: check meter overshoot.
   `overshoot = currentMeterValue - nextDueMeter`
   If `overshoot > 0`:
     `maxCycle = base + floor(overshoot / meterIntervalValue)`
     Return `heaviestCycleInRange(planTasks, base, maxCycle)`.
   If `overshoot <= 0` and triggerType is `'meter'`: return `base`.
   If `overshoot <= 0` and triggerType is `'hybrid'`: fall through to calendar scan.

3. For calendar/hybrid plans: check calendar overshoot.
   `daysPast = today - nextDueDate`
   If `daysPast > 0`:
     `maxCycle = base + floor(daysPast / intervalDays)`
     Return `heaviestCycleInRange(planTasks, base, maxCycle)`.

4. Return `base` (no overshoot in any dimension).

### heaviestCycleInRange(planTasks, from, to)
Scans cycles [from..to] inclusive. Returns the cycle with the highest `calcCycleWeight`.
On ties (equal weight), prefers the **latest** cycle (most overdue critical event).

Example: range [1..13], tasks with multipliers 1, 3, 12.
  Cycle 12 has weight 12 (annual fires).
  Cycle 13 has weight 1 (only monthly fires).
  → Returns 12, not 13. The annual inspection is not skipped.

### cyclesConsumed (fixed mode)
When `effectiveCycle > currentCycleIndex`, the engine "jumped" across multiple cycles.
For fixed mode, thresholds must advance by all consumed intervals:
  `cyclesConsumed = completedCycleIndex - currentCycleIndex + 1`
  (equals 1 for normal single-step completions — no behavioral change in that case)

---

## 7. HIERARCHICAL ANTI-STACKING

Before generating a new WO, the engine checks for an existing open WO for the same
AssetPlan.

```
existingOpenWo = workOrders.find(w => w.assetPlanId === assetPlan.id && !TERMINAL_STATUS)
```

If found:
- Compare `existingWeight = calcCycleWeight(planTasks, existingCycle)`
         `newWeight      = calcCycleWeight(planTasks, effectiveCycle)`

- If `newWeight <= existingWeight`: BLOCK. Pure duplicate or lighter cycle. Skip.
- If `newWeight > existingWeight`: SUPERSEDE. The heavier cycle absorbs the open WO.
  The existing WO is cancelled (`status='cancelled'`) and an audit comment is written.
  The heavier WO is generated.

TERMINAL_STATUSES = `['completed', 'cancelled', 'cancelled_superseded']`

Supersession audit comment format (written to `wo_comments`):
  "SISTEMA — Supersesión por mantenimiento mayor: Ciclo {new} (peso {newW}) absorbió
   Ciclo {old} (peso {oldW}). Mantenimiento mayor generado automáticamente."

---

## 8. SCHEDULER FLOW (runScheduler)

Called with `horizonDays: number`. Iterates all active AssetPlans.

For each AssetPlan:

  Step 1 — Trigger evaluation
    `calendarFires = evalCalendarTrigger(assetPlan, plan, today, horizon)`
    `meterFires    = evalMeterTrigger(assetPlan, plan, currentMeterValue)`
    If neither fires → skip.

  Step 2 — Build task list
    `planTasks = pmTasks.filter(t => t.pmPlanId === plan.id)`

  Step 3 — Effective cycle
    `effectiveCycle = calcEffectiveCycleIndex(assetPlan, plan, today, currentMeter, planTasks)`

  Step 4a — Candidate tasks (modular arithmetic)
    `candidateTasks = planTasks.filter(t => effectiveCycle % t.frequencyMultiplier === 0)`
    If empty → skip. (No tasks fire at this cycle — unusual, but safe to skip.)

  Step 4b — Anti-stacking
    Check for existing open WO. Block or supersede as described in Section 7.

  Step 5 — Build WO
    Priority from plan.criticality.
    `scheduledDate` = nextDueDate - leadDays (or today if meter-triggered hybrid).
    `dueDate`       = nextDueDate (or today if meter-triggered hybrid).
    `pmCycleIndex`  = effectiveCycle.
    `generatedFromMeter` = snapped meter target if meterFires.

Returns `{ generated: GeneratedWo[], skipped: string[], superseded: SupersededAction[] }`.
The caller (`runPmScheduler` in slice.ts) persists generated WOs to DB and applies
supersessions before inserting.

---

## 9. recalcNextDue FLOW

Implementation status:
- `recalcNextDue` still exists in `src/modules/pm/store/slice.ts` as a store method/helper.
- For normal PM closure, `src/modules/workorders/store/slice.ts::completeWo` computes the next thresholds before closure and persists them through the RPC `fn_complete_pm_wo_tx`.
- Do NOT reintroduce the old pattern: close `work_orders` first, then call `recalcNextDue` in a `try/catch`. That can leave a completed WO with a stale `asset_plans` row.
- The atomic closure RPC lives in `schema.sql` and `migration_complete_pm_wo_tx.sql`.

Called after a WO is closed. Updates AssetPlan thresholds and triggers the next WO.

Signature: `recalcNextDue(assetPlanId, completedAt, meterValue?, completedCycleIndex?)`
  - `completedCycleIndex` = `wo.pmCycleIndex` (the cycle the closed WO was generated for).
    Undefined for manually created WOs — falls back to `currentCycleIndex`.

Steps:

  1. Compute `nextBase = completedCycleIndex + 1` (next cycle after the one just completed).
     `currentCycleIndex` is set to `nextBase`.

  2. Compute `cyclesConsumed` (fixed mode only):
     `cyclesConsumed = max(1, completedCycleIndex - currentCycleIndex + 1)`
     For floating mode: always 1.

  3. Calendar update (if triggerType is calendar or hybrid):
     `nextDueDate = calcNextDueDate(plan, assetPlan, completedAt, cyclesConsumed)`
     - Fixed: `base = prevNextDueDate`, advance by `interval * cyclesConsumed`.
     - Floating: `base = completedAt`, advance by `interval * 1`.

  4. Meter update (if triggerType is meter or hybrid):
     - Fixed: `nextDueMeter = prevNextDueMeter + cyclesConsumed * meterIntervalValue`.
     - Floating: `nextDueMeter = completionMeterValue + meterIntervalValue`.

  5. Persist updates to `asset_plans`.

  6. Meter catch-up: if `currentMeterValue >= new nextDueMeter`, run scheduler immediately
     (horizonDays=0). Only if no open WO already exists for this plan.

  7. Calendar auto-trigger: if next_due_date was updated, run scheduler with
     `horizonDays = intervalDays + leadDays`. Only if no open WO already exists.

CURRENT IMPLEMENTATION NOTE (supersedes the legacy note below):
  `completeWo` should call `fn_complete_pm_wo_tx` for PM closures. The RPC closes the
  WO and updates `asset_plans` in one transaction. After that, refresh
  `fetchWorkOrders()` and `fetchPmData()`, then run any scheduler catch-up.

IMPORTANT — legacy warning:
  Older code paths required `fetchWorkOrders()` before `recalcNextDue` because the
  open-WO guard read stale state. Current PM closure avoids that partial-write risk by
  using `fn_complete_pm_wo_tx` first, then refreshing state before scheduler catch-up.

---

## 10. AUTO-TRIGGER RULES SUMMARY

| Plan type     | Trigger condition            | horizonDays used         |
|---------------|------------------------------|--------------------------|
| meter         | currentValue >= nextDueMeter | 0 (immediate)            |
| hybrid-meter  | currentValue >= nextDueMeter | 0 (immediate)            |
| calendar      | always after completion      | intervalDays + leadDays  |
| hybrid-cal    | always after completion      | intervalDays + leadDays  |

Both triggers only fire if no open WO already exists for the same AssetPlan.

---

## 11. FILE LOCATIONS

| File                                        | Role                                         |
|---------------------------------------------|----------------------------------------------|
| src/modules/pm/store/pmEngine.ts            | Pure scheduling logic, no DB calls           |
| src/modules/pm/store/slice.ts               | Zustand slice: DB persistence, recalcNextDue |
| src/modules/workorders/store/slice.ts       | completeWo, fetchWorkOrders                  |
| src/modules/workorders/components/WoCompleteForm.tsx | Closure form, meter reading input   |
| src/modules/pm/types.ts                     | PmPlan, AssetPlan, MeasurementPoint types    |
| src/modules/workorders/types.ts             | WorkOrder, CompletePayload types             |
| schema.sql                                  | DB schema including asset_plans, work_orders |
| migration_complete_pm_wo_tx.sql            | Idempotent RPC migration for atomic PM closure |
| migration_completed_meter_value.sql        | Adds `work_orders.completed_meter_value` |

Key exported functions from pmEngine.ts:
  - `runScheduler(input, horizonDays)` → SchedulerResult
  - `calcNextDueDate(plan, assetPlan, completedAt?, cyclesConsumed?)` → ISO string
  - `computePlanStatus(plan, assetPlan, currentPointValue)` → PlanStatus (UI helper)

---

## 12. KNOWN INVARIANTS

- `currentCycleIndex` starts at 1 and only ever increases.
- A closed WO's `pmCycleIndex` is immutable — it records what cycle was serviced.
- `completedMeterValue` on a WO is immutable — the horómetro reading at closure time.
- Fixed mode thresholds must always be in the future after recalcNextDue. If they are
  not (meter catch-up scenario), the scheduler fires immediately and re-evaluates.
- The engine never deletes asset_plan rows. Deactivation (`active=false`) is the only
  way to stop a plan.
- Anti-stacking weight comparison: `newWeight > existingWeight` to supersede (strictly
  greater). Equal weight blocks — avoids superseding a WO with an identical one.
- `heaviestCycleInRange` uses `>=` (not `>`) on ties so that the latest cycle in a
  tie-range is preferred. This correctly handles the case where two adjacent cycles have
  the same max multiplier — the more overdue one is chosen.

---

## 13. COMMON EDGE CASES

### New AssetPlan with no nextDueMeter/nextDueDate
`evalCalendarTrigger` returns true if `nextDueDate` is null (generate immediately).
`evalMeterTrigger` computes a synthetic target from the current reading if `nextDueMeter`
is null. After the first WO is generated, the scheduler persists computed values to
`asset_plans` so future runs have a concrete threshold.

### Manual WO completion (no pmCycleIndex)
`completeWo` passes `wo.pmCycleIndex ?? undefined`. If undefined, `recalcNextDue`
falls back to `assetPlan.currentCycleIndex` for both `nextBase` and `cyclesConsumed`.
`cyclesConsumed` evaluates to 1. Behavior is identical to a normal single-step completion.

### Hybrid plan — meter fires but calendar does not
`calcEffectiveCycleIndex` enters the meter dimension branch, finds overshoot > 0, returns
`heaviestCycleInRange` result. Calendar dimension is not evaluated (meter already resolved
the effective cycle). The WO due date is set to today.

### Hybrid plan — calendar fires but meter does not
`calcEffectiveCycleIndex`: meter branch finds overshoot <= 0, does NOT return early
(only pure `meter` plans return early here). Falls through to calendar dimension scan.
Calendar range `[base..maxCycle]` is scanned for the heaviest cycle. This ensures a
skipped annual x12 is detected even when the equipment has low meter usage.

### Cycle jump — e.g. 12 months missed on a monthly plan
`calcEffectiveCycleIndex` returns cycle 12 (annual) instead of cycle 13 (routine),
because `heaviestCycleInRange([1..13])` finds weight 12 at cycle 12 vs weight 1 at 13.
`recalcNextDue` sets `cyclesConsumed=12`. Fixed mode advances thresholds by 12 intervals,
placing the next threshold past the current values. No cascade.

### Fixed mode meter catch-up after normal completion
After closing a WO normally (no jump), `cyclesConsumed=1`. Fixed meter: new threshold =
prevThreshold + 1*interval. If the current meter reading is already past that threshold
(e.g. technician delayed reporting), the catch-up fires once, generating the next WO.
That WO's threshold will again be + 1*interval. This continues in O(missed cycles) steps
— but each step generates one WO and requires one completion, so it is not a cascade.
