"""
MIGRACIÓN COMPLETA APEX CMMS v2.5.0
Incluye: Profiles, Assets, Vendors, PM Plans, PM Tasks, Asset Plans, Work Orders
CORRECCIONES:
- PM Plans usan nombre del equipo (Descripcion Nombre)
- Work Orders con bypass de trigger y resolution con ID + actividades
"""

import pandas as pd
import os
from datetime import datetime, timedelta

# ============================================================================
# CONFIGURACIÓN
# ============================================================================
BASE_DIR = r"d:\Apex development\Datos A tratar\Migracion_Completa"
DATOS_FILE = r"d:\Apex development\Datos A tratar\PlanesMtto\Datos.xlsx"
PLANES_DIR = r"d:\Apex development\Datos A tratar\PlanesMtto\Planes"

# ============================================================================
# FUNCIONES UTILITARIAS
# ============================================================================

def uuid_base(tipo, indice):
    """Genera UUIDs consistentes"""
    prefijos = {
        'plant': '00000000-0000-4000-b000-000000000001',
        'area': '00000000-0000-4000-b000-000000000002',
        'equipment': '00000000-0000-4000-b000-000000001000',
        'vendor': '00000000-0000-4000-b000-000000010000',
        'pm_plan': '00000000-0000-4000-b000-000000030000',
        'pm_task': '00000000-0000-4000-b000-000000040000',
        'asset_plan': '00000000-0000-4000-b000-000000050000',
        'wo': '00000000-0000-4000-b000-000000020000',
    }
    prefijo = prefijos.get(tipo, '00000000-0000-4000-b000-000000000000')
    return prefijo[:-len(str(indice))] + str(indice)

def limpiar_texto(texto):
    """Limpia texto de caracteres problemáticos"""
    if pd.isna(texto):
        return ''
    return str(texto).replace("'", "''").replace("\n", " ").replace("\r", " ").strip()[:500]

def calcular_fecha_abierto(fecha_cierre, tipo):
    """Calcula fecha de abierto según tipo de trabajo"""
    if pd.isna(fecha_cierre):
        return None
    try:
        fc = pd.to_datetime(fecha_cierre)
        if tipo == 'preventive':
            return fc - timedelta(days=7)
        else:
            return fc - timedelta(days=2)
    except:
        return None

# ============================================================================
# CLASE PRINCIPAL DE MIGRACIÓN
# ============================================================================

