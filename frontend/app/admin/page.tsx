"use client"

import { useState, useEffect } from "react"
import { mockSuppliers, mockSales } from "@/lib/mock-data"
import type { Product, StockBatch, Supplier } from "@/lib/types"
import { StockBatchFormModal } from "@/components/stock-batch-form-modal"
import { SupplierFormModal } from "@/components/supplier-form-modal"
import { InventoryFormModal } from "@/components/inventory-form-modal"
import { exportProductsToExcel, exportSuppliersToExcel } from "@/components/export-excel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit2, Download, Plus, Trash2, ArrowLeft, Package, Archive, Loader2 } from "lucide-react"
import Link from "next/link"
import { ConfirmDeleteModal } from "@/components/confirm-delete-modal"
import { SalesReport } from "@/components/sales-report"
import { StockBatchesModal } from "@/components/stock-batches-modal"
import { useFetch } from "@/hooks/use-Products"
import { usePost } from "@/hooks/use-Products"
import { exportInventarioToExcel } from "@/lib/utils"

export default function AdminDashboard() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers)
  const [activeTab, setActiveTab] = useState<"inventory" | "suppliers" | "sales">("inventory")
  const [inventoryMode, setInventoryMode] = useState<"products" | "batches">("products")
  const [selectedBatch, setSelectedBatch] = useState<StockBatch | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteBatchModal, setShowDeleteBatchModal] = useState(false)
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null)
  const [showDeleteSupplierModal, setShowDeleteSupplierModal] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null)
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [showStockBatchesModal, setShowStockBatchesModal] = useState(false)
  const [selectedProductForBatches, setSelectedProductForBatches] = useState<Product | null>(null)
  const [loadingExcelInvt, setLoadingExcelInvt] = useState(false);


  const [products, setProducts] = useState<Product[]>([])
  const [batches, setBatches] = useState<StockBatch[]>([])

  const {
    data: productos,
    loading: loadingProducts,
    error: errorProducts,
    refetch: refetchProducts,
  } = useFetch<Product[]>({
    url: "/products",
  })

  const {
    data: inventarios,
    loading: loadingInventario,
    error: errorInventario,
    refetch: refetchInventario,
  } = useFetch<StockBatch[]>({
    url: "/stock-batches",
  })

  const { post, data } = usePost({
      url: "/reports/inventario",
    });


  

  useEffect(() => {
    if (productos) {
      setProducts(productos)
    }
  }, [productos])

  useEffect(() => {
    if (inventarios) {
      setBatches(inventarios)
    }
  }, [inventarios])

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p._id.includes(searchTerm),
  )

  const filteredBatches = batches.filter((b) => {
    const product = products.find((p) => p._id === b.product_id)
    return (
      product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.lot_code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowProductModal(true)
  }

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setShowProductModal(true)
  }

  const handleSaveProduct = async(updatedProduct: Product) => {
    console.log("updatedProduct", updatedProduct)
    // Aquí deberías llamar a la API para guardar/actualizar
    await refetchProducts()
  }

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId)
    setShowDeleteProductModal(true)
  }

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      // Aquí deberías llamar a la API para eliminar
      refetchProducts()
      setProductToDelete(null)
    }
  }

  const handleEditBatch = (batch: StockBatch) => {
    setSelectedBatch(batch)
    setShowBatchModal(true)
  }

  const handleAddBatch = () => {
    setSelectedBatch(null)
    setShowBatchModal(true)
  }

  const handleSaveBatch = (updatedBatch: StockBatch) => {
    // Aquí deberías llamar a la API para guardar/actualizar
    refetchInventario()
  }

  const handleDeleteBatch = (batchId: string) => {
    setBatchToDelete(batchId)
    setShowDeleteBatchModal(true)
  }

  const confirmDeleteBatch = () => {
    if (batchToDelete) {
      // Aquí deberías llamar a la API para eliminar
      refetchInventario()
      setBatchToDelete(null)
    }
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setShowSupplierModal(true)
  }

  const handleAddSupplier = () => {
    setSelectedSupplier(null)
    setShowSupplierModal(true)
  }

  const handleSaveSupplier = (updatedSupplier: Supplier) => {
    setSuppliers((prev) =>
      selectedSupplier
        ? prev.map((s) => (s._id === updatedSupplier._id ? updatedSupplier : s))
        : [...prev, updatedSupplier],
    )
  }

  const handleDeleteSupplier = (supplierId: string) => {
    setSupplierToDelete(supplierId)
    setShowDeleteSupplierModal(true)
  }

  const confirmDeleteSupplier = () => {
    if (supplierToDelete) {
      setSuppliers((prev) => prev.filter((s) => s._id !== supplierToDelete))
      setSupplierToDelete(null)
    }
  }

  const handleManageStock = (product: Product) => {
    setSelectedProductForBatches(product)
    setShowStockBatchesModal(true)
  }

  const generateFileReport = async() => {
    setLoadingExcelInvt(true)
    try{
      const respuesta  = await post({});
      exportInventarioToExcel(respuesta)
      console.log(respuesta)
    }catch (err) {
      // Handle the error
      console.error('Error occurred:', err.message);
  
    } finally {
      // This runs regardless of success or failure
      setLoadingExcelInvt(false);
    }
    


  }

  const deletingBatchName = batches.find((b) => b._id === batchToDelete)?.lot_code || "Lote"
  const deletingSupplierName = suppliers.find((s) => s._id === supplierToDelete)?.name || "Proveedor"
  const deletingProductName = products.find((p) => p._id === productToDelete)?.name || "Producto"

  const isLoading = loadingProducts || loadingInventario
  const hasError = errorProducts || errorInventario

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
          </div>
          <Link href="/">
              <Button variant="outline">Cerrar Sesión</Button>
            </Link>
          
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="flex gap-2 mb-8 flex-wrap">
          <Button variant={activeTab === "inventory" ? "default" : "outline"} onClick={() => setActiveTab("inventory")}>
            Gestión de Inventario
          </Button>
          <Button variant={activeTab === "suppliers" ? "default" : "outline"} onClick={() => setActiveTab("suppliers")}>
            Proveedores
          </Button>
          <Button variant={activeTab === "sales" ? "default" : "outline"} onClick={() => setActiveTab("sales")}>
            Reporte de Ventas
          </Button>
        </div>

        {hasError && (
          <Card className="mb-6 border-destructive">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <div>
                  <p className="font-semibold">Error al cargar datos</p>
                  <p className="text-sm">{errorProducts?.message || errorInventario?.message}</p>
                </div>
                <Button 
                  onClick={() => {
                    refetchProducts()
                    refetchInventario()
                  }} 
                  variant="outline"
                  size="sm"
                >
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="flex gap-2">
              <Button
                variant={inventoryMode === "products" ? "default" : "outline"}
                onClick={() => setInventoryMode("products")}
                className="gap-2"
              >
                <Package className="w-4 h-4" />
                Productos y Presentaciones
              </Button>
              <Button
                variant={inventoryMode === "batches" ? "default" : "outline"}
                onClick={() => setInventoryMode("batches")}
                className="gap-2"
              >
                <Archive className="w-4 h-4" />
                Lotes de Stock
              </Button>
            </div>

            {inventoryMode === "products" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center gap-4">
                  <Input
                    placeholder="Buscar productos por nombre o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                  <div className="flex gap-2">
                    <Button
                      className="cursor-pointer" 
                      //onClick={() => exportProductsToExcel(products)} variant="outline" className="gap-2"
                      
                      onClick={generateFileReport}>
                        {loadingExcelInvt ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                           <Download className="w-4 h-4" />
                                          )}
                      Exportar Excel Inventario
                    </Button>
                    <Button onClick={handleAddProduct} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Agregar Producto
                    </Button>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Catálogo de Productos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingProducts ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b">
                            <tr className="text-muted-foreground">
                              <th className="text-left py-2 px-2">Nombre</th>
                              <th className="text-left py-2 px-2">Categoría</th>
                              <th className="text-left py-2 px-2">Principio Activo</th>
                              <th className="text-left py-2 px-2">Proveedor</th>
                              <th className="text-left py-2 px-2">Presentaciones</th>
                              <th className="text-left py-2 px-2">Stock Total</th>
                              <th className="text-left py-2 px-2">Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map((product) => {
                              const totalStock = batches
                                .filter((b) => b.product_id === product._id)
                                .reduce((sum, b) => sum + b.stock_units, 0)

                              return (
                                <tr key={product._id} className="border-b hover:bg-accent/5">
                                  <td className="py-3 px-2 font-medium">{product.name}</td>
                                  <td className="py-3 px-2 capitalize text-xs">{product.category}</td>
                                  <td className="py-3 px-2 text-xs">{product.principio_activo}</td>
                                  <td className="py-3 px-2 text-xs">{product.supplier}</td>
                                  <td className="py-3 px-2">
                                    <span className="text-xs px-2 py-1 bg-primary/10 rounded">
                                      {product.presentations.length} presentacion
                                      {product.presentations.length !== 1 ? "es" : ""}
                                    </span>
                                  </td>
                                  <td className="py-3 px-2">
                                    <button
                                      onClick={() => handleManageStock(product)}
                                      className="hover:underline"
                                      title="Gestionar Stock"
                                    >
                                      <span className={totalStock < 50 ? "text-destructive font-semibold" : ""}>
                                        {totalStock} unidades
                                      </span>
                                    </button>
                                  </td>
                                  <td className="py-3 px-2 flex gap-2">
                                    <button
                                      onClick={() => handleEditProduct(product)}
                                      className="p-1 hover:bg-primary/10 rounded transition-colors"
                                      title="Editar Producto"
                                    >
                                      <Edit2 className="w-4 h-4 text-primary" />
                                    </button>
                                    <button
                                      onClick={() => handleManageStock(product)}
                                      className="p-1 hover:bg-blue-500/10 rounded transition-colors"
                                      title="Gestionar Stock"
                                    >
                                      <Archive className="w-4 h-4 text-blue-600" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(product._id)}
                                      className="p-1 hover:bg-destructive/10 rounded transition-colors"
                                      title="Eliminar Producto"
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
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {inventoryMode === "batches" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center gap-4">
                  <Input
                    placeholder="Buscar por producto o código de lote..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-md"
                  />
                  <Button onClick={handleAddBatch} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Agregar Lote
                  </Button>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Lotes de Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingInventario ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b">
                            <tr className="text-muted-foreground">
                              <th className="text-left py-2 px-2">Producto</th>
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
                            {filteredBatches.map((batch) => {
                              const product = products.find((p) => p._id === batch.product_id)
                              const daysToExpire = Math.floor(
                                (new Date(batch.expiration_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                              )
                              const isExpiringSoon = daysToExpire < 30

                              return (
                                <tr key={batch._id} className="border-b hover:bg-accent/5">
                                  <td className="py-3 px-2 font-medium">{product?.name || batch.product_id}</td>
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
                                  <td className="py-3 px-2 text-xs">
                                    {new Date(batch.purchase_date).toLocaleDateString()}
                                  </td>
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
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {activeTab === "suppliers" && (
          <div className="space-y-6">
            <div className="flex justify-end gap-2">
              <Button onClick={() => exportSuppliersToExcel(suppliers)} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Exportar Excel
              </Button>
              <Button onClick={handleAddSupplier} className="gap-2">
                <Plus className="w-4 h-4" />
                Agregar Proveedor
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map((supplier) => (
                <Card key={supplier._id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Correo Electrónico</p>
                      <p className="text-sm">{supplier.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Teléfono</p>
                      <p className="text-sm">{supplier.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dirección</p>
                      <p className="text-sm">{supplier.address}</p>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <button
                        onClick={() => handleEditSupplier(supplier)}
                        className="flex-1 flex items-center justify-center gap-2 p-2 hover:bg-primary/10 rounded transition-colors text-primary"
                      >
                        <Edit2 className="w-4 h-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteSupplier(supplier._id)}
                        className="flex-1 flex items-center justify-center gap-2 p-2 hover:bg-destructive/10 rounded transition-colors text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "sales" && <SalesReport sales={mockSales} />}
      </main>

      <InventoryFormModal
        product={selectedProduct}
        open={showProductModal}
        onOpenChange={setShowProductModal}
        onSave={handleSaveProduct}
      />

      <StockBatchFormModal
        batch={selectedBatch}
        products={products}
        open={showBatchModal}
        onOpenChange={setShowBatchModal}
        onSave={handleSaveBatch}
      />

      <SupplierFormModal
        supplier={selectedSupplier}
        open={showSupplierModal}
        onOpenChange={setShowSupplierModal}
        onSave={handleSaveSupplier}
      />

      <ConfirmDeleteModal
        open={showDeleteProductModal}
        onOpenChange={setShowDeleteProductModal}
        onConfirm={confirmDeleteProduct}
        itemName={deletingProductName}
        itemType="producto"
      />

      <ConfirmDeleteModal
        open={showDeleteBatchModal}
        onOpenChange={setShowDeleteBatchModal}
        onConfirm={confirmDeleteBatch}
        itemName={deletingBatchName}
        itemType="lote"
      />

      <ConfirmDeleteModal
        open={showDeleteSupplierModal}
        onOpenChange={setShowDeleteSupplierModal}
        onConfirm={confirmDeleteSupplier}
        itemName={deletingSupplierName}
        itemType="proveedor"
      />

      {selectedProductForBatches && (
        <StockBatchesModal
          product={selectedProductForBatches}
          batches={batches}
          open={showStockBatchesModal}
          onOpenChange={setShowStockBatchesModal}
          onSaveBatch={handleSaveBatch}
          onDeleteBatch={(batchId) => {
            refetchInventario()
          }}
        />
      )}
    </div>
  )
}