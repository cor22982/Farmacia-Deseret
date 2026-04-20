import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import * as XLSX from "xlsx-js-style"

interface InventarioExcel {
  articulo: string
  existencia: number
  costo: number
  pp: number
  "%": number
  total_costo: number
  total_pp: number
}

export function exportInventarioToExcel(data: InventarioExcel[]) {
  const worksheetData = [
    {
      "ARTÍCULO": "ARTÍCULO",
      "EXISTENCIA": "EXISTENCIA",
      "COSTO UNITARIO": "COSTO",
      "PRECIO PÚBLICO": "PP",
      "% GANANCIA": "%",
      "TOTAL COSTO": "TOTAL COSTO",
      "TOTAL PP": "TOTAL PP",
    },
    ...data.map((item) => ({
      "ARTÍCULO": item.articulo,
      "EXISTENCIA": item.existencia,
      "COSTO UNITARIO": item.costo,
      "PRECIO PÚBLICO": item.pp,
      "% GANANCIA": item["%"],
      "TOTAL COSTO": item.total_costo,
      "TOTAL PP": item.total_pp,
    })),
  ]

  const worksheet = XLSX.utils.json_to_sheet(worksheetData, {
    skipHeader: true,
  })

  /* 👉 Ancho de columnas */
  worksheet["!cols"] = [
    { wch: 45 },
    { wch: 14 },
    { wch: 14 },
    { wch: 14 },
    { wch: 10 },
    { wch: 16 },
    { wch: 16 },
  ]

  const range = XLSX.utils.decode_range(worksheet["!ref"]!)

  const borderStyle = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  }

  /* 👉 Aplicar estilos celda por celda */
  for (let R = 0; R <= range.e.r; R++) {
    for (let C = 0; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
      const cell = worksheet[cellAddress]
      if (!cell) continue

      cell.s = {
        border: borderStyle,
        alignment: {
          vertical: "center",
          horizontal: R === 0 ? "center" : C === 0 ? "left" : "right",
        },
        font: R === 0 ? { bold: true } : {},
      }

      /* 👉 Formatos numéricos (solo filas de datos) */
      if (R > 0) {
        if (C === 2 || C === 3 || C === 5 || C === 6) {
          cell.z = '"Q"#,##0.00'
        }
        if (C === 4) {
          cell.z = '0%'
        }
      }
    }
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario")
  const now = new Date()

  const date = now.toISOString().split("T")[0]
  const time = now
  .toTimeString()
  .slice(0, 5)
  .replace(":", "-")

  XLSX.writeFile(
    workbook,
    `reporte_inventario_${date}_${time}.xlsx`
  )
}

function getFirstBusinessMonday(year: number, month: number) {
  // month: 0–11
  const firstDay = new Date(year, month, 1)
  const day = firstDay.getDay() // 0=domingo, 1=lunes...

  if (day === 1) return firstDay // ya es lunes

  const diff = day === 0 ? 1 : 8 - day
  firstDay.setDate(firstDay.getDate() + diff)
  return firstDay
}


function formatSemanaLabel(date: Date) {
  const day = date.getDate()
  const month = date
    .toLocaleDateString("es-GT", { month: "long" })
    .toUpperCase()

  return `SEM ${day} ${month}`
}

function getSemanasHeaders(year: number, month: number) {
  // month: 0–11
  const firstMonday = getFirstBusinessMonday(year, month)

  return Array.from({ length: 4 }).map((_, i) => {
    const d = new Date(firstMonday)
    d.setDate(d.getDate() + i * 7)
    return formatSemanaLabel(d)
  })
}



export function getCurrentWeekDates() {
  const today = new Date();
  const day = today.getDay(); 
  // getDay(): 0=domingo, 1=lunes, ..., 6=sábado

  // Ajuste para que lunes sea el inicio
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  const saturday = new Date(monday);
  saturday.setDate(monday.getDate() + 5);

  const format = (date) => date.toISOString().split("T")[0];

  return {
    start: format(monday),
    end: format(saturday),
  };
}
export const SUPPLIERS = [
  { label: "AMICELCO", value: "AMICELCO" },
  { label: "BENDICION", value: "BENDICION" },
  { label: "BYF", value: "BYF" },
  { label: "COIDE", value: "COIDE" },
  { label: "EMMANUEL", value: "EMMANUEL" },
  { label: "ESTUARDO", value: "ESTUARDO" },
  { label: "GENESIS", value: "GENESIS" },
  { label: "INFASA", value: "INFASA" },
  { label: "OLAM", value: "OLAM" },
  { label: "PRECIO BAJO", value: "PRECIO BAJO" },
  { label: "ROSADEL", value: "ROSADEL" },
  { label: "TORRE FUERTE", value: "TORRE FUERTE" },
  { label: "LAFIMARQ", value: "LAFIMARQ" },
  { label: "TIENDA", value: "TIENDA" },
  { label: "ROXVEL Y RABI", value: "ROXVEL Y RABI" },
  { label: "NO SISTEMA", value: "NO SISTEMA" }
];


