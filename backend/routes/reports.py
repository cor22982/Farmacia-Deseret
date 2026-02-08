from fastapi import APIRouter, Query, Body
from datetime import datetime, timedelta
from config.database import products_collection, stock_batches_collection, sales_collection
from utils.helpers import to_datetime, format_date
from zoneinfo import ZoneInfo
from typing import Optional


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


def get_week_range(date: datetime):
    """Obtiene el lunes y domingo de la semana de una fecha dada"""
    # Encontrar el lunes de esta semana
    days_since_monday = date.weekday()
    monday = date - timedelta(days=days_since_monday)
    monday = monday.replace(hour=0, minute=0, second=0, microsecond=0)
    
    # El domingo es 6 días después
    sunday = monday + timedelta(days=6, hours=23, minutes=59, seconds=59)
    
    return monday, sunday


def first_business_monday(year: int, month: int) -> datetime:
    """Primer lunes DENTRO del mes"""
    first_day = datetime(year, month, 1, tzinfo=GT_TZ)

    if first_day.weekday() == 0:
        return first_day

    return first_day + timedelta(days=(7 - first_day.weekday()))


@router.post("/weekly-monthly")
def sales_inventory_report(
    fecha_inicio: Optional[str] = Body(None, description="Fecha inicio (YYYY-MM-DD)"),
    fecha_fin: Optional[str] = Body(None, description="Fecha fin (YYYY-MM-DD)"),
    proveedor: Optional[str] = Body(None, description="Proveedor"),
):
    """
    Reporte de ventas e inventario.
    
    - Si no se pasan fechas, usa la semana actual
    - Las ventas por día (lunes_am, martes_pm, etc.) son de la semana del rango
    - Las semanas mensuales se calculan automáticamente del mes del rango
    """
    
    # 📅 Determinar rango de fechas
    now_gt = datetime.now(GT_TZ)
    
    if fecha_inicio and fecha_fin:
        # Parsear fechas proporcionadas
        start_gt = datetime.fromisoformat(fecha_inicio).replace(tzinfo=GT_TZ)
        end_gt = datetime.fromisoformat(fecha_fin).replace(tzinfo=GT_TZ)
        # Asegurar que end_gt incluya todo el día
        end_gt = end_gt.replace(hour=23, minute=59, second=59)
    else:
        # Usar semana actual
        start_gt, end_gt = get_week_range(now_gt)
    
    # Extraer año y mes del rango
    year = start_gt.year
    month = start_gt.month
    
    # 🗓️ Rango de la semana para ventas diarias (lunes_am, martes_pm, etc.)
    week_start, week_end = get_week_range(start_gt)
    
    filtro = {}
    if proveedor and proveedor.strip() != "":
        filtro["supplier"] = {
            "$regex": proveedor,   # o f"T.*{proveedor}" si quieres lógica extra
            "$options": "i"
        }

    products = list(
        products_collection
            .find(filtro)
            .sort("name", 1)
    )
    report = []

    # Semanas de negocio del mes (para el análisis semanal)
    first_monday = first_business_monday(year, month)
    weeks = [first_monday + timedelta(weeks=i) for i in range(4)]

    # Límites Mongo en UTC para las semanas del mes
    month_start_utc = weeks[0].astimezone(UTC_TZ)
    month_end_utc = (weeks[-1] + timedelta(days=7)).astimezone(UTC_TZ)
    
    # Límites para las ventas de la semana actual/rango
    week_start_utc = week_start.astimezone(UTC_TZ)
    week_end_utc = week_end.astimezone(UTC_TZ)

    for product in products:

        # 💲 Obtener la presentación más pequeña (menor units)
        base = min(product["presentations"], key=lambda p: p["units"])
        pp = base["price"]
        base_units = base["units"]  # 🔑 DIVISOR para normalizar TODO

        # 📦 Stock
        batches = list(stock_batches_collection.find({
            "product_id": product["_id"]
        }))

        # ✅ DIVIDIR stock_units entre base_units
        existencia_raw = sum(b.get("stock_units", 0) for b in batches)
        existencia = existencia_raw / base_units

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

        # 📊 Ventas por día / horario (DE LA SEMANA DEL RANGO)
        ventas_dia = {
            "lunes_am": 0, "lunes_pm": 0,
            "martes_am": 0, "martes_pm": 0,
            "miercoles_am": 0, "miercoles_pm": 0,
            "jueves_am": 0, "jueves_pm": 0,
            "viernes_am": 0, "viernes_pm": 0,
            "sabado": 0,
        }

        # 🧾 Ventas de la semana del rango
        week_sales = list(sales_collection.find({
            "items.product_id": product["_id"],
            "datetime": {
                "$gte": week_start_utc,
                "$lte": week_end_utc
            }
        }))

        # 🔧 Normalizar fechas de ventas de la semana
        for sale in week_sales:
            sale["_dt_gt"] = normalize_gt_datetime(sale.get("datetime"))

        # 📊 Ventas por día usando datetime
        for sale in week_sales:
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
                # ✅ DIVIDIR entre la presentación más pequeña
                units_normalized = units / base_units

                # Sábado sin AM / PM
                if day == "sabado":
                    ventas_dia["sabado"] += units_normalized

                # Lunes a viernes
                elif shift in ("am", "pm"):
                    ventas_dia[f"{day}_{shift}"] += units_normalized

        # 🧾 Ventas del mes completo (para análisis semanal)
        month_sales = list(sales_collection.find({
            "items.product_id": product["_id"],
            "datetime": {
                "$gte": month_start_utc,
                "$lt": month_end_utc
            }
        }))

        # 🔧 Normalizar fechas de ventas del mes
        for sale in month_sales:
            sale["_dt_gt"] = normalize_gt_datetime(sale.get("datetime"))

        # 📅 Ventas por semana del mes
        week_totals = []

        for w in weeks:
            total = 0
            for sale in month_sales:
                sale_dt = sale["_dt_gt"]
                if w <= sale_dt < w + timedelta(days=7):
                    for item in sale["items"]:
                        if item["product_id"] == product["_id"]:
                            units = item.get("units_deducted", 0)
                            # ✅ DIVIDIR entre la presentación más pequeña
                            total += units / base_units
            week_totals.append(total)

        total_mes = sum(week_totals)
        total_ventas_dia = sum(ventas_dia.values())

        report.append({
            "articulo": product["name"],
            "existencia": existencia + total_ventas_dia,  # ✅ YA normalizado
            "ventas_semana": ventas_dia,  # ✅ YA normalizado
            "nva_existencia": existencia,  # ✅ YA normalizado
            "pedido": 0,
            "pp": pp,
            "fecha_vencimiento": format_date(next_batch["_exp_dt"] if next_batch else None),
            "fecha_compra": format_date(next_batch["_pur_dt"] if next_batch else None),
            "bodega": 0,
            "compras": 0,
            "semanas": {
                "sem_1": week_totals[0],  # ✅ YA normalizado
                "sem_2": week_totals[1],  # ✅ YA normalizado
                "sem_3": week_totals[2],  # ✅ YA normalizado
                "sem_4": week_totals[3],  # ✅ YA normalizado
            },
            "total": total_mes,  # ✅ YA normalizado
            "promedio": total_mes / 4 if total_mes else 0,  # ✅ YA normalizado
            "mes_1": total_mes,  # ✅ YA normalizado
            "mes_2": total_mes * 2,  # ✅ YA normalizado
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


@router.get("/statistics")
def sales_statistics_today():
    now_gt = datetime.now(GT_TZ)

    start_gt = now_gt.replace(hour=0, minute=0, second=0, microsecond=0)
    end_gt = now_gt.replace(hour=23, minute=59, second=59, microsecond=999999)

    # 🔄 Convertir a UTC para Mongo
    start_utc = start_gt.astimezone(UTC_TZ)
    end_utc = end_gt.astimezone(UTC_TZ)

    # 🧾 Ventas de hoy
    sales_today = list(
        sales_collection.find({
            "datetime": {
                "$gte": start_utc,
                "$lte": end_utc
            }
        })
    )

    # 📄 Cantidad de documentos
    total_documents = len(sales_today)

    # 📦 Total unidades vendidas (units_deducted)
    total_units_deducted = 0
    for sale in sales_today:
        for item in sale.get("items", []):
            total_units_deducted += item.get("units_deducted", 0)

    # 💰 Total vendido (sumatoria de sale.total)
    total_sales_amount = sum(sale.get("total", 0) for sale in sales_today)

    return {
        "date": start_gt.date().isoformat(),
        "total_documents": total_documents,
        "total_units_deducted": total_units_deducted,
        "total_sales_amount": total_sales_amount
    }
