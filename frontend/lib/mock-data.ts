// Mock data for products, inventory, and suppliers
import type { ProductPresentation, Supplier as SupplierSystem, Order as OrderSystem } from "./inventory-system"

export interface Presentation {
  id: string
  type: string // e.g., "Tableta", "Cápsula", "Líquido"
  quantity: number
  price: number
  cost: number
  expireDate: string
  purchaseDate: string
}

export interface Product {
  id: string
  name: string
  description: string
  location: string
  image: string
  presentations: Presentation[]
}

export interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
  products: string[]
}

export interface Order {
  id: string
  date: string
  customerName: string
  items: Array<{ productId: string; presentationId: string; levelId: string; quantity: number; price: number }>
  total: number
  paymentMethod: "cash" | "card" | "transfer"
  amountReceived: number
  change: number
}

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Ibuprofen 400mg",
    description: "Pain reliever and fever reducer. Effective for headaches, muscle aches, and arthritis pain.",
    location: "Shelf A1",
    image: "/ibuprofen-tablets.jpg",
    presentations: [
      {
        id: "1-p1",
        type: "Tableta - Caja de 30",
        quantity: 150,
        price: 8.99,
        cost: 3.5,
        expireDate: "2025-12-31",
        purchaseDate: "2024-06-15",
      },
      {
        id: "1-p2",
        type: "Tableta - Caja de 60",
        quantity: 80,
        price: 15.99,
        cost: 6.2,
        expireDate: "2025-11-20",
        purchaseDate: "2024-07-01",
      },
    ],
  },
  {
    id: "2",
    name: "Amoxicillin 500mg",
    description:
      "Antibiotic used to treat bacterial infections including ear, nose, throat, and urinary tract infections.",
    location: "Shelf B2",
    image: "/amoxicillin-capsules.jpg",
    presentations: [
      {
        id: "2-p1",
        type: "Cápsula - Caja de 20",
        quantity: 85,
        price: 15.5,
        cost: 5.2,
        expireDate: "2025-08-20",
        purchaseDate: "2024-05-10",
      },
      {
        id: "2-p2",
        type: "Cápsula - Caja de 40",
        quantity: 45,
        price: 28.5,
        cost: 9.8,
        expireDate: "2025-09-15",
        purchaseDate: "2024-06-05",
      },
    ],
  },
  {
    id: "3",
    name: "Vitamin D3 1000IU",
    description: "Vitamin D supplement supporting bone health and immune system function.",
    location: "Shelf C3",
    image: "/vitamin-d-softgels.jpg",
    presentations: [
      {
        id: "3-p1",
        type: "Softgel - Botella de 100",
        quantity: 200,
        price: 12.99,
        cost: 4.5,
        expireDate: "2026-03-15",
        purchaseDate: "2024-04-22",
      },
      {
        id: "3-p2",
        type: "Softgel - Botella de 200",
        quantity: 120,
        price: 22.99,
        cost: 8.0,
        expireDate: "2026-02-28",
        purchaseDate: "2024-05-10",
      },
    ],
  },
  {
    id: "4",
    name: "Aspirin 100mg",
    description: "Commonly used for pain relief and fever reduction. Also used for heart health.",
    location: "Shelf A2",
    image: "/aspirin-tablets.jpg",
    presentations: [
      {
        id: "4-p1",
        type: "Tableta - Caja de 50",
        quantity: 300,
        price: 6.99,
        cost: 2.3,
        expireDate: "2025-10-30",
        purchaseDate: "2024-03-18",
      },
    ],
  },
  {
    id: "5",
    name: "Multivitamin Complex",
    description: "Complete daily multivitamin with essential nutrients and minerals.",
    location: "Shelf D1",
    image: "/multivitamin-tablets.jpg",
    presentations: [
      {
        id: "5-p1",
        type: "Tableta - Botella de 60",
        quantity: 120,
        price: 14.5,
        cost: 6.0,
        expireDate: "2025-11-20",
        purchaseDate: "2024-07-05",
      },
      {
        id: "5-p2",
        type: "Tableta - Botella de 120",
        quantity: 75,
        price: 25.99,
        cost: 10.5,
        expireDate: "2025-12-10",
        purchaseDate: "2024-08-03",
      },
    ],
  },
]

