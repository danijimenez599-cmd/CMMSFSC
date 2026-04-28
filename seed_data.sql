-- ================================================================
-- APEX CMMS — SEED DE PRUEBAS MANUAL v2
-- Cobertura: 52 escenarios de calendario / medidor / híbrido,
--            anti-stacking, supersesión, multi-ciclo, tolerancias,
--            proyecciones con y sin projectedDate, flujo Kanban.
--
-- ▶ Instrucciones
--   1. Ejecuta este script completo en Supabase SQL Editor.
--   2. Abre la app y ve a PM → Configuración → Ejecutar Motor.
--   3. Si tu sesión de usuario desaparece después de la limpieza:
--        INSERT INTO public.profiles (id, full_name, role)
--        SELECT id, email, 'admin' FROM auth.users
--        ON CONFLICT (id) DO NOTHING;
--
-- ▶ Qué genera el motor al ejecutar (con horizonte ~30 días)
--   ✔ COMP-01  → OT ciclo 7  (bloqueado: ya hay OT abierta ciclo 6)
--   ✔ MOT-01   → OT ciclo 2  (meter dispara, due = hoy+2 días, critical)
--   ✔ CAL-01   → OT ciclo 3  (vencido 70d, multi-ciclo, x3 tarea más pesada)
--   ✔ TOW-01   → OT ciclo 1  (híbrido, solo calendario dispara)
--   ✔ CHIL-01  → OT ciclo 1  (híbrido, solo medidor dispara)
--   ✗ GEN-01   → skipped     (480 < 500, medidor no llegó)
--   ✗ FIL-01   → skipped     (bloqueado: OT abierta mismo peso)
--   ✗ VEN-01   → skipped     (fecha a 90 días, fuera del horizonte)
--   ✔ BWA-01   → OT ciclo 2  (supersede OT ciclo 1: peso 2 > peso 1)
-- ================================================================

-- ── LIMPIEZA (respetar FK: hijos antes que padres) ────────────────
DELETE FROM public.stock_movements;
DELETE FROM public.part_usages;
DELETE FROM public.inventory_items;
DELETE FROM public.wo_comments;
DELETE FROM public.wo_tasks;
DELETE FROM public.work_orders;
DELETE FROM public.asset_plans;
DELETE FROM public.pm_tasks;
DELETE FROM public.pm_plans;
DELETE FROM public.meter_readings;
DELETE FROM public.measurement_points;
DELETE FROM public.measurement_configs;
DELETE FROM public.vendors;
DELETE FROM public.assets;
DELETE FROM public.profiles;

