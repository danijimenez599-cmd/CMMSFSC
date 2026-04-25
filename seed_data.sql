-- APEX CMMS - SEED DATA: VARIANTE TOTAL (Showroom de Ciclos)
-- Limpieza profunda
DELETE FROM public.wo_tasks;
DELETE FROM public.part_usages;
DELETE FROM public.wo_comments;
DELETE FROM public.work_orders;
DELETE FROM public.asset_plans;
DELETE FROM public.pm_tasks;
DELETE FROM public.pm_plans;
DELETE FROM public.meter_readings;
DELETE FROM public.measurement_points;
DELETE FROM public.measurement_configs;
DELETE FROM public.assets;

-- 1. ASSETS
INSERT INTO public.assets (id, name, code, asset_type, criticality, status) VALUES
('00000000-0000-4000-b000-000000000001', 'Planta Central', 'PLT-01', 'plant', 'high', 'active'),
('00000000-0000-4000-b000-000000000002', 'Compresor GA-30', 'COMP-01', 'equipment', 'high', 'active'),
('00000000-0000-4000-b000-000000000003', 'Motor Principal Extrusora', 'MOT-01', 'equipment', 'high', 'active'),
('00000000-0000-4000-b000-000000000004', 'Torre de Enfriamiento', 'TOW-01', 'equipment', 'medium', 'active');

UPDATE public.assets SET parent_id = '00000000-0000-4000-b000-000000000001' WHERE id != '00000000-0000-4000-b000-000000000001';

-- 2. CONFIGURACIÓN DE MEDICIÓN
INSERT INTO public.measurement_configs (id, name, unit, is_cumulative) VALUES
('00000000-0000-4000-c000-000000000001', 'Horas de Operación', 'hrs', true);

