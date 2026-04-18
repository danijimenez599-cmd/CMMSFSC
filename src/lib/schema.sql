-- ================================================================
-- APEX CMMS — Schema SQL para Supabase
-- Ejecuta este script en: app.supabase.com → SQL Editor
-- ================================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUMS ─────────────────────────────────────────────────────────
CREATE TYPE user_role        AS ENUM ('ADMIN','SUPERVISOR','TECHNICIAN');
CREATE TYPE criticality_level AS ENUM ('HIGH','MEDIUM','LOW');
CREATE TYPE asset_status     AS ENUM ('OPERATIONAL','IN_REPAIR','OUT_OF_SERVICE');
CREATE TYPE asset_category   AS ENUM ('plant','area','equip');
CREATE TYPE wo_priority      AS ENUM ('URGENT','HIGH','NORMAL','LOW');
CREATE TYPE wo_status        AS ENUM ('OPEN','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED');
CREATE TYPE wo_type          AS ENUM ('CORRECTIVE','PREVENTIVE');
CREATE TYPE pm_trigger       AS ENUM ('TIME_BASED','METER_BASED');

-- ── USERS ─────────────────────────────────────────────────────────
CREATE TABLE users (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  role          user_role NOT NULL DEFAULT 'TECHNICIAN',
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── LOCATIONS ─────────────────────────────────────────────────────
CREATE TABLE locations (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT NOT NULL,
  description TEXT
);

-- ── ASSETS ────────────────────────────────────────────────────────
CREATE TABLE assets (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  parent_id     TEXT REFERENCES assets(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  location_id   TEXT REFERENCES locations(id) ON DELETE SET NULL,
  category      asset_category NOT NULL DEFAULT 'equip',
  brand         TEXT NOT NULL DEFAULT '',
  model         TEXT NOT NULL DEFAULT '',
  serial_number TEXT NOT NULL DEFAULT '',
  criticality   criticality_level NOT NULL DEFAULT 'MEDIUM',
  status        asset_status NOT NULL DEFAULT 'OPERATIONAL',
  install_date  TIMESTAMPTZ,
  photo_url     TEXT,
  notes         TEXT NOT NULL DEFAULT '',
  qr_code       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── WORK ORDERS ───────────────────────────────────────────────────
CREATE TABLE work_orders (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title            TEXT NOT NULL,
  description      TEXT NOT NULL DEFAULT '',
  asset_id         TEXT REFERENCES assets(id) ON DELETE SET NULL,
  reported_by_id   TEXT REFERENCES users(id) ON DELETE SET NULL,
  assigned_to_id   TEXT REFERENCES users(id) ON DELETE SET NULL,
  priority         wo_priority NOT NULL DEFAULT 'NORMAL',
  status           wo_status NOT NULL DEFAULT 'OPEN',
  type             wo_type NOT NULL DEFAULT 'CORRECTIVE',
  due_date         TIMESTAMPTZ,
  started_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  time_spent_min   INTEGER,
  resolution_notes TEXT,
  pm_plan_id       TEXT,   -- referencia lógica a asset_plans.id
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── WO COMMENTS ───────────────────────────────────────────────────
CREATE TABLE wo_comments (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  work_order_id  TEXT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text           TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── WO TASKS (Checklist snapshot) ────────────────────────────────
CREATE TABLE wo_tasks (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  wo_id       TEXT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  completed   BOOLEAN NOT NULL DEFAULT false,
  "order"     INTEGER NOT NULL DEFAULT 0
);

-- ── PM PLANS ─────────────────────────────────────────────────────
CREATE TABLE pm_plans (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name              TEXT NOT NULL,
  trigger_type      pm_trigger NOT NULL DEFAULT 'TIME_BASED',
  frequency_days    INTEGER NOT NULL DEFAULT 30,
  tolerance_days    INTEGER NOT NULL DEFAULT 3,
  meter_unit        TEXT,
  meter_interval    NUMERIC,
  default_assign_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  active            BOOLEAN NOT NULL DEFAULT true,
  notes             TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PM TASKS ─────────────────────────────────────────────────────
CREATE TABLE pm_tasks (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  pm_plan_id TEXT NOT NULL REFERENCES pm_plans(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  "order"     INTEGER NOT NULL DEFAULT 0
);

-- ── ASSET PLANS (equipo ↔ plan, muchos a muchos) ─────────────────
CREATE TABLE asset_plans (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  asset_id      TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  pm_plan_id    TEXT NOT NULL REFERENCES pm_plans(id) ON DELETE CASCADE,
  next_due_date TIMESTAMPTZ,
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(asset_id, pm_plan_id)
);

-- ── INVENTORY ITEMS ───────────────────────────────────────────────
CREATE TABLE inventory_items (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name          TEXT NOT NULL,
  sku           TEXT NOT NULL DEFAULT '',
  category      TEXT NOT NULL DEFAULT 'consumable',
  current_stock NUMERIC NOT NULL DEFAULT 0,
  min_stock     NUMERIC NOT NULL DEFAULT 0,
  unit          TEXT NOT NULL DEFAULT 'pcs',
  unit_cost     NUMERIC NOT NULL DEFAULT 0,
  location      TEXT NOT NULL DEFAULT '',
  supplier      TEXT NOT NULL DEFAULT '',
  notes         TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── PART USAGES ───────────────────────────────────────────────────
CREATE TABLE part_usages (
  id                TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  work_order_id     TEXT NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  inventory_item_id TEXT NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity          NUMERIC NOT NULL,
  used_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── TRIGGERS: updated_at automático ──────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at          BEFORE UPDATE ON users          FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_assets_updated_at         BEFORE UPDATE ON assets         FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_work_orders_updated_at    BEFORE UPDATE ON work_orders    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_pm_plans_updated_at       BEFORE UPDATE ON pm_plans       FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_inventory_updated_at      BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── ÍNDICES para performance ──────────────────────────────────────
CREATE INDEX idx_assets_parent_id      ON assets(parent_id);
CREATE INDEX idx_work_orders_asset_id  ON work_orders(asset_id);
CREATE INDEX idx_work_orders_status    ON work_orders(status);
CREATE INDEX idx_work_orders_due_date  ON work_orders(due_date);
CREATE INDEX idx_asset_plans_asset_id  ON asset_plans(asset_id);
CREATE INDEX idx_asset_plans_due       ON asset_plans(next_due_date);
CREATE INDEX idx_wo_tasks_wo_id        ON wo_tasks(wo_id);
CREATE INDEX idx_pm_tasks_plan_id      ON pm_tasks(pm_plan_id);
CREATE INDEX idx_part_usages_wo_id     ON part_usages(work_order_id);
CREATE INDEX idx_wo_comments_wo_id     ON wo_comments(work_order_id);

-- ── ROW LEVEL SECURITY (habilitar cuando implementes Auth real) ───
-- ALTER TABLE assets         ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE work_orders    ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
-- etc...
--
-- Política básica de ejemplo (todos los usuarios autenticados ven todo):
-- CREATE POLICY "authenticated_all" ON assets
--   FOR ALL USING (auth.role() = 'authenticated');

-- ── VISTA: OTs con datos de activo y técnico ──────────────────────
CREATE VIEW v_work_orders AS
SELECT
  wo.*,
  a.name          AS asset_name,
  a.serial_number AS asset_serial,
  u.name          AS assigned_to_name
FROM work_orders wo
LEFT JOIN assets a ON wo.asset_id = a.id
LEFT JOIN users  u ON wo.assigned_to_id = u.id;

-- ── NOTA: datos de ejemplo ────────────────────────────────────────
-- Los datos demo del archivo src/data/defaults.ts se cargarán
-- automáticamente desde el store cuando no hay datos en Supabase.
-- Para cargar datos de prueba, ejecuta el seed script o usa
-- el botón "Reset Demo" en la app (que resetea localStorage).
