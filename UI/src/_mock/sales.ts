import { ReactNode } from "react";

export interface Jornada {
  jornada: string;
  totalCantidad: number;
}

export interface Presentacion {
  presentacion: string;
  presentacionCantidad: number;
  fecha_compra: string;
  fecha_vencimiento: string;
  jornadas: Jornada[];
}

export interface SaleProduct {
  ventasPorSemana: any;
  fecha_compra: ReactNode;
  fecha_vencimiento: ReactNode;
  presentacion: ReactNode;
  ventasPorDia: any;
  presentacionCantidad: number;
  producto: string;
  existencias: number;
  presentaciones: Presentacion[];
}
