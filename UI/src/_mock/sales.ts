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
  producto: string;
  existencias: number;
  presentaciones: Presentacion[];
}