export const mockProductPresentations: ProductPresentation[] = [
  {
    id: "p1",
    productId: "1",
    name: "Acetaminophen 500mg",
    description: "Pain reliever and fever reducer. Effective for headaches and general pain.",
    location: "Shelf A1",
    image: "/acetaminophen.jpg",
    levels: [
      { id: "box", name: "Caja", unitsPerParent: 1, price: 25.0, cost: 10.0 },
      { id: "blister", name: "Blíster", unitsPerParent: 5, price: 5.5, cost: 2.0 },
      { id: "pill", name: "Tableta", unitsPerParent: 8, price: 0.8, cost: 0.3 },
    ],
    batches: [
      {
        id: "batch-1",
        batchNumber: "ACT-2024-001",
        expireDate: "2026-12-31",
        purchaseDate: "2024-01-15",
        quantities: {
          box: 50,
          blister: 250, // 50 boxes * 5 blisters/box
          pill: 2000, // 250 blisters * 8 pills/blister
        },
      },
      {
        id: "batch-2",
        batchNumber: "ACT-2024-002",
        expireDate: "2026-06-30",
        purchaseDate: "2024-06-20",
        quantities: {
          box: 30,
          blister: 150,
          pill: 1200,
        },
      },
    ],
  },
  {
    id: "p2",
    productId: "2",
    name: "Ibuprofen 400mg",
    description: "Anti-inflammatory pain reliever and fever reducer.",
    location: "Shelf A2",
    image: "/ibuprofen.jpg",
    levels: [
      { id: "box", name: "Caja", unitsPerParent: 1, price: 18.0, cost: 7.5 },
      { id: "blister", name: "Blíster", unitsPerParent: 4, price: 4.8, cost: 1.9 },
      { id: "pill", name: "Tableta", unitsPerParent: 10, price: 0.6, cost: 0.25 },
    ],
    batches: [
      {
        id: "batch-3",
        batchNumber: "IBU-2024-001",
        expireDate: "2026-03-15",
        purchaseDate: "2024-02-10",
        quantities: {
          box: 100,
          blister: 400,
          pill: 4000,
        },
      },
    ],
  },
  {
    id: "p3",
    productId: "3",
    name: "Aspirin 100mg",
    description: "Commonly used for pain relief and heart health.",
    location: "Shelf B1",
    image: "/aspirin.jpg",
    levels: [
      { id: "box", name: "Caja", unitsPerParent: 1, price: 12.0, cost: 4.5 },
      { id: "strip", name: "Tira", unitsPerParent: 10, price: 1.3, cost: 0.5 },
      { id: "pill", name: "Tableta", unitsPerParent: 10, price: 0.15, cost: 0.06 },
    ],
    batches: [
      {
        id: "batch-4",
        batchNumber: "ASP-2024-001",
        expireDate: "2025-12-20",
        purchaseDate: "2024-03-01",
        quantities: {
          box: 200,
          strip: 2000,
          pill: 20000,
        },
      },
    ],
  },
]

export const mockSuppliers: SupplierSystem[] = [
  {
    id: "1",
    name: "MediCare Distributions",
    email: "contact@medicaredist.com",
    phone: "1-800-123-4567",
    address: "123 Pharma Street, City, State 12345",
    products: ["1", "2", "3"],
  },
  {
    id: "2",
    name: "Global Pharma Solutions",
    email: "sales@globalpharma.com",
    phone: "1-800-987-6543",
    address: "456 Medical Ave, Town, State 54321",
    products: ["1", "3"],
  },
]

export const mockOrders: OrderSystem[] = [
  {
    id: "ORD-001",
    date: "2024-11-25",
    customerName: "John Doe",
    items: [
      {
        productId: "1",
        presentationId: "p1",
        levelId: "blister",
        quantity: 3,
        price: 5.5,
      },
    ],
    total: 16.5,
    paymentMethod: "cash",
    amountReceived: 20.0,
    change: 3.5,
  },
]
