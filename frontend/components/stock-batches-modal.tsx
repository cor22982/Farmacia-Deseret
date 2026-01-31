"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Edit2, Trash2, Package, Loader2 } from "lucide-react"
import type { Product, StockBatch } from "@/lib/types"
import { StockBatchFormModal } from "@/components/stock-batch-form-modal"
import { ConfirmDeleteModal } from "@/components/confirm-delete-modal"
import { useFetch, useDelete } from "@/hooks/use-Products"

interface StockBatchesModalProps {
  product: Product
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveBatch: (batch: StockBatch) => void
  onDeleteBatch: (batchId: string) => void
}

export function StockBatchesModal({
  product,
  open,
  onOpenChange,
  onSaveBatch,
  onDeleteBatch,
}: StockBatchesModalProps) {
  const [selectedBatch, setSelectedBatch] = useState<StockBatch | null>(null)
  const [showBatchForm, setShowBatchForm] = useState(false)
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Fetch batches using the hook
  const { 
    data: batches, 
    loading, 
    error,
    refetch 
  } = useFetch<StockBatch[]>({
    url: `stock-batches/productid/${product._id}`,
    enabled: open, // Solo fetch cuando el modal está abierto
  })
  const { remove } = useDelete();

  const productBatches = batches || []

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

  const confirmDelete = async () => {
    if (batchToDelete) {
      await onDeleteBatch(batchToDelete)
      await remove(`/stock-batches/${batchToDelete}`);
      console.log(batchToDelete)
      setBatchToDelete(null)
      refetch() // Refrescar la lista después de eliminar
    }
  }

  const handleSaveBatch = async (batch: StockBatch) => {
    await onSaveBatch({ ...batch, product_id: product._id })
    setShowBatchForm(false)
    refetch() // Refrescar la lista después de guardar
    refetch()
  }

  const totalStock = productBatches.reduce((sum, b) => sum + b.stock_units, 0)
  const deletingBatchName = productBatches.find((b) => b._id === batchToDelete)?.lot_code || "Lote"

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
            <Button onClick={handleAddBatch} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Lote
            </Button>

            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
                <p className="text-muted-foreground mt-2">Cargando lotes...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 border rounded-lg bg-destructive/10">
                <p className="text-destructive">Error: {error}</p>
                <Button onClick={refetch} variant="outline" className="mt-4">
                  Reintentar
                </Button>
              </div>
            ) : productBatches.length > 0 ? (
              <div className="grid gap-3">
                {productBatches.map((batch) => {
                  const daysToExpire = Math.floor(
                    (new Date(batch.expiration_date).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  );
                  const isExpiringSoon = daysToExpire < 30;

                  return (
                    <div
                      key={batch._id}
                      className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Información principal */}
                        <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {/* Código de lote */}
                          <div>
                            <div className="text-xs text-muted-foreground uppercase font-medium mb-1">
                              Código Lote
                            </div>
                            <div className="text-sm font-semibold">
                              {batch.lot_code}
                            </div>
                          </div>

                          {/* Stock */}
                          <div>
                            <div className="text-xs text-muted-foreground uppercase font-medium mb-1">
                              Stock
                            </div>
                            <div className="text-sm font-semibold">
                              {batch.stock_units} unidades
                            </div>
                          </div>

                          {/* Costo */}
                          <div>
                            <div className="text-xs text-muted-foreground uppercase font-medium mb-1">
                              Costo/Unidad
                            </div>
                            <div className="text-sm font-semibold">
                              Q{batch.cost_per_unit.toFixed(2)}
                            </div>
                          </div>

                          {/* Ubicación */}
                          <div>
                            <div className="text-xs text-muted-foreground uppercase font-medium mb-1">
                              Ubicación
                            </div>
                            <div className="text-sm truncate" title={batch.location}>
                              {batch.location}
                            </div>
                          </div>

                          {/* Fecha de compra */}
                          <div>
                            <div className="text-xs text-muted-foreground uppercase font-medium mb-1">
                              Fecha Compra
                            </div>
                            <div className="text-sm">
                              {new Date(batch.purchase_date).toLocaleDateString('es-GT')}
                            </div>
                          </div>

                          {/* Vencimiento */}
                          <div>
                            <div className="text-xs text-muted-foreground uppercase font-medium mb-1">
                              Vencimiento
                            </div>
                            <div className={`text-sm font-medium ${isExpiringSoon ? 'text-destructive' : ''}`}>
                              {new Date(batch.expiration_date).toLocaleDateString('es-GT')}
                              {isExpiringSoon && (
                                <span className="block text-xs">
                                  ⚠️ {daysToExpire} días
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleEditBatch(batch)}
                            className="p-2 hover:bg-primary/10 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBatch(batch._id)}
                            className="p-2 hover:bg-destructive/10 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-muted/30">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  No hay lotes de stock para este producto. Haga clic en "Agregar Lote" para comenzar.
                </p>
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
        onSave={handleSaveBatch}
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