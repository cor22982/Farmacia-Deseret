// Cambiar a la base de datos 'farmacia'
db = db.getSiblingDB("farmacia");

// ---------- PRODUCTS ----------
db.products.insertOne({
  _id: "acetaminofen-500mg",
  name: "Acetaminofén 500mg",
  category: "analgésico",
  principio_activo: "Paracetamol (Acetaminofén)",
  descripcion: "Indicaciones: Alivio del dolor leve a moderado y reducción de la fiebre. Dosificación: Adultos: 500 mg cada 4-6 horas según sea necesario; no exceder 4 g/24 h. Niños: ajustar según peso y presentación pediátrica.",
  image_url: "/uploads/products/acetaminofen.jpg",
  supplier: "Distribuidora Farmacéutica Guatemala",
  presentations: [
    {
      presentation_name: "unidad",
      units: 1,
      cost: 0.45,
      price: 0.60,
      profit_percent: 0.15,
      sku: "ACE-U-01"
    },
    {
      presentation_name: "blister",
      units: 8,
      cost: 2.80,
      price: 3.50,
      profit_percent: 0.20,
      sku: "ACE-B-01"
    },
    {
      presentation_name: "caja",
      units: 80,
      cost: 18.75,
      price: 25.00,
      profit_percent: 0.25,
      sku: "ACE-C-01"
    }
  ],
  created_at: new Date(),
  updated_at: new Date()
});

// ---------- STOCK BATCHES ----------
db.stock_batches.insertOne({
  _id: "batch-ACE-2025-01",
  product_id: "acetaminofen-500mg",
  lot_code: "L2025A",
  expiration_date: new Date("2026-05-30"),
  purchase_date: new Date("2025-01-20"),
  stock_units: 800,
  cost_per_unit: 0.1875,
  location: "farmacia",
  created_at: new Date(),
  updated_at: new Date()
});

// ---------- SALES ----------
db.sales.insertOne({
  _id: "sale-0001",
  sale_name: "Venta Mathew 01",
  datetime: new Date("2025-11-27T19:45:00Z"),
  day_of_week: "jueves",
  shift: "noche",
  items: [
    {
      product_id: "acetaminofen-500mg",
      presentation_name: "blister",
      qty: 2,
      units_deducted: 16,
      batch_id: "batch-ACE-2025-01",
      price_unit: 3.50,
      profit_percent: 0.20,
      subtotal: 7.00,
      batch_cost_per_unit: 0.1875,
      real_cost: 3.00,
      real_profit: 4.00
    }
  ],
  total: 7.00,
  payment_method: "efectivo",
  created_at: new Date()
});

// ---------- USERS (opcional, para tener un usuario admin) ----------
db.users.insertOne({
  _id: "user-admin-001",
  username: "admin",
  email: "admin@farmacia.com",
  // Password hasheado con bcrypt: "admin123"
  password: "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7qvK0S.U7i",
  role: "admin",
  created_at: new Date(),
  updated_at: new Date()
});

// ---------- SHOPPING CART ----------
db.shopping_cart.insertOne({
  _id: "cart-user-admin-001",
  user_id: "user-admin-001",

  items: [],
  total: 0,

  // cuánto paga el cliente (opcional hasta el momento del pago)
  paid_amount: 0,

  // método de pago: "efectivo", "tarjeta", "transferencia", etc.
  payment_method: null,

  created_at: new Date(),
  updated_at: new Date()
});

// Índices
db.shopping_cart.createIndex({ user_id: 1 });
db.shopping_cart.createIndex({ "items.product_id": 1 });
db.shopping_cart.createIndex({ payment_method: 1 });


// ---------- ÍNDICES ----------
// Índices para products
db.products.createIndex({ name: 1 });
db.products.createIndex({ category: 1 });
db.products.createIndex({ supplier: 1 });
db.products.createIndex({ "presentations.sku": 1 });

// Índices para stock_batches
db.stock_batches.createIndex({ product_id: 1 });
db.stock_batches.createIndex({ expiration_date: 1 });
db.stock_batches.createIndex({ lot_code: 1 });
db.stock_batches.createIndex({ location: 1 });

// Índices para sales
db.sales.createIndex({ datetime: -1 });
db.sales.createIndex({ day_of_week: 1 });
db.sales.createIndex({ shift: 1 });
db.sales.createIndex({ "items.product_id": 1 });
db.sales.createIndex({ payment_method: 1 });

// Índices para users
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });

// Mensaje de confirmación
print("✅ Base de datos 'farmacia' inicializada correctamente");
print("📦 Colecciones creadas:");
print("   - products: " + db.products.countDocuments());
print("   - stock_batches: " + db.stock_batches.countDocuments());
print("   - sales: " + db.sales.countDocuments());
print("   - users: " + db.users.countDocuments());
print("🔐 Usuario admin creado - Email: admin@farmacia.com | Password: admin123");