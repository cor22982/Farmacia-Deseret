"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { StockBatch, Product } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StockBatchFormModalProps {
  batch: StockBatch | null
  products: Product[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (batch: StockBatch) => void
}

export function StockBatchFormModal({ batch, products, open, onOpenChange, onSave }: StockBatchFormModalProps) {
  const [formData, setFormData] = useState<Partial<StockBatch>>({
    product_id: "",
    lot_code: "",
    expiration_date: new Date(),
    purchase_date: new Date(),
    stock_units: 0,
    cost_per_unit: 0,
    location: "farmacia",
  })

  useEffect(() => {
    if (batch) {
      setFormData(batch)
    } else {
      setFormData({
        product_id: "",
        lot_code: "",
        expiration_date: new Date(),
        purchase_date: new Date(),
        stock_units: 0,
        cost_per_unit: 0,
        location: "farmacia",
      })
    }
  }, [batch, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const batchData: StockBatch = {
      _id: batch?._id || `batch-${Date.now()}`,
      product_id: formData.product_id!,
      lot_code: formData.lot_code!,
      expiration_date: formData.expiration_date!,
      purchase_date: formData.purchase_date!,
      stock_units: formData.stock_units!,
      cost_per_unit: formData.cost_per_unit!,
      location: formData.location!,
      created_at: batch?.created_at || new Date(),
      updated_at: new Date(),
    }
    onSave(batchData)
    onOpenChange(false)
  }

  const selectedProduct = products.find((p) => p._id === formData.product_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{batch ? "Editar Lote de Stock" : "Agregar Lote de Stock"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="product">Producto *</Label>
            <Select
              value={formData.product_id}
              onValueChange={(value) => setFormData({ ...formData, product_id: value })}
            >
              <SelectTrigger id="product">
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedProduct && (
            <div className="bg-accent/10 p-3 rounded-md text-sm">
              <p className="font-semibold">Presentaciones disponibles:</p>
              <ul className="mt-1 space-y-1">
                {selectedProduct.presentations.map((pres) => (
                  <li key={pres.sku} className="text-muted-foreground">
                    • {pres.presentation_name}: {pres.units} unidades (Costo: ${pres.cost.toFixed(2)}, Precio: $
                    {pres.price.toFixed(2)})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lot_code">Código de Lote *</Label>
              <Input
                id="lot_code"
                value={formData.lot_code}
                onChange={(e) => setFormData({ ...formData, lot_code: e.target.value })}
                placeholder="ej: L2025A"
                required
              />
            </div>

            <div>
              <Label htmlFor="location">Ubicación *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger id="location">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="farmacia">Farmacia</SelectItem>
                  <SelectItem value="bodega">Bodega</SelectItem>
                  <SelectItem value="refrigerador">Refrigerador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stock_units">Unidades en Stock *</Label>
              <Input
                id="stock_units"
                type="number"
                value={formData.stock_units}
                onChange={(e) => setFormData({ ...formData, stock_units: Number(e.target.value) })}
                min="0"
                required
              />
            </div>

            <div>
              <Label htmlFor="cost_per_unit">Costo por Unidad *</Label>
              <Input
                id="cost_per_unit"
                type="number"
                step="0.01"
                value={formData.cost_per_unit}
                onChange={(e) => setFormData({ ...formData, cost_per_unit: Number(e.target.value) })}
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchase_date">Fecha de Compra *</Label>
              <Input
                id="purchase_date"
                type="date"
                value={
                  formData.purchase_date instanceof Date
                    ? formData.purchase_date.toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
                onChange={(e) => setFormData({ ...formData, purchase_date: new Date(e.target.value) })}
                required
              />
            </div>

            <div>
              <Label htmlFor="expiration_date">Fecha de Vencimiento *</Label>
              <Input
                id="expiration_date"
                type="date"
                value={
                  formData.expiration_date instanceof Date
                    ? formData.expiration_date.toISOString().split("T")[0]
                    : new Date().toISOString().split("T")[0]
                }
                onChange={(e) => setFormData({ ...formData, expiration_date: new Date(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{batch ? "Actualizar" : "Agregar"} Lote</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
