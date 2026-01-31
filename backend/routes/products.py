from fastapi import APIRouter, HTTPException, status, Body
from config.database import products_collection, serialize_doc, serialize_list, stock_batches_collection
from datetime import datetime

router = APIRouter(prefix="/products", tags=["Products"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_product(product: dict = Body(...)):
    """Crear un nuevo producto"""
    product["created_at"] = datetime.utcnow()
    product["updated_at"] = datetime.utcnow()
    
    # Generar ID único basado en el nombre
    if "_id" not in product:
        product_id = product["name"].lower().replace(" ", "-")
        product_id = product_id.replace("á", "a").replace("é", "e").replace("í", "i")
        product_id = product_id.replace("ó", "o").replace("ú", "u")
        product["_id"] = product_id
    
    try:
        products_collection.insert_one(product)
        return serialize_doc(product)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.get("")
def get_products(skip: int = 0, limit: int = 100):
    """Obtener todos los productos"""
    products = list(products_collection.find().skip(skip).limit(limit))
    
    return serialize_list(products)

@router.get("/search")
def search_products(q: str):
    """
    Buscar productos por nombre, descripción o principio activo
    Parámetro: q = string de búsqueda
    """
    search_pattern = {"$regex": q, "$options": "i"}
    
    query = {
        "$or": [
            {"name": search_pattern},
            {"descripcion": search_pattern},
            {"principio_activo": search_pattern}
        ]
    }
    
    products = list(products_collection.find(query))
    return {
        "query": q,
        "count": len(products),
        "results": serialize_list(products)
    }

@router.get("/{product_id}")
def get_product(product_id: str):
    """Obtener un producto por ID"""
    product = products_collection.find_one({"_id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return serialize_doc(product)

@router.put("/{product_id}", status_code=status.HTTP_200_OK)
def upsert_product(product_id: str, product: dict = Body(...)):
    """Crear o actualizar un producto (upsert)"""

    now = datetime.utcnow()
    product["updated_at"] = now

    # Si se crea por primera vez
    product.setdefault("created_at", now)
    product["_id"] = product_id

    result = products_collection.update_one(
        {"_id": product_id},
        {"$set": product},
        upsert=True
    )

    updated_product = products_collection.find_one({"_id": product_id})
    return serialize_doc(updated_product)

@router.delete("/{product_id}")
def delete_product(product_id: str):
    """Eliminar un producto y sus batches relacionados"""

  
    batches_result = stock_batches_collection.delete_many(
        {"product_id": product_id}
    )

    product_result = products_collection.delete_one(
        {"_id": product_id}
    )

    if product_result.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Producto no encontrado"
        )

    return {
        "message": "Producto eliminado correctamente",
        "product_id": product_id,
        "batches_deleted": batches_result.deleted_count
    }