"use client"

import { useState } from "react"
import type { ProductPresentation, PresentationLevel } from "@/lib/inventory-system"
import { getTotalAtLevel } from "@/lib/inventory-system"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"

interface ProductLevelSelectorProps {
  presentation: ProductPresentation
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddToCart: (levelId: string, levelName: string, quantity: number, price: number) => void
}

export function ProductLevelSelector({ presentation, open, onOpenChange, onAddToCart }: ProductLevelSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<PresentationLevel | null>(null)
  const [quantity, setQuantity] = useState(1)

  if (!selectedLevel) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{presentation.name}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
              <Image
                src={presentation.image || "/placeholder.svg"}
                alt={presentation.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* Product Details */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="text-base">{presentation.description}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Ubicación</p>
                <p className="font-medium">{presentation.location}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Seleccionar Presentación</p>
                <div className="space-y-2">
                  {presentation.levels.map((level) => {
                    const stock = getTotalAtLevel(presentation.batches, level.id)
                    return (
                      <button
                        key={level.id}
                        onClick={() => setSelectedLevel(level)}
                        className="w-full p-3 border-2 border-border rounded-lg hover:border-primary transition-colors text-left"
                      >
                        <p className="font-medium">{level.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${level.price.toFixed(2)} - Stock: {stock} disponibles
                        </p>
                      </button>
                    )
                  })}
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

  const stock = getTotalAtLevel(presentation.batches, selectedLevel.id)

  const handleAddToCart = () => {
    onAddToCart(selectedLevel.id, selectedLevel.name, quantity, selectedLevel.price)
    setQuantity(1)
    setSelectedLevel(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{presentation.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="relative w-full h-80 bg-muted rounded-lg overflow-hidden">
            <Image
              src={presentation.image || "/placeholder.svg"}
              alt={presentation.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Product Details */}
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Descripción</p>
              <p className="text-base">{presentation.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Presentación</p>
                <p className="font-medium">{selectedLevel.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Ubicación</p>
                <p className="font-medium">{presentation.location}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Precio Unitario</p>
                <p className="text-2xl font-bold text-primary">${selectedLevel.price.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock Disponible</p>
                <p className="font-medium">{stock} unidades</p>
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
                  max={stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="w-16 text-center"
                />
                <Button size="sm" variant="outline" onClick={() => setQuantity(Math.min(stock, quantity + 1))}>
                  +
                </Button>
              </div>
            </div>

            {/* Total Price */}
            <div className="bg-accent/10 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Total:</p>
              <p className="text-2xl font-bold text-accent">${(selectedLevel.price * quantity).toFixed(2)}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setSelectedLevel(null)}>
            Volver
          </Button>
          <Button onClick={handleAddToCart} disabled={quantity > stock}>
            Agregar al Carrito
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
