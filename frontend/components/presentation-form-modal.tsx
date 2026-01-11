"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ProductPresentation } from "@/lib/types"

interface PresentationFormModalProps {
  presentation: ProductPresentation | null
  productId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (presentation: ProductPresentation) => void
}

export function PresentationFormModal({
  presentation,
  productId,
  open,
  onOpenChange,
  onSave,
}: PresentationFormModalProps) {
  const [formData, setFormData] = useState<ProductPresentation>({
    presentation_name: "",
    units: 1,
    cost: 0,
    price: 0,
    profit_percent: 0,
    sku: "",
  })

  useEffect(() => {
    if (presentation) {
      setFormData(presentation)
    } else {
      setFormData({
        presentation_name: "",
        units: 1,
        cost: 0,
        price: 0,
        profit_percent: 0,
        sku: "",
      })
    }
  }, [presentation, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Calculate profit percent if not manually set
    const profitPercent =
      formData.price > 0 && formData.cost > 0
        ? (formData.price - formData.cost) / formData.cost
        : formData.profit_percent

    onSave({
      ...formData,
      profit_percent: profitPercent,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{presentation ? "Editar Presentación" : "Nueva Presentación"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="presentation_name">Nombre Presentación *</Label>
              <Input
                id="presentation_name"
                value={formData.presentation_name}
                onChange={(e) => setFormData({ ...formData, presentation_name: e.target.value })}
                placeholder="ej: unidad, blister, caja"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="units">Unidades *</Label>
              <Input
                id="units"
                type="number"
                min="1"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: Number.parseInt(e.target.value) || 1 })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU *</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="ej: ACE-B-01"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Costo *</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Precio de Venta *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="profit_percent">Margen de Ganancia (%)</Label>
              <Input
                id="profit_percent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={(formData.profit_percent * 100).toFixed(2)}
                onChange={(e) =>
                  setFormData({ ...formData, profit_percent: (Number.parseFloat(e.target.value) || 0) / 100 })
                }
                placeholder="Se calcula automáticamente"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                {formData.price > 0 && formData.cost > 0
                  ? `Ganancia: $${(formData.price - formData.cost).toFixed(2)} (${(((formData.price - formData.cost) / formData.cost) * 100).toFixed(1)}%)`
                  : "Ingrese costo y precio"}
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Guardar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
