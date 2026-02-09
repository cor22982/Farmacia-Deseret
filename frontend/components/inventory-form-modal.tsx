"use client"

import { useState, useEffect } from "react"
import type { Product, ProductPresentation } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Trash2, Plus, Loader2, ChevronDown, Check } from "lucide-react"
import { useUpdate } from "@/hooks/use-Products"
import { SUPPLIERS } from "@/lib/utils"


interface InventoryFormModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: Product) => void
}

export function InventoryFormModal({ product, open, onOpenChange, onSave }: InventoryFormModalProps) {
  const { update, loading, error } =  useUpdate();
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    category: "",
    principio_activo: "",
    descripcion: "",
    supplier: "",
    image_url: "/pharmacy-product.jpg",
    presentations: [],
  })
  const [isOpen, setIsOpen] = useState(false);



  

  useEffect(() => {
  if (!open) {
    console.log("Entre aqui2")
    setFormData({
      name: "",
      category: "",
      principio_activo: "",
      descripcion: "",
      supplier: "",
      image_url: "/pharmacy-product.jpg",
      presentations: [],
    });
    return;
  }

  if (product) {
    console.log("Entre aqui")
    // 📝 Editar
    setFormData(product);
  } else {
    
    // ➕ Crear
    setFormData({
      name: "",
      category: "",
      principio_activo: "",
      descripcion: "",
      supplier: "",
      image_url: "/pharmacy-product.jpg",
      presentations: [],
    });
  }
}, [open, product]);


  const handleChange = (field: keyof Product, value: string) => {
    setFormData({
      ...formData,
      [field]: value,
    })
  }

  const handleAddPresentation = () => {
    const newPresentation: ProductPresentation = {
      presentation_name: "",
      units: 0,
      sku: `SKU-${Date.now()}`,
      cost: 0,
      price: 0,
      profit_percent: 0,
    }

    setFormData({
      ...formData,
      presentations: [...(formData.presentations || []), newPresentation],
    })
  }

  const handlePresentationChange = (index: number, field: keyof ProductPresentation, value: string | number) => {
    const updatedPresentations = [...(formData.presentations || [])]
    updatedPresentations[index] = {
      ...updatedPresentations[index],
      [field]: value,
    }

    // Auto-calculate profit percent when cost or price changes
    if (field === "cost" || field === "price") {
      const cost = field === "cost" ? Number(value) : updatedPresentations[index].cost
      const price = field === "price" ? Number(value) : updatedPresentations[index].price
      const profit = price - cost
      updatedPresentations[index].profit_percent = cost > 0 ? profit / price : 0
    }

    setFormData({
      ...formData,
      presentations: updatedPresentations,
    })
  }

  const handleDeletePresentation = (index: number) => {
    setFormData({
      ...formData,
      presentations: formData.presentations?.filter((_, i) => i !== index),
    })
  }

  const handleSave = async() => {
    if (!formData.name || !formData.category) {
      alert("Complete los campos requeridos del producto")
      return
    }

    if (!formData.presentations || formData.presentations.length === 0) {
      alert("Agregue al menos una presentación")
      return
    }

    // Validate all presentations
    for (const pres of formData.presentations) {
      if (!pres.presentation_name || !pres.units || pres.cost <= 0 || pres.price <= 0) {
        alert("Complete todos los campos de las presentaciones")
        return
      }
    }

    const savedProduct: Product = {
      ...formData,
      _id: product?._id || `prod-${Date.now()}`,
      created_at: product?.created_at || new Date(),
      updated_at: new Date(),
    } as Product

    onSave(savedProduct)

    console.log(savedProduct)
    await update(`/products/${product?._id || (savedProduct.name + savedProduct._id) }`,savedProduct)
    setFormData({
        name: "",
        category: "",
        principio_activo: "",
        descripcion: "",
        supplier: "",
        image_url: "/pharmacy-product.jpg",
        presentations: [],
      })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Producto" : "Agregar Nuevo Producto"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Información del Producto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Producto *</Label>
                <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoría *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  placeholder="ej: Analgésico"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="principio_activo">Principio Activo</Label>
                <Input
                  id="principio_activo"
                  value={formData.principio_activo}
                  onChange={(e) => handleChange("principio_activo", e.target.value)}
                  placeholder="ej: Paracetamol"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor</Label>
                  <div className="relative w-50">
                                      <button
                                        onClick={() => setIsOpen(!isOpen)}
                                        className="w-full px-3 py-2 text-left bg-white border rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
                                      >
                                        <span className={!formData.supplier ? "text-gray-400" : ""}>
                                          {SUPPLIERS.find(s => s.value === formData.supplier)?.label || "Filtrar por proveedor"}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                      </button>
                
                                      {isOpen && (
                                        <>
                                          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                                          <div className="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                                            <button
                                              onClick={() => {  handleChange("supplier",""); setIsOpen(false); }}
                                              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
                                            >
                                              Todos los proveedores
                                              {!formData.supplier && <Check className="w-4 h-4" />}
                                            </button>
                                            {SUPPLIERS.map((supplier) => (
                                              <button
                                                key={supplier.value}
                                                onClick={() => { handleChange("supplier",supplier.value); setIsOpen(false); }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center justify-between"
                                              >
                                                {supplier.label}
                                                {formData.supplier === supplier.value && <Check className="w-4 h-4" />}
                                              </button>
                                            ))}
                                          </div>
                                        </>
                                      )}
                                    </div>
             
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Presentations as Cards */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-lg">Presentaciones</h3>
              <Button size="sm" onClick={handleAddPresentation} className="gap-2" type="button">
                <Plus className="w-4 h-4" />
                Agregar Presentación
              </Button>
            </div>

            <div className="space-y-4">
              {formData.presentations && formData.presentations.length > 0 ? (
                formData.presentations.map((pres, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4 bg-card relative">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Presentación {index + 1}</h4>
                      <button
                        onClick={() => handleDeletePresentation(index)}
                        className="p-1 hover:bg-destructive/10 rounded transition-colors"
                        type="button"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Tipo de Presentación</Label>
                        <Input
                          value={pres.presentation_name}
                          onChange={(e) => handlePresentationChange(index, "presentation_name", e.target.value)}
                          placeholder="ej: Tableta - Caja de 30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          value={pres.units}
                          onChange={(e) => handlePresentationChange(index, "units", Number(e.target.value))}
                          placeholder="30"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Precio de Venta (Q)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={pres.price}
                          onChange={(e) => handlePresentationChange(index, "price", Number(e.target.value))}
                          placeholder="0.7"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Costo (Q)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={pres.cost}
                          onChange={(e) => handlePresentationChange(index, "cost", Number(e.target.value))}
                          placeholder="0.5"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Margen de Ganancia</Label>
                        <Input value={`${(pres.profit_percent * 100).toFixed(1)}%`} disabled className="bg-muted" />
                      </div>

                      <div className="space-y-2">
                        <Label>SKU</Label>
                        <Input
                          value={pres.sku}
                          onChange={(e) => handlePresentationChange(index, "sku", e.target.value)}
                          placeholder="SKU-123"
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                  No hay presentaciones. Haga clic en "Agregar Presentación" para comenzar.
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Guardando..." : "Guardar Producto"}
        </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
