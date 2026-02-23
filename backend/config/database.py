import os
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv

load_dotenv()

# Variables de entorno
MONGODB_URL = os.getenv("MONGODB_URL","")
DATABASE_NAME = os.getenv("DATABASE_NAME", "farmacia")

# Cliente MongoDB
client = MongoClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Colecciones
products_collection = db.products
stock_batches_collection = db.stock_batches
sales_collection = db.sales
users_collection = db.users
shopping_cart_collection = db.shopping_cart

# Funciones auxiliares
def serialize_doc(doc):
    """Convierte ObjectId a string para JSON"""
    if doc is None:
        return None
    if "_id" in doc and isinstance(doc["_id"], ObjectId):
        doc["_id"] = str(doc["_id"])
    return doc

def serialize_list(docs):
    out = []
    for doc in docs:
       
        res = serialize_doc(doc)
        out.append(res)
    return out