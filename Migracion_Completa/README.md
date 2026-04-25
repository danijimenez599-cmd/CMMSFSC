# APEX CMMS v2.5.0 - Migración Completa

## 📋 Descripción

Migración completa de datos para el sistema APEX CMMS v2.5.0.

## 📁 Estructura

```
Migracion_Completa/
├── README.md                              # Este archivo
├── scripts/
│   ├── migracion_completa.py              # Script principal de migración
│   ├── consolidar.py                      # Consolida SQL en un solo archivo
│   └── extraer_csv.py                     # Extrae Excel a CSV
├── sql/
│   └── separados/
│       └── 08_work_orders.sql             # Todos los INSERTs
├── consolidado/
│   └── MIGRACION_COMPLETA.sql            # Schema + Datos (archivo final)
└── datos_originales/
    ├── Arbol_Equipos.csv                 # Inventario de equipos
    ├── Historico_MTTO.csv                # Histórico de mantenimientos
    └── PM_*.csv                          # Planes de mantenimiento
```

## 📊 Datos Migrados

| Tabla | Cantidad |
|-------|----------|
| Profiles | 1 |
| Assets (plant) | 1 |
| Assets (areas) | 8 |
| Assets (equipos) | 181 |
| Vendors | 9 |
| PM Plans | 41 |
| PM Tasks | 619 |
| Asset Plans | 41 |
| Work Orders | 217 |

---

## 🤖 INSTRUCCIONES PARA OTRA AI

### LOGICA DE MIGRACION

#### 1. DATOS DE ENTRADA

Los datos están en `datos_originales/` en formato CSV:

**a) Arbol_Equipos.csv** - Inventario de equipos
- Columnas importantes:
  - `Planta`: PTAR1, PTAR2, etc.
  - `Descripcion Planta`: Nombre del área (PTAR1, PTAR2, Planta Ozono, etc.)
  - `Codigo Equipo`: Código base sin correlativo (PTAR1.AA.AE)
  - `Descripcion Nombre`: Nombre descriptivo del equipo (Aireador de 20 HP)
  - `Cantidad de equipos `: Cantidad de equipos de este tipo

**b) Historico_MTTO.csv** - Órdenes de trabajo cerradas
- Columnas importantes:
  - `CodigoYCorr`: Código con correlativo (PTAR1.AA.AE.1)
  - `ID`: ID original de la OT
  - `Descripcion de actividad`: Título de la OT
  - `Actividades programadas`: Descripción/Resolución
  - `Fecha de Mantenimiento`: Fecha de cierre
  - `Preventivo`: Si/No
  - `Taller Externo`: Nombre del taller
  - `Costo `: Costo del servicio

**c) PM_*.csv** - Planes de mantenimiento (41 archivos)
- Estructura irregular, buscar en columnas 2, 3, 4:
  - Columna 2: Parte del equipo (Motor, Reductor, etc.)
  - Columna 3: Intervalo (Quincenal, Mensual, Trimestral, Anual)
  - Columna 4: Labor/Tarea de mantenimiento

---

#### 2. GENERACION DE UUIDs

Usar prefijos consistentes para cada tipo:
```
Plant:      00000000-0000-4000-b000-000000000001
Area:       00000000-0000-4000-b000-000000000002 + i
Equipment:  00000000-0000-4000-b000-000000001000 + i
Vendor:     00000000-0000-4000-b000-000000010000 + i
PM Plan:    00000000-0000-4000-b000-000000030000 + i
PM Task:    00000000-0000-4000-b000-000000040000 + i
Asset Plan: 00000000-0000-4000-b000-000000050000 + i
WO:         00000000-0000-4000-b000-000000020000 + i
```

---

#### 3. MIGRACION DE ASSETS

1. Crear Plant con código PLANT-01
2. Crear Áreas únicas de `Descripcion Planta`
3. Para cada equipo en Arbol_Equipos.csv:
   - Código: `{Codigo Equipo}-{01,02,...,cantidad}`
   - Nombre: `Descripcion Nombre`
   - Tag: Guardar código original en campo `code`

**Importante**: El código (ej: PTAR1.AA.AE-01) es el tag que vincula Assets con Work Orders.

---

#### 4. MIGRACION DE PM PLANS

1. Para cada archivo PM_*.csv:
   - Extraer código base del nombre (PM_PTAR1_AA_AE20.xlsx → PTAR1.AA.AE)
   - Buscar nombre en Arbol_Equipos.csv → usar `Descripcion Nombre`
   - Nombre del plan: `{Nombre Equipo} ({Código})`
   
2. Determinar frecuencia base del plan:
   - Quincenal → interval_value=15, interval_unit='days'
   - Mensual → interval_value=1, interval_unit='months'
   - Trimestral → interval_value=3, interval_unit='months'
   - Anual → interval_value=12, interval_unit='months'

3. Cada tarea tiene `frequency_multiplier`:
   - Quincenal/Mensual → multiplier=1
   - Trimestral → multiplier=3
   - Anual → multiplier=12

---

#### 5. MIGRACION DE WORK ORDERS

1. De Historico_MTTO.csv, por cada registro:
   - Parsear `CodigoYCorr`: PTAR1.AA.AE.1 → código=PTAR1.AA.AE, corr=1
   - Asset ID: Buscar en Assets el código `{código}-{corr:02d}`
   
2. WO Number basado en fecha real:
   ```
   Fecha: 2023-09-15, Correlativo mensual: 1
   → WO-23-09-00001
   ```
   
3. Scheduled_date (fecha abierto):
   - Preventivo: completed_at - 7 días
   - Correctivo: completed_at - 2 días

4. **RESOLUTION**: Combinar ID original + actividades:
   ```
   ID: 280 | Necesita embobinado y cambio de rodamientos
   ```

5. **BYPASS DE TRIGGERS** (Supabase):
   ```sql
   ALTER TABLE public.work_orders DISABLE TRIGGER USER;
   -- [INSERTs]
   ALTER TABLE public.work_orders ENABLE TRIGGER USER;
   ```

---

#### 6. RELACIONES

- Asset → Area (parent_id)
- Asset Plan → Asset + PM Plan (vincular cada equipo a su plan)
- Work Order → Asset (asset_id)
- Work Order → Vendor (vendor_id, si aplica)
- Work Order → Asset Plan (asset_plan_id, si aplica)

---

## 🚀 USO

### Regenerar desde CSV:
```bash
cd Migracion_Completa/scripts
python migracion_completa.py
python consolidar.py
```

### Cargar en Supabase:
1. Abrir `consolidado/MIGRACION_COMPLETA.sql`
2. Ejecutar todo el archivo

---

## 📝 NOTES
- El campo `code` en assets guarda el código original (PTAR1.AA.AE-01)
- Los Asset Plans vinculan equipos a sus PM Plans
- El bypass de triggers permite inyectar WO numbers basados en fechas reales
- El campo `resolution` guarda: `ID: XXX | [actividades realizadas]`

---
*Generado: 2026-04-25*