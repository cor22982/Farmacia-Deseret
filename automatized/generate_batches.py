import pandas as pd
import json
import uuid
from datetime import datetime

# ================= CONFIG =================
CSV_PATH = "data.csv"
PRODUCTS_PATH = "products.json"
BATCHES_OUT = "batches.json"
LOCATION = "farmacia"
# =========================================

# Meses en español
MESES = {
    "ene": 1, "feb": 2, "mar": 3, "abr": 4, "may": 5, "jun": 6,
    "jul": 7, "ago": 8, "sep": 9, "oct": 10, "nov": 11, "dic": 12
}

# -------- helpers --------
def slugify(text):
    return "".join(c for c in text.lower().replace(" ", "_") if c.isalnum() or c == "_")

def parse_mes_fecha(valor):
    """Convierte ago-27 -> 2027-08-01T00:00:00.000Z"""
    if not valor or str(valor).strip() == "":
        return None
    try:
        mes, anio = valor.lower().split("-")
        mes_num = MESES.get(mes[:3])
        anio = int("20" + anio)
        fecha = datetime(anio, mes_num, 1)
        return {"$date": fecha.strftime("%Y-%m-%dT00:00:00.000Z")}
    except:
        return None

# -------- load files --------
df = pd.read_csv(CSV_PATH, sep=";", encoding="latin-1")

with open(PRODUCTS_PATH, "r", encoding="utf-8") as f:
    products = json.load(f)

# index por id
product_index = {p["_id"]: p for p in products}

batches = []

for i, row in df.iterrows():
    nombre = str(row["Nombre"]).strip()
    product_id = slugify(nombre)

    if product_id not in product_index:
        print(f"❌ Producto no existe: {nombre}")
        continue

    batch_id = f"batch-{product_id}-{datetime.utcnow().year}-{i+1}"

    batch = {
        "_id": batch_id,
        "product_id": product_id,
        "lot_code": f"LOT-{uuid.uuid4().hex[:10].upper()}",
        "expiration_date": parse_mes_fecha(row.get("FV")),
        "purchase_date": parse_mes_fecha(row.get("FC")),
        "stock_units": int(row.get("Cantidad", 0)),
        "cost_per_unit": float(row["Costo"]),
        "location": LOCATION,
        "created_at": {"$date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000Z")},
        "updated_at": {"$date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000Z")}
    }

    batches.append(batch)

# -------- save --------
with open(BATCHES_OUT, "w", encoding="utf-8") as f:
    json.dump(batches, f, indent=2, ensure_ascii=False)

print("✅ batches.json generado")
