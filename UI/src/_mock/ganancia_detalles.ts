export class ganancia_details {
  
  id: number;

  name: string;
  
  existencia: number;

  ganancia: number;

  constructor(id: number, name: string, existencia: number, ganancia: number) {
    this.id = id;
    this.name = name;
    this.existencia = existencia;
    this.ganancia = ganancia;
  }
}