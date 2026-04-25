"""
Consolida todos los SQLs en un solo archivo
"""

import os

BASE_DIR = r"d:\Apex development\Datos A tratar\Migracion_Completa"
SCHEMA_FILE = r"d:\Apex development\Datos A tratar\Ejemplos y nuevo schema\schema.sql"
DATOS_FILE = r"d:\Apex development\Datos A tratar\Migracion_Completa\sql\separados\08_work_orders.sql"
OUTPUT_FILE = os.path.join(BASE_DIR, "consolidado", "MIGRACION_COMPLETA.sql")

# Leer schema
with open(SCHEMA_FILE, 'r', encoding='utf-8') as f:
    schema = f.read()

# Leer datos
with open(DATOS_FILE, 'r', encoding='utf-8') as f:
    datos = f.read()

# Consolidar
consolidado = f"""-- ============================================================================
-- APEX CMMS v2.5.0 - MIGRACIÓN COMPLETA
-- ============================================================================
-- Fecha: 2026-04-25
-- Incluya: Schema + Profiles + Assets + Vendors + PM Plans + PM Tasks + 
--          Asset Plans + Work Orders
-- ============================================================================

{schema}

-- ============================================================================
-- DATOS DE MIGRACIÓN
-- ============================================================================
{datos}
"""

with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
    f.write(consolidado)

# Obtener tamaño
tamano = os.path.getsize(OUTPUT_FILE)
print(f"Archivo consolidado: {OUTPUT_FILE}")
print(f"Tamaño: {tamano:,} bytes ({tamano/1024:.1f} KB)")