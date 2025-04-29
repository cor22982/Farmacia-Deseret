import pandas as pd
import time
import json

# id : 209,  NOMBRE : BODEGA, tipo : bodega
df_inventario = pd.read_csv('./data/ BYF.csv', sep=',')
df_hoja_datos = pd.read_csv('./data/IVR BYF.csv', sep=',')

df_supliers = pd.read_csv('./supplier.csv')

print(df_inventario.columns)

print(df_hoja_datos.columns)

df_seleccionado_supplier = df_supliers[['ID', 'SUPPLIER']]




# Mostrar la lista de suppliers disponibles
print("Lista de proveedores:")
print(df_seleccionado_supplier)

# Pedir al usuario que elija un ID
id_seleccionado = input("Ingrese el ID del proveedor que desea seleccionar: ")

# Buscar el supplier correspondiente
proveedor = df_seleccionado_supplier[df_seleccionado_supplier['ID'].astype(str) == id_seleccionado]

nombre_proveedor = ""
if not proveedor.empty:
    nombre_proveedor = proveedor.iloc[0]['SUPPLIER']
    id_proveedor = proveedor.iloc[0]['ID']
    print(f"Proveedor seleccionado: {nombre_proveedor} con id: {id_proveedor}")
else:
    print("ID no encontrado. Por favor, intente de nuevo.")
