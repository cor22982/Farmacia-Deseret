import pandas as pd
import json
import uuid
from datetime import datetime

# ================= CONFIG =================
CSV_PATH = "data.csv"
PRODUCTS_PATH = "products_fixed.json"
BATCHES_OUT = "batches.json"
BODEGA_LOCATION = "BODEGA"
# =========================================

MESES = {
    "ene": 1, "feb": 2, "mar": 3, "abr": 4, "may": 5, "jun": 6,
    "jul": 7, "ago": 8, "sep": 9, "oct": 10, "nov": 11, "dic": 12
}

# -------- helpers --------
def slugify(text):
    return "".join(c for c in text.lower().replace(" ", "_") if c.isalnum() or c == "_")

def parse_mes_fecha(valor):
    if not valor or str(valor).strip() == "":
        return None
    try:
        mes, anio = str(valor).lower().split("-")
        mes_num = MESES.get(mes[:3])
        anio = int("20" + anio)
        fecha = datetime(anio, mes_num, 1)
        return {"$date": fecha.strftime("%Y-%m-%dT%H:%M:%S.000Z")}
    except:
        return None

def parse_location(valor):
    if valor is None:
        return "SIN UBICACION"
    s = str(valor).strip()
    if s == "" or s.lower() in ("null", "nan", "none", "0"):
        return "SIN UBICACION"
    return s

# 🔥 IMPORTANTE: detecta NaN real
def parse_int_or_none(valor):
    try:
        if pd.isna(valor):
            return None
        v = float(str(valor).strip())
        if v != v:  # NaN check extra
            return None
        return int(v)
    except:
        return None

def parse_bodega(valor):
    try:
        if pd.isna(valor):
            return None
        v = int(float(str(valor).strip()))
        return v if v > 0 else None
    except:
        return None

def make_batch(batch_id, product_id, row, location, stock_units):
    now = datetime.utcnow()

    return {
        "_id": batch_id,
        "product_id": product_id,
        "lot_code": f"LOT-{uuid.uuid4().hex[:10].upper()}",
        "expiration_date": parse_mes_fecha(row.get("FV")),
        "purchase_date": parse_mes_fecha(row.get("FC")),
        "stock_units": stock_units,
        "cost_per_unit": float(row["Costo"]),
        "location": location,
        "created_at": now.strftime("%Y-%m-%dT%H:%M:%S"),
        "updated_at": {
            "$date": now.strftime("%Y-%m-%dT%H:%M:%S.000Z")
        }
    }

# -------- load files --------
df = pd.read_csv(CSV_PATH, sep=";", encoding="latin-1")

with open(PRODUCTS_PATH, "r", encoding="utf-8") as f:
    products = json.load(f)

product_index = {p["_id"]: p for p in products}

batches = []
year = datetime.utcnow().year

for i, row in df.iterrows():
    nombre = str(row["Nombre"]).strip()
    product_id = slugify(nombre)

    if product_id not in product_index:
        print(f"❌ Producto no existe: {nombre}")
        continue

    location = parse_location(row.get("Ubicacion"))

    # 🔥 AQUÍ EL CAMBIO IMPORTANTE
    stock_farmacia = parse_int_or_none(row.get("Cantidad"))
    stock_bodega = parse_bodega(row.get("Bodega"))

    # 🚨 SI ES NAN → NO CREAR BATCH
    if stock_farmacia is None:
        print(f"⚠️ SKIP (Cantidad NaN) → {nombre}")
    else:
        batch_id = f"batch-{product_id}-{year}-{i+1}"
        batch = make_batch(
            batch_id=batch_id,
            product_id=product_id,
            row=row,
            location=location,
            stock_units=stock_farmacia
        )
        batches.append(batch)

        print(f"✅ Batch → {nombre} | stock: {stock_farmacia} | location: {location}")

    # ---- BODEGA ----
    if stock_bodega:
        batch_id_bodega = f"BODEGA-{product_id}-{year}-{i+1}"
        batch_bodega = make_batch(
            batch_id=batch_id_bodega,
            product_id=product_id,
            row=row,
            location=BODEGA_LOCATION,
            stock_units=stock_bodega
        )
        batches.append(batch_bodega)

        print(f"   📦 Batch BODEGA → {nombre} | stock: {stock_bodega}")

# -------- save --------
with open(BATCHES_OUT, "w", encoding="utf-8") as f:
    json.dump(batches, f, indent=2, ensure_ascii=False)

print(f"\n✅ batches.json generado — {len(batches)} batches totales")