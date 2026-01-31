from datetime import datetime, timedelta
from config.database import stock_batches_collection, products_collection

def to_datetime(value):
    if value is None:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except ValueError:
            return None
    return None

def format_date(value):
    """Devuelve fecha en formato DD/MM/YYYY"""
    dt = to_datetime(value)
    return dt.strftime("%d/%m/%Y") if dt else None


from datetime import datetime

def update_product_presentations_from_stock(product_id: str):
    """
    Recalcula el costo y profit_percent de todas las presentaciones
    del producto usando el costo de la unidad mínima (stock).
    """

    # 1️⃣ Obtener producto
    product = products_collection.find_one({"_id": product_id})
    if not product:
        return

    presentations = product.get("presentations", [])
    if not presentations:
        return

    # 2️⃣ Obtener el batch más reciente (último costo)
    latest_batch = stock_batches_collection.find_one(
        {"product_id": product_id},
        sort=[("updated_at", -1)]
    )

    if not latest_batch:
        return

    cost_per_unit = latest_batch.get("cost_per_unit", 0)

    updated_presentations = []

    # 3️⃣ Recalcular cada presentación
    for p in presentations:
        units = p.get("units", 1)
        price = p.get("price", 0)

        # 🔹 actualizar costo de la presentación
        presentation_cost = round(cost_per_unit * units, 2)

        # 🔹 recalcular profit (price - cost) / price
        profit_percent = (
            round((price - presentation_cost) / price, 2)
            if price > 0 else 0
        )

        updated_presentations.append({
            **p,
            "cost": presentation_cost,
            "profit_percent": profit_percent
        })

    # 4️⃣ Guardar producto actualizado
    products_collection.update_one(
        {"_id": product_id},
        {
            "$set": {
                "presentations": updated_presentations,
                "updated_at": datetime.utcnow()
            }
        }
    )
