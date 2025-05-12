import requests
import csv

# Constantes
API_URL = 'http://localhost:7000/insertProductDetails'
TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2wiOiJhZG1pbiIsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3NDcwNzg3MzQsImV4cCI6MTc0NzI1ODczNH0.RGdGR45CKe5WRpROp6jpw2E3VYf4ryzvY4r5t77wv6I'
UBICACION_ID = 210 



def insertar_producto(cantidad, fechac, fechav, costo, id_product, id_ubicacion):
    headers = {
        'Content-Type': 'application/json'
    }

    payload = {
        'token': TOKEN,
        'cantidad': cantidad,
        'fechac': fechac,
        'fechav': fechav,
        'costo': costo,
        'id_product': id_product,
        'id_ubicacion': id_ubicacion
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()
        print(f"✅ Insertado: {id_product}")
        print("Respuesta:", response.json())
    except requests.exceptions.RequestException as e:
        print(f"❌ Error al insertar: {id_product}")
        if hasattr(e, 'response') and e.response:
            print(f"Status code: {e.response.status_code}")
            print(f"Respuesta: {e.response.text}")

def cargar_desde_csv(csv_path):
    with open(csv_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for i, row in enumerate(reader, 1):
            try:
                insertar_producto(
                    cantidad=float(row['CANTIDAD_TOTAL_UNIDADES']),
                    fechac=row['FECHA_COMPRA'],
                    fechav=row['FECHA_VENCIMIENTO'],
                    costo=float(row['COSTO_UNIDAD']),
                    id_product=row['Nombre'],
                    id_ubicacion=UBICACION_ID
                )
            except Exception as e:
                print(f"❌ Fila {i} falló: {e}")

if __name__ == '__main__':
    # Cambia 'productos.csv' por el nombre real del archivo CSV que estás usando
    cargar_desde_csv('./resultado_costos.csv')