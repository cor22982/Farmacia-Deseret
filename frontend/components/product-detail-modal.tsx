"use client"

import { useState } from "react"
import type { Product, Presentation } from "@/lib/mock-data"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface ProductDetailModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddToCart: (product: Product, presentation: Presentation, quantity: number) => void
}

export function ProductDetailModal({ product, open, onOpenChange, onAddToCart }: ProductDetailModalProps) {
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null)
  const [quantity, setQuantity] = useState(1)

  if (!product) return null

  if (!selectedPresentation && product.presentations.length > 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Product Details */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="text-base">{product.description}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Ubicación</p>
                <p className="font-medium">{product.location}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Seleccionar Presentación</p>
                <div className="space-y-2">
                  {product.presentations.map((pres) => (
                    <button
                      key={pres.id}
                      onClick={() => setSelectedPresentation(pres)}
                      className="w-full p-3 border-2 border-border rounded-lg hover:border-primary transition-colors text-left"
                    >
                      <p className="font-medium">{pres.type}</p>
                      <p className="text-sm text-muted-foreground">
                        ${pres.price.toFixed(2)} - Stock: {pres.quantity} unidades
                      </p>
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
            {/* Product Image */}
            <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Product Details */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="text-base">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Presentación</p>
                  <p className="font-medium">{selectedPresentation.type}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ubicación</p>
                  <p className="font-medium">{product.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Precio</p>
                  <p className="text-2xl font-bold text-primary">${selectedPresentation.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stock Disponible</p>
                  <p className="font-medium">{selectedPresentation.quantity} unidades</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de Vencimiento</p>
                  <p className="font-medium">{new Date(selectedPresentation.expireDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fecha de Compra</p>
                  <p className="font-medium">{new Date(selectedPresentation.purchaseDate).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium">Cantidad:</label>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                    −
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={selectedPresentation.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="w-16 text-center"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setQuantity(Math.min(selectedPresentation.quantity, quantity + 1))}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-accent/10 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Total:</p>
                <p className="text-2xl font-bold text-accent">${(selectedPresentation.price * quantity).toFixed(2)}</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPresentation(null)}>
              Volver
            </Button>
            <Button onClick={handleAddToCart} disabled={quantity > selectedPresentation.quantity}>
              Agregar al Carrito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return null
}
