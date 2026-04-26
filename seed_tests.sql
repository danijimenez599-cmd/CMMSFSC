-- APEX CMMS - SEED DATA PARA PRUEBAS (CONSOLIDADO)
-- Este archivo limpia las tablas principales e inserta los datos de prueba proporcionados.

-- 1. LIMPIEZA DE DATOS (Orden respetando restricciones de integridad)
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

-- 2. INSERTAR ASSETS
INSERT INTO "public"."assets" ("id", "parent_id", "location_id", "name", "code", "asset_type", "category", "manufacturer", "model", "serial_number", "install_date", "warranty_until", "criticality", "status", "description", "specs", "image_url", "created_by", "created_at", "updated_at") VALUES 
('298e062c-715d-419a-bc4a-9f75de0cf4e2', null, null, 'Equipo Tiempo', null, 'equipment', 'rotating', null, null, null, null, null, 'medium', 'active', null, '{}', null, null, '2026-04-26 17:59:52.317654+00', '2026-04-26 17:59:52.317654+00'), 
('e6a43eb6-e128-4609-b392-e5b5504ed9c0', null, null, 'Equipo Horas', null, 'equipment', 'rotating', null, null, null, null, null, 'medium', 'active', null, '{}', null, null, '2026-04-26 17:59:44.602035+00', '2026-04-26 17:59:44.602035+00'), 
('eab8fe23-566b-43dd-ac9e-c06ded466780', null, null, 'Equipo Hibrido', null, 'equipment', 'rotating', null, null, null, null, null, 'medium', 'active', null, '{}', null, null, '2026-04-26 17:59:58.516781+00', '2026-04-26 17:59:58.516781+00');

-- 3. INSERTAR INVENTARIO
INSERT INTO "public"."inventory_items" ("id", "name", "part_number", "description", "category", "unit", "stock_current", "stock_min", "stock_max", "location_bin", "unit_cost", "active", "created_at", "updated_at") VALUES 
('428609d6-634c-4dd4-8cd2-1c1a0957dfc4', 'BB', 'asfasf', null, 'Eléctricos', 'kg', '7', '1', null, null, '223', true, '2026-04-26 18:06:57.627792+00', '2026-04-26 18:06:57.627792+00'), 
('edba65d8-9744-43be-a5e9-e725ab2ec72e', 'AA', 'asdasd', null, null, 'und', '22', '1', null, null, '24.55', true, '2026-04-26 18:06:35.164621+00', '2026-04-26 18:06:35.164621+00');

-- 4. INSERTAR CONFIGURACIONES DE MEDICIÓN
INSERT INTO "public"."measurement_configs" ("id", "name", "unit", "is_cumulative", "created_at") VALUES 
('1d7afdbd-fb29-4a2f-a538-0316a6199d08', 'Horas', 'Horometro', true, '2026-04-26 18:03:07.410121+00'), 
('da6522b7-8ea5-422d-8076-ccf9212c0392', 'Temperatura', 'C', false, '2026-04-26 18:07:21.835202+00');

-- 5. INSERTAR PLANES DE MANTENIMIENTO (PM PLANS)
INSERT INTO "public"."pm_plans" ("id", "name", "description", "trigger_type", "interval_value", "interval_unit", "interval_mode", "lead_days", "meter_interval_value", "meter_interval_unit", "estimated_duration", "criticality", "created_at") VALUES 
('51261d17-1f77-4176-b6d9-d1023597cc65', 'Plan Float Acumulador', null, 'meter', 1, 'months', 'floating', 7, '100', 'Horometro', null, 'medium', '2026-04-26 18:04:06.552966+00'), 
('b79444a7-92da-40eb-a0eb-8a8a79fd2935', 'Plan Float Tiempo', null, 'calendar', 1, 'months', 'floating', 7, null, null, null, 'medium', '2026-04-26 18:01:04.396893+00');

-- 6. INSERTAR TAREAS DE LOS PLANES (PM TASKS)
INSERT INTO "public"."pm_tasks" ("id", "pm_plan_id", "description", "sort_order", "frequency_multiplier") VALUES 
('19f49d0e-c492-4916-b7ef-196a3f9c169d', 'b79444a7-92da-40eb-a0eb-8a8a79fd2935', 'TAREA 1', 0, 1), 
('2e5f313b-1f80-40c4-baff-7ca897ad200b', 'b79444a7-92da-40eb-a0eb-8a8a79fd2935', 'TAREA 3', 2, 3), 
('31e70c6b-5b28-4f57-beae-c4cdecca24f2', '51261d17-1f77-4176-b6d9-d1023597cc65', 'T4', 3, 4), 
('36802602-aa93-4797-9c83-7061601445b9', 'b79444a7-92da-40eb-a0eb-8a8a79fd2935', 'TAREA 4', 3, 4), 
('5f19c102-461f-4fba-93b6-859c7f6aca23', '51261d17-1f77-4176-b6d9-d1023597cc65', 'T2', 1, 2), 
('6b2c5a88-aa45-47f2-80b4-f58ebedd513f', '51261d17-1f77-4176-b6d9-d1023597cc65', 'T1', 0, 1), 
('8ce58055-4db0-49ec-858b-37760364bd65', 'b79444a7-92da-40eb-a0eb-8a8a79fd2935', 'TAREA 2', 1, 2), 
('ff057e69-d2ac-4301-a7f5-53731ba87d91', '51261d17-1f77-4176-b6d9-d1023597cc65', 'T3', 2, 3);

-- 7. INSERTAR PROVEEDORES (VENDORS)
INSERT INTO "public"."vendors" ("id", "name", "category", "contact_name", "email", "phone", "tax_id", "is_active", "created_at") VALUES 
('7675b22e-ed9f-4359-84b0-3f05f9cc8cb6', 'DON LU', null, 'asfasf', 'asfasdsadas@asfasfasfafaf.COM', '455454654', '4454554345345343545345345543435534453', true, '2026-04-26 18:07:50.277604+00');
