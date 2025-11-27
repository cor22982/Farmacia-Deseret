"use client"

import { useState, useMemo } from "react"
import { ProductDetailModal } from "@/components/product-detail-modal"
import { AdminLoginModal } from "@/components/admin-login-modal"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { mockProducts, type Product, type Presentation } from "@/lib/mock-data"
import { ShoppingCart, LogOut, Settings, Search, X } from "lucide-react"
import Link from "next/link"
import { PaymentModal } from "@/components/payment-modal"

interface CartItem {
  product: Product
  presentation: Presentation
  quantity: number
}

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPresentation, setSelectedPresentation] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null)

  const handleAddToCart = (product: Product, presentation: Presentation, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.presentation.id === presentation.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.presentation.id === presentation.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [...prev, { product, presentation, quantity }]
    })
  }

  const handleRemoveFromCart = (productId: string, presentationId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.presentation.id === presentationId)),
    )
  }

  const filteredProducts = useMemo(() => {
    return mockProducts.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesPresentation =
        !selectedPresentation || product.presentations.some((p) => p.type.includes(selectedPresentation))

      const matchesPrice =
        !priceRange || product.presentations.some((p) => p.price >= priceRange.min && p.price <= priceRange.max)

      return matchesSearch && matchesPresentation && matchesPrice
    })
  }, [searchTerm, selectedPresentation, priceRange])

  const cartTotal = cartItems.reduce((sum, item) => sum + item.presentation.price * item.quantity, 0)

  const presentations = Array.from(new Set(mockProducts.flatMap((p) => p.presentations.map((pr) => pr.type))))
  const maxPrice = Math.max(...mockProducts.flatMap((p) => p.presentations.map((pr) => pr.price)))

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">PC</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">PharmaCare</h1>
          </div>

          <div className="flex items-center gap-3">
            {isAdminLoggedIn ? (
              <>
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    <Settings className="w-4 h-4" />
                    Panel de Administración
                  </Button>
                </Link>
                <Button size="sm" variant="ghost" onClick={() => setIsAdminLoggedIn(false)} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </Button>
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
                    {cartItems.map((item) => (
                      <div
                        key={`${item.product.id}-${item.presentation.id}`}
                        className="flex justify-between items-start border-b pb-3"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-xs text-muted-foreground">{item.presentation.type}</p>
                          <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                          <p className="text-sm font-semibold text-primary">
                            ${(item.presentation.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item.product.id, item.presentation.id)}
                          className="text-xs text-destructive hover:bg-destructive/10 px-2 py-1 rounded"
                        >
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="bg-accent/10 p-4 rounded-lg mb-6">
                    <p className="text-sm text-muted-foreground mb-1">Total:</p>
                    <p className="text-3xl font-bold text-accent">${cartTotal.toFixed(2)}</p>
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

        {/* Search and Filters Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Productos de Farmacia</h2>
          <p className="text-muted-foreground mb-6">Explora nuestra selección de medicamentos y suplementos</p>

          <div className="space-y-4 mb-6">
            {/* Search Bar */}
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

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Presentation Filter */}
              <div className="flex gap-2">
                <select
                  value={selectedPresentation || ""}
                  onChange={(e) => setSelectedPresentation(e.target.value || null)}
                  className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Todas las Presentaciones</option>
                  {presentations.map((pres) => (
                    <option key={pres} value={pres}>
                      {pres}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
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

              {/* Clear Filters Button */}
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

          {/* Results Count */}
          <p className="text-sm text-muted-foreground mb-6">
            Mostrando {filteredProducts.length} de {mockProducts.length} productos
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
                  key={product.id}
                  product={product}
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
      </main>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
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
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        cartItems={cartItems}
        cartTotal={cartTotal}
      />
    </div>
  )
}
