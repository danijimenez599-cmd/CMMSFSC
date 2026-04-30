-- Adds the closure-time meter snapshot used by Work Orders.
-- Safe to re-run.

ALTER TABLE public.work_orders
ADD COLUMN IF NOT EXISTS completed_meter_value NUMERIC;
