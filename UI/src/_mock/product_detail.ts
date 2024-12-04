import { Place } from "./places";

export class ProductDetail {
  id: number;

  cantidad: number;

  fecha_compra: Date;

  fecha_vencimiento: Date;

  costo: number;

  id_product: number;
  
  ubicacion: Place;

  constructor(
    id: number,
    cantidad: number,
    fecha_compra: Date,
    fecha_vencimiento: Date,
    costo: number,
    id_product: number,
    ubicacion: Place
  ) {
    this.id = id;
    this.cantidad = cantidad;
    this.fecha_compra = fecha_compra;
    this.fecha_vencimiento = fecha_vencimiento;
    this.costo = costo;
    this.id_product = id_product;
    this.ubicacion = ubicacion;
  }
}
