"use client"

import { useState, useMemo, useEffect } from "react"
import { ProductDetailModal } from "@/components/product-detail-modal"
import { AdminLoginModal } from "@/components/admin-login-modal"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { mockProducts, mockStockBatches } from "@/lib/mock-data"
import type { Product, ProductPresentation, CartItem } from "@/lib/types"
import { ShoppingCart, LogOut, Settings, Search, X, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { PaymentModal } from "@/components/payment-modal"
import { useFetch } from "@/hooks/use-Products"


export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null)
  
  const {
    data: products,
    loading,
    error,
    refetch,
  } = useFetch<Product[]>({
    url: "/products",
  });

  const safeProducts = products ?? []


  const handleAddToCart = (product: Product, presentation: ProductPresentation, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product_id === product._id && item.presentation_name === presentation.presentation_name,
      )
      if (existing) {
        return prev.map((item) =>
          item.product_id === product._id && item.presentation_name === presentation.presentation_name
            ? { ...item, qty: item.qty + quantity }
            : item,
        )
      }
      return [
        ...prev,
        {
          product_id: product._id,
          presentation_name: presentation.presentation_name,
          qty: quantity,
          price_unit: presentation.price,
        },
      ]
    })
  }

  const handleRemoveFromCart = (productId: string, presentationName: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product_id === productId && item.presentation_name === presentationName)),
    )
  }

  const filteredProducts = useMemo(() => {
    return safeProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPresentation =
        !selectedPresentation || product.presentations.some((p) => p.presentation_name.includes(selectedPresentation))

      const matchesPrice =
        !priceRange || product.presentations.some((p) => p.price >= priceRange.min && p.price <= priceRange.max)

      return matchesSearch && matchesPresentation && matchesPrice
    })
  }, [safeProducts, searchTerm, selectedPresentation, priceRange])

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price_unit * item.qty, 0)

  const presentations = Array.from(
    new Set(safeProducts.flatMap((p) => p.presentations.map((pr) => pr.presentation_name))),
  )
  const maxPrice = safeProducts.length > 0 ? Math.max(...safeProducts.flatMap((p) => p.presentations.map((pr) => pr.price))) : 0

  // Efecto para actualizar el producto seleccionado cuando cambian los productos
  useEffect(() => {
    if (selectedProduct && safeProducts.length > 0) {
      const updatedProduct = safeProducts.find(p => p._id === selectedProduct._id)
      if (updatedProduct) {
        setSelectedProduct(updatedProduct)
      }
    }
  }, [safeProducts])

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">FD</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">Farmacia Deseret</h1>
          </div>

          <div className="flex items-center gap-3">
            {isAdminLoggedIn ? (
              <>
                <Link href="/admin">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2 bg-transparent"
                    onClick={() => setLoadingAdmin(true)}
                    disabled={loadingAdmin}>
                     {loadingAdmin ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Settings className="w-4 h-4" />
                    )}
                    {loadingAdmin ? "Cargando..." : "Panel de Administración"}
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="sm" variant="ghost" className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </Button>
                </Link>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setShowAdminLogin(true)}>
                Iniciar Sesión Admin
              </Button>
            )}

            <button
              onClick={() => setShowCart(!showCart)}
              className="relative p-2 hover:bg-accent/10 rounded-lg transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Cart Sidebar */}
        {showCart && (
          <div className="fixed right-0 top-16 w-96 h-[calc(100vh-64px)] bg-card border-l border-border shadow-xl overflow-y-auto z-30">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">Carrito de Compras</h2>

              {cartItems.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Tu carrito está vacío</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cartItems.map((item) => {
                      const product = safeProducts.find((p) => p._id === item.product_id)
                      return (
                        <div
                          key={`${item.product_id}-${item.presentation_name}`}
                          className="flex justify-between items-start border-b pb-3"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{product?.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">{item.presentation_name}</p>
                            <p className="text-sm text-muted-foreground">Cantidad: {item.qty}</p>
                            <p className="text-sm font-semibold text-primary">
                              Q{(item.price_unit * item.qty).toFixed(2)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveFromCart(item.product_id, item.presentation_name)}
                            className="text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded"
                          >
                            Eliminar
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  <div className="bg-accent/10 p-4 rounded-lg mb-6">
                    <p className="text-sm text-muted-foreground mb-1">Total:</p>
                    <p className="text-3xl font-bold text-accent">Q{cartTotal.toFixed(2)}</p>
                  </div>

                  <Button className="w-full mb-2" onClick={() => setShowPaymentModal(true)}>
                    Pagar
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" onClick={() => setShowCart(false)}>
                    Seguir Comprando
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
            <p className="text-lg text-muted-foreground">Cargando productos...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <h3 className="text-lg font-semibold text-destructive">Error al cargar productos</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                No se pudieron cargar los productos. Por favor, intenta nuevamente.
              </p>
              <Button onClick={refetch} className="w-full">
                Reintentar
              </Button>
            </div>
          </div>
        )}

        {/* Products Section - Only show when not loading and no error */}
        {!loading && !error && (
          <>
            {/* Search and Filters Section */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2">Productos de Farmacia</h2>
              <p className="text-muted-foreground mb-6">Explora nuestra selección de medicamentos y suplementos</p>

              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar productos por nombre o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="flex gap-2">
                    <select
                      value={selectedPresentation || ""}
                      onChange={(e) => setSelectedPresentation(e.target.value || null)}
                      className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary capitalize"
                    >
                      <option value="">Todas las Presentaciones</option>
                      {presentations.map((pres) => (
                        <option key={pres} value={pres} className="capitalize">
                          {pres}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      placeholder="Precio mínimo"
                      value={priceRange?.min || ""}
                      onChange={(e) => {
                        const value = e.target.value ? Number.parseFloat(e.target.value) : undefined
                        setPriceRange(
                          value !== undefined ? ({ ...priceRange, min: value } as { min: number; max: number }) : null,
                        )
                      }}
                      className="w-24 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      type="number"
                      placeholder="Precio máximo"
                      value={priceRange?.max || ""}
                      onChange={(e) => {
                        const value = e.target.value ? Number.parseFloat(e.target.value) : undefined
                        setPriceRange(
                          value !== undefined ? ({ ...priceRange, max: value } as { min: number; max: number }) : maxPrice,
                        )
                      }}
                      className="w-24 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {(searchTerm || selectedPresentation || priceRange) && (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSearchTerm("")
                        setSelectedPresentation(null)
                        setPriceRange(null)
                      }}
                    >
                      Limpiar Filtros
                    </Button>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                Mostrando {filteredProducts.length} de {safeProducts.length} productos
              </p>
            </div>

            {/* Products Grid */}
            <div>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    No se encontraron productos que coincidan con tu búsqueda.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4 bg-transparent"
                    onClick={() => {
                      setSearchTerm("")
                      setSelectedPresentation(null)
                      setPriceRange(null)
                    }}
                  >
                    Limpiar Filtros
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      batches={mockStockBatches}
                      onViewDetails={(product) => {
                        setSelectedProduct(product)
                        setShowProductModal(true)
                      }}
                      onAddToCart={() => {
                        setSelectedProduct(product)
                        setShowProductModal(true)
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        batches={mockStockBatches}
        open={showProductModal}
        onOpenChange={setShowProductModal}
        onAddToCart={handleAddToCart}
      />

      <AdminLoginModal
        open={showAdminLogin}
        onOpenChange={setShowAdminLogin}
        onLoginSuccess={() => {
          setIsAdminLoggedIn(true)
          setShowAdminLogin(false)
        }}
      />

      <PaymentModal
        refetch={refetch}
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        cartItems={cartItems}
        cartTotal={cartTotal}
        setCartItems={setCartItems}
        products={safeProducts}
      />
    </div>
  )
}