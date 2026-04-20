import pandas as pd
import json
import uuid
import requests
from datetime import datetime
from pathlib import Path
import os
import time
from dotenv import load_dotenv

load_dotenv()

# ================= CONFIG =================
CSV_PATH = "data.csv"
PRODUCTS_OUT = "products.json"
SUPPLIER = "ROSADEL"

GPT_API_URL = "https://api.openai.com/v1/chat/completions"
GPT_TOKEN = os.getenv("TOKEN", "")

# -------- helpers --------
def slugify(text):
    return "".join(c for c in text.lower().replace(" ", "_") if c.isalnum() or c == "_")

def safe_profit(valor):
    texto = str(valor).strip()
    if texto in ["#¡DIV/0!", "#DIV/0!", "nan", "", "None"]:
        return "0"
    return texto

def safe_float(valor):
    try:
        if pd.isna(valor):
            return 0.0
        texto = str(valor).strip()
        if texto in ["#¡DIV/0!", "#DIV/0!", "", "nan"]:
            return 0.0
        return float(texto)
    except:
        return 0.0

# -------- load existing --------
def load_existing_products(path):
    if not Path(path).exists():
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return []

def build_index(products):
    return {p["_id"]: p for p in products}

def save_products(products):
    with open(PRODUCTS_OUT, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)

# -------- GPT --------
def gpt_enrich_product(nombre_producto):
    try:
        headers = {
            "Authorization": f"Bearer {GPT_TOKEN}",
            "Content-Type": "application/json"
        }

        prompt = f"""
Dado el nombre del producto farmacéutico: "{nombre_producto}"

Devuelve SOLO JSON válido:
{{
  "category": "...",
  "principio_activo": "...",
  "descripcion": "..."
}}
"""

        payload = {
            "model": "gpt-4.1-mini",
            "messages": [
                {"role": "system", "content": "Responde solo JSON válido. Sin texto extra."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0
        }

        r = requests.post(GPT_API_URL, headers=headers, json=payload, timeout=40)

        if r.status_code != 200:
            print(f"[HTTP ERROR {r.status_code}] {r.text}")
            raise Exception("HTTP error")

        response_json = r.json()
        content = response_json["choices"][0]["message"]["content"]

        if not content or content.strip() == "":
            raise ValueError("Respuesta vacía de GPT")

        content = content.strip()

        # limpiar markdown ```json
        if content.startswith("```"):
            content = content.replace("```json", "").replace("```", "").strip()

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

# -------- MAIN --------
df = pd.read_csv(CSV_PATH, sep=";", encoding="latin-1")

products = load_existing_products(PRODUCTS_OUT)
index = build_index(products)

print(f"📦 Productos ya existentes: {len(products)}")

for i, row in df.iterrows():
    nombre = str(row["Nombre"]).strip()
    product_id = slugify(nombre)

    # 🔁 resume automático
    if product_id in index:
        print(f"⏭️  Ya existe → {nombre}")
        continue

    cost = safe_float(row["Costo"])
    price = safe_float(row["PP"])
    profit = safe_profit(row.get("PROFIT", "0"))

    print(f"🤖 GPT → {nombre}")
    gpt_data = gpt_enrich_product(nombre)

    product = {
        "_id": product_id,
        "name": nombre,
        "category": gpt_data["category"],
        "principio_activo": gpt_data["principio_activo"],
        "descripcion": gpt_data["descripcion"],
        "image_url": f"/uploads/products/{product_id}.jpg",
        "supplier": SUPPLIER,
        "presentations": [
            {
                "presentation_name": "unidad",
                "units": 1,
                "cost": cost,
                "price": price,
                "profit_percent": profit,
                "sku": f"SKU-{uuid.uuid4().hex[:12].upper()}"
            }
        ],
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }

    # ➕ agregar
    products.append(product)
    index[product_id] = product

    # 💾 guardar en cada iteración
    save_products(products)

    print(f"💾 Guardado → {nombre}")

    # ⏱️ evitar rate limit
    time.sleep(1)

print("\n✅ Proceso terminado sin perder progreso")