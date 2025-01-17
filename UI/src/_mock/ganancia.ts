import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";
import useToken from "src/hooks/useToken";
import { ganancia_details } from "./ganancia_detalles";



export class Ganancia {
  id: number;

  articulo: string;

  existencia: number;

  costo: number;

  pp: number;

  ganacia: number;

  total_costo: number;

  total_pp: number;

  detalles: ganancia_details[];

  constructor(
    id: number,
    articulo: string,
    existencia: number,
    costo: number,
    pp: number,
    ganacia: number,
    total_costo: number,
    total_pp: number,
    detalles: ganancia_details[],
  ) {
    this.id = id;
    this.articulo = articulo;
    this.existencia = existencia;
    this.costo = costo;
    this.pp = pp;
    this.ganacia = ganacia;
    this.total_costo = total_costo;
    this.total_pp = total_pp;
    this.detalles = detalles;
  }
}


export const useGetGanancias = () =>{
  const { llamado: getAllGanancias } = useApi(`${source_link}/getAllGanancias`);
  const {token} = useToken();
  


}