-- 3. PUNTOS DE MEDICIÓN
INSERT INTO public.measurement_points (id, asset_id, config_id, name, unit, current_value) VALUES
('00000000-0000-4000-f000-000000000001', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-c000-000000000001', 'Horómetro Motor', 'hrs', 1250),
('00000000-0000-4000-f000-000000000002', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-c000-000000000001', 'Horómetro Torre', 'hrs', 800);

-- 4. PLANES MAESTROS
-- A. Calendario (Mensual)
INSERT INTO public.pm_plans (id, name, trigger_type, interval_value, interval_unit, criticality) VALUES
('00000000-0000-4000-a000-000000000001', 'Plan Mecánico Mensual', 'calendar', 1, 'months', 'high');
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
(uuid_generate_v4(), '00000000-0000-4000-a000-000000000001', 'Inspección de fajas', 1, 1),
(uuid_generate_v4(), '00000000-0000-4000-a000-000000000001', 'Cambio de filtros (Trimestral)', 2, 3);

-- B. Medidor (500h)
INSERT INTO public.pm_plans (id, name, trigger_type, meter_interval_value, meter_interval_unit, criticality) VALUES
('00000000-0000-4000-a000-000000000002', 'Plan por Horas (Motor)', 'meter', 500, 'hrs', 'high');
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
(uuid_generate_v4(), '00000000-0000-4000-a000-000000000002', 'Lubricación básica', 1, 1),
(uuid_generate_v4(), '00000000-0000-4000-a000-000000000002', 'Alineamiento láser (Cada 1000h)', 2, 2);

-- C. Híbrido (6 Meses o 2000h)
INSERT INTO public.pm_plans (id, name, trigger_type, interval_value, interval_unit, meter_interval_value, meter_interval_unit, criticality) VALUES
('00000000-0000-4000-a000-000000000003', 'Plan Híbrido (Torre)', 'hybrid', 6, 'months', 2000, 'hrs', 'medium');
INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
(uuid_generate_v4(), '00000000-0000-4000-a000-000000000003', 'Limpieza de boquillas', 1, 1),
(uuid_generate_v4(), '00000000-0000-4000-a000-000000000003', 'Inspección estructural anual', 2, 2);

-- 5. ASIGNACIÓN DE PLANES
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, next_due_date, current_cycle_index) VALUES
('00000000-0000-4000-e000-000000000001', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000001', (NOW() + interval '15 days')::date, 3); -- Va por el ciclo 3

INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, measurement_point_id, next_due_meter, current_cycle_index) VALUES
('00000000-0000-4000-e000-000000000002', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000002', '00000000-0000-4000-f000-000000000001', 1500, 2); -- Va por el ciclo 2

INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, measurement_point_id, next_due_date, next_due_meter, current_cycle_index) VALUES
('00000000-0000-4000-e000-000000000003', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000003', '00000000-0000-4000-f000-000000000002', (NOW() + interval '6 months')::date, 2800, 1);

-- 6. ÓRDENES DE TRABAJO (HISTÓRICAS Y ACTIVAS)
-- OT 1: Cerrada del Ciclo 1 (Compresor)
INSERT INTO public.work_orders (id, asset_id, asset_plan_id, wo_number, title, wo_type, status, pm_cycle_index, pm_plan_name_snapshot, completed_at) VALUES
('00000000-0000-4000-d000-000000000001', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-e000-000000000001', 'OT-1001', 'PM Mensual - Ciclo 1', 'preventive', 'completed', 1, 'Plan Mecánico Mensual', (NOW() - interval '60 days'));

-- OT 2: Cerrada del Ciclo 2 (Compresor)
INSERT INTO public.work_orders (id, asset_id, asset_plan_id, wo_number, title, wo_type, status, pm_cycle_index, pm_plan_name_snapshot, completed_at) VALUES
('00000000-0000-4000-d000-000000000002', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-e000-000000000001', 'OT-1002', 'PM Mensual - Ciclo 2', 'preventive', 'completed', 2, 'Plan Mecánico Mensual', (NOW() - interval '30 days'));

-- OT 3: Abierta del Ciclo 1 (Motor - 500h)
INSERT INTO public.work_orders (id, asset_id, asset_plan_id, wo_number, title, wo_type, status, pm_cycle_index, pm_plan_name_snapshot) VALUES
('00000000-0000-4000-d000-000000000003', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-e000-000000000002', 'OT-1003', 'PM 500h - Ciclo 1', 'preventive', 'in_progress', 1, 'Plan por Horas (Motor)');

-- OT 4: Correctiva Manual (Sin ciclo)
INSERT INTO public.work_orders (id, asset_id, wo_number, title, wo_type, status) VALUES
('00000000-0000-4000-d000-000000000004', '00000000-0000-4000-b000-000000000002', 'OT-1004', 'Reparación de fuga de aceite', 'inspection', 'open');

-- 7. TAREAS DE LAS ÓRDENES (Checklist persistente)
INSERT INTO public.wo_tasks (id, work_order_id, description, sort_order, completed) VALUES
-- Tareas OT-1001 (Ciclo 1 - Solo Rutina)
(uuid_generate_v4(), '00000000-0000-4000-d000-000000000001', 'Inspección de fajas', 1, true),
-- Tareas OT-1002 (Ciclo 2 - Solo Rutina)
(uuid_generate_v4(), '00000000-0000-4000-d000-000000000002', 'Inspección de fajas', 1, true),
-- Tareas OT-1003 (Ciclo 1 del Motor)
(uuid_generate_v4(), '00000000-0000-4000-d000-000000000003', 'Lubricación básica', 1, false),
-- Tareas OT-1004 (Correctiva)
(uuid_generate_v4(), '00000000-0000-4000-d000-000000000004', 'Localizar punto de fuga', 1, true),
(uuid_generate_v4(), '00000000-0000-4000-d000-000000000004', 'Cambio de sello de manguera', 2, false);

-- 8. PERFILES
INSERT INTO public.profiles (id, full_name, role)
VALUES ('00000000-0000-4000-a000-000000000000', 'Administrador (Dev)', 'admin')
ON CONFLICT (id) DO NOTHING;
