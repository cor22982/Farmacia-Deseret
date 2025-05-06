import pandas as pd
import ast

def safe_parse_dict(val):
    try:
        parsed = ast.literal_eval(val)
        if isinstance(parsed, dict):
            return parsed
    except:
        pass
    return {}

# Leer los archivos CSV
df_stock = pd.read_csv('presentaciones_add.csv', header=None, names=['id', 'medicamento', 'presentacion'])
df_info = pd.read_csv('./output_data/byf_data.csv')
df_inventario = pd.read_csv('./data/ BYF.csv')

# Normalizar nombres de medicamentos para emparejar correctamente
df_stock['medicamento'] = df_stock['medicamento'].str.strip().str.upper()
df_info['medicamento'] = df_info['medicamento'].str.strip().str.upper()
df_inventario['ARTICULO'] = df_inventario['ARTICULO'].str.strip().str.upper()

# Unir df_stock con df_info
df_merge1 = pd.merge(df_stock, df_info, on='medicamento', how='inner')

# Renombrar 'ARTICULO' a 'medicamento' en df_inventario para facilitar merge
df_inventario = df_inventario.rename(columns={'ARTICULO': 'medicamento'})

# Unir con el tercer archivo
df_final = pd.merge(df_merge1, df_inventario, on='medicamento', how='inner')   

# Convertir presentación a dict
df_final['presentacion_dict'] = df_final['presentacion'].apply(safe_parse_dict)

# Filtrar válidos
df_final = df_final[df_final['presentacion_dict'].apply(lambda x: bool(x))].copy()

# Función para calcular el PP por cada presentación
def calcular_pp_por_presentacion(presentaciones, pp):
    # Determinamos la cantidad mínima entre todas las presentaciones de este producto
    cantidad_min = min(presentaciones.values())
    
    # Calculamos el precio por unidad para este producto específico
    precio_unidad = pp / cantidad_min
    
    # Calculamos el precio para cada presentación
    return {
        nombre: [
            cantidad,  # Mantenemos la cantidad
            round(cantidad * precio_unidad, 2)  # Calculamos el precio correctamente
        ]
        for nombre, cantidad in presentaciones.items()
    }

# Aplicar la función a cada fila
df_final['presentacion'] = df_final.apply(
    lambda row: calcular_pp_por_presentacion(row['presentacion_dict'], row['PP']),
    axis=1
)

# Eliminar columnas auxiliares
df_final = df_final.drop(columns=['presentacion_dict'])

# Guardar resultado
df_final.to_csv('unido_final.csv', index=False)
print("✅ Archivo 'unido_final.csv' generado con éxito.")