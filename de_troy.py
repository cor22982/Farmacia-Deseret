import pandas as pd
import os

# Cargar el archivo Excel
archivo_excel = './farmacia.xlsx'
salida_carpeta = 'data'

# Crear carpeta de salida si no existe
os.makedirs(salida_carpeta, exist_ok=True)

# Cargar todas las hojas
hojas = pd.read_excel(archivo_excel, sheet_name=None)  # sheet_name=None carga todas las hojas

# Recorrer cada hoja
for nombre_hoja, dataframe in hojas.items():
    nombre_csv = f"{nombre_hoja}.csv"
    ruta_csv = os.path.join(salida_carpeta, nombre_csv)
    dataframe.to_csv(ruta_csv, index=False)
    print(f"Hoja '{nombre_hoja}' guardada como {ruta_csv}")
