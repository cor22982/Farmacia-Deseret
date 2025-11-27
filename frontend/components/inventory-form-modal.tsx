"use client"

import { useState, useEffect } from "react"
import type { Product, Presentation } from "@/lib/mock-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Plus } from "lucide-react"

interface InventoryFormModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: Product) => void
}

export function InventoryFormModal({ product, open, onOpenChange, onSave }: InventoryFormModalProps) {
  const defaultPresentation: Presentation = {
    id: `pres-${Date.now()}`,
    type: "",
    quantity: 0,
    price: 0,
    cost: 0,
    expireDate: new Date().toISOString().split("T")[0],
    purchaseDate: new Date().toISOString().split("T")[0],
  }

  const defaultProduct: Product = {
    id: "",
    name: "",
    description: "",
    location: "",
    image: "/pharmacy-product.jpg",
    presentations: [defaultPresentation],
  }

  const [formData, setFormData] = useState<Product>(defaultProduct)

  useEffect(() => {
    if (product) {
      setFormData(product)
    } else if (open) {
      setFormData(defaultProduct)
    }
  }, [product, open])

  const handleChange = (field: keyof Product, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handlePresentationChange = (index: number, field: keyof Presentation, value: string | number) => {
    const updatedPresentations = [...formData.presentations]
    updatedPresentations[index] = {
      ...updatedPresentations[index],
      [field]: value,
    }
    setFormData({
      ...formData,
      presentations: updatedPresentations,
    })
  }

  const addPresentation = () => {
    setFormData({
      ...formData,
      presentations: [...formData.presentations, { ...defaultPresentation, id: `pres-${Date.now()}` }],
    })
  }

  const removePresentation = (index: number) => {
    if (formData.presentations.length > 1) {
      setFormData({
        ...formData,
        presentations: formData.presentations.filter((_, i) => i !== index),
      })
    }
  }

  const handleSave = () => {
    if (!formData.name) {
      alert("Nombre del producto requerido")
      return
    }
    if (formData.presentations.length === 0) {
      alert("Se requiere al menos una presentación")
      return
    }
    onSave(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Agregar Nuevo Producto"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Información del Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="ej: Estante A1"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="w-full p-2 border rounded-md font-sans"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Presentations */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Presentaciones</h3>
              <Button size="sm" onClick={addPresentation} className="gap-2">
                <Plus className="w-4 h-4" />
                Agregar Presentación
              </Button>
            </div>

            <div className="space-y-4">
              {formData.presentations.map((pres, index) => (
                <div key={pres.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium">Presentación {index + 1}</p>
                    {formData.presentations.length > 1 && (
                      <button
                        onClick={() => removePresentation(index)}
                        className="p-1 hover:bg-destructive/10 rounded text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Tipo de Presentación</Label>
                      <Input
                        value={pres.type}
                        onChange={(e) => handlePresentationChange(index, "type", e.target.value)}
                        placeholder="ej: Tableta - Caja de 30"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Cantidad</Label>
                      <Input
                        type="number"
                        value={pres.quantity}
                        onChange={(e) =>
                          handlePresentationChange(index, "quantity", Number.parseInt(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Precio de Venta ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={pres.price}
                        onChange={(e) =>
                          handlePresentationChange(index, "price", Number.parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Costo ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={pres.cost}
                        onChange={(e) =>
                          handlePresentationChange(index, "cost", Number.parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Fecha de Vencimiento</Label>
                      <Input
                        type="date"
                        value={pres.expireDate}
                        onChange={(e) => handlePresentationChange(index, "expireDate", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Fecha de Compra</Label>
                      <Input
                        type="date"
                        value={pres.purchaseDate}
                        onChange={(e) => handlePresentationChange(index, "purchaseDate", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar Cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
