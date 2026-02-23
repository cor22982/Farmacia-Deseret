from fastapi import APIRouter, HTTPException, status, Body
from config.database import sales_collection, serialize_doc, serialize_list
from datetime import datetime

router = APIRouter(prefix="/sales", tags=["Sales"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_sale(sale: dict = Body(...)):
    """Crear una nueva venta"""
    # Convertir datetime string a datetime
    if "datetime" in sale and isinstance(sale["datetime"], str):
        sale["datetime"] = datetime.fromisoformat(sale["datetime"].replace("Z", "+00:00"))
    
    sale["created_at"] = datetime.utcnow()
    
    try:
        result = sales_collection.insert_one(sale)
        sale["_id"] = str(result.inserted_id)
        return serialize_doc(sale)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.get("")
def get_sales(skip: int = 0, limit: int = 10000, payment_method: str = None, shift: str = None):
    """Obtener todas las ventas con filtros opcionales"""
    query = {}
    if payment_method:
        query["payment_method"] = payment_method
    if shift:
        query["shift"] = shift
    
    sales = list(sales_collection.find(query).sort("datetime", -1).skip(skip).limit(limit))
    return serialize_list(sales)

@router.get("/{sale_id}")
def get_sale(sale_id: str):
    """Obtener una venta por ID"""
    sale = sales_collection.find_one({"_id": sale_id})
    if not sale:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    return serialize_doc(sale)

@router.put("/{sale_id}")
def update_sale(sale_id: str, sale: dict = Body(...)):
    """Actualizar una venta"""
    if "datetime" in sale and isinstance(sale["datetime"], str):
        sale["datetime"] = datetime.fromisoformat(sale["datetime"].replace("Z", "+00:00"))
    
    result = sales_collection.update_one(
        {"_id": sale_id},
        {"$set": sale}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    
    updated_sale = sales_collection.find_one({"_id": sale_id})
    return serialize_doc(updated_sale)

@router.delete("/{sale_id}")
def delete_sale(sale_id: str):
    """Eliminar una venta"""
    result = sales_collection.delete_one({"_id": sale_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Venta no encontrada")
    
    return {"message": "Venta eliminada", "sale_id": sale_id}