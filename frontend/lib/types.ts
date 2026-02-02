// ---------- PRODUCTS ----------
export interface ProductPresentation {
  presentation_name: string // e.g., "unidad", "blister", "caja"
  units: number // How many base units in this presentation
  cost: number // Cost price
  price: number // Selling price
  profit_percent: number // Profit margin as decimal (0.15 = 15%)
  sku: string // Stock keeping unit code
}

export interface SalesStatistics {
  date: string           // YYYY-MM-DD
  total_documents: number
  total_units_deducted: number
  total_sales_amount: number
}


export interface Product {
  _id: string
  name: string
  category: string
  principio_activo: string // Active ingredient
  descripcion: string // Description with indications and dosage
  image_url: string
  supplier: string
  presentations: ProductPresentation[]
  created_at: Date
  updated_at: Date
}

// ---------- STOCK BATCHES ----------
export interface StockBatch {
  _id: string
  product_id: string
  lot_code: string // Batch/lot number
  expiration_date: Date
  purchase_date: Date
  stock_units: number // Total units in stock for this batch
  cost_per_unit: number
  location: string // e.g., "farmacia", "bodega"
  created_at: Date
  updated_at: Date
}

// ---------- SALES ----------
export interface SaleItem {
  product_id: string
  presentation_name: string
  qty: number // Quantity of presentations sold
  units_deducted: number // Total base units deducted
  batch_id: string
  price_unit: number // Price per presentation
  profit_percent: number
  subtotal: number
  batch_cost_per_unit: number
  real_cost: number
  real_profit: number
}

export interface Sale {
  _id: string
  sale_name: string
  datetime: Date
  day_of_week: string
  shift: string // e.g., "mañana", "tarde", "noche"
  items: SaleItem[]
  total: number
  payment_method: "efectivo" | "tarjeta" | "transferencia"
  created_at: Date
}

// ---------- USERS ----------
export interface User {
  _id: string
  username: string
  email: string
  password: string // Hashed password
  role: "admin" | "user"
  created_at: Date
  updated_at: Date
}

// ---------- SHOPPING CART ----------
export interface CartItem {
  product_id: string
  presentation_name: string
  qty: number
  price_unit: number
}

export interface ShoppingCart {
  _id: string
  user_id: string
  items: CartItem[]
  total: number
  paid_amount: number
  payment_method: "efectivo" | "tarjeta" | "transferencia" | null
  created_at: Date
  updated_at: Date
}

// ---------- SUPPLIERS ----------
export interface Supplier {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  products: string[] // Array of product IDs
  created_at: Date
  updated_at: Date
}
