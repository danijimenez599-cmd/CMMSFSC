-- APEX CMMS - SEED DATA: VARIANTE TOTAL (Showroom de Ciclos)
-- Limpieza profunda
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

-- 1. PERFILES
INSERT INTO public.profiles (id, full_name, email, role) VALUES 
('00000000-0000-4000-a000-000000000000', 'Administrador (Dev)', 'admin@apex-cmms.com', 'admin'),
('00000000-0000-4000-a000-000000000001', 'Juan Técnico', 'juan.tecnico@apex-cmms.com', 'technician');

-- 2. VENDORES (PROVEEDORES)
INSERT INTO public.vendors (id, name, category, contact_name, email, phone) VALUES
('00000000-0000-4000-9000-000000000001', 'Suministros Industriales S.A.', 'parts', 'Carlos Ruiz', 'ventas@suministros.com', '503-2222-1111'),
('00000000-0000-4000-9000-000000000002', 'Servicios Energéticos', 'service', 'Ana López', 'soporte@energeticos.com', '503-2222-2222'),
('00000000-0000-4000-9000-000000000003', 'Atlas Copco (OEM)', 'oem', 'Ing. Roberto', 'service.atlas@atlascopco.com', '503-2222-3333');

-- 3. ASSETS
INSERT INTO public.assets (id, name, code, asset_type, criticality, status) VALUES
('00000000-0000-4000-b000-000000000001', 'Planta Central', 'PLT-01', 'plant', 'high', 'active'),
('00000000-0000-4000-b000-000000000002', 'Compresor GA-30', 'COMP-01', 'equipment', 'high', 'active'),
('00000000-0000-4000-b000-000000000003', 'Motor Principal Extrusora', 'MOT-01', 'equipment', 'high', 'active'),
('00000000-0000-4000-b000-000000000004', 'Torre de Enfriamiento', 'TOW-01', 'equipment', 'medium', 'active');

UPDATE public.assets SET parent_id = '00000000-0000-4000-b000-000000000001' WHERE id != '00000000-0000-4000-b000-000000000001';

-- 4. CATÁLOGO DE MEDICIONES
INSERT INTO public.measurement_configs (id, name, unit, is_cumulative) VALUES
('00000000-0000-4000-c000-000000000001', 'Horas de Operación', 'hrs', true),
('00000000-0000-4000-c000-000000000002', 'Temperatura de Descarga', '°C', false),
('00000000-0000-4000-c000-000000000003', 'Presión de Aceite', 'PSI', false),
('00000000-0000-4000-c000-000000000004', 'Vibración Motor', 'mm/s', false),
('00000000-0000-4000-c000-000000000005', 'Consumo Eléctrico', 'kWh', true);

