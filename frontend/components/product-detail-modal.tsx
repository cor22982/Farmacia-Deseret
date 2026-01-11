"use client"

import { useState } from "react"
import type { Product, ProductPresentation, StockBatch } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useFetch } from "@/hooks/use-Products"

interface ProductDetailModalProps {
  product: Product | null
  batches: StockBatch[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddToCart: (product: Product, presentation: ProductPresentation, quantity: number) => void
}

export function ProductDetailModal({
  product,
  batches,
  open,
  onOpenChange,
  onAddToCart,
}: ProductDetailModalProps) {
  const {
    data: productBatches,
    loading,
    error,
    refetch,
    reset, // Agregar reset si tu hook lo tiene, o setData
  } = useFetch<StockBatch[]>({
    url: product?._id ? `/stock-batches/productid/${product._id}` : null,
  });
  
  const [selectedPresentation, setSelectedPresentation] = useState(null)
  const [quantity, setQuantity] = useState(1)

  // Limpiar estado cuando se cierra el modal
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedPresentation(null)
      setQuantity(1)
      // Resetear productBatches si tu hook tiene reset
      if (reset) reset()
    }
    onOpenChange(isOpen)
  }

  if (!product) return null
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Asegurar que siempre sea un array
  const safeproductBatches = Array.isArray(productBatches) ? productBatches : []

  const totalStock = safeproductBatches.reduce((sum, b) => sum + b.stock_units, 0)
  
  const earliestExpiration =
    safeproductBatches.length > 0
      ? new Date(Math.min(...safeproductBatches.map((b) => new Date(b.expiration_date).getTime())))
      : null
  
  console.log("Safeproducts", safeproductBatches)
  
  /* =========================
     VISTA 1: SELECCIÓN
     ========================= */
  if (!selectedPresentation && product.presentations.length > 0) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
          <DialogHeader>
            <DialogTitle className="text-xl">{product.name}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            {/* Imagen */}
            <div className="relative w-full h-64 bg-muted rounded-xl overflow-hidden shadow-sm">
              <Image
                src={apiUrl + product.image_url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>

            {/* Info del producto */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Categoría</p>
                <p className="font-medium capitalize">{product.category}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Proveedor</p>
                <p className="font-medium">{product.supplier}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Stock total</p>
                <p className="font-medium">{totalStock} unidades</p>
              </div>

              {earliestExpiration && (
                <div>
                  <p className="text-xs text-muted-foreground">Próximo vencimiento</p>
                  <p className="font-medium">{earliestExpiration.toLocaleDateString()}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Principio activo</p>
              <p className="font-medium">{product.principio_activo}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">Descripción</p>
              <p className="text-sm leading-relaxed">{product.descripcion}</p>
            </div>

            {/* Presentaciones */}
            <div>
              <p className="text-sm font-semibold mb-3">Seleccionar presentación</p>
              <div className="space-y-2">
                {product.presentations.map((pres) => (
                  <button
                    key={pres.sku}
                    onClick={() => setSelectedPresentation(pres)}
                    className="w-full p-3 border-2 border-border rounded-lg
                               hover:border-primary hover:bg-primary/5
                               transition-all text-left flex justify-between items-center gap-3"
                  >
                    <div className="flex-1">
                      <p className="font-medium capitalize text-sm">{pres.presentation_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {pres.units} unidad{pres.units > 1 ? "es" : ""} · SKU: {pres.sku}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">Q{pres.price.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        {(pres.profit_percent * 100).toFixed(0)}% margen
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  /* =========================
     VISTA 2: CANTIDAD
     ========================= */
  if (selectedPresentation) {
    const maxQuantityForPresentation = Math.floor(totalStock / selectedPresentation.units)

    const handleConfirm = () => {
      onAddToCart(product, selectedPresentation, quantity)
      setQuantity(1)
      setSelectedPresentation(null)
      onOpenChange(false)
    }

    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
          <DialogHeader>
            <DialogTitle className="text-xl">{product.name}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            {/* Imagen */}
            <div className="relative w-full h-64 bg-muted rounded-xl overflow-hidden shadow-sm">
              <Image
                src={apiUrl + product.image_url || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>

            {/* Detalles de la presentación */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Presentación</p>
                <p className="font-medium capitalize">{selectedPresentation.presentation_name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Unidades</p>
                <p className="font-medium">{selectedPresentation.units}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">SKU</p>
                <p className="font-medium">{selectedPresentation.sku}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Precio</p>
                <p className="text-2xl font-bold text-primary">
                  Q{selectedPresentation.price.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Stock disponible</p>
                <p className="font-medium">{maxQuantityForPresentation}</p>
              </div>
              {earliestExpiration && (
                <div>
                  <p className="text-xs text-muted-foreground">Vence</p>
                  <p className="font-medium">{earliestExpiration.toLocaleDateString()}</p>
                </div>
              )}
            </div>

            {/* Cantidad */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Cantidad</span>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  −
                </Button>
                <Input
                  type="number"
                  min={1}
                  max={maxQuantityForPresentation}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(
                        maxQuantityForPresentation,
                        Math.max(1, Number.parseInt(e.target.value) || 1),
                      ),
                    )
                  }
                  className="w-20 text-center"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setQuantity(Math.min(maxQuantityForPresentation, quantity + 1))
                  }
                >
                  +
                </Button>
              </div>
            </div>

            {/* Total */}
            <div className="bg-accent/10 p-4 rounded-xl">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-accent">
                Q{(selectedPresentation.price * quantity).toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground">
                {quantity * selectedPresentation.units} unidades totales
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPresentation(null)}>
              Volver
            </Button>
            <Button onClick={handleConfirm} disabled={quantity > maxQuantityForPresentation}>
              Agregar al carrito
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return null
}