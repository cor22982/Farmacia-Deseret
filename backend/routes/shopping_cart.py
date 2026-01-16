from fastapi import APIRouter, HTTPException, status, Body
from config.database import shopping_cart_collection, serialize_doc, serialize_list, products_collection, stock_batches_collection
from datetime import datetime

router = APIRouter(prefix="/shopping-cart", tags=["Shopping Cart"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_cart(cart: dict = Body(...)):
    """Crear un nuevo carrito de compras"""
    cart["created_at"] = datetime.utcnow()
    cart["updated_at"] = datetime.utcnow()
    
    # Valores por defecto
    if "items" not in cart:
        cart["items"] = []
    if "total" not in cart:
        cart["total"] = 0
    if "paid_amount" not in cart:
        cart["paid_amount"] = 0
    if "payment_method" not in cart:
        cart["payment_method"] = None
    
    try:
        result = shopping_cart_collection.insert_one(cart)
        cart["_id"] = str(result.inserted_id)
        
        for item in cart["items"]:
            product_id = item["product_id"]

            product = products_collection.find_one({"_id": product_id})
            if not product:
                raise Exception(f"Producto no encontrado: {product_id}")

            units = next(
                (p["units"] for p in product["presentations"]
                if p["presentation_name"] == item["presentation_name"]),
                None
            )

            if units is None:
                raise Exception("No se pudo determinar units")

            remaining_units = units * int(item["qty"])

            # 1️⃣ Obtener batches ordenados por fecha de expiración
            batches = stock_batches_collection.find(
                {"product_id": product_id, "stock_units": {"$gt": 0}}
            ).sort("expiration_date", 1)

            for batch in batches:
                if remaining_units <= 0:
                    break

                available = batch["stock_units"]

                if available >= remaining_units:
                    # 2️⃣ Este batch cubre todo
                    stock_batches_collection.update_one(
                        {"_id": batch["_id"]},
                        {
                            "$inc": {"stock_units": -remaining_units},
                            "$set": {"updated_at": datetime.utcnow()}
                        }
                    )
                    remaining_units = 0
                else:
                    # 3️⃣ Consumimos todo el batch y seguimos
                    stock_batches_collection.update_one(
                        {"_id": batch["_id"]},
                        {
                            "$set": {
                                "stock_units": 0,
                                "updated_at": datetime.utcnow()
                            }
                        }
                    )
                    remaining_units -= available

            if remaining_units > 0:
                raise Exception(
                    f"Stock insuficiente para {product_id}. Faltan {remaining_units} unidades"
                )

        
                
        return serialize_doc(cart)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@router.get("")
def get_carts(skip: int = 0, limit: int = 100, user_id: str = None):
    """Obtener todos los carritos"""
    query = {}
    if user_id:
        query["user_id"] = user_id
    
    carts = list(shopping_cart_collection.find(query).skip(skip).limit(limit))
    return serialize_list(carts)

@router.get("/{cart_id}")
def get_cart(cart_id: str):
    """Obtener un carrito por ID"""
    cart = shopping_cart_collection.find_one({"_id": cart_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    return serialize_doc(cart)

@router.get("/user/{user_id}")
def get_user_cart(user_id: str):
    """Obtener el carrito de un usuario específico"""
    cart = shopping_cart_collection.find_one({"user_id": user_id})
    if not cart:
        raise HTTPException(status_code=404, detail="Carrito no encontrado para este usuario")
    return serialize_doc(cart)

@router.put("/{cart_id}")
def update_cart(cart_id: str, cart: dict = Body(...)):
    """Actualizar un carrito"""
    cart["updated_at"] = datetime.utcnow()
    
    result = shopping_cart_collection.update_one(
        {"_id": cart_id},
        {"$set": cart}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    
    updated_cart = shopping_cart_collection.find_one({"_id": cart_id})
    return serialize_doc(updated_cart)

@router.delete("/{cart_id}")
def delete_cart(cart_id: str):
    """Eliminar un carrito"""
    result = shopping_cart_collection.delete_one({"_id": cart_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    
    return {"message": "Carrito eliminado", "cart_id": cart_id}

@router.post("/{cart_id}/clear")
def clear_cart(cart_id: str):
    """Vaciar el carrito (limpiar items)"""
    result = shopping_cart_collection.update_one(
        {"_id": cart_id},
        {"$set": {"items": [], "total": 0, "updated_at": datetime.utcnow()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Carrito no encontrado")
    
    return {"message": "Carrito vaciado", "cart_id": cart_id}