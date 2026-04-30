-- Atomic PM work-order closure + asset_plan recalc persistence.
-- Safe to re-run.

CREATE OR REPLACE FUNCTION public.fn_complete_pm_wo_tx(
  p_wo_id UUID,
  p_asset_plan_id UUID,
  p_completed_at TIMESTAMPTZ,
  p_actual_hours NUMERIC,
  p_failure_code TEXT,
  p_root_cause TEXT,
  p_resolution TEXT,
  p_vendor_id UUID,
  p_external_service_cost NUMERIC,
  p_external_invoice_ref TEXT,
  p_assigned_to_name_snapshot TEXT,
  p_vendor_name_snapshot TEXT,
  p_asset_name_snapshot TEXT,
  p_completed_meter_value NUMERIC,
  p_measurement_point_id UUID,
  p_meter_reading_id UUID,
  p_recorded_by UUID,
  p_last_completed_at TIMESTAMPTZ,
  p_wo_count INTEGER,
  p_current_cycle_index INTEGER,
  p_next_due_date DATE,
  p_next_due_meter NUMERIC
)
RETURNS VOID AS $$
BEGIN
  UPDATE public.work_orders
  SET
    status = 'completed',
    actual_hours = p_actual_hours,
    completed_at = p_completed_at,
    updated_at = p_completed_at,
    failure_code = p_failure_code,
    root_cause = p_root_cause,
    resolution = p_resolution,
    vendor_id = p_vendor_id,
    external_service_cost = COALESCE(p_external_service_cost, 0),
    external_invoice_ref = p_external_invoice_ref,
    assigned_to_name_snapshot = p_assigned_to_name_snapshot,
    vendor_name_snapshot = p_vendor_name_snapshot,
    asset_name_snapshot = p_asset_name_snapshot,
    completed_meter_value = p_completed_meter_value
  WHERE id = p_wo_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orden de trabajo no encontrada: %', p_wo_id;
  END IF;

  UPDATE public.asset_plans
  SET
    last_completed_at = p_last_completed_at,
    wo_count = p_wo_count,
    current_cycle_index = p_current_cycle_index,
    next_due_date = COALESCE(p_next_due_date, next_due_date),
    next_due_meter = COALESCE(p_next_due_meter, next_due_meter)
  WHERE id = p_asset_plan_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan de activo no encontrado: %', p_asset_plan_id;
  END IF;

  IF p_completed_meter_value IS NOT NULL AND p_measurement_point_id IS NOT NULL THEN
    UPDATE public.measurement_points
    SET current_value = p_completed_meter_value,
        last_reading_at = p_completed_at
    WHERE id = p_measurement_point_id;

    INSERT INTO public.meter_readings (id, point_id, value, recorded_by)
    VALUES (p_meter_reading_id, p_measurement_point_id, p_completed_meter_value, p_recorded_by);
  END IF;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.fn_complete_pm_wo_tx(
  UUID, UUID, TIMESTAMPTZ, NUMERIC, TEXT, TEXT, TEXT, UUID, NUMERIC, TEXT,
  TEXT, TEXT, TEXT, NUMERIC, UUID, UUID, UUID, TIMESTAMPTZ, INTEGER, INTEGER, DATE, NUMERIC
) TO anon, authenticated, service_role;
