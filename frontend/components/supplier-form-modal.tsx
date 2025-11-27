"use client"

import { useState, useEffect } from "react"
import type { Supplier } from "@/lib/mock-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SupplierFormModalProps {
  supplier: Supplier | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (supplier: Supplier) => void
}

export function SupplierFormModal({ supplier, open, onOpenChange, onSave }: SupplierFormModalProps) {
  const defaultSupplier: Supplier = {
    id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  }

  const [formData, setFormData] = useState<Supplier>(defaultSupplier)

  useEffect(() => {
    if (supplier) {
      setFormData(supplier)
    } else if (open) {
      setFormData(defaultSupplier)
    }
  }, [supplier, open])

  const handleChange = (field: keyof Supplier, value: string | string[]) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleSave = () => {
    if (!formData.name) {
      alert("Supplier name is required")
      return
    }
    onSave(formData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{supplier ? "Editar Proveedor" : "Agregar Nuevo Proveedor"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Proveedor</Label>
            <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar Proveedor</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
