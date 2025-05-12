import pandas as pd
import ast

# Cargar datasets
df1 = pd.read_csv('./datav2/BYF.csv')              # Dataset con ARTICULO, EXISTENCIA, COSTO
df2 = pd.read_csv('./final_out/byf.csv')           # Dataset con presentacion
df3 = pd.read_csv('./datav2/IVR BYF.csv')           # Dataset con fechas

# Normalizar nombres para hacer match
df1['ARTICULO_NORM'] = df1['ARTICULO'].str.upper().str.strip()
df2['medicamento_NORM'] = df2['medicamento'].str.upper().str.strip()
df3['ARTICULO_NORM'] = df3['ARTICULO'].str.upper().str.strip()

# Merge entre df1 y df2
merged = pd.merge(df1, df2, left_on='ARTICULO_NORM', right_on='medicamento_NORM', how='inner')

# Convertir presentacion a diccionario
merged['presentacion_dict'] = merged['presentacion'].apply(ast.literal_eval)

# Obtener cantidad más pequeña por presentación
def get_min_qty_and_key(presentacion_dict):
    return min((val[0], key) for key, val in presentacion_dict.items())

merged['min_N'], merged['min_key'] = zip(*merged['presentacion_dict'].apply(get_min_qty_and_key))

# Calcular costo por unidad redondeado a 3 decimales
merged['costo_unidad'] = (merged['COSTO_y'] / merged['min_N']).round(3)

# Calcular cantidad total de unidades: EXISTENCIA (en presentación menor) * cantidad por unidad
merged['CANTIDAD_TOTAL_UNIDADES'] = merged['EXISTENCIA_x'] * merged['min_N']

# Merge con fechas
merged = pd.merge(
    merged,
    df3[['ARTICULO_NORM', 'FECHA DE COMPRA', 'FECHA DE VENCIMIENTO']],
    on='ARTICULO_NORM',
    how='left'
)

# Selección de columnas finales
resultado = merged[[
    'medicamento',
    'COSTO_y',
    'EXISTENCIA_x',
    'costo_unidad',
    'CANTIDAD_TOTAL_UNIDADES',
    'FECHA DE COMPRA',
    'FECHA DE VENCIMIENTO'
]]
resultado.columns = [
    'Nombre',
    'COSTO',
    'EXISTENCIA',
    'COSTO_UNIDAD',
    'CANTIDAD_TOTAL_UNIDADES',
    'FECHA_COMPRA',
    'FECHA_VENCIMIENTO'
]

# Guardar resultado
resultado.to_csv('resultado_costos.csv', index=False)
