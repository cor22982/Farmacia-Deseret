from fastapi import APIRouter
from datetime import datetime, timedelta
from config.database import products_collection, stock_batches_collection, sales_collection
from utils.helpers  import to_datetime, format_date
from zoneinfo import ZoneInfo


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

GT_TZ = ZoneInfo("America/Guatemala")
UTC_TZ = ZoneInfo("UTC")


def normalize_gt_datetime(dt):
    if not dt:
        return None

    dt = to_datetime(dt)

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=UTC_TZ)

    return dt.astimezone(GT_TZ)


def get_shift_from_datetime(dt: datetime):
    """
    AM:  08:30 - 14:00
    PM:  15:00 - 20:30
    """
    h = dt.hour
    m = dt.minute

    # AM
    if (h == 8 and m >= 30) or (9 <= h < 14) or (h == 14 and m == 0):
        return "am"

    # PM
    if (15 <= h < 20) or (h == 20 and m <= 30):
        return "pm"

    return None


def first_business_monday(year: int, month: int) -> datetime:
    """Primer lunes DENTRO del mes"""
    first_day = datetime(year, month, 1, tzinfo=GT_TZ)

    if first_day.weekday() == 0:
        return first_day

    return first_day + timedelta(days=(7 - first_day.weekday()))


@router.post("/weekly-monthly")
def sales_inventory_report(month: int, year: int):

    products = list(products_collection.find())
    report = []

    # Semanas de negocio (NO ISO)
    first_monday = first_business_monday(year, month)
    weeks = [first_monday + timedelta(weeks=i) for i in range(4)]

    # Límites Mongo en UTC
    start_utc = weeks[0].astimezone(UTC_TZ)
    end_utc = (weeks[-1] + timedelta(days=7)).astimezone(UTC_TZ)

    for product in products:

        # 💲 Precio base
        base = min(product["presentations"], key=lambda p: p["units"])
        pp = base["price"]

        # 📦 Stock
        batches = list(stock_batches_collection.find({
            "product_id": product["_id"]
        }))

        existencia = sum(b.get("stock_units", 0) for b in batches)

        # 🔧 Normalizar lotes
        normalized_batches = []
        for b in batches:
            if b.get("stock_units", 0) <= 0:
                continue

            exp = normalize_gt_datetime(b.get("expiration_date"))
            pur = normalize_gt_datetime(b.get("purchase_date"))

            if exp:
                b["_exp_dt"] = exp
                b["_pur_dt"] = pur
                normalized_batches.append(b)

        next_batch = min(
            normalized_batches,
            key=lambda b: b["_exp_dt"],
            default=None
        )

        # 📊 Ventas por día / horario
        ventas_dia = {
            "lunes_am": 0, "lunes_pm": 0,
            "martes_am": 0, "martes_pm": 0,
            "miercoles_am": 0, "miercoles_pm": 0,
            "jueves_am": 0, "jueves_pm": 0,
            "viernes_am": 0, "viernes_pm": 0,
            "sabado": 0,
        }

        # 🧾 Ventas del período
        sales = list(sales_collection.find({
            "items.product_id": product["_id"],
            "datetime": {
                "$gte": start_utc,
                "$lt": end_utc
            }
        }))

        # 🔧 Normalizar fechas de ventas
        for sale in sales:
            sale["_dt_gt"] = normalize_gt_datetime(sale.get("datetime"))

        # 📊 Ventas por día usando datetime
        for sale in sales:
            sale_dt = sale["_dt_gt"]
            raw_day = sale_dt.strftime("%A").lower()
            day = DAY_MAP.get(raw_day)

            if not day:
                continue

            shift = get_shift_from_datetime(sale_dt)

            for item in sale["items"]:
                if item["product_id"] != product["_id"]:
                    continue

                units = item.get("units_deducted", 0)

                # Sábado sin AM / PM
                if day == "sabado":
                    ventas_dia["sabado"] += units

                # Lunes a viernes
                elif shift in ("am", "pm"):
                    ventas_dia[f"{day}_{shift}"] += units

        # 📅 Ventas por semana
        week_totals = []

        for w in weeks:
            total = 0
            for sale in sales:
                sale_dt = sale["_dt_gt"]
                if w <= sale_dt < w + timedelta(days=7):
                    for item in sale["items"]:
                        if item["product_id"] == product["_id"]:
                            total += item.get("units_deducted", 0)
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
            "promedio": total_mes / 4 if total_mes else 0,
            "mes_1": total_mes,
            "mes_2": total_mes * 2,
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
