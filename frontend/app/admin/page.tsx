"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { type Product, type Supplier, mockProducts, mockSuppliers, mockOrders } from "@/lib/mock-data"
import { InventoryFormModal } from "@/components/inventory-form-modal"
import { SupplierFormModal } from "@/components/supplier-form-modal"
import { exportProductsToExcel, exportSuppliersToExcel } from "@/components/export-excel"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Edit2, Download, Plus, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ConfirmDeleteModal } from "@/components/confirm-delete-modal"
import { SalesReport } from "@/components/sales-report"

export default function AdminDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers)
  const [activeTab, setActiveTab] = useState<"inventory" | "suppliers" | "sales">("inventory")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [showSupplierModal, setShowSupplierModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [showDeleteSupplierModal, setShowDeleteSupplierModal] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null)

  const filteredProducts = products.filter(
    (p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm),
  )

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setShowInventoryModal(true)
  }

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setShowInventoryModal(true)
  }

  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      selectedProduct
        ? prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
        : [...prev, { ...updatedProduct, id: `PROD-${Date.now()}` }],
    )
  }

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId)
    setShowDeleteProductModal(true)
  }

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete))
      setProductToDelete(null)
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
        ? prev.map((s) => (s.id === updatedSupplier.id ? updatedSupplier : s))
        : [...prev, { ...updatedSupplier, id: `SUP-${Date.now()}` }],
    )
  }

  const handleDeleteSupplier = (supplierId: string) => {
    setSupplierToDelete(supplierId)
    setShowDeleteSupplierModal(true)
  }

  const confirmDeleteSupplier = () => {
    if (supplierToDelete) {
      setSuppliers((prev) => prev.filter((s) => s.id !== supplierToDelete))
      setSupplierToDelete(null)
    }
  }

  const deletingProductName = products.find((p) => p.id === productToDelete)?.name || "Producto"
  const deletingSupplierName = suppliers.find((s) => s.id === supplierToDelete)?.name || "Proveedor"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
          <Button variant="outline">Cerrar Sesión</Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Tab Navigation */}
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

        {/* Inventory Management Tab */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center gap-4">
              <Input
                placeholder="Buscar productos por nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
              <div className="flex gap-2">
                <Button onClick={() => exportProductsToExcel(products)} variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Exportar Excel
                </Button>
                <Button onClick={handleAddProduct} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar Producto
                </Button>
              </div>
            </div>

            {/* Products Table */}
            <Card>
              <CardHeader>
                <CardTitle>Productos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-muted-foreground">
                        <th className="text-left py-2 px-2">Nombre</th>
                        <th className="text-left py-2 px-2">Presentaciones</th>
                        <th className="text-left py-2 px-2">Total Stock</th>
                        <th className="text-left py-2 px-2">Ubicación</th>
                        <th className="text-left py-2 px-2">Próximo Vencimiento</th>
                        <th className="text-left py-2 px-2">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => {
                        const totalStock = product.presentations.reduce((sum, p) => sum + p.quantity, 0)
                        const nextExpire = new Date(
                          Math.min(...product.presentations.map((p) => new Date(p.expireDate).getTime())),
                        )

                        return (
                          <tr key={product.id} className="border-b hover:bg-accent/5">
                            <td className="py-3 px-2 font-medium">{product.name}</td>
                            <td className="py-3 px-2 text-xs">{product.presentations.map((p) => p.type).join(", ")}</td>
                            <td className="py-3 px-2">
                              <span className={totalStock < 50 ? "text-destructive font-semibold" : ""}>
                                {totalStock}
                              </span>
                            </td>
                            <td className="py-3 px-2">{product.location}</td>
                            <td className="py-3 px-2">{nextExpire.toLocaleDateString()}</td>
                            <td className="py-3 px-2 flex gap-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-1 hover:bg-primary/10 rounded transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4 text-primary" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Suppliers Tab */}
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

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suppliers.map((supplier) => (
                <Card key={supplier.id}>
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
                        onClick={() => handleDeleteSupplier(supplier.id)}
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

        {/* Sales Report Tab */}
        {activeTab === "sales" && <SalesReport orders={mockOrders} />}
      </main>

      {/* Modals */}
      <ConfirmDeleteModal
        open={showDeleteProductModal}
        onOpenChange={setShowDeleteProductModal}
        title="Eliminar Producto"
        description="¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer."
        itemName={deletingProductName}
        onConfirm={confirmDeleteProduct}
      />

      <ConfirmDeleteModal
        open={showDeleteSupplierModal}
        onOpenChange={setShowDeleteSupplierModal}
        title="Eliminar Proveedor"
        description="¿Estás seguro de que deseas eliminar este proveedor? Esta acción no se puede deshacer."
        itemName={deletingSupplierName}
        onConfirm={confirmDeleteSupplier}
      />

      <InventoryFormModal
        product={selectedProduct}
        open={showInventoryModal}
        onOpenChange={setShowInventoryModal}
        onSave={handleSaveProduct}
      />

      <SupplierFormModal
        supplier={selectedSupplier}
        open={showSupplierModal}
        onOpenChange={setShowSupplierModal}
        onSave={handleSaveSupplier}
      />
    </div>
  )
}
