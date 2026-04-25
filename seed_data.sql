-- ========================================================
-- APEX CMMS - TITAN ENGINEERING SEED
-- Only 2 assets, but extremely deep and vivid.
-- ========================================================

-- 0. CLEANUP
TRUNCATE public.profiles, public.assets, public.pm_plans, public.asset_plans, 
         public.work_orders, public.measurement_points, public.pm_tasks, 
         public.wo_tasks, public.measurement_configs, public.vendors, 
         public.inventory_items, public.part_usages, public.stock_movements CASCADE;

-- 1. TEAM
INSERT INTO public.profiles (id, full_name, role, specialty) VALUES
('00000000-0000-4000-a000-000000000000', 'Ing. Daniel Jiménez', 'admin', 'Reliability Engineering'),
(uuid_generate_v4(), 'Ing. Senior Rotativa', 'technician', 'Vibration Analysis'),
(uuid_generate_v4(), 'Especialista Eléctrico', 'technician', 'High Voltage / SF6');

-- 2. TITAN ASSETS
DO $$
DECLARE
    plant_id UUID := uuid_generate_v4();
    -- Titan 1: Centac Compressor
    centac_id UUID := uuid_generate_v4();
    centac_plan UUID := uuid_generate_v4();
    centac_mp UUID := uuid_generate_v4();
    -- Titan 2: GIS Substation
    gis_id UUID := uuid_generate_v4();
    gis_plan UUID := uuid_generate_v4();
BEGIN
    -- Plant Root
    INSERT INTO public.assets (id, name, code, asset_type, category, criticality)
    VALUES (plant_id, 'Complejo Industrial de Alta Disponibilidad', 'PL-HIGH-AVAIL', 'plant', 'other', 'high');

    -- TITAN 1: TURBOCOMPRESOR CENTRÍFUGO (CENTAC 3000)
    INSERT INTO public.assets (id, parent_id, name, code, asset_type, category, criticality, manufacturer, model, serial_number)
    VALUES (centac_id, plant_id, 'Turbocompresor Centrífugo de Aire (Centac 3000)', 'AIR-CENT-01', 'equipment', 'rotating', 'high', 'Ingersoll Rand', 'Centac 3000', 'IR-998822');

    INSERT INTO public.measurement_points (id, asset_id, name, unit, current_value)
    VALUES (centac_mp, centac_id, 'Horas de Operación Totales', 'hrs', 14250.0);

    -- Plan Centac (Multi-tier: x1, x3, x12, x48)
    INSERT INTO public.pm_plans (id, name, trigger_type, interval_value, interval_unit, meter_interval_value, criticality, lead_days)
    VALUES (centac_plan, 'Estrategia de Mantenimiento Centac 3000', 'hybrid', 1, 'months', 2000, 'high', 10);

    INSERT INTO public.pm_tasks (pm_plan_id, description, sort_order, frequency_multiplier) VALUES
    (centac_plan, 'Inspección visual de fugas y niveles de aceite', 1, 1),
    (centac_plan, 'Drenado manual de condensados en intercoolers', 2, 1),
    (centac_plan, 'Análisis espectrométrico de aceite lubricante', 3, 3),
    (centac_plan, 'Verificación de diferencial de presión en filtros de aire', 4, 3),
    (centac_plan, 'Limpieza química de intercambiadores de calor (Coolers)', 5, 12),
    (centac_plan, 'Análisis de firma de vibraciones (FFT)', 6, 12),
    (centac_plan, 'Overhaul de Etapa 1 y 2: Inspección de Impulsores y Sellos (4 Años)', 7, 48);

    -- TITAN 2: SUBESTACIÓN BLINDADA (GIS - 115kV)
    INSERT INTO public.assets (id, parent_id, name, code, asset_type, category, criticality, manufacturer, model)
    VALUES (gis_id, plant_id, 'Subestación Blindada en SF6 (GIS - 115kV)', 'ELEC-GIS-01', 'system', 'electrical', 'high', 'Siemens', '8DN8-Switchgear');

    -- Plan GIS (Multi-tier: x1, x12, x60)
    INSERT INTO public.pm_plans (id, name, trigger_type, interval_value, interval_unit, criticality, lead_days)
    VALUES (gis_plan, 'Protocolo de Mantenimiento Subestación GIS', 'calendar', 1, 'months', 'critical', 15);

    INSERT INTO public.pm_tasks (pm_plan_id, description, sort_order, frequency_multiplier) VALUES
    (gis_plan, 'Lectura de manómetros de presión de gas SF6', 1, 1),
    (gis_plan, 'Verificación de contadores de maniobra de interruptores', 2, 1),
    (gis_plan, 'Medición de Descargas Parciales (Método Acústico/UHF)', 3, 12),
    (gis_plan, 'Inspección termográfica de celdas y compartimientos', 4, 12),
    (gis_plan, 'Análisis de calidad del gas SF6 (Humedad, Pureza, SO2)', 5, 60),
    (gis_plan, 'Pruebas de tiempos de apertura y simultaneidad (Ciclo 5 Años)', 6, 60),
    (gis_plan, 'Medición de resistencia de contacto (Ducter)', 7, 60);

    -- ASSET PLANS (Puntos de inicio estratégicos)
    -- Centac: En Ciclo 12 (Anual) para ver el Scope Mayor
    INSERT INTO public.asset_plans (asset_id, pm_plan_id, measurement_point_id, next_due_date, current_cycle_index)
    VALUES (centac_id, centac_plan, centac_mp, (CURRENT_DATE + INTERVAL '5 days'), 12);

    -- GIS: En Ciclo 59 (A un mes del gran Overhaul de 5 años)
    INSERT INTO public.asset_plans (asset_id, pm_plan_id, next_due_date, current_cycle_index)
    VALUES (gis_id, gis_plan, (CURRENT_DATE + INTERVAL '10 days'), 59);

    -- HISTORIA DE ÉXITO
    INSERT INTO public.work_orders (id, asset_id, wo_number, title, wo_type, status, priority, scheduled_date, completed_at, resolution)
    VALUES (uuid_generate_v4(), centac_id, 'WO-TITAN-001', 'PM Mensual — Inspección Centac', 'preventive', 'completed', 'high', (CURRENT_DATE - INTERVAL '30 days'), (CURRENT_DATE - INTERVAL '29 days'), 'Inspección satisfactoria. Sin fugas detectadas.');

END $$;
