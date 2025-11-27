import type { Product, Supplier } from "@/lib/mock-data"

export function exportProductsToExcel(products: Product[]) {
  const headers = [
    "ID Producto",
    "Nombre",
    "Descripción",
    "Ubicación",
    "Presentación",
    "Cantidad",
    "Precio Venta",
    "Precio Costo",
    "Fecha Vencimiento",
    "Fecha Compra",
  ]

  const rows = products.flatMap((product) =>
    product.presentations.map((pres) => [
      product.id,
      product.name,
      product.description,
      product.location,
      pres.type,
      pres.quantity,
      pres.price,
      pres.cost,
      pres.expireDate,
      pres.purchaseDate,
    ]),
  )

  const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

  downloadCSV(csvContent, "inventario-productos.csv")
}

export function exportSuppliersToExcel(suppliers: Supplier[]) {
  const headers = ["ID Proveedor", "Nombre", "Email", "Teléfono", "Dirección"]

  const rows = suppliers.map((supplier) => [
    supplier.id,
    supplier.name,
    supplier.email,
    supplier.phone,
    supplier.address,
  ])

  const csvContent = [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")

  downloadCSV(csvContent, "proveedores.csv")
}

function downloadCSV(content: string, filename: string) {
  const element = document.createElement("a")
  element.setAttribute("href", `data:text/csv;charset=utf-8,${encodeURIComponent(content)}`)
  element.setAttribute("download", filename)
  element.style.display = "none"
  document.body.appendChild(element)
  element.click()
  document.body.removeChild(element)
}