-- ── 1. PERFILES ──────────────────────────────────────────────────
INSERT INTO public.profiles (id, full_name, email, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Administrador APEX',   'admin@apex.dev',       'admin'),
  ('00000000-0000-0000-0000-000000000002', 'Carlos Pérez',         'carlos@apex.dev',      'technician'),
  ('00000000-0000-0000-0000-000000000003', 'María González',       'maria@apex.dev',       'supervisor');

-- ── 2. JERARQUÍA DE ACTIVOS ──────────────────────────────────────
-- Planta raíz
INSERT INTO public.assets (id, name, code, asset_type, criticality, status) VALUES
  ('10000000-0000-0000-0000-000000000000', 'Planta Norte', 'PLT-01', 'plant', 'high', 'active');

-- Áreas (parent = planta)
INSERT INTO public.assets (id, name, code, asset_type, criticality, status, parent_id) VALUES
  ('10000000-0000-0000-0000-000000000001', 'Área Producción', 'ARE-PROD', 'area', 'high',   'active', '10000000-0000-0000-0000-000000000000'),
  ('10000000-0000-0000-0000-000000000002', 'Área Servicios',  'ARE-SERV', 'area', 'medium', 'active', '10000000-0000-0000-0000-000000000000');

-- Equipos en Producción
INSERT INTO public.assets (id, name, code, asset_type, criticality, status, parent_id) VALUES
  -- ESC 1/4/24  Calendar fires within lead window; cycle=6 → x3 también dispara (isMajor)
  ('20000000-0000-0000-0000-000000000001', 'Compresor Atlas GA-30',      'COMP-01', 'equipment', 'high',   'active', '10000000-0000-0000-0000-000000000001'),
  -- ESC 6/18    Meter fires (2050 ≥ 2000); plan criticality=critical → due = hoy+2 d
  ('20000000-0000-0000-0000-000000000002', 'Motor Principal Extrusora',  'MOT-01',  'equipment', 'high',   'active', '10000000-0000-0000-0000-000000000001'),
  -- ESC 2/16    Calendar OVERDUE 70 d; multi-ciclo: efectivo=3, x3 más pesado que x1
  ('20000000-0000-0000-0000-000000000003', 'Caldera Industrial B-02',    'CAL-01',  'equipment', 'high',   'active', '10000000-0000-0000-0000-000000000001'),
  -- ESC 10/32   Hybrid: solo calendario dispara (meter=1500 < 2000)
  ('20000000-0000-0000-0000-000000000004', 'Torre de Enfriamiento',      'TOW-01',  'equipment', 'medium', 'active', '10000000-0000-0000-0000-000000000001');

-- Equipos en Servicios
INSERT INTO public.assets (id, name, code, asset_type, criticality, status, parent_id) VALUES
  -- ESC 7/27    Meter NOT fired (480 < 500); 2 lecturas → projectedDate computable (~63 días)
  ('20000000-0000-0000-0000-000000000005', 'Generador de Emergencia',    'GEN-01',  'equipment', 'high',   'active', '10000000-0000-0000-0000-000000000002'),
  -- ESC 13      Meter fires (520 ≥ 500); OT abierta mismo peso → BLOQUEADO
  ('20000000-0000-0000-0000-000000000006', 'Filtro Secundario',          'FIL-01',  'equipment', 'high',   'active', '10000000-0000-0000-0000-000000000002'),
  -- ESC 3       Calendar far future (+90 d, lead=0) → NO genera con horizonte normal
  ('20000000-0000-0000-0000-000000000007', 'Ventilador Industrial',      'VEN-01',  'equipment', 'low',    'active', '10000000-0000-0000-0000-000000000002'),
  -- ESC 11/30   Hybrid: solo medidor fires (1100 ≥ 1000); calendario a +10 meses; delta=0 → projectedDate=null
  ('20000000-0000-0000-0000-000000000008', 'Chiller Secundario',         'CHIL-01', 'equipment', 'medium', 'active', '10000000-0000-0000-0000-000000000002'),
  -- ESC 14      Meter fires con overshoot → ciclo efectivo=2 (peso 2); OT abierta ciclo 1 (peso 1) → SUPERSEDE
  ('20000000-0000-0000-0000-000000000009', 'Bomba de Agua Industrial',   'BWA-01',  'equipment', 'medium', 'active', '10000000-0000-0000-0000-000000000002');

-- ── 3. CONFIGURACIONES DE MEDICIÓN ──────────────────────────────
INSERT INTO public.measurement_configs (id, name, unit, is_cumulative) VALUES
  ('30000000-0000-0000-0000-000000000001', 'Horas de Operación', 'hrs', true),
  ('30000000-0000-0000-0000-000000000002', 'Temperatura',        '°C',  false);

-- ── 4. PUNTOS DE MEDICIÓN ────────────────────────────────────────
INSERT INTO public.measurement_points
  (id, asset_id, config_id, name, unit, current_value) VALUES
  -- MOT-01 : 2050 ≥ umbral 2000  → DISPARA
  ('40000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001',
   'Horómetro Motor',     'hrs', 2050),
  -- GEN-01 : 480  < umbral 500   → NO dispara; 2 lecturas → projectedDate válido
  ('40000000-0000-0000-0000-000000000002',
   '20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001',
   'Horómetro Generador', 'hrs', 480),
  -- TOW-01 : 1500 < umbral 2000  → NO dispara (híbrido, solo calendario)
  ('40000000-0000-0000-0000-000000000003',
   '20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001',
   'Horómetro Torre',     'hrs', 1500),
  -- FIL-01 : 520  ≥ umbral 500   → DISPARA (pero bloqueado por OT abierta)
  ('40000000-0000-0000-0000-000000000004',
   '20000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001',
   'Horómetro Filtro',    'hrs', 520),
  -- CHIL-01: 1100 ≥ umbral 1000  → DISPARA (híbrido, solo medidor; delta=0 → projectedDate=null)
  ('40000000-0000-0000-0000-000000000005',
   '20000000-0000-0000-0000-000000000008', '30000000-0000-0000-0000-000000000001',
   'Horómetro Chiller',   'hrs', 1100),
  -- BWA-01 : 1100 ≥ umbral 500   → DISPARA con overshoot → ciclo efectivo = 2
  ('40000000-0000-0000-0000-000000000006',
   '20000000-0000-0000-0000-000000000009', '30000000-0000-0000-0000-000000000001',
   'Horómetro Bomba',     'hrs', 1100);

-- ── 5. LECTURAS HISTÓRICAS ────────────────────────────────────────

-- MOT-01: delta=170 h en 30 días → tasa≈5.7 h/día. 2 lecturas → projectedDate computable.
INSERT INTO public.meter_readings (point_id, value, created_at) VALUES
  ('40000000-0000-0000-0000-000000000001', 1880, NOW() - INTERVAL '30 days'),
  ('40000000-0000-0000-0000-000000000001', 2050, NOW());

-- GEN-01: delta=240 h en 30 días → tasa=8 h/día.
--   projections.ts arranca desde nextDueMeter-interval=0, gap=500 h → ~63 días proyectados.
INSERT INTO public.meter_readings (point_id, value, created_at) VALUES
  ('40000000-0000-0000-0000-000000000002', 240, NOW() - INTERVAL '30 days'),
  ('40000000-0000-0000-0000-000000000002', 480, NOW());

-- CHIL-01: delta=0 → projectedDate=null (ESC-30: equipo en stand-by, sin consumo registrado).
INSERT INTO public.meter_readings (point_id, value, created_at) VALUES
  ('40000000-0000-0000-0000-000000000005', 1100, NOW() - INTERVAL '15 days'),
  ('40000000-0000-0000-0000-000000000005', 1100, NOW());

-- FIL-01: solo 1 lectura → projectedDate=null (ESC-30: datos insuficientes).
INSERT INTO public.meter_readings (point_id, value, created_at) VALUES
  ('40000000-0000-0000-0000-000000000004', 380, NOW() - INTERVAL '20 days');

-- ── 6. PLANES PM ─────────────────────────────────────────────────

-- ── PLAN-A: Rutina Mensual ─────────────────────────────────────
-- calendar · high · lead=14 d
-- Tareas: x1 (cada ciclo), x3 (trimestral), x12 (anual)
-- Ciclo 6 (COMP-01): x1+x3 disparan → isMajor=true
-- Proyección ciclo 12: x1+x3+x12 → revisión anual
INSERT INTO public.pm_plans
  (id, name, trigger_type, interval_value, interval_unit, interval_mode, lead_days, criticality) VALUES
  ('50000000-0000-0000-0000-000000000001',
   'Rutina Mensual', 'calendar', 1, 'months', 'fixed', 14, 'high');
INSERT INTO public.pm_tasks (pm_plan_id, description, sort_order, frequency_multiplier) VALUES
  ('50000000-0000-0000-0000-000000000001', 'Inspección visual y limpieza general',           0, 1),
  ('50000000-0000-0000-0000-000000000001', 'Cambio de filtros y lubricación (trimestral)',    1, 3),
  ('50000000-0000-0000-0000-000000000001', 'Revisión integral y calibración anual',           2, 12);

-- ── PLAN-B: Revisión Mensual Caldera ──────────────────────────
-- calendar · high · lead=0
-- ESC 2/16: next_due hace 70 días → multi-ciclo detectado.
--   daysPast=70, interval≈30 d → maxCycle=base+2=3.
--   heaviestCycle([1,3]): ciclo 3 tiene tarea x3 (peso 3) vs x1 (peso 1) → efectivo=3.
INSERT INTO public.pm_plans
  (id, name, trigger_type, interval_value, interval_unit, interval_mode, lead_days, criticality) VALUES
  ('50000000-0000-0000-0000-000000000002',
   'Revisión Mensual Caldera', 'calendar', 1, 'months', 'fixed', 0, 'high');
INSERT INTO public.pm_tasks (pm_plan_id, description, sort_order, frequency_multiplier) VALUES
  ('50000000-0000-0000-0000-000000000002', 'Verificación de válvulas y presostatos',          0, 1),
  ('50000000-0000-0000-0000-000000000002', 'Análisis de gases de combustión (trimestral)',     1, 3);

-- ── PLAN-C: Servicio 1000 h Motor ─────────────────────────────
-- meter · critical · x1+x2
-- ESC 6/18: current=2050 ≥ 2000 → dispara. Ciclo 2 → x1+x2 activos (isMajor).
-- due_date = hoy + 2 días (tolerancia critical).
INSERT INTO public.pm_plans
  (id, name, trigger_type, meter_interval_value, meter_interval_unit, criticality) VALUES
  ('50000000-0000-0000-0000-000000000003',
   'Servicio 1000h Motor', 'meter', 1000, 'hrs', 'critical');
INSERT INTO public.pm_tasks (pm_plan_id, description, sort_order, frequency_multiplier) VALUES
  ('50000000-0000-0000-0000-000000000003', 'Lubricación y cambio de aceite',                  0, 1),
  ('50000000-0000-0000-0000-000000000003', 'Alineamiento láser y balanceo (x2000 h)',         1, 2);

-- ── PLAN-D: Servicio 500 h Generador ──────────────────────────
-- meter · critical · x1+x3
-- ESC 7/27: current=480 < 500 → NO dispara. Proyecciones visibles con projectedDate ~63 d.
-- Ciclo 3 en proyecciones: x1+x3 → isMajor.
INSERT INTO public.pm_plans
  (id, name, trigger_type, meter_interval_value, meter_interval_unit, criticality) VALUES
  ('50000000-0000-0000-0000-000000000004',
   'Servicio 500h Generador', 'meter', 500, 'hrs', 'critical');
INSERT INTO public.pm_tasks (pm_plan_id, description, sort_order, frequency_multiplier) VALUES
  ('50000000-0000-0000-0000-000000000004', 'Cambio de aceite y filtros',                      0, 1),
  ('50000000-0000-0000-0000-000000000004', 'Inspección mayor de alternador (x1500 h)',        1, 3);

-- ── PLAN-E: Servicio 500 h Filtro ─────────────────────────────
-- meter · high · x1 únicamente → peso siempre 1
-- ESC 13: fires (520 ≥ 500) pero OT abierta ciclo 1 (mismo peso) → BLOQUEADO.
INSERT INTO public.pm_plans
  (id, name, trigger_type, meter_interval_value, meter_interval_unit, criticality) VALUES
  ('50000000-0000-0000-0000-000000000005',
   'Servicio 500h Filtro', 'meter', 500, 'hrs', 'high');
INSERT INTO public.pm_tasks (pm_plan_id, description, sort_order, frequency_multiplier) VALUES
  ('50000000-0000-0000-0000-000000000005', 'Limpieza y retrolavado de membranas',             0, 1);

-- ── PLAN-F: Mantenimiento Torre 3 m / 2000 h ──────────────────
-- hybrid · medium · lead=0
-- ESC 10/32: next_due a -1 d (pasado reciente) → calendario dispara; meter=1500 < 2000 → no.
-- Solo la dimensión calendario activa → meterTriggered=false → fechas de calendario.
INSERT INTO public.pm_plans
  (id, name, trigger_type,
   interval_value, interval_unit,
   meter_interval_value, meter_interval_unit,
   lead_days, criticality) VALUES
  ('50000000-0000-0000-0000-000000000006',
   'Mantenimiento Torre 3m/2000h', 'hybrid',
   3, 'months', 2000, 'hrs', 0, 'medium');
INSERT INTO public.pm_tasks (pm_plan_id, description, sort_order, frequency_multiplier) VALUES
  ('50000000-0000-0000-0000-000000000006', 'Limpieza de boquillas y relleno',                 0, 1),
  ('50000000-0000-0000-0000-000000000006', 'Inspección estructural y pintura (x2)',           1, 2);

-- ── PLAN-G: Revisión Bimestral Ventilador ─────────────────────
-- calendar · low · lead=0
-- ESC 3: next_due = hoy + 90 días; sin lead → leadDate=+90 → fuera del horizonte normal → NO genera.
INSERT INTO public.pm_plans
  (id, name, trigger_type, interval_value, interval_unit, lead_days, criticality) VALUES
  ('50000000-0000-0000-0000-000000000007',
   'Revisión Bimestral Ventilador', 'calendar', 2, 'months', 0, 'low');
INSERT INTO public.pm_tasks (pm_plan_id, description, sort_order, frequency_multiplier) VALUES
  ('50000000-0000-0000-0000-000000000007', 'Inspección de aspas y sistema de transmisión',   0, 1);

-- ── PLAN-H: Mantenimiento Chiller 12 m / 1000 h ───────────────
-- hybrid · medium · lead=0
-- ESC 11: calendario = hoy+10 meses (no dispara). Medidor 1100 ≥ 1000 → solo meter fires.
-- meterTriggered=true → fechas de tolerancia (medium=14 d).
-- ESC 30: lecturas delta=0 → projectedDate=null en proyecciones.
INSERT INTO public.pm_plans
  (id, name, trigger_type,
   interval_value, interval_unit,
   meter_interval_value, meter_interval_unit,
   lead_days, criticality) VALUES
  ('50000000-0000-0000-0000-000000000008',
   'Mantenimiento Chiller 12m/1000h', 'hybrid',
   12, 'months', 1000, 'hrs', 0, 'medium');
INSERT INTO public.pm_tasks (pm_plan_id, description, sort_order, frequency_multiplier) VALUES
  ('50000000-0000-0000-0000-000000000008', 'Recarga de refrigerante y limpieza de condensador', 0, 1),
  ('50000000-0000-0000-0000-000000000008', 'Revisión completa de compresor (x2000 h)',          1, 2);

-- ── PLAN-I: Servicio 500 h Bomba ──────────────────────────────
-- meter · high · x1+x2
-- ESC 14 (supersesión):
--   current=1100, nextDueMeter=500, interval=500 → overshoot=600.
--   maxCycle = 1 + floor(600/500) = 2.
--   heaviestCycle([1,2]): ciclo 2 peso=2 (x2) > ciclo 1 peso=1 (x1).
--   OT abierta en ciclo 1 (peso 1) → nueva generación ciclo 2 (peso 2) → SUPERSEDE.
INSERT INTO public.pm_plans
  (id, name, trigger_type, meter_interval_value, meter_interval_unit, criticality) VALUES
  ('50000000-0000-0000-0000-000000000009',
   'Servicio 500h Bomba', 'meter', 500, 'hrs', 'high');
INSERT INTO public.pm_tasks (pm_plan_id, description, sort_order, frequency_multiplier) VALUES
  ('50000000-0000-0000-0000-000000000009', 'Lubricación de cojinetes',                       0, 1),
  ('50000000-0000-0000-0000-000000000009', 'Cambio de sellos mecánicos (x1000 h)',           1, 2);

-- ── 7. ASSET PLANS ───────────────────────────────────────────────

-- AP-001  COMP-01 → PLAN-A (calendar)
--   next_due = hoy+10 d, lead=14 d → leadDate = hoy-4 d → FIRES (ESC-1/4).
--   cycle=6 → x1(c%1=0)+x3(c%3=0) disparan → isMajor=true.
--   OT pre-insertada en ciclo 6 → anti-stacking bloquea nueva generación (ESC-13).
INSERT INTO public.asset_plans
  (id, asset_id, pm_plan_id, next_due_date, current_cycle_index, active) VALUES
  ('60000000-0000-0000-0000-000000000001',
   '20000000-0000-0000-0000-000000000001',
   '50000000-0000-0000-0000-000000000001',
   (NOW() + INTERVAL '10 days')::date, 6, true);

-- AP-002  MOT-01 → PLAN-C (meter 1000 h)
--   current=2050 ≥ nextDueMeter=2000 → FIRES (ESC-6).
--   cycle=2 → x1+x2 disparan. Due = hoy+2 d (critical tolerance).
INSERT INTO public.asset_plans
  (id, asset_id, pm_plan_id,
   measurement_point_id, next_due_meter,
   current_cycle_index, active) VALUES
  ('60000000-0000-0000-0000-000000000002',
   '20000000-0000-0000-0000-000000000002',
   '50000000-0000-0000-0000-000000000003',
   '40000000-0000-0000-0000-000000000001', 2000, 2, true);

-- AP-003  CAL-01 → PLAN-B (calendar, vencido)
--   next_due = hace 70 días → OVERDUE (ESC-2).
--   daysPast≈70, interval≈30 d → maxCycle = 1+floor(70/30)=3.
--   heaviestCycle([1,3]): ciclo 3 tiene x3 (peso 3), ciclo 1 x1 (peso 1) → efectivo=3 (ESC-16).
INSERT INTO public.asset_plans
  (id, asset_id, pm_plan_id, next_due_date, current_cycle_index, active) VALUES
  ('60000000-0000-0000-0000-000000000003',
   '20000000-0000-0000-0000-000000000003',
   '50000000-0000-0000-0000-000000000002',
   (NOW() - INTERVAL '70 days')::date, 1, true);

-- AP-004  GEN-01 → PLAN-D (meter 500 h)
--   current=480 < nextDueMeter=500 → NO FIRES (ESC-7).
--   Lecturas históricas existentes → projectedDate calculable en ~63 días (ESC-27).
--   Abre panel de proyecciones para ver ~15 may (est.) en calendarios/kanban.
INSERT INTO public.asset_plans
  (id, asset_id, pm_plan_id,
   measurement_point_id, next_due_meter,
   current_cycle_index, active) VALUES
  ('60000000-0000-0000-0000-000000000004',
   '20000000-0000-0000-0000-000000000005',
   '50000000-0000-0000-0000-000000000004',
   '40000000-0000-0000-0000-000000000002', 500, 1, true);

-- AP-005  TOW-01 → PLAN-F (hybrid 3 m / 2000 h)
--   next_due = ayer → calendario FIRES (ESC-10).
--   meter=1500 < 2000 → medidor no dispara. Solo calendario activo.
--   meterTriggered=false → scheduledDate/dueDate usan lógica de calendario.
INSERT INTO public.asset_plans
  (id, asset_id, pm_plan_id,
   measurement_point_id,
   next_due_date, next_due_meter,
   current_cycle_index, active) VALUES
  ('60000000-0000-0000-0000-000000000005',
   '20000000-0000-0000-0000-000000000004',
   '50000000-0000-0000-0000-000000000006',
   '40000000-0000-0000-0000-000000000003',
   (NOW() - INTERVAL '1 day')::date, 2000, 1, true);

-- AP-006  FIL-01 → PLAN-E (meter 500 h)
--   current=520 ≥ 500 → FIRES. OT abierta ciclo 1 (peso 1 = mismo peso) → BLOQUEADO (ESC-13).
INSERT INTO public.asset_plans
  (id, asset_id, pm_plan_id,
   measurement_point_id, next_due_meter,
   current_cycle_index, active) VALUES
  ('60000000-0000-0000-0000-000000000006',
   '20000000-0000-0000-0000-000000000006',
   '50000000-0000-0000-0000-000000000005',
   '40000000-0000-0000-0000-000000000004', 500, 1, true);

-- AP-007  VEN-01 → PLAN-G (calendar bimestral)
--   next_due = hoy+90 d, lead=0 → NO genera con horizonte ≤ 30 días (ESC-3).
--   Si el usuario corre el scheduler con horizonte 120 d: sí genera.
INSERT INTO public.asset_plans
  (id, asset_id, pm_plan_id, next_due_date, current_cycle_index, active) VALUES
  ('60000000-0000-0000-0000-000000000007',
   '20000000-0000-0000-0000-000000000007',
   '50000000-0000-0000-0000-000000000007',
   (NOW() + INTERVAL '90 days')::date, 1, true);

-- AP-008  CHIL-01 → PLAN-H (hybrid 12 m / 1000 h)
--   Calendario = hoy+10 meses → no entra en ningún horizonte normal.
--   Medidor = 1100 ≥ 1000 → FIRES. Solo dimensión medidor activa (ESC-11).
--   Due = hoy+14 d (medium tolerance). projectedDate=null (delta=0 en lecturas, ESC-30).
INSERT INTO public.asset_plans
  (id, asset_id, pm_plan_id,
   measurement_point_id,
   next_due_date, next_due_meter,
   current_cycle_index, active) VALUES
  ('60000000-0000-0000-0000-000000000008',
   '20000000-0000-0000-0000-000000000008',
   '50000000-0000-0000-0000-000000000008',
   '40000000-0000-0000-0000-000000000005',
   (NOW() + INTERVAL '10 months')::date, 1000, 1, true);

-- AP-009  BWA-01 → PLAN-I (meter 500 h)
--   current=1100, nextDueMeter=500, overshoot=600 → ciclo efectivo=2.
--   OT pre-insertada en ciclo 1 (peso 1). Ciclo 2 (peso 2) > 1 → SUPERSEDE (ESC-14).
INSERT INTO public.asset_plans
  (id, asset_id, pm_plan_id,
   measurement_point_id, next_due_meter,
   current_cycle_index, active) VALUES
  ('60000000-0000-0000-0000-000000000009',
   '20000000-0000-0000-0000-000000000009',
   '50000000-0000-0000-0000-000000000009',
   '40000000-0000-0000-0000-000000000006', 500, 1, true);

-- ── 8. WORK ORDERS ───────────────────────────────────────────────
-- Estado    Quién             Propósito
-- ─────────────────────────────────────────────────────────────────
-- completed COMP-01 c.1-5    Historial de ciclos anteriores
-- open      COMP-01 c.6      Anti-stacking: misma OT ya existe (ESC-13)
-- open      FIL-01  c.1      Anti-stacking: mismo peso bloquea (ESC-13)
-- open      BWA-01  c.1      Supersesión: ciclo 2 (peso 2) > ciclo 1 (peso 1) (ESC-14)
-- open      TOW-01           Inspección vencida (due_date pasado) → badge rojo Kanban
-- open      VEN-01           Correctiva manual sin plan PM
-- assigned  GEN-01           Correctiva asignada a Carlos
-- in_progress CAL-01         Correctiva en ejecución
-- on_hold   MOT-01           Esperando repuestos (on_hold)

-- Historial COMP-01 — ciclos 1 al 5 completados
INSERT INTO public.work_orders
  (asset_id, asset_plan_id, title, wo_type, status, priority,
   pm_cycle_index, pm_plan_name_snapshot,
   scheduled_date, due_date, completed_at, resolution, assigned_to)
VALUES
  ('20000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001',
   'PM Rutina — Ciclo 1', 'preventive', 'completed', 'high',
   1, 'Rutina Mensual',
   (NOW()-INTERVAL '5 months'-INTERVAL '14 days')::date,
   (NOW()-INTERVAL '5 months')::date,
   NOW()-INTERVAL '5 months'+INTERVAL '2 days',
   'Completado sin novedades.',
   '00000000-0000-0000-0000-000000000002');

INSERT INTO public.work_orders
  (asset_id, asset_plan_id, title, wo_type, status, priority,
   pm_cycle_index, pm_plan_name_snapshot,
   scheduled_date, due_date, completed_at, resolution, assigned_to)
VALUES
  ('20000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001',
   'PM Rutina — Ciclo 2', 'preventive', 'completed', 'high',
   2, 'Rutina Mensual',
   (NOW()-INTERVAL '4 months'-INTERVAL '14 days')::date,
   (NOW()-INTERVAL '4 months')::date,
   NOW()-INTERVAL '4 months'+INTERVAL '3 days',
   'Fajas con desgaste moderado, reemplazadas.',
   '00000000-0000-0000-0000-000000000002');

INSERT INTO public.work_orders
  (asset_id, asset_plan_id, title, wo_type, status, priority,
   pm_cycle_index, pm_plan_name_snapshot,
   scheduled_date, due_date, completed_at, resolution, assigned_to)
VALUES
  ('20000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001',
   'PM Rutina — Ciclo 3 (Trimestral)', 'preventive', 'completed', 'high',
   3, 'Rutina Mensual',
   (NOW()-INTERVAL '3 months'-INTERVAL '14 days')::date,
   (NOW()-INTERVAL '3 months')::date,
   NOW()-INTERVAL '3 months'+INTERVAL '1 day',
   'Filtros cambiados. Revisión trimestral OK.',
   '00000000-0000-0000-0000-000000000002');

INSERT INTO public.work_orders
  (asset_id, asset_plan_id, title, wo_type, status, priority,
   pm_cycle_index, pm_plan_name_snapshot,
   scheduled_date, due_date, completed_at, resolution, assigned_to)
VALUES
  ('20000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001',
   'PM Rutina — Ciclo 4', 'preventive', 'completed', 'high',
   4, 'Rutina Mensual',
   (NOW()-INTERVAL '2 months'-INTERVAL '14 days')::date,
   (NOW()-INTERVAL '2 months')::date,
   NOW()-INTERVAL '2 months'+INTERVAL '4 days',
   'Sin novedades. Sistema operativo.',
   '00000000-0000-0000-0000-000000000002');

INSERT INTO public.work_orders
  (asset_id, asset_plan_id, title, wo_type, status, priority,
   pm_cycle_index, pm_plan_name_snapshot,
   scheduled_date, due_date, completed_at, resolution, assigned_to)
VALUES
  ('20000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001',
   'PM Rutina — Ciclo 5', 'preventive', 'completed', 'high',
   5, 'Rutina Mensual',
   (NOW()-INTERVAL '1 month'-INTERVAL '14 days')::date,
   (NOW()-INTERVAL '1 month')::date,
   NOW()-INTERVAL '1 month'+INTERVAL '2 days',
   'Lubricación y ajuste de correas.',
   '00000000-0000-0000-0000-000000000002');

-- COMP-01 ciclo 6 — OPEN (anti-stacking: bloquea nueva generación al correr el motor)
INSERT INTO public.work_orders
  (asset_id, asset_plan_id, title, wo_type, status, priority,
   pm_cycle_index, pm_plan_name_snapshot,
   scheduled_date, due_date)
VALUES
  ('20000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001',
   'PM Rutina — Ciclo 6 (Trimestral)', 'preventive', 'open', 'high',
   6, 'Rutina Mensual',
   (NOW()-INTERVAL '4 days')::date,
   (NOW()+INTERVAL '10 days')::date);

-- FIL-01 ciclo 1 — OPEN (anti-stacking: mismo peso 1, scheduler bloqueado)
INSERT INTO public.work_orders
  (asset_id, asset_plan_id, title, wo_type, status, priority,
   pm_cycle_index, pm_plan_name_snapshot,
   scheduled_date, due_date)
VALUES
  ('20000000-0000-0000-0000-000000000006', '60000000-0000-0000-0000-000000000006',
   'PM 500h Filtro — Ciclo 1', 'preventive', 'open', 'high',
   1, 'Servicio 500h Filtro',
   NOW()::date,
   (NOW()+INTERVAL '5 days')::date);

-- BWA-01 ciclo 1 — OPEN (supersesión: cuando el motor detecte ciclo 2 más pesado, cancela esta)
INSERT INTO public.work_orders
  (asset_id, asset_plan_id, title, wo_type, status, priority,
   pm_cycle_index, pm_plan_name_snapshot,
   scheduled_date, due_date)
VALUES
  ('20000000-0000-0000-0000-000000000009', '60000000-0000-0000-0000-000000000009',
   'PM 500h Bomba — Ciclo 1 (será supersedida)', 'preventive', 'open', 'high',
   1, 'Servicio 500h Bomba',
   NOW()::date,
   (NOW()+INTERVAL '5 days')::date);

-- TOW-01 — OPEN y VENCIDA (due_date pasado → badge rojo en Kanban)
INSERT INTO public.work_orders
  (asset_id, title, wo_type, status, priority, description,
   scheduled_date, due_date)
VALUES
  ('20000000-0000-0000-0000-000000000004',
   'Inspección Torre — VENCIDA', 'inspection', 'open', 'medium',
   'Inspección periódica pendiente de ejecución. Sin asignar técnico.',
   (NOW()-INTERVAL '20 days')::date,
   (NOW()-INTERVAL '10 days')::date);

-- VEN-01 — OPEN correctiva manual sin plan PM
INSERT INTO public.work_orders
  (asset_id, title, wo_type, status, priority, description,
   scheduled_date, due_date)
VALUES
  ('20000000-0000-0000-0000-000000000007',
   'Vibración anormal en arranque — VEN-01', 'corrective', 'open', 'high',
   'Operador reporta vibración inusual al arrancar. Verificar balanceo de aspas y estado de rodamientos.',
   NOW()::date,
   (NOW()+INTERVAL '3 days')::date);

-- GEN-01 — ASSIGNED correctiva a Carlos
INSERT INTO public.work_orders
  (asset_id, title, wo_type, status, priority, description,
   scheduled_date, due_date, assigned_to)
VALUES
  ('20000000-0000-0000-0000-000000000005',
   'Fuga de aceite en sello — GEN-01', 'corrective', 'assigned', 'critical',
   'Fuga detectada en sello de cigüeñal. Riesgo de contaminación de cojinetes.',
   NOW()::date,
   (NOW()+INTERVAL '1 day')::date,
   '00000000-0000-0000-0000-000000000002');

-- CAL-01 — IN_PROGRESS correctiva en ejecución
INSERT INTO public.work_orders
  (asset_id, title, wo_type, status, priority, description,
   scheduled_date, due_date, assigned_to)
VALUES
  ('20000000-0000-0000-0000-000000000003',
   'Obstrucción en quemador — CAL-01', 'corrective', 'in_progress', 'high',
   'Llama irregular detectada. Carlos está desmontando el quemador para limpieza.',
   (NOW()-INTERVAL '1 day')::date,
   (NOW()+INTERVAL '2 days')::date,
   '00000000-0000-0000-0000-000000000002');

-- MOT-01 — ON_HOLD esperando repuesto
INSERT INTO public.work_orders
  (asset_id, title, wo_type, status, priority, description,
   scheduled_date, due_date)
VALUES
  ('20000000-0000-0000-0000-000000000002',
   'Reemplazo de rodamiento delantero — MOT-01', 'corrective', 'on_hold', 'high',
   'Rodamiento 6205-2RS solicitado al proveedor. En espera de entrega estimada en 3 días.',
   NOW()::date,
   (NOW()+INTERVAL '7 days')::date);

-- ── 9. TAREAS DE OT (wo_tasks) ────────────────────────────────────
-- Solo para las OTs completadas de COMP-01 y la OT abierta ciclo 6

-- Tareas del ciclo 3 completado (el más representativo: trimestral)
WITH c3 AS (
  SELECT id FROM public.work_orders
  WHERE asset_id = '20000000-0000-0000-0000-000000000001'
    AND pm_cycle_index = 3
    AND status = 'completed'
  LIMIT 1
)
INSERT INTO public.wo_tasks (work_order_id, description, sort_order, completed, completed_at, completed_by, notes)
SELECT c3.id, 'Inspección visual y limpieza general',        0, true, NOW()-INTERVAL '3 months'+INTERVAL '1 hour',  '00000000-0000-0000-0000-000000000002'::uuid, 'Sin desgaste visible.' FROM c3
UNION ALL
SELECT c3.id, 'Cambio de filtros y lubricación (trimestral)',1, true, NOW()-INTERVAL '3 months'+INTERVAL '2 hours', '00000000-0000-0000-0000-000000000002'::uuid, 'Filtros P/N 2240-A reemplazados. 2 unidades.' FROM c3;

-- Tareas de la OT abierta ciclo 6 (pendientes)
WITH c6 AS (
  SELECT id FROM public.work_orders
  WHERE asset_id = '20000000-0000-0000-0000-000000000001'
    AND pm_cycle_index = 6
    AND status = 'open'
  LIMIT 1
)
INSERT INTO public.wo_tasks (work_order_id, description, sort_order, completed)
SELECT c6.id, 'Inspección visual y limpieza general',         0, false FROM c6
UNION ALL
SELECT c6.id, 'Cambio de filtros y lubricación (trimestral)', 1, false FROM c6;

-- ── 10. COMENTARIOS DE OT ─────────────────────────────────────────
-- Comentario en la OT vencida de TOW-01
WITH ot_tow AS (
  SELECT id FROM public.work_orders
  WHERE asset_id = '20000000-0000-0000-0000-000000000004'
    AND status = 'open'
  LIMIT 1
)
INSERT INTO public.wo_comments (work_order_id, author_id, body, created_at)
SELECT ot_tow.id,
       '00000000-0000-0000-0000-000000000003'::uuid,
       'Esta inspección lleva 10 días vencida. Se requiere acción inmediata para evitar fallo.',
       NOW()-INTERVAL '2 days'
FROM ot_tow;

-- Comentarios en la OT in_progress de CAL-01
WITH ot_cal AS (
  SELECT id FROM public.work_orders
  WHERE asset_id = '20000000-0000-0000-0000-000000000003'
    AND status = 'in_progress'
  LIMIT 1
)
INSERT INTO public.wo_comments (work_order_id, author_id, body, created_at)
SELECT ot_cal.id, '00000000-0000-0000-0000-000000000002'::uuid,
       'Quemador desmontado. Acumulación de hollín en boquillas internas. Procedo a limpieza con cepillo metálico.',
       NOW()-INTERVAL '3 hours'
FROM ot_cal;

-- ── 11. TOLERANCIAS DE MEDIDOR ────────────────────────────────────
-- Restablece los 4 niveles.
-- 'critical' se deja en 3 días (en lugar del default 2) para demostrar
-- que la tabla es editable desde PM → Configuración → Tolerancias.
INSERT INTO public.pm_meter_tolerance
  (criticality, scheduled_offset_days, due_offset_days)
VALUES
  ('critical', 0,  3),
  ('high',     0,  5),
  ('medium',   0, 14),
  ('low',      0, 30)
ON CONFLICT (criticality) DO UPDATE SET
  scheduled_offset_days = EXCLUDED.scheduled_offset_days,
  due_offset_days        = EXCLUDED.due_offset_days,
  updated_at             = NOW();

-- ================================================================
-- FIN DEL SEED — Resumen de escenarios cubiertos
-- ================================================================
-- Calendar   → COMP-01 (fires w/lead), CAL-01 (overdue+multi-cycle), VEN-01 (far future)
-- Meter      → MOT-01 (fires, critical), GEN-01 (not fired, projectedDate), FIL-01 (anti-stack)
-- Hybrid     → TOW-01 (solo calendario), CHIL-01 (solo medidor, projectedDate=null)
-- Anti-stack → COMP-01 c6 (mismo peso), FIL-01 c1 (mismo peso)
-- Supersesión→ BWA-01 c1→c2 (peso 1 absorbido por peso 2)
-- Kanban     → open / assigned / in_progress / on_hold / completed × correctivas y PM
-- Tolerancias→ critical=3d (sobreescrito) · high=5d · medium=14d · low=30d
-- Proyecciones→ GEN-01 (projectedDate ~63d), CHIL-01 (delta=0 → null), FIL-01 (1 lectura → null)
-- ================================================================
