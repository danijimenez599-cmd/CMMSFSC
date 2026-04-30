-- ========================================================
-- APEX CMMS - FULL DATABASE SCHEMA
-- Target  : Supabase / PostgreSQL
-- Updated : 2026-04 — Soft Delete + Immutable History Architecture
--
-- Key design decisions:
--   • Assets and inventory items are NEVER physically deleted.
--     They are deactivated via status='decommissioned' / active=false.
--   • work_orders.asset_id          → ON DELETE RESTRICT  (replaces CASCADE)
--   • part_usages.inventory_item_id → ON DELETE RESTRICT  (replaces CASCADE)
--   • stock_movements.inventory_item_id → ON DELETE RESTRICT (replaces CASCADE)
--   • Snapshot columns on work_orders freeze who did the work at close-time.
--   • A BEFORE UPDATE trigger makes completed/cancelled WOs immutable.
--   • RLS is intentionally disabled (can be enabled per-table later).
-- ========================================================

-- RESET SCHEMA
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- CORE PERMISSIONS
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- 1. PROFILES
-- ========================================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY,
  full_name   TEXT,
  email       TEXT,
  role        TEXT DEFAULT 'technician' CHECK (role IN ('admin', 'supervisor', 'technician', 'viewer')),
  avatar_url  TEXT,
  specialty   TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 2. ASSETS
