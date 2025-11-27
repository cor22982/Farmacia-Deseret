export interface PresentationLevel {
  id: string
  name: string // e.g., "Box", "Blister", "Pill"
  unitsPerParent: number // How many of this fit in parent (1 box = 5 blisters, 1 blister = 8 pills)
  price: number
  cost: number
}

export interface ProductBatch {
  id: string
  batchNumber: string
  expireDate: string
  purchaseDate: string
  quantities: {
    [levelId: string]: number // Quantity at each level
  }
}

export interface ProductPresentation {
  id: string
  productId: string
  name: string // e.g., "Acetaminophen 500mg"
  description: string
  location: string
  image: string
  levels: PresentationLevel[] // Hierarchy: [Box, Blister, Pill]
  batches: ProductBatch[] // Each batch has dates and quantities
}

export interface Supplier {
  id: string
  name: string
  email: string
  phone: string
  address: string
  products: string[]
}

export interface CartItem {
  productId: string
  presentationId: string
  levelId: string // Which level user is buying (Box, Blister, etc)
  quantity: number
  price: number
}

export interface Order {
  id: string
  date: string
  customerName: string
  items: CartItem[]
  total: number
  paymentMethod: "cash" | "card" | "transfer"
  amountReceived: number
  change: number
}

// Utility functions for quantity synchronization
export const calculateQuantitiesAtAllLevels = (
  baseQuantity: number,
  baseLevelIndex: number,
  levels: PresentationLevel[],
) => {
  const quantities: { [key: string]: number } = {}

  // Calculate upward (to parent levels)
  let parentQuantity = baseQuantity
  for (let i = baseLevelIndex; i >= 0; i--) {
    quantities[levels[i].id] = parentQuantity
    if (i > 0) {
      parentQuantity = Math.floor(parentQuantity / levels[i].unitsPerParent)
    }
  }

  // Calculate downward (to child levels)
  let childQuantity = baseQuantity * (baseLevelIndex > 0 ? levels[baseLevelIndex - 1]?.unitsPerParent || 1 : 1)
  for (let i = baseLevelIndex + 1; i < levels.length; i++) {
    childQuantity = childQuantity * levels[i].unitsPerParent
    quantities[levels[i].id] = childQuantity
  }

  return quantities
}

export const addProductStock = (
  batch: ProductBatch,
  quantity: number,
  levelId: string,
  levels: PresentationLevel[],
) => {
  const levelIndex = levels.findIndex((l) => l.id === levelId)
  if (levelIndex === -1) return batch

  const newBatch = { ...batch, quantities: { ...batch.quantities } }
  const allLevelQuantities = calculateQuantitiesAtAllLevels(quantity, levelIndex, levels)

  Object.entries(allLevelQuantities).forEach(([id, qty]) => {
    newBatch.quantities[id] = (newBatch.quantities[id] || 0) + qty
  })

  return newBatch
}

export const removeProductStock = (
  batch: ProductBatch,
  quantity: number,
  levelId: string,
  levels: PresentationLevel[],
) => {
  const levelIndex = levels.findIndex((l) => l.id === levelId)
  if (levelIndex === -1) return batch

  const newBatch = { ...batch, quantities: { ...batch.quantities } }
  const allLevelQuantities = calculateQuantitiesAtAllLevels(quantity, levelIndex, levels)

  Object.entries(allLevelQuantities).forEach(([id, qty]) => {
    newBatch.quantities[id] = Math.max(0, (newBatch.quantities[id] || 0) - qty)
  })

  return newBatch
}

export const getTotalAtLevel = (batches: ProductBatch[], levelId: string): number => {
  return batches.reduce((sum, batch) => sum + (batch.quantities[levelId] || 0), 0)
}

export const getAvailableBatches = (batches: ProductBatch[], levelId: string): ProductBatch[] => {
  return batches.filter((batch) => (batch.quantities[levelId] || 0) > 0)
}
