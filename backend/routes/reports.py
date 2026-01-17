from fastapi import APIRouter
from datetime import datetime, timedelta
from config.database import products_collection, stock_batches_collection, sales_collection
from utils.helpers  import to_datetime, format_date
router = APIRouter(prefix="/reports", tags=["Reports"])

DAY_MAP = {
    "monday": "lunes",
    "tuesday": "martes",
    "wednesday": "miercoles",
    "thursday": "jueves",
    "friday": "viernes",
    "saturday": "sabado",
    "sunday": "domingo",
}

SHIFT_MAP = {
    "día": "am",
    "tarde": "pm",
    "noche": "pm",
}

@router.post("/weekly-monthly")
def sales_inventory_report(month: int, year: int):

    products = list(products_collection.find())
    report = []

    first_day = datetime(year, month, 1)
    first_monday = first_day - timedelta(days=first_day.weekday())
    weeks = [first_monday + timedelta(weeks=i) for i in range(4)]

    for product in products:

        base = min(product["presentations"], key=lambda p: p["units"])
        pp = base["price"]

        batches = list(stock_batches_collection.find({
            "product_id": product["_id"]
        }))

        existencia = sum(b["stock_units"] for b in batches)

        # 🔧 NORMALIZAR FECHAS
        normalized_batches = []
        for b in batches:
            exp = to_datetime(b.get("expiration_date"))
            pur = to_datetime(b.get("purchase_date"))

            if b.get("stock_units", 0) > 0 and exp:
                b["_exp_dt"] = exp
                b["_pur_dt"] = pur
                normalized_batches.append(b)

        next_batch = min(
            normalized_batches,
            key=lambda b: b["_exp_dt"],
            default=None
        )

        ventas_dia = {
            "lunes_am": 0, "lunes_pm": 0,
            "martes_am": 0, "martes_pm": 0,
            "miercoles_am": 0, "miercoles_pm": 0,
            "jueves_am": 0, "jueves_pm": 0,
            "viernes_am": 0, "viernes_pm": 0,
            "sabado": 0,
        }

        sales = list(sales_collection.find({
            "items.product_id": product["_id"],
            "datetime": {
                "$gte": first_monday,
                "$lt": first_monday + timedelta(days=28)
            }
        }))

        for sale in sales:
            raw_day = sale.get("day_of_week", "").lower()
            raw_shift = sale.get("shift", "").lower()

            day = DAY_MAP.get(raw_day)
            shift = SHIFT_MAP.get(raw_shift)

            if not day:
                continue

            for item in sale["items"]:
                if item["product_id"] != product["_id"]:
                    continue

                units = item["units_deducted"]

                if day == "sabado":
                    ventas_dia["sabado"] += units
                elif shift in ("am", "pm"):
                    ventas_dia[f"{day}_{shift}"] += units

        week_totals = []
        for w in weeks:
            total = 0
            for sale in sales:
                if w <= sale["datetime"] < w + timedelta(days=7):
                    for item in sale["items"]:
                        if item["product_id"] == product["_id"]:
                            total += item["units_deducted"]
            week_totals.append(total)

        total_mes = sum(week_totals)
        total_ventas_dia = sum(ventas_dia.values())

        report.append({
            "articulo": product["name"],
            "existencia": existencia + total_ventas_dia,
            "ventas_semana": ventas_dia,
            "nva_existencia": existencia,
            "pedido": 0,
            "pp": pp,
            "fecha_vencimiento": format_date(next_batch["_exp_dt"] if next_batch else None),
            "fecha_compra": format_date(next_batch["_pur_dt"] if next_batch else None),
            "bodega": 0,
            "compras": 0,
            "semanas": {
                "sem_1": week_totals[0],
                "sem_2": week_totals[1],
                "sem_3": week_totals[2],
                "sem_4": week_totals[3],
            },
            "total": total_mes,
            "promedio": total_mes / 4,
            "mes_1": total_mes,
            "mes_2": total_mes * 2
        })

    return report


@router.post("/inventario")
def inventory_report():

    products = list(products_collection.find())
    report = []

    for product in products:

        # 🔹 presentación más pequeña
        base = min(product["presentations"], key=lambda p: p["units"])
        units_base = base["units"]
        costo = base["cost"]
        pp = base["price"]

        # 🔹 stock total en unidades mínimas
        batches = list(stock_batches_collection.find({
            "product_id": product["_id"]
        }))

        total_stock_units = sum(b.get("stock_units", 0) for b in batches)

        # 🔹 existencia en presentación base
        existencia = (
            total_stock_units / units_base
            if units_base > 0 else 0
        )

        # 🔹 cálculos financieros
        porcentaje = ((pp - costo) / pp) if pp > 0 else 0
        total_costo = costo * existencia
        total_pp = pp * existencia

        report.append({
            "articulo": product["name"],
            "existencia": round(existencia, 2),
            "costo": round(costo, 2),
            "pp": round(pp, 2),
            "%": round(porcentaje, 4),
            "total_costo": round(total_costo, 2),
            "total_pp": round(total_pp, 2),
        })

    return report
