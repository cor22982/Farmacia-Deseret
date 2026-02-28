import os
from pymongo import MongoClient
from bson import ObjectId
from dotenv import load_dotenv
from datetime import datetime


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
    if isinstance(doc, ObjectId):
        return str(doc)

    if isinstance(doc, datetime):
        return doc.isoformat()

    if isinstance(doc, dict):
        return {k: serialize_doc(v) for k, v in doc.items()}

    if isinstance(doc, list):
        return [serialize_doc(i) for i in doc]

    return doc

def serialize_list(docs):
    out = []
    for doc in docs:
       
        res = serialize_doc(doc)
        out.append(res)
    return out