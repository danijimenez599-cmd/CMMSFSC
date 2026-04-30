-- Transactional inventory helpers.
-- Safe to re-run.

CREATE OR REPLACE FUNCTION public.fn_adjust_stock_tx(
  p_item_id UUID,
  p_type TEXT,
  p_quantity NUMERIC,
  p_work_order_id UUID DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_performed_by UUID DEFAULT NULL,
  p_movement_id UUID DEFAULT uuid_generate_v4()
)
RETURNS VOID AS $$
DECLARE
  v_before NUMERIC;
  v_after NUMERIC;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'La cantidad debe ser mayor que cero.';
  END IF;

  SELECT stock_current INTO v_before
  FROM public.inventory_items
  WHERE id = p_item_id AND active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Repuesto no encontrado o inactivo: %', p_item_id;
  END IF;

  CASE p_type
    WHEN 'in' THEN v_after := v_before + p_quantity;
    WHEN 'return' THEN v_after := v_before + p_quantity;
    WHEN 'out' THEN
      IF v_before < p_quantity THEN
        RAISE EXCEPTION 'Stock insuficiente. Disponible: %, solicitado: %', v_before, p_quantity;
      END IF;
      v_after := v_before - p_quantity;
    WHEN 'adjustment' THEN v_after := p_quantity;
    ELSE
      RAISE EXCEPTION 'Tipo de movimiento invalido: %', p_type;
  END CASE;

  UPDATE public.inventory_items
  SET stock_current = v_after, updated_at = NOW()
  WHERE id = p_item_id;

  INSERT INTO public.stock_movements (
    id, inventory_item_id, type, quantity, balance_before, balance_after,
    work_order_id, reason, performed_by
  )
  VALUES (
    p_movement_id, p_item_id, p_type, p_quantity, v_before, v_after,
    p_work_order_id, p_reason, p_performed_by
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.fn_add_part_usage_tx(
  p_usage_id UUID,
  p_work_order_id UUID,
  p_item_id UUID,
  p_quantity NUMERIC,
  p_added_by UUID DEFAULT NULL,
  p_movement_id UUID DEFAULT uuid_generate_v4()
)
RETURNS VOID AS $$
DECLARE
  v_before NUMERIC;
  v_after NUMERIC;
  v_unit_cost NUMERIC;
  v_status TEXT;
BEGIN
  IF p_quantity IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'La cantidad debe ser mayor que cero.';
  END IF;

  SELECT status INTO v_status
  FROM public.work_orders
  WHERE id = p_work_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orden de trabajo no encontrada: %', p_work_order_id;
  END IF;

  IF v_status IN ('completed', 'cancelled') THEN
    RAISE EXCEPTION 'No se pueden consumir repuestos en una OT cerrada.';
  END IF;

  SELECT stock_current, unit_cost INTO v_before, v_unit_cost
  FROM public.inventory_items
  WHERE id = p_item_id AND active = true
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Repuesto no encontrado o inactivo: %', p_item_id;
  END IF;

  IF v_before < p_quantity THEN
    RAISE EXCEPTION 'Stock insuficiente. Disponible: %, solicitado: %', v_before, p_quantity;
  END IF;

  v_after := v_before - p_quantity;

  INSERT INTO public.part_usages (
    id, work_order_id, inventory_item_id, quantity, unit_cost, added_by
  )
  VALUES (
    p_usage_id, p_work_order_id, p_item_id, p_quantity, COALESCE(v_unit_cost, 0), p_added_by
  );

  UPDATE public.inventory_items
  SET stock_current = v_after, updated_at = NOW()
  WHERE id = p_item_id;

  INSERT INTO public.stock_movements (
    id, inventory_item_id, type, quantity, balance_before, balance_after,
    work_order_id, reason, performed_by
  )
  VALUES (
    p_movement_id, p_item_id, 'out', p_quantity, v_before, v_after,
    p_work_order_id, 'Consumo en OT', p_added_by
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.fn_remove_part_usage_tx(
  p_usage_id UUID,
  p_work_order_id UUID,
  p_performed_by UUID DEFAULT NULL,
  p_movement_id UUID DEFAULT uuid_generate_v4()
)
RETURNS VOID AS $$
DECLARE
  v_usage public.part_usages%ROWTYPE;
  v_before NUMERIC;
  v_after NUMERIC;
  v_status TEXT;
BEGIN
  SELECT status INTO v_status
  FROM public.work_orders
  WHERE id = p_work_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orden de trabajo no encontrada: %', p_work_order_id;
  END IF;

  IF v_status IN ('completed', 'cancelled') THEN
    RAISE EXCEPTION 'No se pueden devolver repuestos en una OT cerrada.';
  END IF;

  SELECT * INTO v_usage
  FROM public.part_usages
  WHERE id = p_usage_id AND work_order_id = p_work_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Consumo de repuesto no encontrado: %', p_usage_id;
  END IF;

  SELECT stock_current INTO v_before
  FROM public.inventory_items
  WHERE id = v_usage.inventory_item_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Repuesto no encontrado: %', v_usage.inventory_item_id;
  END IF;

  v_after := v_before + v_usage.quantity;

  DELETE FROM public.part_usages WHERE id = p_usage_id;

  UPDATE public.inventory_items
  SET stock_current = v_after, updated_at = NOW()
  WHERE id = v_usage.inventory_item_id;

  INSERT INTO public.stock_movements (
    id, inventory_item_id, type, quantity, balance_before, balance_after,
    work_order_id, reason, performed_by
  )
  VALUES (
    p_movement_id, v_usage.inventory_item_id, 'return', v_usage.quantity, v_before, v_after,
    p_work_order_id, 'Devolucion de consumo en OT', p_performed_by
  );
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.fn_adjust_stock_tx(UUID, TEXT, NUMERIC, UUID, TEXT, UUID, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_add_part_usage_tx(UUID, UUID, UUID, NUMERIC, UUID, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.fn_remove_part_usage_tx(UUID, UUID, UUID, UUID) TO anon, authenticated, service_role;
