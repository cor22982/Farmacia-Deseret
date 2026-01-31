"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import type { StockBatch, Product } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useUpdate } from "@/hooks/use-Products"

interface StockBatchFormModalProps {
  batch: StockBatch | null
  products: Product[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (batch: StockBatch) => void
}

export function StockBatchFormModal({ batch, products, open, onOpenChange, onSave }: StockBatchFormModalProps) {
  
  const { update, loading, error } =  useUpdate();
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
  if (!open) {
    // Limpiar cuando se cierra
    setFormData({
      product_id: "",
      lot_code: "",
      expiration_date: new Date(),
      purchase_date: new Date(),
      stock_units: 0,
      cost_per_unit: 0,
      location: "",
    });
    return;
  }

  // Cuando se abre el modal
  if (batch?._id) {
    // 📝 Editar - tiene un _id válido
    setFormData({
      product_id: batch.product_id,
      lot_code: batch.lot_code,
      expiration_date: batch.expiration_date instanceof Date 
        ? batch.expiration_date 
        : new Date(batch.expiration_date),
      purchase_date: batch.purchase_date instanceof Date 
        ? batch.purchase_date 
        : new Date(batch.purchase_date),
      stock_units: batch.stock_units,
      cost_per_unit: batch.cost_per_unit,
      location: batch.location,
    });
  } else {
    // ➕ Crear - batch es null o no tiene _id
    setFormData({
      product_id: products[0]._id,
      lot_code: "",
      expiration_date: new Date(),
      purchase_date: new Date(),
      stock_units: 0,
      cost_per_unit: 0,
      location: "farmacia",
    });
  }
}, [open, batch?._id]);

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
    console.log("A GUARDAR", batchData)
    onOpenChange(false)
  }

  const handleSubmitApi = async(e: React.FormEvent) => {
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
    await update(`/stock-batches/${batchData?._id || (batchData.lot_code + batchData.product_id) }`,batchData)
    console.log("A GUARDAR", batchData)
    onOpenChange(false)
  }

  const selectedProduct = products.find((p) => p._id === formData.product_id)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={batch?._id || 'new-batch'} className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{batch ? "Editar Lote de Stock" : "Agregar Lote de Stock"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmitApi} className="space-y-4">
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
                    • {pres.presentation_name}: {pres.units} unidades (Costo: Q{pres.cost.toFixed(2)}, Precio: Q
                    {pres.price.toFixed(2)})
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lot_code">Codigo de Lote *</Label>
              <Input
  id="lot_code"
  value={formData.lot_code}
  placeholder="Generado automáticamente"
  required
  onFocus={() => {
    if (!formData.lot_code) {
      setFormData({
        ...formData,
        lot_code: `LOT-${crypto
          .randomUUID()
          .slice(0, 8)
          .toUpperCase()}`
      });
    }
  }}
  onChange={(e) =>
    setFormData({ ...formData, lot_code: e.target.value })
  }
/>

            </div>

            <div>
              <Label htmlFor="location">Ubicación *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="ej: L2025A"
                required
              />
           
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
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading
                ? "Guardando..."
                : batch
                ? "Actualizar Lote"
                : "Agregar Lote"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
