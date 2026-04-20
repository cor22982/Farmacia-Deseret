from fastapi import APIRouter, HTTPException, status, Body
from config.database import stock_batches_collection, serialize_doc, serialize_list
from datetime import datetime
from utils.helpers import update_product_presentations_from_stock

router = APIRouter(prefix="/stock-batches", tags=["Stock Batches"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_batch(batch: dict = Body(...)):
    """Crear un nuevo lote de stock"""
    # Convertir fechas string a datetime
    if "expiration_date" in batch and isinstance(batch["expiration_date"], str):
        batch["expiration_date"] = datetime.fromisoformat(batch["expiration_date"].replace("Z", "+00:00"))
    
    if "purchase_date" in batch and isinstance(batch["purchase_date"], str):
        batch["purchase_date"] = datetime.fromisoformat(batch["purchase_date"].replace("Z", "+00:00"))
    
    batch["created_at"] = datetime.utcnow()
    batch["updated_at"] = datetime.utcnow()
    
    try:
        result = stock_batches_collection.insert_one(batch)
        batch["_id"] = str(result.inserted_id)
        return serialize_doc(batch)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.get("")
def get_batches(skip: int = 0, limit: int = 1000000, product_id: str = None):
    query = {}
    if product_id:
        query["product_id"] = product_id
    
    batches = list(stock_batches_collection.find(query).skip(skip).limit(limit))
    return serialize_list(batches)

@router.get("/{batch_id}")
def get_batch(batch_id: str):
    """Obtener un lote por ID"""
    batch = stock_batches_collection.find_one({"_id": batch_id})
    if not batch:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    return serialize_doc(batch)

@router.get("/productid/{product_id}")
def get_batches_by_product_id(product_id: str):
    """Obtener todos los lotes de un producto"""
    batches_cursor = stock_batches_collection.find({"product_id": product_id})

    batches = [serialize_doc(batch) for batch in batches_cursor]

    if not batches:
        raise HTTPException(status_code=404, detail="No hay lotes para este producto")

    return batches


@router.put("/{batch_id}")
def upsert_batch(batch_id: str, batch: dict = Body(...)):

    # 1️⃣ Normalizar fechas
    for field in ["expiration_date", "purchase_date"]:
        if field in batch and isinstance(batch.get(field), str):
            batch[field] = datetime.fromisoformat(
                batch[field].replace("Z", "+00:00")
            )

    now = datetime.utcnow()
    batch["_id"] = batch_id
    batch["updated_at"] = now
    batch.setdefault("created_at", now)

    # 2️⃣ Upsert del batch
    stock_batches_collection.update_one(
        {"_id": batch_id},
        {"$set": batch},
        upsert=True
    )

    # 3️⃣ Recalcular presentaciones del producto
    product_id = batch.get("product_id")
    if not product_id:
        raise HTTPException(
            status_code=400,
            detail="El batch debe contener product_id"
        )

    update_product_presentations_from_stock(product_id)

    # 4️⃣ Retornar batch actualizado
    updated_batch = stock_batches_collection.find_one({"_id": batch_id})
    return serialize_doc(updated_batch)

@router.delete("/{batch_id}")
def delete_batch(batch_id: str):
    """Eliminar un lote de stock"""
    result = stock_batches_collection.delete_one({"_id": batch_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lote no encontrado")
    
    return {"message": "Lote eliminado", "batch_id": batch_id}