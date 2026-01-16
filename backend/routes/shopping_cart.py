from fastapi import APIRouter, HTTPException, status, Body
from config.database import shopping_cart_collection, serialize_doc, serialize_list, products_collection, stock_batches_collection, sales_collection
from datetime import datetime
import calendar
from bson import ObjectId
from zoneinfo import ZoneInfo


GT_TZ = ZoneInfo("America/Guatemala")

router = APIRouter(prefix="/shopping-cart", tags=["Shopping Cart"])

@router.post("", status_code=status.HTTP_201_CREATED)
def create_cart(cart: dict = Body(...)):
    """Crear carrito, descontar stock y registrar venta"""

    now = datetime.now(GT_TZ)


    cart["created_at"] = now
    cart["updated_at"] = now

    # Valores por defecto
    cart.setdefault("items", [])
    cart.setdefault("total", 0)
    cart.setdefault("paid_amount", 0)
    cart.setdefault("payment_method", None)

    try:
        # ======================
        # 1️⃣ Guardar carrito
        # ======================
        result = shopping_cart_collection.insert_one(cart)
        cart["_id"] = str(result.inserted_id)

        sale_items = []
        sale_total = 0

        # ======================
        # 2️⃣ Procesar items
        # ======================
        for item in cart["items"]:
            product_id = item["product_id"]
            qty = int(item["qty"])

            product = products_collection.find_one({"_id": product_id})
            if not product:
                raise Exception(f"Producto no encontrado: {product_id}")

            presentation = next(
                (p for p in product["presentations"]
                 if p["presentation_name"] == item["presentation_name"]),
                None
            )

            if not presentation:
                raise Exception("Presentación no encontrada")

            units_per_presentation = presentation["units"]
            price_unit = presentation["price"]
            profit_percent = presentation["profit_percent"]

            remaining_units = units_per_presentation * qty
            subtotal = price_unit * qty
            sale_total += subtotal

            # ======================
            # 3️⃣ Descuento FIFO por batch
            # ======================
            batches = stock_batches_collection.find(
                {"product_id": product_id, "stock_units": {"$gt": 0}}
            ).sort("expiration_date", 1)

            for batch in batches:
                if remaining_units <= 0:
                    break

                available = batch["stock_units"]
                used_units = min(available, remaining_units)

                # Descontar stock
                stock_batches_collection.update_one(
                    {"_id": batch["_id"]},
                    {
                        "$inc": {"stock_units": -used_units},
                        "$set": {"updated_at": now}
                    }
                )

                real_cost = used_units * batch["cost_per_unit"]
                real_profit = subtotal - real_cost

                sale_items.append({
                    "product_id": product_id,
                    "presentation_name": item["presentation_name"],
                    "qty": qty,
                    "units_deducted": used_units,
                    "batch_id": batch["_id"],
                    "price_unit": price_unit,
                    "profit_percent": profit_percent,
                    "subtotal": subtotal,
                    "batch_cost_per_unit": batch["cost_per_unit"],
                    "real_cost": real_cost,
                    "real_profit": real_profit
                })

                remaining_units -= used_units

            if remaining_units > 0:
                raise Exception(
                    f"Stock insuficiente para {product_id}. "
                    f"Faltan {remaining_units} unidades"
                )

        # ======================
        # 4️⃣ Registrar venta
        # ======================
        shift = "noche" if now.hour >= 17 else "día"
        day_of_week = calendar.day_name[now.weekday()].lower()

        sale = {
            "_id": f"sale-{ObjectId()}",
            "sale_name": f"Venta {now.strftime('%Y%m%d-%H%M%S')}",
            "datetime": now,
            "day_of_week": day_of_week,
            "shift": shift,
            "items": sale_items,
            "total": sale_total,
            "payment_method": cart["payment_method"],
            "created_at": now
        }

        sales_collection.insert_one(sale)

        return serialize_doc({
            "cart": cart,
            "sale": sale
        })

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error al procesar la venta: {str(e)}"
        )
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