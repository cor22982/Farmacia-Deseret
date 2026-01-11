"use client"

import { useState } from "react"
import type { Product, ProductPresentation, StockBatch } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface ProductDetailModalProps {
  product: Product | null
  batches: StockBatch[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddToCart: (product: Product, presentation: ProductPresentation, quantity: number) => void
}

export function ProductDetailModal({ product, batches, open, onOpenChange, onAddToCart }: ProductDetailModalProps) {
  const [selectedPresentation, setSelectedPresentation] = useState<ProductPresentation | null>(null)
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  const productBatches = batches.filter((b) => b.product_id === product._id)
  const totalStock = productBatches.reduce((sum, b) => sum + b.stock_units, 0)

  const earliestExpiration =
    productBatches.length > 0
      ? new Date(Math.min(...productBatches.map((b) => new Date(b.expiration_date).getTime())))
      : null

  if (!selectedPresentation && product.presentations.length > 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
              <Image
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Categoría</p>
                <p className="text-base font-medium">{product.category}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Principio Activo</p>
                <p className="text-base font-medium">{product.principio_activo}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="text-base">{product.descripcion}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Proveedor</p>
                <p className="font-medium">{product.supplier}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Stock Total</p>
                  <p className="font-medium">{totalStock} unidades</p>
                </div>
                {earliestExpiration && (
                  <div>
                    <p className="text-sm text-muted-foreground">Próximo Vencimiento</p>
                    <p className="font-medium">{earliestExpiration.toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Seleccionar Presentación</p>
                <div className="space-y-2">
                  {product.presentations.map((pres, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPresentation(pres)}
                      className="w-full p-3 border-2 border-border rounded-lg hover:border-primary transition-colors text-left"
                    >
                      <p className="font-medium capitalize">{pres.presentation_name}</p>
                      <p className="text-sm text-muted-foreground">
                        ${pres.price.toFixed(2)} - {pres.units} unidad{pres.units > 1 ? "es" : ""} - SKU: {pres.sku}
                      </p>
                      <p className="text-xs text-muted-foreground">Margen: {(pres.profit_percent * 100).toFixed(0)}%</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  if (selectedPresentation) {
    const maxQuantityForPresentation = Math.floor(totalStock / selectedPresentation.units)

    const handleAddToCart = () => {
      onAddToCart(product, selectedPresentation, quantity)
      setQuantity(1)
      setSelectedPresentation(null)
      onOpenChange(false)
    }

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
              <Image
                src={product.image_url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="text-base">{product.descripcion}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Presentación</p>
                  <p className="font-medium capitalize">{selectedPresentation.presentation_name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Unidades</p>
                  <p className="font-medium">{selectedPresentation.units}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Precio</p>
                  <p className="text-2xl font-bold text-primary">${selectedPresentation.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stock Disponible</p>
                  <p className="font-medium">{maxQuantityForPresentation} disponibles</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SKU</p>
                  <p className="font-medium">{selectedPresentation.sku}</p>
                </div>
                {earliestExpiration && (
                  <div>
                    <p className="text-xs text-muted-foreground">Próximo Vencimiento</p>
                    <p className="font-medium">{earliestExpiration.toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Cantidad:</label>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    −
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={maxQuantityForPresentation}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="w-16 text-center"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.min(maxQuantityForPresentation, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="bg-accent/10 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Total:</p>
                <p className="text-2xl font-bold text-accent">${(selectedPresentation.price * quantity).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {quantity * selectedPresentation.units} unidades totales
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPresentation(null)}>
              Volver
            </Button>
            <Button onClick={handleAddToCart} disabled={quantity > maxQuantityForPresentation}>
              Agregar al Carrito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return null
}
