import pandas as pd
import json
import uuid
import requests
from datetime import datetime
from pathlib import Path
import os

# ================= CONFIG =================
CSV_PATH = "data.csv"
PRODUCTS_OUT = "products.json"
BATCHES_OUT = "batches.json"
SUPPLIER = "BYF"
LOCATION = "farmacia"

# ===== GPT CONFIG =====
GPT_API_URL = "https://api.openai.com/v1/chat/completions"
GPT_TOKEN = os.getenv("TOKEN","")
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


def parse_profit(valor):
    if not valor:
        return 0.0
    return float(str(valor).replace("%", "").strip())


# -------- GPT --------
def gpt_enrich_product(nombre_producto):
    try:
        headers = {
            "Authorization": f"Bearer {GPT_TOKEN}",
            "Content-Type": "application/json"
        }

        prompt = f"""
Dado el nombre del producto farmacéutico: "{nombre_producto}"

Devuelve ÚNICAMENTE un JSON válido con este formato:
{{
  "category": "...",
  "principio_activo": "...",
  "descripcion": "..."
}}

No agregues texto.
No markdown.
No explicaciones.
Solo JSON.
"""

        payload = {
            "model": "gpt-4.1-mini",
            "messages": [
                {"role": "system", "content": "Eres un asistente experto en farmacología y clasificación de medicamentos."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2
        }

        r = requests.post(GPT_API_URL, headers=headers, json=payload, timeout=40)
        r.raise_for_status()

        content = r.json()["choices"][0]["message"]["content"]
        data = json.loads(content)

        return {
            "category": data.get("category", "otros"),
            "principio_activo": data.get("principio_activo", "no especificado"),
            "descripcion": data.get("descripcion", "sin descripcion")
        }

    except Exception as e:
        print(f"[GPT ERROR] {nombre_producto}: {e}")
        return {
            "category": "otros",
            "principio_activo": "no especificado",
            "descripcion": "sin descripcion"
        }


# -------- load csv --------
df = pd.read_csv(CSV_PATH, sep=";", encoding="latin-1")

products = []
batches = []

for i, row in df.iterrows():
    nombre = str(row["Nombre"]).strip()
    product_id = slugify(nombre)

    print(f"🤖 GPT → {nombre}")
    gpt_data = gpt_enrich_product(nombre)

    image_url = f"/uploads/products/{product_id}.jpg"

    cost = float(row["Costo"])
    price = float(row["PP"])
    profit = parse_profit(row.get("PROFIT", 0))

    sku = f"SKU-{uuid.uuid4().hex[:12].upper()}"

    # -------- PRODUCT --------
    product = {
        "_id": product_id,
        "name": nombre,
        "category": gpt_data["category"],
        "principio_activo": gpt_data["principio_activo"],
        "descripcion": gpt_data["descripcion"],
        "image_url": image_url,
        "supplier": SUPPLIER,
        "presentations": [
            {
                "presentation_name": "unidad",
                "units": 1,
                "cost": cost,
                "price": price,
                "profit_percent": profit,
                "sku": sku
            }
        ],
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }

    products.append(product)

    # -------- BATCH --------
    batch_id = f"batch-{product_id}-{datetime.utcnow().year}-{i+1}"

    batch = {
        "_id": batch_id,
        "product_id": product_id,
        "lot_code": f"LOT-{uuid.uuid4().hex[:10].upper()}",
        "expiration_date": parse_mes_fecha(row.get("FV")),
        "purchase_date": parse_mes_fecha(row.get("FC")),
        "stock_units": int(row.get("Cantidad", 0)),
        "cost_per_unit": cost,
        "location": LOCATION,
        "created_at": {"$date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000Z")},
        "updated_at": {"$date": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%S.000Z")}
    }

    batches.append(batch)

# -------- save files --------
with open(PRODUCTS_OUT, "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

with open(BATCHES_OUT, "w", encoding="utf-8") as f:
    json.dump(batches, f, indent=2, ensure_ascii=False)

print("✅ products.json generado")
print("✅ batches.json generado")
