import json
import os
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv

# =========================
# Cargar variables de entorno
# =========================
load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
MONGO_DATABASE = os.getenv("MONGO_DATABASE")

if not MONGODB_URL or not MONGO_DATABASE:
    raise ValueError("Faltan variables de entorno MONGODB_URL o MONGO_DATABASE en el .env")

# =========================
# Conexión a MongoDB
# =========================
client = MongoClient(MONGODB_URL)
db = client[MONGO_DATABASE]
collection = db["stock_batches"]

# =========================
# Utilidades
# =========================
def parse_mongo_date(date_obj):
    """
    Convierte {"$date": "..."} a datetime
    """
    if isinstance(date_obj, dict) and "$date" in date_obj:
        return datetime.fromisoformat(date_obj["$date"].replace("Z", "+00:00"))
    return None

# =========================
# Leer archivo batches.json
# =========================
with open("batches.json", "r", encoding="utf-8") as f:
    batches_data = json.load(f)

if not isinstance(batches_data, list):
    raise ValueError("batches.json debe contener una lista de documentos")

# =========================
# Lógica principal (REEMPLAZO TOTAL)
# =========================
for batch in batches_data:

    product_id = batch.get("product_id")

    exp_date = parse_mongo_date(batch.get("expiration_date"))
    pur_date = parse_mongo_date(batch.get("purchase_date"))

    if not product_id or not exp_date or not pur_date:
        print(f"Documento inválido, se omite: {batch.get('_id')}")
        continue

    # =========================
    # 1. BORRAR TODOS LOS BATCHES EXISTENTES DEL PRODUCTO
    # =========================
    delete_result = collection.delete_many({"product_id": product_id})

    if delete_result.deleted_count > 0:
        print(f"DELETE {delete_result.deleted_count} batches -> product_id={product_id}")

    # =========================
    # 2. INSERTAR EL BATCH DEL JSON
    # =========================
    batch_to_insert = batch.copy()

    # limpiar _id para evitar duplicados
    if "_id" in batch_to_insert:
        del batch_to_insert["_id"]

    # convertir fechas a datetime
    batch_to_insert["expiration_date"] = exp_date
    batch_to_insert["purchase_date"] = pur_date

    if "created_at" in batch_to_insert:
        batch_to_insert["created_at"] = parse_mongo_date(batch_to_insert["created_at"])
    else:
        batch_to_insert["created_at"] = datetime.utcnow()

    if "updated_at" in batch_to_insert:
        batch_to_insert["updated_at"] = parse_mongo_date(batch_to_insert["updated_at"])
    else:
        batch_to_insert["updated_at"] = datetime.utcnow()

    collection.insert_one(batch_to_insert)

    print(f"INSERT nuevo batch -> product_id={product_id}")

print("Proceso terminado.")