-- NOTE: parent_id / location_id use CASCADE within the asset
--       hierarchy (deleting a parent removes children in the tree).
--       The FK from work_orders → assets uses RESTRICT instead,
--       so a decommissioned asset's WO history is never wiped.
-- ========================================================
CREATE TABLE public.assets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id       UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  location_id     UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  code            TEXT UNIQUE,
  asset_type      TEXT NOT NULL CHECK (asset_type IN ('plant', 'area', 'system', 'equipment', 'component')),
  category        TEXT CHECK (category IN ('rotating', 'static', 'electrical', 'instrument', 'civil', 'other')),
  manufacturer    TEXT,
  model           TEXT,
  serial_number   TEXT,
  install_date    DATE,
  warranty_until  DATE,
  criticality     TEXT DEFAULT 'medium' CHECK (criticality IN ('high', 'medium', 'low')),
  -- 'decommissioned' = soft-deleted; filtered out of all UI queries
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'standby', 'decommissioned')),
  description     TEXT,
  specs           JSONB DEFAULT '{}',
  image_url       TEXT,
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 3. MEASUREMENT CONFIGURATIONS
-- ========================================================
CREATE TABLE public.measurement_configs (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  unit           TEXT NOT NULL,
  is_cumulative  BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 4. MEASUREMENT POINTS
-- ========================================================
CREATE TABLE public.measurement_points (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id         UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  config_id        UUID REFERENCES public.measurement_configs(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  unit             TEXT NOT NULL,
  current_value    NUMERIC,
  min_threshold    NUMERIC,
  max_threshold    NUMERIC,
  trigger_wo_title TEXT,
  trigger_priority TEXT DEFAULT 'high',
  last_trigger_at  TIMESTAMPTZ,
  last_reading_at  TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 5. METER READINGS
-- ========================================================
CREATE TABLE public.meter_readings (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  point_id    UUID NOT NULL REFERENCES public.measurement_points(id) ON DELETE CASCADE,
  value       NUMERIC NOT NULL,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── pm_meter_tolerance ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pm_meter_tolerance (
  criticality           TEXT PRIMARY KEY
                          CHECK (criticality IN ('critical','high','medium','low')),
  scheduled_offset_days INTEGER NOT NULL DEFAULT 0 CHECK (scheduled_offset_days >= 0),
  due_offset_days       INTEGER NOT NULL DEFAULT 7  CHECK (due_offset_days >= 1),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.pm_meter_tolerance (criticality, scheduled_offset_days, due_offset_days)
VALUES
  ('critical', 0,  2),
  ('high',     0,  5),
  ('medium',   0, 14),
  ('low',      0, 30)
ON CONFLICT (criticality) DO NOTHING;

-- ========================================================
-- 6. PM PLANS
-- ========================================================
CREATE TABLE public.pm_plans (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                 TEXT NOT NULL,
  description          TEXT,
  trigger_type         TEXT NOT NULL CHECK (trigger_type IN ('calendar', 'meter', 'hybrid')),
  interval_value       INTEGER,
  interval_unit        TEXT CHECK (interval_unit IN ('days', 'weeks', 'months', 'years')),
  interval_mode        TEXT DEFAULT 'fixed' CHECK (interval_mode IN ('fixed', 'floating')),
  lead_days            INTEGER DEFAULT 0,
  meter_interval_value NUMERIC,
  meter_interval_unit  TEXT,
  estimated_duration   NUMERIC,
  criticality          TEXT DEFAULT 'medium' CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 7. PM TASKS
-- ========================================================
CREATE TABLE public.pm_tasks (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pm_plan_id           UUID NOT NULL REFERENCES public.pm_plans(id) ON DELETE CASCADE,
  description          TEXT NOT NULL,
  sort_order           INTEGER DEFAULT 0,
  frequency_multiplier INTEGER DEFAULT 1  -- x1, x2, x4, etc.
);

-- ========================================================
-- 8. ASSET PLANS
-- ========================================================
CREATE TABLE public.asset_plans (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id             UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  pm_plan_id           UUID NOT NULL REFERENCES public.pm_plans(id) ON DELETE CASCADE,
  measurement_point_id UUID REFERENCES public.measurement_points(id) ON DELETE SET NULL,
  next_due_date        DATE,
  next_due_meter       NUMERIC,
  last_completed_at    TIMESTAMPTZ,
  wo_count             INTEGER DEFAULT 0,
  current_cycle_index  INTEGER DEFAULT 1,  -- tracks which PM cycle we are on
  active               BOOLEAN DEFAULT true,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 9. VENDORS
-- ========================================================
CREATE TABLE public.vendors (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  category     TEXT CHECK (category IN ('parts', 'service', 'tools', 'oem', 'other')),
  contact_name TEXT,
  email        TEXT,
  phone        TEXT,
  tax_id       TEXT,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 10. WORK ORDERS
--
-- INTEGRITY RULES:
--   asset_id → ON DELETE RESTRICT
--     Prevents deleting an asset that has any work orders.
--     Assets must be soft-deleted (status = 'decommissioned') instead.
--
-- SNAPSHOT COLUMNS (assigned_to_name_snapshot, vendor_name_snapshot,
--                   pm_plan_name_snapshot, asset_name_snapshot):
--   When a WO is closed, the application writes the human-readable
--   names of who did the work as plain text. These columns are the
--   permanent historical record and survive even if the related
--   profile / vendor is later deactivated or removed.
-- ========================================================
CREATE TABLE public.work_orders (
  id                         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- RESTRICT: cannot delete an asset that still has WO history
  asset_id                   UUID NOT NULL REFERENCES public.assets(id) ON DELETE RESTRICT,
  asset_plan_id              UUID REFERENCES public.asset_plans(id) ON DELETE SET NULL,
  wo_number                  TEXT UNIQUE NOT NULL,
  title                      TEXT NOT NULL,
  description                TEXT,
  wo_type                    TEXT NOT NULL CHECK (wo_type IN ('preventive', 'corrective', 'predictive', 'inspection')),
  status                     TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  priority                   TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  pm_cycle_index             INTEGER,               -- snapshot of the preventive cycle number
  assigned_to                UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_date             DATE,
  due_date                   DATE,
  started_at                 TIMESTAMPTZ,
  completed_at               TIMESTAMPTZ,
  estimated_hours            NUMERIC,
  actual_hours               NUMERIC,
  failure_code               TEXT,
  root_cause                 TEXT,
  resolution                 TEXT,
  generated_from_plan_id     UUID REFERENCES public.pm_plans(id) ON DELETE SET NULL,
  -- Snapshot columns: frozen text values captured at WO close time
  pm_plan_name_snapshot      TEXT,
  asset_name_snapshot        TEXT,
  assigned_to_name_snapshot  TEXT,   -- technician full_name at close time
  vendor_name_snapshot       TEXT,   -- vendor name at close time
  source_point_id            UUID REFERENCES public.measurement_points(id) ON DELETE SET NULL,
  vendor_id                  UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  external_service_cost      NUMERIC DEFAULT 0,
  external_invoice_ref       TEXT,
  completed_meter_value      NUMERIC,
  created_by                 UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at                 TIMESTAMPTZ DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 11. WO TASKS
-- ========================================================
CREATE TABLE public.wo_tasks (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id  UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  sort_order     INTEGER DEFAULT 0,
  description    TEXT NOT NULL,
  completed      BOOLEAN DEFAULT false,
  completed_at   TIMESTAMPTZ,
  completed_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes          TEXT
);

-- ========================================================
-- 12. WO COMMENTS
-- ========================================================
CREATE TABLE public.wo_comments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id  UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  author_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  body           TEXT NOT NULL,
  attachment_url TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 13. INVENTORY ITEMS
--   active = false → soft-deleted; never physically removed
--   so that part_usage and stock_movement history is preserved.
-- ========================================================
CREATE TABLE public.inventory_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  part_number  TEXT UNIQUE,
  description  TEXT,
  category     TEXT,
  unit         TEXT NOT NULL DEFAULT 'und',
  stock_current NUMERIC DEFAULT 0,
  stock_min    NUMERIC DEFAULT 1,
  stock_max    NUMERIC,
  location_bin TEXT,
  unit_cost    NUMERIC,
  -- false = soft-deleted; filtered from all UI queries but history intact
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 14. PART USAGES
--
-- INTEGRITY RULES:
--   inventory_item_id → ON DELETE RESTRICT
--     Prevents deleting an inventory item that has consumption history.
--     Items must be soft-deleted (active = false) instead.
-- ========================================================
CREATE TABLE public.part_usages (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id       UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  -- RESTRICT: cannot delete an inventory item with part usage records
  inventory_item_id   UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
  quantity            NUMERIC NOT NULL DEFAULT 1,
  unit_cost           NUMERIC,
  added_by            UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  added_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- 15. STOCK MOVEMENTS
--
-- INTEGRITY RULES:
--   inventory_item_id → ON DELETE RESTRICT
--     Prevents deleting an inventory item that has stock movement history.
--     Items must be soft-deleted (active = false) instead.
-- ========================================================
CREATE TABLE public.stock_movements (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- RESTRICT: cannot delete an inventory item with stock movement records
  inventory_item_id   UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE RESTRICT,
  type                TEXT NOT NULL CHECK (type IN ('in', 'out', 'return', 'adjustment')),
  quantity            NUMERIC NOT NULL,
  balance_before      NUMERIC NOT NULL,
  balance_after       NUMERIC NOT NULL,
  work_order_id       UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  reason              TEXT,
  performed_by        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  performed_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- INVENTORY TRANSACTION HELPERS
-- Keep part usage, stock balance, and movement ledger atomic.
-- ========================================================
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

-- ========================================================
-- AUTOMATION 1: WORK ORDER AUTO-NUMBERING
-- Format: WO-YY-MM-XXXXX  (e.g. WO-26-04-00001)
-- ========================================================
CREATE OR REPLACE FUNCTION public.fn_assign_wo_number()
RETURNS TRIGGER AS $$
DECLARE
    current_yy TEXT;
    current_mm TEXT;
    next_seq   INT;
BEGIN
    current_yy := TO_CHAR(NOW(), 'YY');
    current_mm := TO_CHAR(NOW(), 'MM');

    SELECT COALESCE(
        MAX(CAST(SUBSTRING(wo_number FROM 10) AS INT)),
        0
    ) + 1
    INTO next_seq
    FROM public.work_orders
    WHERE wo_number LIKE 'WO-' || current_yy || '-' || current_mm || '-%';

    NEW.wo_number := 'WO-' || current_yy || '-' || current_mm || '-' || LPAD(next_seq::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_wo_number
BEFORE INSERT ON public.work_orders
FOR EACH ROW
EXECUTE FUNCTION public.fn_assign_wo_number();

-- ========================================================
-- AUTOMATION 2: IMMUTABILITY TRIGGER FOR CLOSED WORK ORDERS
--
-- Once a WO reaches 'completed' or 'cancelled' it becomes a
-- permanent historical record.  Any further UPDATE attempt —
-- regardless of where it originates — is rejected at the DB level.
-- This is the final line of defence complementing the RESTRICT FKs.
-- ========================================================
CREATE OR REPLACE FUNCTION public.prevent_closed_wo_updates()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IN ('completed', 'cancelled') THEN
        RAISE EXCEPTION
            'Integridad bloqueada: No se puede modificar una Orden de Trabajo '
            'que ya está cerrada (estado: %). ID: %', OLD.status, OLD.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_closed_wo_updates
BEFORE UPDATE ON public.work_orders
FOR EACH ROW
EXECUTE FUNCTION public.prevent_closed_wo_updates();

-- ========================================================
-- PERFORMANCE INDEXES
-- ========================================================
CREATE INDEX idx_assets_parent         ON public.assets(parent_id);
CREATE INDEX idx_assets_status         ON public.assets(status);
CREATE INDEX idx_work_orders_asset     ON public.work_orders(asset_id);
CREATE INDEX idx_work_orders_status    ON public.work_orders(status);
CREATE INDEX idx_work_orders_completed ON public.work_orders(completed_at);
CREATE INDEX idx_wo_tasks_wo           ON public.wo_tasks(work_order_id);
CREATE INDEX idx_asset_plans_asset     ON public.asset_plans(asset_id);
CREATE INDEX idx_inventory_active      ON public.inventory_items(active);
CREATE INDEX idx_part_usages_item      ON public.part_usages(inventory_item_id);
CREATE INDEX idx_stock_movements_item  ON public.stock_movements(inventory_item_id);

-- ========================================================
-- FINAL PERMISSIONS GRANT
-- ========================================================
GRANT ALL ON ALL TABLES    IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Disable RLS — re-enable per-table when ready
ALTER TABLE public.profiles            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets              DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_plans            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_plans         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wo_tasks            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wo_comments         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_points  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_readings      DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_meter_tolerance  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_usages         DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors             DISABLE ROW LEVEL SECURITY;

-- ========================================================
-- AUTOMATION 3: AUTH SYNC  (Supabase Auth → profiles)
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'admin'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing auth users after schema reset
INSERT INTO public.profiles (id, full_name, role)
SELECT id, email, 'admin'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- DEV: ensure a default local test user always exists
INSERT INTO public.profiles (id, full_name, role)
VALUES ('00000000-0000-4000-a000-000000000000', 'Administrador (Dev)', 'admin')
ON CONFLICT (id) DO NOTHING;
