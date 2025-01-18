export class Ganancia_details {
  
  id: number;

  name: string;
  
  existencia: number;

  ganancia: number;

  cantidad_presentacion: number;

  pp: number;

  constructor(id: number, name: string, existencia: number, ganancia: number, cantidad_presentacion: number, pp: number) {
    this.id = id;
    this.name = name;
    this.existencia = existencia;
    this.ganancia = ganancia;
    this.cantidad_presentacion = cantidad_presentacion;
    this.pp = pp;
  }
}