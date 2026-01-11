"use client"

import type { Product, StockBatch } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ProductCardProps {
  product: Product
  batches: StockBatch[]
  onViewDetails: (product: Product) => void
  onAddToCart: (product: Product) => void
}

export function ProductCard({ product, batches, onViewDetails, onAddToCart }: ProductCardProps) {
  const lowestPrice = Math.min(...product.presentations.map((p) => p.price))
  const presentationTypes = product.presentations.map((p) => p.presentation_name).join(", ")

  const totalStock = batches.filter((b) => b.product_id === product._id).reduce((sum, b) => sum + b.stock_units, 0)

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col h-full">
      <CardContent className="p-4 flex-1 flex flex-col">
        <div
          className="relative w-full h-48 mb-4 bg-muted rounded-lg overflow-hidden cursor-pointer"
          onClick={() => onViewDetails(product)}
        >
          <Image
            src={product.image_url || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <h3 className="font-semibold text-lg text-balance mb-2">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-1">{product.category}</p>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{product.descripcion}</p>
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Presentaciones</p>
            <p className="text-sm font-medium line-clamp-1">{presentationTypes}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Stock</p>
            <p className="text-sm font-medium">{totalStock} unidades</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-4 mt-auto">
          <span className="text-2xl font-bold text-primary">desde ${lowestPrice.toFixed(2)}</span>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails(product)
            }}
          >
            Ver Detalles
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails(product)
            }}
          >
            Agregar al Carrito
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
