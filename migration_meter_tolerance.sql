-- ── pm_meter_tolerance ────────────────────────────────────────────────────────
-- Configurable grace window for meter-triggered work orders.
-- scheduledOffsetDays: days after trigger for scheduled_date (0 = same day)
-- dueOffsetDays:       days after trigger for due_date (tolerance window)

CREATE TABLE IF NOT EXISTS public.pm_meter_tolerance (
  criticality           TEXT PRIMARY KEY
                          CHECK (criticality IN ('critical','high','medium','low')),
  scheduled_offset_days INTEGER NOT NULL DEFAULT 0 CHECK (scheduled_offset_days >= 0),
  due_offset_days       INTEGER NOT NULL DEFAULT 7  CHECK (due_offset_days >= 1),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pm_meter_tolerance DISABLE ROW LEVEL SECURITY;

-- Seed defaults (upsert so re-running is safe)
INSERT INTO public.pm_meter_tolerance (criticality, scheduled_offset_days, due_offset_days)
VALUES
  ('critical', 0,  2),
  ('high',     0,  5),
  ('medium',   0, 14),
  ('low',      0, 30)
ON CONFLICT (criticality) DO NOTHING;