-- 5. PUNTOS DE MEDICIÓN
INSERT INTO public.measurement_points (id, asset_id, config_id, name, unit, current_value, min_threshold, max_threshold, trigger_wo_title) VALUES
('00000000-0000-4000-f000-000000000001', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-c000-000000000001', 'Horómetro Motor', 'hrs', 1250, null, null, null),
('00000000-0000-4000-f000-000000000002', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-c000-000000000001', 'Horómetro Torre', 'hrs', 800, null, null, null),
('00000000-0000-4000-f000-000000000003', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-c000-000000000002', 'Temp. Compresor', '°C', 85, 40, 105, 'Alerta: Alta Temperatura Compresor');

-- 6. PLANES MAESTROS
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

-- 7. ASIGNACIÓN DE PLANES
INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, next_due_date, current_cycle_index) VALUES
('00000000-0000-4000-e000-000000000001', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-a000-000000000001', (NOW() + interval '15 days')::date, 3);

INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, measurement_point_id, next_due_meter, current_cycle_index) VALUES
('00000000-0000-4000-e000-000000000002', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-a000-000000000002', '00000000-0000-4000-f000-000000000001', 1500, 2);

INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, measurement_point_id, next_due_date, next_due_meter, current_cycle_index) VALUES
('00000000-0000-4000-e000-000000000003', '00000000-0000-4000-b000-000000000004', '00000000-0000-4000-a000-000000000003', '00000000-0000-4000-f000-000000000002', (NOW() + interval '6 months')::date, 2800, 1);

-- 8. ÓRDENES DE TRABAJO (HISTÓRICAS Y ACTIVAS)
-- OT 1: Cerrada del Ciclo 1 (Compresor)
INSERT INTO public.work_orders (id, asset_id, asset_plan_id, wo_number, title, wo_type, status, pm_cycle_index, pm_plan_name_snapshot, assigned_to, completed_at, resolution) VALUES
('00000000-0000-4000-d000-000000000001', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-e000-000000000001', 'WO-24-03-00001', 'PM Mensual - Ciclo 1', 'preventive', 'completed', 1, 'Plan Mecánico Mensual', '00000000-0000-4000-a000-000000000001', (NOW() - interval '60 days'), 'Se realizó inspección visual, fajas en buen estado.');

-- OT 2: Cerrada del Ciclo 2 (Compresor)
INSERT INTO public.work_orders (id, asset_id, asset_plan_id, wo_number, title, wo_type, status, pm_cycle_index, pm_plan_name_snapshot, assigned_to, completed_at, resolution, vendor_id) VALUES
('00000000-0000-4000-d000-000000000002', '00000000-0000-4000-b000-000000000002', '00000000-0000-4000-e000-000000000001', 'WO-24-04-00001', 'PM Mensual - Ciclo 2', 'preventive', 'completed', 2, 'Plan Mecánico Mensual', '00000000-0000-4000-a000-000000000001', (NOW() - interval '30 days'), 'Inspección completada. Se solicitó apoyo externo para calibración de válvulas.', '00000000-0000-4000-9000-000000000003');

-- OT 3: Abierta del Ciclo 1 (Motor - 500h)
INSERT INTO public.work_orders (id, asset_id, asset_plan_id, wo_number, title, wo_type, status, pm_cycle_index, pm_plan_name_snapshot, assigned_to) VALUES
('00000000-0000-4000-d000-000000000003', '00000000-0000-4000-b000-000000000003', '00000000-0000-4000-e000-000000000002', 'WO-24-04-00002', 'PM 500h - Ciclo 1', 'preventive', 'in_progress', 1, 'Plan por Horas (Motor)', '00000000-0000-4000-a000-000000000001');

-- OT 4: Correctiva Manual
INSERT INTO public.work_orders (id, asset_id, wo_number, title, wo_type, status) VALUES
('00000000-0000-4000-d000-000000000004', '00000000-0000-4000-b000-000000000002', 'WO-24-04-00003', 'Reparación de fuga de aceite', 'inspection', 'open');

-- 9. ACTIVIDADES (TASKS & COMMENTS) PARA OTs CERRADAS
INSERT INTO public.wo_tasks (id, work_order_id, description, sort_order, completed, completed_at, completed_by, notes) VALUES
-- Tareas OT-001
(uuid_generate_v4(), '00000000-0000-4000-d000-000000000001', 'Inspección de fajas', 1, true, (NOW() - interval '60 days'), '00000000-0000-4000-a000-000000000001', 'Fajas con tensión correcta.'),
-- Tareas OT-002
(uuid_generate_v4(), '00000000-0000-4000-d000-000000000002', 'Inspección de fajas', 1, true, (NOW() - interval '30 days'), '00000000-0000-4000-a000-000000000001', 'Todo OK.'),
(uuid_generate_v4(), '00000000-0000-4000-d000-000000000002', 'Calibración de válvulas', 2, true, (NOW() - interval '29 days'), '00000000-0000-4000-a000-000000000001', 'Realizado por Atlas Copco.'),
-- Tareas OT-003 (Abierta)
(uuid_generate_v4(), '00000000-0000-4000-d000-000000000003', 'Lubricación básica', 1, false, null, null, null);

INSERT INTO public.wo_comments (id, work_order_id, author_id, body, created_at) VALUES
('00000000-0000-4000-c000-000000000001', '00000000-0000-4000-d000-000000000001', '00000000-0000-4000-a000-000000000001', 'Inicio de inspección mensual.', (NOW() - interval '60 days' + interval '1 hour')),
('00000000-0000-4000-c000-000000000002', '00000000-0000-4000-d000-000000000001', '00000000-0000-4000-a000-000000000001', 'Inspección finalizada sin novedades.', (NOW() - interval '60 days' + interval '3 hours')),
('00000000-0000-4000-c000-000000000003', '00000000-0000-4000-d000-000000000002', '00000000-0000-4000-a000-000000000001', 'Se requiere soporte de Atlas Copco para calibración avanzada.', (NOW() - interval '30 days' + interval '2 hours'));
