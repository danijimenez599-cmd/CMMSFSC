"""Extrae datos de Excel a CSV"""
import pandas as pd
import os

BASE = r'd:/Apex development/Datos A tratar/Migracion_Completa/datos_originales'
DATOS = r'd:/Apex development/Datos A tratar/PlanesMtto/Datos.xlsx'
PLANES = r'd:/Apex development/Datos A tratar/PlanesMtto/Planes'

os.makedirs(BASE, exist_ok=True)

# Arbol Equipos
df = pd.read_excel(DATOS, sheet_name='Arbol Equipos', header=0)
df.to_csv(os.path.join(BASE, 'Arbol_Equipos.csv'), index=False, encoding='utf-8-sig')
print(f'Arbol_Equipos.csv: {len(df)} registros')

# Historico MTTO
df = pd.read_excel(DATOS, sheet_name='Historico de MTTO', header=0)
df.to_csv(os.path.join(BASE, 'Historico_MTTO.csv'), index=False, encoding='utf-8-sig')
print(f'Historico_MTTO.csv: {len(df)} registros')

# PM Plans
count = 0
for f in os.listdir(PLANES):
    if f.startswith('PM_') and f.endswith('.xlsx'):
        name = f[:-5]
        try:
            df = pd.read_excel(os.path.join(PLANES, f), sheet_name=0, header=None)
            df.to_csv(os.path.join(BASE, f'{name}.csv'), index=False, encoding='utf-8-sig')
            count += 1
            print(f'{name}.csv: {len(df)} filas')
        except Exception as e:
            print(f'Error {f}: {e}')

print(f'\nTotal PM Plans: {count}')
print('Done!')