export function exportReporteVentasExcel(
  data: any[],
  fecha: any
) {
  const [y, m] = fecha.split("-")
  const year = Number(y)
  const month = Number(m) - 1

  const [SEM1, SEM2, SEM3, SEM4] = getSemanasHeaders(year, month)

  const rows = [
    {
      NO: "No",
      ARTICULO: "ARTICULO",
      EXISTENCIA: "EXISTENCIA",
      L_AM: "LUNES AM",
      L_PM: "LUNES PM",
      M_AM: "MARTES AM",
      M_PM: "MARTES PM",
      MI_AM: "MIERCOLES AM",
      MI_PM: "MIERCOLES PM",
      J_AM: "JUEVES AM",
      J_PM: "JUEVES PM",
      V_AM: "VIERNES AM",
      V_PM: "VIERNES PM",
      SAB: "SABADO",
      NVA: "NVA EXIST",
      PEDIDO: "PEDIDO",
      PP: "PP",
      OBS: "OBSERVACIONES",
      FV: "FECHA VENCIMIENTO",
      BOD: "BODEGA",
      COM: "COMPRAS",
      FC: "FECHA COMPRA",
      S1: SEM1,
      S2: SEM2,
      S3: SEM3,
      S4: SEM4,
      TOTAL: "TOTAL",
      PROM: "PROMEDIO",
      M1: "1 MES",
      M2: "2 MESES",
    },
    ...data.map((item, i) => ({
      NO: i + 1,
      ARTICULO: item.articulo,
      EXISTENCIA: item.existencia,
      L_AM: item.ventas_semana.lunes_am,
      L_PM: item.ventas_semana.lunes_pm,
      M_AM: item.ventas_semana.martes_am,
      M_PM: item.ventas_semana.martes_pm,
      MI_AM: item.ventas_semana.miercoles_am,
      MI_PM: item.ventas_semana.miercoles_pm,
      J_AM: item.ventas_semana.jueves_am,
      J_PM: item.ventas_semana.jueves_pm,
      V_AM: item.ventas_semana.viernes_am,
      V_PM: item.ventas_semana.viernes_pm,
      SAB: item.ventas_semana.sabado,
      NVA: item.nva_existencia,
      PEDIDO: item.pedido,
      PP: item.pp,
      OBS: "",
      FV: item.fecha_vencimiento ?? "",
      BOD: item.bodega,
      COM: item.compras,
      FC: item.fecha_compra ?? "",
      S1: item.semanas.sem_1,
      S2: item.semanas.sem_2,
      S3: item.semanas.sem_3,
      S4: item.semanas.sem_4,
      TOTAL: item.total,
      PROM: item.promedio,
      M1: item.mes_1,
      M2: item.mes_2,
    })),
  ]

  const ws = XLSX.utils.json_to_sheet(rows, { skipHeader: true })

  ws["!cols"] = [
    { wch: 5 }, { wch: 40 }, { wch: 12 },
    ...Array(11).fill({ wch: 10 }),
    { wch: 12 }, { wch: 10 }, { wch: 10 },
    { wch: 18 }, { wch: 10 }, { wch: 10 },
    { wch: 18 },
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 },
    { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
  ]

  const border = {
    top: { style: "thin" },
    bottom: { style: "thin" },
    left: { style: "thin" },
    right: { style: "thin" },
  }

  const getHeaderColor = (C: number) => {
    if (C === 2) return "FFD9D9D9"              // EXISTENCIA
    if (C >= 3 && C <= 12) return "FFDDEBF7"    // L–V
    if (C === 13) return "FFFCE4D6"             // SABADO
    if (C === 14) return "FFFFFF00"             // NVA EXIST
    if (C === 15 || C === 16) return "FFF4CCCC" // PEDIDO / PP
    if (C === 17 || C === 18) return "FFE2EFDA" // OBS / FV
    if (C === 19 || C === 20) return "FFD9E1F2" // BODEGA / COMPRAS
    if (C === 21) return "FFFCE4D6"              // FECHA COMPRA
    if (C >= 22 && C <= 25) return "FFF8CBAD"   // SEMANAS
    if (C >= 26) return "FFEDEDED"               // TOTAL / PROM / MESES
    return null
  }

  const range = XLSX.utils.decode_range(ws["!ref"]!)

  for (let R = 0; R <= range.e.r; R++) {
    for (let C = 0; C <= range.e.c; C++) {
      const ref = XLSX.utils.encode_cell({ r: R, c: C })
      const cell = ws[ref]
      if (!cell) continue

      const headerColor = R === 0 ? getHeaderColor(C) : null

      cell.s = {
        border,
        font: R === 0 ? { bold: true, sz: 10 } : {},
        alignment: {
          vertical: "center",
          horizontal: R === 0 ? "center" : C <= 1 ? "left" : "right",
          textRotation: R === 0 && C >= 2 ? 90 : 0, // 🔄 ROTADO
          wrapText: true,
        },
        fill: headerColor
          ? {
              patternType: "solid",
              fgColor: { rgb: headerColor },
            }
          : undefined,
      }

      if (R > 0 && C === 16) {
        cell.z = '"Q"#,##0.00' // PP
      }
    }
  }

  ws["!rows"] = [{ hpt: 80 }] // altura del header

  const now = new Date()
  const date = now.toLocaleDateString("en-CA")
  const time = now
    .toLocaleTimeString("es-GT", { hour: "2-digit", minute: "2-digit", hour12: false })
    .replace(":", "-")

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Reporte Ventas")

  XLSX.writeFile(wb, `reporte_ventas_${date}_${time}.xlsx`)
}
