-- ========================================================
-- APEX CMMS - FULL DATABASE SCHEMA
-- Target: Supabase / PostgreSQL
-- Version: 1.3.1 (post-audit fixes)
-- ========================================================

-- RESET SCHEMA
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- CORE PERMISSIONS
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- SEQUENCES
-- ========================================================

-- FIX 4.1: Use a sequence for WO numbering instead of MAX() query.
-- nextval() is atomic — eliminates the race condition where concurrent
-- inserts could read the same MAX and generate duplicate wo_numbers.
CREATE SEQUENCE public.wo_number_seq START 1;

-- ========================================================
-- TABLES
-- ========================================================

-- 1. PROFILES
-- FIX 4.3: role CHECK now uses 'supervisor' to match TypeScript UserRole type.
-- Removed 'manager' which was only in SQL and caused silent mismatches with the frontend.
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'technician' CHECK (role IN ('admin', 'supervisor', 'technician', 'viewer')),
  avatar_url TEXT,
  specialty TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ASSETS
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('plant', 'area', 'system', 'equipment', 'component')),
  category TEXT CHECK (category IN ('rotating', 'static', 'electrical', 'instrument', 'civil', 'other')),
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  install_date DATE,
  warranty_until DATE,
  criticality TEXT DEFAULT 'medium' CHECK (criticality IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'standby', 'decommissioned')),
  description TEXT,
  specs JSONB DEFAULT '{}',
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MEASUREMENT CONFIGURATIONS
CREATE TABLE public.measurement_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  is_cumulative BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MEASUREMENT POINTS
CREATE TABLE public.measurement_points (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  config_id UUID REFERENCES public.measurement_configs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  current_value NUMERIC,
  min_threshold NUMERIC,
  max_threshold NUMERIC,
  trigger_wo_title TEXT,
  trigger_priority TEXT DEFAULT 'high',
  last_trigger_at TIMESTAMPTZ,
  last_reading_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. METER READINGS
CREATE TABLE public.meter_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  point_id UUID NOT NULL REFERENCES public.measurement_points(id) ON DELETE CASCADE,
  value NUMERIC NOT NULL,
  recorded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. PM PLANS
CREATE TABLE public.pm_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('calendar', 'meter', 'hybrid')),
  interval_value INTEGER,
  interval_unit TEXT CHECK (interval_unit IN ('days', 'weeks', 'months', 'years')),
  -- FIX 2.3: interval_mode drives fixed vs floating scheduling logic in the PM engine.
  -- fixed   = next due advances from the previous due date (rigid calendar)
  -- floating = next due advances from the completion date (adaptive)
  interval_mode TEXT DEFAULT 'floating' CHECK (interval_mode IN ('fixed', 'floating')),
  lead_days INTEGER DEFAULT 0,
  meter_interval_value NUMERIC,
  meter_interval_unit TEXT,
  estimated_duration NUMERIC,
  criticality TEXT DEFAULT 'medium' CHECK (criticality IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PM TASKS
CREATE TABLE public.pm_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pm_plan_id UUID NOT NULL REFERENCES public.pm_plans(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  frequency_multiplier INTEGER DEFAULT 1  -- x1 = every cycle, x3 = every 3rd cycle, etc.
);

-- 8. ASSET PLANS
CREATE TABLE public.asset_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  pm_plan_id UUID NOT NULL REFERENCES public.pm_plans(id) ON DELETE CASCADE,
  measurement_point_id UUID REFERENCES public.measurement_points(id) ON DELETE SET NULL,
  next_due_date DATE,
  next_due_meter NUMERIC,
  last_completed_at TIMESTAMPTZ,
  wo_count INTEGER DEFAULT 0,
  current_cycle_index INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. VENDORS
CREATE TABLE public.vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  tax_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. WORK ORDERS
CREATE TABLE public.work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  asset_plan_id UUID REFERENCES public.asset_plans(id) ON DELETE SET NULL,
  wo_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  wo_type TEXT NOT NULL CHECK (wo_type IN ('preventive', 'corrective', 'predictive', 'inspection')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('critical', 'high', 'medium', 'low')),
  pm_cycle_index INTEGER,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  scheduled_date DATE,
  due_date DATE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  failure_code TEXT,
  root_cause TEXT,
  resolution TEXT,
  generated_from_plan_id UUID,
  pm_plan_name_snapshot TEXT,
  source_point_id UUID REFERENCES public.measurement_points(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
  external_service_cost NUMERIC DEFAULT 0,
  external_invoice_ref TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. WO TASKS
CREATE TABLE public.wo_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  description TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT
);

-- 12. WO COMMENTS
-- FIX 4.4: author_id must be nullable because ON DELETE SET NULL requires it.
-- The previous NOT NULL + ON DELETE SET NULL was a contradiction that would
-- cause a constraint violation whenever the referenced profile was deleted.
CREATE TABLE public.wo_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. INVENTORY ITEMS
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  part_number TEXT UNIQUE,
  description TEXT,
  category TEXT,
  unit TEXT NOT NULL DEFAULT 'und',
  stock_current NUMERIC DEFAULT 0,
  stock_min NUMERIC DEFAULT 1,
  stock_max NUMERIC,
  location_bin TEXT,
  unit_cost NUMERIC,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PART USAGES
CREATE TABLE public.part_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_cost NUMERIC,
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. STOCK MOVEMENTS
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in', 'out', 'return', 'adjustment')),
  quantity NUMERIC NOT NULL,
  balance_before NUMERIC NOT NULL,
  balance_after NUMERIC NOT NULL,
  work_order_id UUID REFERENCES public.work_orders(id) ON DELETE SET NULL,
  reason TEXT,
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  performed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- AUTOMATION: WORK ORDER NUMBERING TRIGGER
-- FIX 4.1: Replaced MAX() query with nextval() on a sequence.
-- MAX() had a race condition under concurrent inserts: two transactions
-- could read the same MAX and generate duplicate wo_numbers, causing the
-- UNIQUE constraint to reject the second insert.
-- nextval() is atomic and serialized by PostgreSQL — no duplicates possible.
-- Format: WO-YY-MM-NNNNN (e.g. WO-26-04-00001). The sequence is global
-- and does not reset per month, but uniqueness is guaranteed at all times.
-- ========================================================
CREATE OR REPLACE FUNCTION public.fn_assign_wo_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.wo_number := 'WO-' || TO_CHAR(NOW(), 'YY') || '-' ||
                     TO_CHAR(NOW(), 'MM') || '-' ||
                     LPAD(nextval('public.wo_number_seq')::TEXT, 5, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_assign_wo_number
BEFORE INSERT ON public.work_orders
FOR EACH ROW
EXECUTE FUNCTION public.fn_assign_wo_number();

-- ========================================================
-- PERFORMANCE INDEXES
-- ========================================================
CREATE INDEX idx_assets_parent        ON public.assets(parent_id);
CREATE INDEX idx_work_orders_asset    ON public.work_orders(asset_id);
CREATE INDEX idx_work_orders_status   ON public.work_orders(status);
-- FIX 5.1: Support the 90-day historic WO filter (completed_at >= cutoff)
CREATE INDEX idx_work_orders_completed ON public.work_orders(completed_at);
CREATE INDEX idx_wo_tasks_wo          ON public.wo_tasks(work_order_id);
CREATE INDEX idx_asset_plans_asset    ON public.asset_plans(asset_id);
CREATE INDEX idx_asset_plans_active   ON public.asset_plans(active);

-- ========================================================
-- FINAL PERMISSIONS GRANT
-- ========================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Disable RLS for now — re-enable per table once row-level policies are defined
ALTER TABLE public.profiles          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets            DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_plans          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_plans       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wo_tasks          DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wo_comments       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_points  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_readings    DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_usages       DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements   DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors           DISABLE ROW LEVEL SECURITY;

-- ========================================================
-- AUTOMATION: AUTH SYNC (Supabase Auth -> Profiles)
-- ========================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'avatar_url', 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing Supabase Auth users into profiles
INSERT INTO public.profiles (id, full_name, role)
SELECT id, email, 'admin'
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Dev mode: ensure the standard dev user exists for local testing
-- This UUID is used by loginAsDev() in authSlice.ts
INSERT INTO public.profiles (id, full_name, role)
VALUES ('00000000-0000-4000-a000-000000000000', 'Administrador (Dev)', 'admin')
ON CONFLICT (id) DO NOTHING;
