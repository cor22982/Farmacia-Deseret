"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download } from "lucide-react"
import type { Sale, Product, SalesStatistics } from "@/lib/types"
import { usePost, useFetch } from "@/hooks/use-Products"
import { exportReporteVentasExcel } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { getCurrentWeekDates } from "@/lib/utils"

// @ts-ignore
import * as XLSX from "xlsx"

interface SalesReportProps {
  sales: Sale[]
  products: Product[]
}

export function SalesReport({ sales = [], products = [] }: SalesReportProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loadingExcelSales, setLoadingExcelSales] = useState(false);

  const {
      data: stadistics,
      loading,
      error,
      refetch,
    } = useFetch<SalesStatistics>({
      url: "/reports/statistics",
    });

  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.datetime)
    const start = new Date(startDate)
    const end = new Date(endDate)
    return saleDate >= start && saleDate <= end
  })

   useEffect(() => {
    const { start, end } = getCurrentWeekDates();
    setStartDate(start);
    setEndDate(end);
  }, []);

  const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalCost = filteredSales.reduce((sum, sale) => {
    return sum + sale.items.reduce((itemSum, item) => itemSum + item.real_cost, 0)
  }, 0)
  const totalProfit = filteredSales.reduce((sum, sale) => {
    return sum + sale.items.reduce((itemSum, item) => itemSum + item.real_profit, 0)
  }, 0)

  const paymentMethods = {
    efectivo: filteredSales.filter((s) => s.payment_method === "efectivo").length,
    tarjeta: filteredSales.filter((s) => s.payment_method === "tarjeta").length,
    transferencia: filteredSales.filter((s) => s.payment_method === "transferencia").length,
  }

  const { post, data } = usePost({
        url: "reports/weekly-monthly",
      });

  
  const generateFileReport = async() => {
      setLoadingExcelSales(true)
      try{
        const respuesta  = await post({
          fecha_inicio:startDate,
          fecha_fin: endDate
        });
        exportReporteVentasExcel(respuesta, startDate)
        console.log(respuesta)
      }
      catch (err) {
      // Handle the error
      console.error('Error occurred:', err.message);
  
      } finally {
      // This runs regardless of success or failure
      setLoadingExcelSales(false);
     }
      
  
  
    }



  const handleExportReport = () => {
    const data = filteredSales.map((sale) => {
      const productsList = sale.items
        .map((item) => {
          const product = products.find((p) => p._id === item.product_id)
          return `${product?.name || item.product_id} (${item.presentation_name} x${item.qty})`
        })
        .join("; ")

      const totalCost = sale.items.reduce((sum, item) => sum + item.real_cost, 0)
      const totalProfit = sale.items.reduce((sum, item) => sum + item.real_profit, 0)

      return {
        "ID Venta": sale._id,
        "Nombre Venta": sale.sale_name,
        Fecha: new Date(sale.datetime).toLocaleDateString(),
        Hora: new Date(sale.datetime).toLocaleTimeString(),
        Día: sale.day_of_week,
        Turno: sale.shift,
        Productos: productsList,
        Total: sale.total.toFixed(2),
        "Método Pago": sale.payment_method,
        "Costo Real": totalCost.toFixed(2),
        "Ganancia Real": totalProfit.toFixed(2),
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ventas")

    // Auto-size columns
    const maxWidth = data.reduce((w, r) => Math.max(w, r["Productos"].length), 10)
    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: Math.min(maxWidth, 50) },
      { wch: 10 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
    ]

    XLSX.writeFile(workbook, `reporte-ventas-${startDate}-${endDate}.xlsx`)
  }

  return (
    <div className="space-y-6">
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
          <Button 
            //onClick={handleExportReport} 
            onClick={generateFileReport}
            className="gap-2 w-full md:w-auto cursor-pointer">
            {loadingExcelSales ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                          ) : (
                                           <Download className="w-4 h-4" />
                                          )}
            Exportar Reporte como Excel
          </Button>
        </CardContent>
      </Card>
     <Card>
  <CardHeader className="pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Estadísticas de Hoy
    </CardTitle>
  </CardHeader>

  <CardContent>
    <div className="flex items-center justify-between gap-8">
      
      <div>
        <p className="text-sm text-muted-foreground">Total de Ventas</p>
        <p className="text-3xl font-bold">
          {stadistics?.total_documents ?? 0}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm text-muted-foreground">Productos Vendidos</p>
        <p className="text-3xl font-bold text-red-600">
        {stadistics?.total_units_deducted ?? 0}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground">Total </p>
        <p className="text-3xl font-bold text-green-600">
        Q{stadistics?.total_sales_amount?? 0}
        </p>
      </div>

    </div>
  </CardContent>
</Card>


      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Ventas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{filteredSales.length}</p>
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

      <Card>
        <CardHeader>
          <CardTitle>Resumen de Métodos de Pago</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Efectivo</p>
              <p className="text-2xl font-bold text-primary">{paymentMethods.efectivo}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Tarjeta</p>
              <p className="text-2xl font-bold text-primary">{paymentMethods.tarjeta}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Transferencia</p>
              <p className="text-2xl font-bold text-primary">{paymentMethods.transferencia}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-muted-foreground">
                  <th className="text-left py-2 px-2">ID</th>
                  <th className="text-left py-2 px-2">Nombre</th>
                  <th className="text-left py-2 px-2">Fecha</th>
                  <th className="text-left py-2 px-2">Turno</th>
                  <th className="text-left py-2 px-2">Productos</th>
                  <th className="text-left py-2 px-2">Total</th>
                  <th className="text-left py-2 px-2">Pago</th>
                  <th className="text-left py-2 px-2">Ganancia</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No se encontraron ventas para este período
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((sale) => {
                    const saleProfit = sale.items.reduce((sum, item) => sum + item.real_profit, 0)
                    return (
                      <tr key={sale._id} className="border-b hover:bg-accent/5">
                        <td className="py-3 px-2 font-mono text-xs">{sale._id}</td>
                        <td className="py-3 px-2">{sale.sale_name}</td>
                        <td className="py-3 px-2 text-xs">
                          {new Date(sale.datetime).toLocaleDateString()}
                          <br />
                          <span className="text-muted-foreground">{new Date(sale.datetime).toLocaleTimeString()}</span>
                        </td>
                        <td className="py-3 px-2 capitalize text-xs">
                          {sale.day_of_week}
                          <br />
                          <span className="text-muted-foreground">{sale.shift}</span>
                        </td>
                        <td className="py-3 px-2 text-xs">
                          <div className="space-y-1">
                            {sale.items.map((item, idx) => {
                              const product = products.find((p) => p._id === item.product_id)
                              return (
                                <div key={idx}>
                                  {product?.name || item.product_id} ({item.presentation_name} x{item.qty})
                                </div>
                              )
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-2 font-semibold">${sale.total.toFixed(2)}</td>
                        <td className="py-3 px-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium capitalize ${
                              sale.payment_method === "efectivo"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : sale.payment_method === "tarjeta"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                  : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                            }`}
                          >
                            {sale.payment_method}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-semibold text-green-600">${saleProfit.toFixed(2)}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}