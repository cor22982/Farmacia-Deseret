# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel
from bson import ObjectId
from typing import List, Optional
import os

app = FastAPI(title="FastAPI MongoDB App")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuración de MongoDB
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://admin:password123@mongodb:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "myapp")

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]
collection = db["items"]

# Modelos Pydantic
class Item(BaseModel):
    name: str
    description: str
    price: float
    quantity: int

class ItemResponse(BaseModel):
    id: str
    name: str
    description: str
    price: float
    quantity: int

# Rutas
@app.get("/")
async def root():
    return {"message": "API funcionando correctamente"}

@app.get("/health")
async def health_check():
    try:
        await client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.post("/items/", response_model=ItemResponse)
async def create_item(item: Item):
    item_dict = item.dict()
    result = await collection.insert_one(item_dict)
    created_item = await collection.find_one({"_id": result.inserted_id})
    return ItemResponse(
        id=str(created_item["_id"]),
        name=created_item["name"],
        description=created_item["description"],
        price=created_item["price"],
        quantity=created_item["quantity"]
    )

@app.get("/items/", response_model=List[ItemResponse])
async def get_items():
    items = []
    cursor = collection.find()
    async for document in cursor:
        items.append(ItemResponse(
            id=str(document["_id"]),
            name=document["name"],
            description=document["description"],
            price=document["price"],
            quantity=document["quantity"]
        ))
    return items

@app.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(item_id: str):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    item = await collection.find_one({"_id": ObjectId(item_id)})
    if item is None:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    return ItemResponse(
        id=str(item["_id"]),
        name=item["name"],
        description=item["description"],
        price=item["price"],
        quantity=item["quantity"]
    )

@app.put("/items/{item_id}", response_model=ItemResponse)
async def update_item(item_id: str, item: Item):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    result = await collection.update_one(
        {"_id": ObjectId(item_id)},
        {"$set": item.dict()}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    updated_item = await collection.find_one({"_id": ObjectId(item_id)})
    return ItemResponse(
        id=str(updated_item["_id"]),
        name=updated_item["name"],
        description=updated_item["description"],
        price=updated_item["price"],
        quantity=updated_item["quantity"]
    )

@app.delete("/items/{item_id}")
async def delete_item(item_id: str):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="ID inválido")
    
    result = await collection.delete_one({"_id": ObjectId(item_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    return {"message": "Item eliminado exitosamente"}