class MigracionAPEX:
    
    def __init__(self):
        self.sql = []
        self.equipo_ids = {}           # codigo_asset -> uuid
        self.equipo_nombres = {}       # codigo_base -> nombre_equipo
        self.area_ids = {}             # nombre_area -> uuid
        self.vendor_ids = {}           # nombre_vendor -> uuid
        self.pm_plan_ids = {}          # nombre_plan -> uuid
        self.asset_plan_ids = {}       # asset_id + plan_id -> uuid
        self.wo_sequences = {}         # mes -> correlativo
        
    def agregar_seccion(self, titulo):
        self.sql.append("")
        self.sql.append("-- " + "=" * 76)
        self.sql.append(f"-- {titulo}")
        self.sql.append("-- " + "=" * 76)
        self.sql.append("")
    
    # =========================================================================
    # 1. PROFILES
    # =========================================================================
    def migrate_profiles(self):
        self.agregar_seccion("1. PROFILES")
        admin_id = '00000000-0000-4000-a000-000000000000'
        self.sql.append(f"""INSERT INTO public.profiles (id, full_name, role, created_at) VALUES
('{admin_id}', 'Administrador Sistema', 'admin', NOW())
ON CONFLICT (id) DO NOTHING;""")
    
    # =========================================================================
    # 2. ASSETS
    # =========================================================================
    def migrate_assets(self):
        self.agregar_seccion("2. ASSETS - Árbol de Equipos")
        
        df_arbol = pd.read_excel(DATOS_FILE, sheet_name="Arbol Equipos", header=0)
        
        # Guardar mapeo codigo -> nombre
        for _, row in df_arbol.iterrows():
            codigo = row['Codigo Equipo']
            nombre = row.get('Descripcion Nombre', codigo)
            self.equipo_nombres[codigo] = nombre
        
        # Plant
        facilities_id = '00000000-0000-4000-b000-000000000001'
        self.sql.append(f"""INSERT INTO public.assets (id, name, code, asset_type, status, created_at) VALUES
('{facilities_id}', 'Planta Industrial Central', 'PLANT-01', 'plant', 'active', NOW())
ON CONFLICT (id) DO NOTHING;""")
        
        # Áreas
        areas = df_arbol['Descripcion Planta'].unique()
        area_inserts = []
        for i, area in enumerate(areas):
            area_id = uuid_base('area', i + 2)
            self.area_ids[area] = area_id
            area_code = area.upper().replace(' ', '').replace('Á', 'A').replace('É', 'E')[:10]
            area_inserts.append(f"('{area_id}', '{area}', '{area_code}', 'area', 'active', '{facilities_id}', NOW())")
        
        self.sql.append("INSERT INTO public.assets (id, name, code, asset_type, status, parent_id, created_at) VALUES")
        self.sql.append(",\n".join(area_inserts) + " ON CONFLICT (id) DO NOTHING;")
        
        # Equipos
        self.sql.append("")
        equipo_indice = 1000
        equipo_inserts = []
        
        for _, row in df_arbol.iterrows():
            codigo_base = row['Codigo Equipo']
            nombre = row.get('Descripcion Nombre', codigo_base)
            cantidad_val = row.get('Cantidad de equipos ', 1)
            if pd.isna(cantidad_val):
                cantidad = 1
            else:
                cantidad = int(cantidad_val)
            
            area_nombre = row['Descripcion Planta']
            area_id = self.area_ids.get(area_nombre, facilities_id)
            
            for n in range(1, cantidad + 1):
                codigo_asset = f"{codigo_base}-{n:02d}"
                equipo_id = uuid_base('equipment', equipo_indice)
                self.equipo_ids[codigo_asset] = equipo_id
                
                nombre_limpio = limpiar_texto(nombre)
                equipo_inserts.append(f"('{equipo_id}', '{nombre_limpio}', '{codigo_asset}', 'equipment', 'active', '{area_id}', NOW())")
                equipo_indice += 1
        
        # Insertar en batches
        for i in range(0, len(equipo_inserts), 50):
            batch = equipo_inserts[i:i+50]
            self.sql.append("INSERT INTO public.assets (id, name, code, asset_type, status, parent_id, created_at) VALUES")
            self.sql.append(",\n".join(batch) + " ON CONFLICT (id) DO NOTHING;")
        
        print(f"   Assets: 1 plant + {len(areas)} areas + {len(equipo_inserts)} equipos")
    
    # =========================================================================
    # 3. VENDORS
    # =========================================================================
    def migrate_vendors(self):
        self.agregar_seccion("3. VENDORS - Talleres Externos")
        
        df_hist = pd.read_excel(DATOS_FILE, sheet_name="Historico de MTTO", header=0)
        talleres = df_hist['Taller Externo'].dropna().unique()
        
        vendor_inserts = []
        vendor_indice = 10000
        
        for taller in talleres:
            if taller not in ['Si', 'No', '']:
                vendor_id = uuid_base('vendor', vendor_indice)
                self.vendor_ids[taller] = vendor_id
                nombre = limpiar_texto(taller)
                vendor_inserts.append(f"('{vendor_id}', '{nombre}', 'service', NULL, NULL, NULL, NULL, true, NOW())")
                vendor_indice += 1
        
        if vendor_inserts:
            self.sql.append("INSERT INTO public.vendors (id, name, category, contact_name, email, phone, tax_id, is_active, created_at) VALUES")
            self.sql.append(",\n".join(vendor_inserts) + " ON CONFLICT (id) DO NOTHING;")
        
        print(f"   Vendors: {len(vendor_inserts)}")
    
    # =========================================================================
    # 4. PM PLANS y PM TASKS
    # =========================================================================
    def migrate_pm_plans(self):
        self.agregar_seccion("4. PM PLANS y PM TASKS")
        
        pm_files = [f for f in os.listdir(PLANES_DIR) if f.startswith('PM_') and f.endswith('.xlsx')]
        
        pm_plan_indice = 3000
        pm_task_indice = 4000
        plan_count = 0
        task_count = 0
        
        for pm_file in pm_files:
            # Extraer código base del archivo: PM_PTAR1_AA_AE20.xlsx -> PTAR1.AA.AE
            codigo_base = pm_file[3:-5].replace('_', '.')
            
            # Buscar nombre del equipo en el mapeo
            nombre_equipo = self.equipo_nombres.get(codigo_base, codigo_base)
            
            try:
                df_pm = pd.read_excel(os.path.join(PLANES_DIR, pm_file), sheet_name=0, header=None)
                
                # Analizar intervalos
                intervalos_encontrados = {}
                for idx, row in df_pm.iterrows():
                    for val in row:
                        if pd.notna(val):
                            val_str = str(val).lower()
                            if 'quincenal' in val_str: intervalos_encontrados['quincenal'] = True
                            if 'trimestral' in val_str: intervalos_encontrados['trimestral'] = True
                            if 'mensual' in val_str: intervalos_encontrados['mensual'] = True
                            if 'anual' in val_str: intervalos_encontrados['anual'] = True
                
                # Determinar frecuencia base
                if 'quincenal' in intervalos_encontrados:
                    base_freq, base_unit = 15, 'days'
                elif 'anual' in intervalos_encontrados:
                    base_freq, base_unit = 12, 'months'
                elif 'trimestral' in intervalos_encontrados:
                    base_freq, base_unit = 3, 'months'
                elif 'mensual' in intervalos_encontrados:
                    base_freq, base_unit = 1, 'months'
                else:
                    base_freq, base_unit = 1, 'months'
                
                # Crear PM Plan con NOMBRE DEL EQUIPO
                pm_plan_id = uuid_base('pm_plan', pm_plan_indice)
                self.pm_plan_ids[codigo_base] = pm_plan_id
                
                # Usar nombre del equipo + intervalo
                plan_name = f"{nombre_equipo} ({codigo_base})"
                
                self.sql.append(f"""-- Plan: {plan_name}
INSERT INTO public.pm_plans (id, name, description, trigger_type, interval_value, interval_unit, interval_mode, criticality, created_at) VALUES
('{pm_plan_id}', '{plan_name}', 'Plan de mantenimiento preventivo migrado', 'calendar', {base_freq}, '{base_unit}', 'floating', 'medium', NOW())
ON CONFLICT (id) DO NOTHING;""")
                
                plan_count += 1
                
                # Extraer tareas
                tareas_por_intervalo = {'quincenal': [], 'mensual': [], 'trimestral': [], 'anual': []}
                
                for idx, row in df_pm.iterrows():
                    if len(row) >= 5:
                        parte = str(row.iloc[2]) if pd.notna(row.iloc[2]) else ''
                        intervalo = str(row.iloc[3]).lower() if pd.notna(row.iloc[3]) else ''
                        labor = str(row.iloc[4]) if pd.notna(row.iloc[4]) else ''
                        
                        if labor and labor != 'nan' and parte != 'nan':
                            tarea_text = f"{parte}: {labor}"[:200]
                            tarea_text = limpiar_texto(tarea_text)
                            
                            if 'anual' in intervalo: tareas_por_intervalo['anual'].append(tarea_text)
                            elif 'trimestral' in intervalo: tareas_por_intervalo['trimestral'].append(tarea_text)
                            elif 'mensual' in intervalo: tareas_por_intervalo['mensual'].append(tarea_text)
                            elif 'quincenal' in intervalo: tareas_por_intervalo['quincenal'].append(tarea_text)
                            else: tareas_por_intervalo['mensual'].append(tarea_text)
                
                # Crear PM Tasks con frequency_multiplier
                sort_order = 0
                for intervalo, tareas in tareas_por_intervalo.items():
                    for tarea in tareas:
                        if tarea:
                            if intervalo == 'anual': multiplier = 12
                            elif intervalo == 'trimestral': multiplier = 3
                            else: multiplier = 1
                            
                            pm_task_id = uuid_base('pm_task', pm_task_indice)
                            self.sql.append(f"""INSERT INTO public.pm_tasks (id, pm_plan_id, description, sort_order, frequency_multiplier) VALUES
('{pm_task_id}', '{pm_plan_id}', '{tarea}', {sort_order}, {multiplier})
ON CONFLICT (id) DO NOTHING;""")
                            
                            task_count += 1
                            sort_order += 1
                            pm_task_indice += 1
                
                pm_plan_indice += 1
                
            except Exception as e:
                print(f"   Error procesando {pm_file}: {e}")
        
        print(f"   PM Plans: {plan_count}, PM Tasks: {task_count}")
        return plan_count, task_count
    
    # =========================================================================
    # 5. ASSET PLANS
    # =========================================================================
    def migrate_asset_plans(self):
        self.agregar_seccion("5. ASSET PLANS - Vinculación equipos a planes")
        
        asset_plan_indice = 5000
        count = 0
        
        for codigo_asset, asset_id in self.equipo_ids.items():
            codigo_base = codigo_asset.split('-')[0]
            
            for codigo_plan, pm_plan_id in self.pm_plan_ids.items():
                if codigo_base == codigo_plan:
                    asset_plan_id = uuid_base('asset_plan', asset_plan_indice)
                    self.asset_plan_ids[f"{asset_id}_{pm_plan_id}"] = asset_plan_id
                    
                    self.sql.append(f"""INSERT INTO public.asset_plans (id, asset_id, pm_plan_id, current_cycle_index, active, created_at) VALUES
('{asset_plan_id}', '{asset_id}', '{pm_plan_id}', 1, true, NOW())
ON CONFLICT (id) DO NOTHING;""")
                    
                    count += 1
                    asset_plan_indice += 1
                    break
        
        print(f"   Asset Plans: {count}")
        return count
    
    # =========================================================================
    # 6. WORK ORDERS (CON BYPASS Y RESOLUTION)
    # =========================================================================
    def migrate_work_orders(self):
        self.agregar_seccion("6. WORK ORDERS - Histórico de Mantenimiento")
        
        # BYPASS: Deshabilitar triggers de usuario para poder inyectar WO-YY-MM-XXXXX
        self.sql.append("-- ============================================================================")
        self.sql.append("-- BYPASS: Deshabilitar triggers de usuario para carga masiva de Work Orders")
        self.sql.append("-- Nota: Los triggers de sistema no se pueden deshabilitar en Supabase")
        self.sql.append("-- ============================================================================")
        self.sql.append("")
        self.sql.append("ALTER TABLE public.work_orders DISABLE TRIGGER USER;")
        self.sql.append("")
        
        df_hist = pd.read_excel(DATOS_FILE, sheet_name="Historico de MTTO", header=0)
        
        wo_indice = 2000
        wo_count = 0
        
        for _, row in df_hist.iterrows():
            codigo_y_corr = row['CodigoYCorr']
            
            # Parsear código
            parts = str(codigo_y_corr).rsplit('.', 1)
            if len(parts) == 2:
                try:
                    correlativo = int(parts[1])
                    codigo_base = parts[0]
                except:
                    correlativo = 1
                    codigo_base = str(codigo_y_corr)
            else:
                codigo_base = str(codigo_y_corr)
                correlativo = 1
            
            codigo_asset = f"{codigo_base}-{correlativo:02d}"
            asset_id = self.equipo_ids.get(codigo_asset)
            
            if not asset_id:
                continue
            
            # Título
            titulo = limpiar_texto(row.get('Descripcion de actividad', 'Mantenimiento'))
            if not titulo:
                titulo = 'Mantenimiento Historico'
            
            # Resolution: ID Original + Actividades realizadas
            id_original = str(row.get('ID', ''))
            actividades = row.get('Actividades programadas', '')
            if pd.notna(actividades) and str(actividades) != 'nan':
                resolution = f"ID: {id_original} | {limpiar_texto(actividades)}"
            else:
                resolution = f"ID: {id_original}"
            resolution = resolution[:500]
            
            # Tipo
            preventivo = str(row.get('Preventivo', 'No')).strip().lower()
            wo_tipo = 'preventive' if preventivo == 'si' else 'corrective'
            
            # Vendor
            taller = row.get('Taller Externo', '')
            vendor_id = self.vendor_ids.get(taller)
            vendor_name_snapshot = taller if taller not in ['Si', 'No', ''] else None
            
            # Costo
            costo = row.get('Costo ', 0)
            if pd.isna(costo):
                costo = 0
            
            # Fechas
            fecha_cierre = row.get('Fecha de Mantenimiento', '')
            fecha_abierto = calcular_fecha_abierto(fecha_cierre, wo_tipo)
            
            # WO Number basado en fecha real
            if pd.notna(fecha_cierre):
                try:
                    fecha_dt = pd.to_datetime(fecha_cierre)
                    mes_key = f"{fecha_dt.year}-{fecha_dt.month:02d}"
                    if mes_key not in self.wo_sequences:
                        self.wo_sequences[mes_key] = 1
                    seq = self.wo_sequences[mes_key]
                    self.wo_sequences[mes_key] += 1
                    yy = fecha_dt.strftime('%y')
                    mm = fecha_dt.strftime('%m')
                    wo_number = f"WO-{yy}-{mm}-{seq:05d}"
                except:
                    wo_number = f"WO-LEGACY-{wo_indice:05d}"
            else:
                wo_number = f"WO-LEGACY-{wo_indice:05d}"
            
            # Asset plan
            asset_plan_id = 'NULL'
            for plan_key, ap_id in self.asset_plan_ids.items():
                if plan_key.startswith(asset_id):
                    asset_plan_id = f"'{ap_id}'"
                    break
            
            wo_id = uuid_base('wo', wo_indice)
            
            self.sql.append(f"""-- {wo_number}: {codigo_asset} ({wo_tipo})
INSERT INTO public.work_orders (
    id, asset_id, asset_plan_id, wo_number, title, description, resolution,
    wo_type, status, priority,
    scheduled_date, completed_at,
    external_service_cost, vendor_id,
    asset_name_snapshot, vendor_name_snapshot,
    created_at, updated_at
) VALUES (
    '{wo_id}', '{asset_id}', {asset_plan_id}, '{wo_number}', '{titulo}', '{resolution}', '{resolution}',
    '{wo_tipo}', 'completed', 'medium',
    {f"'{fecha_abierto.strftime('%Y-%m-%d')}'" if fecha_abierto else 'NULL'},
    {f"'{fecha_dt.strftime('%Y-%m-%d')}'" if pd.notna(fecha_cierre) else 'NULL'},
    {costo}, {f"'{vendor_id}'" if vendor_id else 'NULL'},
    '{codigo_asset}', {f"'{vendor_name_snapshot}'" if vendor_name_snapshot else 'NULL'},
    NOW(), NOW()
) ON CONFLICT (id) DO NOTHING;""")
            
            wo_indice += 1
            wo_count += 1
        
        # Rehabilitar triggers
        self.sql.append("")
        self.sql.append("-- ============================================================================")
        self.sql.append("-- REHABILITAR triggers de usuario después de carga masiva")
        self.sql.append("-- ============================================================================")
        self.sql.append("")
        self.sql.append("ALTER TABLE public.work_orders ENABLE TRIGGER USER;")
        
        print(f"   Work Orders: {wo_count}")
        return wo_count
    
    # =========================================================================
    # EJECUTAR MIGRACIÓN
    # =========================================================================
    def ejecutar(self):
        print("=" * 76)
        print("MIGRACIÓN COMPLETA APEX CMMS v2.5.0")
        print("=" * 76)
        
        self.migrate_profiles()
        self.migrate_assets()
        self.migrate_vendors()
        pm_count, task_count = self.migrate_pm_plans()
        ap_count = self.migrate_asset_plans()
        wo_count = self.migrate_work_orders()
        
        # Guardar SQL
        sql_dir = os.path.join(BASE_DIR, "sql", "separados")
        output_file = os.path.join(sql_dir, "08_work_orders.sql")
        
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("\n".join(self.sql))
        
        print("")
        print("=" * 76)
        print("MIGRACIÓN COMPLETADA")
        print(f"   PM Plans: {pm_count}")
        print(f"   PM Tasks: {task_count}")
        print(f"   Asset Plans: {ap_count}")
        print(f"   Work Orders: {wo_count}")
        print(f"   Archivo: {output_file}")
        print("=" * 76)
        
        return {
            'pm_plans': pm_count,
            'pm_tasks': task_count,
            'asset_plans': ap_count,
            'work_orders': wo_count
        }

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    migracion = MigracionAPEX()
    migracion.ejecutar()