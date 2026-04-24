-- ========================================================
-- APEX CMMS - FULL DATABASE SCHEMA (FIXED PERMISSIONS)
-- Target: Supabase / PostgreSQL
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

-- 1. PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'technician' CHECK (role IN ('admin', 'manager', 'technician', 'viewer')),
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
  interval_mode TEXT DEFAULT 'fixed' CHECK (interval_mode IN ('fixed', 'floating')),
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
  sort_order INTEGER DEFAULT 0
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
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. WORK ORDERS
CREATE SEQUENCE IF NOT EXISTS public.wo_number_seq START WITH 1;

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
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. WO TASKS
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

-- 11. WO COMMENTS
CREATE TABLE public.wo_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. INVENTORY ITEMS
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

-- 13. PART USAGES
CREATE TABLE public.part_usages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES public.work_orders(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_cost NUMERIC,
  added_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. STOCK MOVEMENTS
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
-- ========================================================
CREATE OR REPLACE FUNCTION public.fn_assign_wo_number()
RETURNS TRIGGER AS $$
DECLARE
    current_year TEXT;
    next_seq BIGINT;
BEGIN
    current_year := TO_CHAR(NOW(), 'YYYY');
    SELECT nextval('public.wo_number_seq') INTO next_seq;
    NEW.wo_number := 'WO-' || current_year || '-' || LPAD(next_seq::TEXT, 5, '0');
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
CREATE INDEX idx_assets_parent ON public.assets(parent_id);
CREATE INDEX idx_work_orders_asset ON public.work_orders(asset_id);
CREATE INDEX idx_work_orders_status ON public.work_orders(status);
CREATE INDEX idx_wo_tasks_wo ON public.wo_tasks(work_order_id);
CREATE INDEX idx_asset_plans_asset ON public.asset_plans(asset_id);

-- ========================================================
-- FINAL PERMISSIONS GRANT
-- ========================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- Disable RLS for now to ensure connectivity, user can re-enable later if needed
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pm_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wo_tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_configs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.measurement_points DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.meter_readings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.wo_comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.part_usages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements DISABLE ROW LEVEL SECURITY;

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

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- EMERGENCY: Backfill existing users (since we dropped the schema)
INSERT INTO public.profiles (id, full_name, role)
SELECT id, email, 'admin' 
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- DEV MODE: Ensure the standard dev user exists for local testing
INSERT INTO public.profiles (id, full_name, role)
VALUES ('00000000-0000-4000-a000-000000000000', 'Administrador (Dev)', 'admin')
ON CONFLICT (id) DO NOTHING;

