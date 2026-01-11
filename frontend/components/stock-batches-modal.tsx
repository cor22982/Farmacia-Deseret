"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2 } from "lucide-react"
import type { Product, StockBatch } from "@/lib/types"
import { StockBatchFormModal } from "@/components/stock-batch-form-modal"
import { ConfirmDeleteModal } from "@/components/confirm-delete-modal"

interface StockBatchesModalProps {
  product: Product
  batches: StockBatch[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveBatch: (batch: StockBatch) => void
  onDeleteBatch: (batchId: string) => void
}

export function StockBatchesModal({
  product,
  batches,
  open,
  onOpenChange,
  onSaveBatch,
  onDeleteBatch,
}: StockBatchesModalProps) {
  const [selectedBatch, setSelectedBatch] = useState<StockBatch | null>(null)
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const productBatches = batches.filter((b) => b.product_id === product._id)

  const handleAddBatch = () => {
    setSelectedBatch(null)
    setShowBatchForm(true)
  }

  const handleEditBatch = (batch: StockBatch) => {
    setSelectedBatch(batch)
    setShowBatchForm(true)
  }

  const handleDeleteBatch = (batchId: string) => {
    setBatchToDelete(batchId)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (batchToDelete) {
      onDeleteBatch(batchToDelete)
      setBatchToDelete(null)
    }
  }

  const totalStock = productBatches.reduce((sum, b) => sum + b.stock_units, 0)
  const deletingBatchName = batches.find((b) => b._id === batchToDelete)?.lot_code || "Lote"

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Gestión de Lotes - {product.name}
              <div className="text-sm font-normal text-muted-foreground mt-1">
                Stock total: {totalStock} unidades en {productBatches.length} lote(s)
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Button onClick={handleAddBatch} className="gap-2">
              <Plus className="w-4 h-4" />
              Agregar Lote
            </Button>

            {productBatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-muted-foreground">
                      <th className="text-left py-2 px-2">Código Lote</th>
                      <th className="text-left py-2 px-2">Stock</th>
                      <th className="text-left py-2 px-2">Costo/Unidad</th>
                      <th className="text-left py-2 px-2">Ubicación</th>
                      <th className="text-left py-2 px-2">Fecha Compra</th>
                      <th className="text-left py-2 px-2">Vencimiento</th>
                      <th className="text-left py-2 px-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productBatches.map((batch) => {
                      const daysToExpire = Math.floor(
                        (new Date(batch.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                      )
                      const isExpiringSoon = daysToExpire < 30

                      return (
                        <tr key={batch._id} className="border-b hover:bg-accent/5">
                          <td className="py-3 px-2 font-mono text-xs">{batch.lot_code}</td>
                          <td className="py-3 px-2">
                            <span className={batch.stock_units < 100 ? "text-orange-600 font-semibold" : ""}>
                              {batch.stock_units}
                            </span>
                          </td>
                          <td className="py-3 px-2">${batch.cost_per_unit.toFixed(2)}</td>
                          <td className="py-3 px-2 capitalize">
                            <span className="px-2 py-1 rounded text-xs bg-accent">{batch.location}</span>
                          </td>
                          <td className="py-3 px-2 text-xs">{new Date(batch.purchase_date).toLocaleDateString()}</td>
                          <td className="py-3 px-2 text-xs">
                            <span className={isExpiringSoon ? "text-destructive font-semibold" : ""}>
                              {new Date(batch.expiration_date).toLocaleDateString()}
                              {isExpiringSoon && ` (${daysToExpire}d)`}
                            </span>
                          </td>
                          <td className="py-3 px-2 flex gap-2">
                            <button
                              onClick={() => handleEditBatch(batch)}
                              className="p-1 hover:bg-primary/10 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4 text-primary" />
                            </button>
                            <button
                              onClick={() => handleDeleteBatch(batch._id)}
                              className="p-1 hover:bg-destructive/10 rounded transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                No hay lotes de stock para este producto. Haga clic en "Agregar Lote" para comenzar.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <StockBatchFormModal
        batch={selectedBatch}
        products={[product]}
        open={showBatchForm}
        onOpenChange={setShowBatchForm}
        onSave={(batch) => {
          onSaveBatch({ ...batch, product_id: product._id })
          setShowBatchForm(false)
        }}
      />

      <ConfirmDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={confirmDelete}
        itemName={deletingBatchName}
        itemType="lote"
      />
    </>
  )
}
