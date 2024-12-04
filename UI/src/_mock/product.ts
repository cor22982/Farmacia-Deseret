import useApi from "src/hooks/useApi";
import useToken from "src/hooks/useToken";
import source_link from "src/repository/source_repo";
import { Supplier } from "./supplier";
import { ProductDetail } from "./product_detail";


export class Product {
  id: number;

  nombre: string;

  horario_cierre: string;

  forma_farmaceutica: string;

  descripcion_uso: string;

  imagen: string;

  costo: number;

  pp: number;

  presentacion: string;

  principio_activo: string;

  existencias: number;

  controlado: boolean;

  proveedor: Supplier;

  ganancia: number;

  tipo: string;

  listdetails : ProductDetail[];

  constructor(
    id: number,
    nombre: string,
    horario_cierre: string,
    forma_farmaceutica: string,
    descripcion_uso: string,
    imagen: string,
    costo: number,
    pp: number,
    presentacion: string,
    principio_activo: string,
    existencias: number,
    controlado: boolean,
    proveedor: Supplier,
    ganancia: number,
    tipo: string,
    listdetails: ProductDetail[],

  ) {
    this.id = id;
    this.nombre = nombre;
    this.horario_cierre = horario_cierre;
    this.forma_farmaceutica = forma_farmaceutica;
    this.descripcion_uso = descripcion_uso;
    this.imagen = imagen;
    this.costo = costo;
    this.pp = pp;
    this.presentacion = presentacion;
    this.principio_activo = principio_activo;
    this.existencias = existencias;
    this.controlado = controlado;
    this.proveedor = proveedor;
    this.ganancia = ganancia;
    this.tipo = tipo;
    this.listdetails = listdetails
  }
}
