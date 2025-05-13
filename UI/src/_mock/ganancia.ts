import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";
import useToken from "src/hooks/useToken";
import { Ganancia_details } from "./ganancia_detalles";
import { useGetPresentaciones } from "./presentaciones";



export class Ganancia {
  id: number;

  articulo: string;

  existencia: number;

  costo: number;

  pp: number;

  ganacia: number;

  total_costo: number;

  total_pp: number;

  detalles: Ganancia_details[];

  constructor(
    id: number,
    articulo: string,
    existencia: number,
    costo: number,
    pp: number,
    ganacia: number,
    total_costo: number,
    total_pp: number,
    detalles: Ganancia_details[],
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
  const {getOnePresentacion } = useGetPresentaciones();

  const getGanancias = async (limit: string, offset: string, search: string): Promise<Ganancia[]> => {
    const body = { token, limit, offset, search };
    
    const response = await getAllGanancias(body, "POST");

    if (response.success && Array.isArray(response.ganancias)) {
      const ganancias = await Promise.all(
              response.ganancias.map(async (ganancia: {
                id: number;
                nombre: string;
                ganancia: string;
                existencias: number;
                costo: string;
                
                productos_presentacion_producto: {
                  id: number;
                  pp: string;
                  porcentaje_ganancia: string;
                  cantidad_presentacion: number;
                  presentacion_id: number;
                }[];
                
              }) => {
                const detalles = ganancia.productos_presentacion_producto &&
                Array.isArray(ganancia.productos_presentacion_producto) &&
                ganancia.productos_presentacion_producto.length > 0
                  ? await Promise.all(
                      ganancia.productos_presentacion_producto.map(async (detalle) => {
                        const presentacion = await getOnePresentacion(detalle.presentacion_id);
                        return new Ganancia_details(
                          detalle.id,
                          presentacion?.nombre || '',
                          detalle.cantidad_presentacion !== 0
                          ? Math.floor(ganancia.existencias / detalle.cantidad_presentacion)
                          : 0,
                          Number(detalle.porcentaje_ganancia)*100,
                          detalle.cantidad_presentacion,
                          Number(detalle.pp) || 0
                        );
                      })
                    )
                  : [];
              
                  const detalleConMenorPorcentaje = detalles.length > 0
                  ? detalles.reduce((minDetalle, currentDetalle) =>
                      currentDetalle.ganancia < minDetalle.ganancia
                        ? currentDetalle
                        : minDetalle
                    )
                  : null;
                
                  const total_costo = detalleConMenorPorcentaje 
                  ? (detalleConMenorPorcentaje.cantidad_presentacion || 0) *
                    Number(ganancia.costo) *
                    (detalleConMenorPorcentaje.existencia || 0)
                  : 0;

                
                  const total_pp = detalleConMenorPorcentaje 
                    ? (detalleConMenorPorcentaje.pp || 0) * (detalleConMenorPorcentaje.existencia || 0)
                    : 0;


                return new Ganancia(
                  ganancia.id,
                  ganancia.nombre,
                  detalleConMenorPorcentaje?.existencia || 0,
                  detalleConMenorPorcentaje 
                  ? (detalleConMenorPorcentaje.cantidad_presentacion || 0) *
                    Number(ganancia.costo): 0,
                  detalleConMenorPorcentaje?.pp || 0,
                  Number(ganancia.ganancia )* 100,
                  total_costo,
                  total_pp,
                  detalles
                  
                );
              })
            );
            return ganancias;
    }

    return [];

  }

  return {getGanancias}

}
