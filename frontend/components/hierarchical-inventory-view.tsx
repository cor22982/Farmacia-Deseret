"use client"

import { useState } from "react"
import type { ProductPresentation, ProductBatch } from "@/lib/inventory-system"
import { getTotalAtLevel, addProductStock } from "@/lib/inventory-system"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Trash2, Plus } from "lucide-react"

interface HierarchicalInventoryViewProps {
  presentation: ProductPresentation
  onUpdate: (presentation: ProductPresentation) => void
}

export function HierarchicalInventoryView({ presentation, onUpdate }: HierarchicalInventoryViewProps) {
  const [showAddStockModal, setShowAddStockModal] = useState(false)
  const [selectedLevelForAdd, setSelectedLevelForAdd] = useState<string | null>(null)
  const [newBatchNumber, setNewBatchNumber] = useState("")
  const [newExpireDate, setNewExpireDate] = useState("")
  const [newPurchaseDate, setNewPurchaseDate] = useState("")
  const [quantityToAdd, setQuantityToAdd] = useState(1)

  const handleAddStock = () => {
    if (!selectedLevelForAdd || !newBatchNumber || !newExpireDate) {
      alert("Por favor completa todos los campos")
      return
    }

    const levelIndex = presentation.levels.findIndex((l) => l.id === selectedLevelForAdd)
    const newBatch: ProductBatch = {
      id: `batch-${Date.now()}`,
      batchNumber: newBatchNumber,
      expireDate: newExpireDate,
      purchaseDate: newPurchaseDate || new Date().toISOString().split("T")[0],
      quantities: {},
    }

    const updatedBatch = addProductStock(newBatch, quantityToAdd, selectedLevelForAdd, presentation.levels)

    const updatedPresentation = {
      ...presentation,
      batches: [...presentation.batches, updatedBatch],
    }

    onUpdate(updatedPresentation)
    setShowAddStockModal(false)
    setSelectedLevelForAdd(null)
    setNewBatchNumber("")
    setNewExpireDate("")
    setNewPurchaseDate("")
    setQuantityToAdd(1)
  }

  const handleRemoveBatch = (batchId: string) => {
    const updatedPresentation = {
      ...presentation,
      batches: presentation.batches.filter((b) => b.id !== batchId),
    }
    onUpdate(updatedPresentation)
  }

  return (
    <div className="space-y-6">
      {/* Summary by Level */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resumen de Stock por Nivel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {presentation.levels.map((level) => {
              const total = getTotalAtLevel(presentation.batches, level.id)
              return (
                <div key={level.id} className="bg-accent/10 p-4 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">{level.name}</p>
                  <p className="text-2xl font-bold text-accent">{total}</p>
                  <p className="text-xs text-muted-foreground mt-1">${level.price.toFixed(2)}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Batches Detail */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Lotes de Stock</CardTitle>
            <Button size="sm" onClick={() => setShowAddStockModal(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar Stock
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {presentation.batches.map((batch) => (
              <div key={batch.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold">Lote: {batch.batchNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      Compra: {new Date(batch.purchaseDate).toLocaleDateString()} | Vencimiento:{" "}
                      {new Date(batch.expireDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveBatch(batch.id)}
                    className="p-1 hover:bg-destructive/10 rounded text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {presentation.levels.map((level) => (
                    <div key={level.id} className="bg-muted p-2 rounded text-center">
                      <p className="text-xs text-muted-foreground">{level.name}</p>
                      <p className="font-semibold">{batch.quantities[level.id] || 0}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Stock Modal */}
      <Dialog open={showAddStockModal} onOpenChange={setShowAddStockModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Stock</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Seleccionar Nivel</Label>
              <select
                value={selectedLevelForAdd || ""}
                onChange={(e) => setSelectedLevelForAdd(e.target.value || null)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Elige un nivel</option>
                {presentation.levels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name} (${level.price.toFixed(2)} c/u)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch">Número de Lote</Label>
              <Input
                id="batch"
                value={newBatchNumber}
                onChange={(e) => setNewBatchNumber(e.target.value)}
                placeholder="ej: LOT-2024-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantityToAdd}
                onChange={(e) => setQuantityToAdd(Math.max(1, Number.parseInt(e.target.value) || 1))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase">Fecha de Compra</Label>
              <Input
                id="purchase"
                type="date"
                value={newPurchaseDate}
                onChange={(e) => setNewPurchaseDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expire">Fecha de Vencimiento</Label>
              <Input id="expire" type="date" value={newExpireDate} onChange={(e) => setNewExpireDate(e.target.value)} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddStockModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddStock}>Agregar Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
