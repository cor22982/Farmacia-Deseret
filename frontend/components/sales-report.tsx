"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download } from "lucide-react"
import type { Order } from "@/lib/mock-data"

interface SalesReportProps {
  orders: Order[]
}

export function SalesReport({ orders }: SalesReportProps) {
  const [startDate, setStartDate] = useState("2024-11-20")
  const [endDate, setEndDate] = useState("2024-11-30")

  // Filter orders by date range
  const filteredOrders = orders.filter((order) => {
    const orderDate = new Date(order.date)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return orderDate >= start && orderDate <= end
  })

  // Calculate totals
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0)
  const totalCost = filteredOrders.reduce((sum, order) => {
    return (
      sum +
      order.items.reduce((itemSum, item) => {
        // This is simplified - in a real app, you'd have cost data
        return itemSum + item.price * item.quantity * 0.4 // Assuming 40% cost ratio
      }, 0)
    )
  }, 0)
  const totalProfit = totalRevenue - totalCost
  const paymentMethods = {
    cash: filteredOrders.filter((o) => o.paymentMethod === "cash").length,
    card: filteredOrders.filter((o) => o.paymentMethod === "card").length,
    transfer: filteredOrders.filter((o) => o.paymentMethod === "transfer").length,
  }

  // Export to CSV
  const handleExportReport = () => {
    let csv = "Order ID,Date,Customer,Products,Total,Payment Method,Amount Received,Change\n"

    filteredOrders.forEach((order) => {
      const productsList = order.items.map((item) => `${item.productName} (x${item.quantity})`).join("; ")
      csv += `"${order.id}","${order.date}","${order.customerName}","${productsList}","${order.total.toFixed(2)}","${order.paymentMethod}","${order.amountReceived.toFixed(2)}","${order.change.toFixed(2)}"\n`
    })

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-report-${startDate}-to-${endDate}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrar por Rango de Fechas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Fecha Inicial</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Fecha Final</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="mt-1" />
            </div>
          </div>
          <Button onClick={handleExportReport} className="gap-2 w-full md:w-auto">
            <Download className="w-4 h-4" />
            Exportar Reporte como CSV
          </Button>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{filteredOrders.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ingresos Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Costo Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">${totalCost.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ganancia</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">${totalProfit.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Métodos de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Efectivo</p>
              <p className="text-2xl font-bold text-primary">{paymentMethods.cash}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Tarjeta</p>
              <p className="text-2xl font-bold text-primary">{paymentMethods.card}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Transferencia</p>
              <p className="text-2xl font-bold text-primary">{paymentMethods.transfer}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-muted-foreground">
                  <th className="text-left py-2 px-2">ID de Pedido</th>
                  <th className="text-left py-2 px-2">Fecha</th>
                  <th className="text-left py-2 px-2">Cliente</th>
                  <th className="text-left py-2 px-2">Productos</th>
                  <th className="text-left py-2 px-2">Total</th>
                  <th className="text-left py-2 px-2">Pago</th>
                  <th className="text-left py-2 px-2">Cambio</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No se encontraron pedidos para este período
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-accent/5">
                      <td className="py-3 px-2 font-mono text-xs">{order.id}</td>
                      <td className="py-3 px-2">{new Date(order.date).toLocaleDateString()}</td>
                      <td className="py-3 px-2">{order.customerName}</td>
                      <td className="py-3 px-2 text-xs">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx}>
                              {item.productName} x{item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-2 font-semibold">${order.total.toFixed(2)}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            order.paymentMethod === "cash"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : order.paymentMethod === "card"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                          }`}
                        >
                          {order.paymentMethod === "cash"
                            ? "EFECTIVO"
                            : order.paymentMethod === "card"
                              ? "TARJETA"
                              : "TRANSFERENCIA"}
                        </span>
                      </td>
                      <td className="py-3 px-2">${order.change.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
