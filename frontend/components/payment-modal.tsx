"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { CartItem, Product } from "@/lib/types"

interface PaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cartItems: CartItem[]
  cartTotal: number
  products: Product[]
}

export function PaymentModal({ open, onOpenChange, cartItems, cartTotal, products }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta" | "transferencia">("efectivo")
  const [amountReceived, setAmountReceived] = useState<number>(cartTotal)
  const [customerName, setCustomerName] = useState("")

  const change = Math.max(0, amountReceived - cartTotal)

  const handleCheckout = () => {
    console.log("Processing order:", {
      customer: customerName,
      items: cartItems.map((item) => {
        const product = products.find((p) => p._id === item.product_id)
        return {
          product_id: item.product_id,
          presentation_name: item.presentation_name,
          qty: item.qty,
          price_unit: item.price_unit,
          productName: product?.name,
        }
      }),
      total: cartTotal,
      payment_method: paymentMethod,
      paid_amount: paymentMethod === "efectivo" ? amountReceived : cartTotal,
      change: paymentMethod === "efectivo" ? change : 0,
    })

    alert(`Pedido confirmado! ${paymentMethod === "efectivo" ? `Cambio: $${change.toFixed(2)}` : "Pago procesado"}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pagar</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg">Resumen de Compra</h3>
            <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
              {cartItems.map((item) => {
                const product = products.find((p) => p._id === item.product_id)
                return (
                  <div
                    key={`${item.product_id}-${item.presentation_name}`}
                    className="space-y-1 pb-2 border-b last:border-b-0"
                  >
                    <div className="flex justify-between items-start text-sm">
                      <div>
                        <p className="font-medium">{product?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.presentation_name}</p>
                      </div>
                      <span className="font-medium">${(item.price_unit * item.qty).toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Cantidad: {item.qty}</p>
                  </div>
                )
              })}
            </div>
            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-2xl font-bold text-accent">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-2">
            <Label htmlFor="customer-name">Nombre del Cliente (Opcional)</Label>
            <Input
              id="customer-name"
              placeholder="Ingresa el nombre del cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <h3 className="font-semibold">Método de Pago</h3>
            <div className="grid grid-cols-3 gap-3">
              {(["efectivo", "tarjeta", "transferencia"] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => {
                    setPaymentMethod(method)
                    if (method !== "efectivo") setAmountReceived(cartTotal)
                  }}
                  className={`p-3 rounded-lg border-2 transition-all capitalize font-medium ${
                    paymentMethod === method
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  {method === "tarjeta"
                    ? "💳 Tarjeta"
                    : method === "transferencia"
                      ? "🏦 Transferencia"
                      : "💵 Efectivo"}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Received (for cash only) */}
          {paymentMethod === "efectivo" && (
            <div className="space-y-3">
              <Label htmlFor="amount-received">Cantidad Recibida</Label>
              <Input
                id="amount-received"
                type="number"
                min={cartTotal}
                step={0.01}
                value={amountReceived}
                onChange={(e) => setAmountReceived(Number.parseFloat(e.target.value) || cartTotal)}
              />

              {/* Change Calculation */}
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cantidad Recibida:</span>
                    <span className="font-medium">${amountReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-medium">−${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-green-200 dark:border-green-800 pt-2 flex justify-between">
                    <span className="font-semibold">Cambio a Devolver:</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">${change.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Auto-filled for card/transfer */}
          {paymentMethod !== "efectivo" && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Monto Total:</span>
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCheckout}>Completar Pedido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
