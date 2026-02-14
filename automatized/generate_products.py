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
SUPPLIER = "BYF"

# ===== GPT CONFIG =====
GPT_API_URL = "https://api.openai.com/v1/chat/completions"
GPT_TOKEN = os.getenv("TOKEN","")
# =========================================

# -------- helpers --------
def slugify(text):
    return "".join(c for c in text.lower().replace(" ", "_") if c.isalnum() or c == "_")

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

No agregues texto. No markdown. No explicaciones. Solo JSON.
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

# -------- save --------
with open(PRODUCTS_OUT, "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print("✅ products.json generado")
