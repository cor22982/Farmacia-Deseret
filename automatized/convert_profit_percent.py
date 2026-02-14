import json

INPUT_FILE = "products.json"
OUTPUT_FILE = "products_fixed.json"

def normalize_profit(value):
    try:
        v = float(value)
        # Si viene como 43.0 → 0.43
        if v > 1:
            return round(v / 100, 4)
        return round(v, 4)
    except:
        return 0.0

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    products = json.load(f)

for product in products:
    presentations = product.get("presentations", [])
    for p in presentations:
        old = p.get("profit_percent", 0)
        new = normalize_profit(old)
        p["profit_percent"] = new
        print(f"✅ {product.get('name','')} | {old} → {new}")

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(products, f, indent=2, ensure_ascii=False)

print("\n🎯 products_fixed.json generado correctamente")
