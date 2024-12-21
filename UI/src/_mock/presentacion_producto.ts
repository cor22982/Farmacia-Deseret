import useToken from "src/hooks/useToken";
import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";
import { Presentacion, useGetPresentaciones } from "./presentaciones";

export class PresentacionProducto {
  id: number;

  porcentaje_ganancia: number | null;

  pp: number | null;

  cantidad_presentacion: number | null;

  presentacion_id: number;

  product_id: number;

  presentacion: Presentacion | null;

  constructor(
    id: number,
    porcentaje_ganancia: number | null,
    pp: number | null,
    cantidad_presentacion: number | null,
    presentacion_id: number,
    product_id: number,
    presentacion: Presentacion | null,
  ) {
    this.id = id;
    this.porcentaje_ganancia = porcentaje_ganancia;
    this.pp = pp;
    this.cantidad_presentacion = cantidad_presentacion;
    this.presentacion_id = presentacion_id;
    this.product_id = product_id;
    this.presentacion = presentacion
  }
}


export const useGetPresentacionesProducto = () => {
  const { llamado: presentacionesproductos } = useApi(`${source_link}/presentaciones_by_product`);
  const { llamado: getpresentacionbyID } = useApi(`${source_link}/getpresentacionbyID`);


  const { token } = useToken();
  const { getOnePresentacion } = useGetPresentaciones();

  const getPresentacionesProducto = async (id_product: number): Promise<PresentacionProducto[]> => {
    try {
      const body = { id_product };
      const response = await presentacionesproductos(body, "POST");

      if (response.success && Array.isArray(response.presentaciones)) {
        const presentacion_producto = await Promise.all(
          response.presentaciones.map(async (p: {
            id: number;
            porcentaje_ganancia: number | null;
            pp: string;
            cantidad_presentacion: number;
            presentacion_id: number;
            product_id: number;
          }) => {
            const presentacion_geted = await getOnePresentacion(p.presentacion_id);
            return new PresentacionProducto(
              p.id,
              p.porcentaje_ganancia,
              Number(p.pp),
              p.cantidad_presentacion,
              p.presentacion_id,
              p.product_id,
              presentacion_geted
            );
          })
        );

        return presentacion_producto;
      }

      return [];
    } catch (error) {
      console.error("Error al obtener las presentaciones del producto:", error);
      return [];
    }
  };

  const getPresentacionProductobyID = async (id: number): Promise<PresentacionProducto | null> => {
      const body = { id_presentacion:id };
      const response = await getpresentacionbyID(body, "POST");
      if (response.success) {
        const presentacion_geted = await getOnePresentacion(response.producto_presentacion.presentacion_id);

        const carrito = new PresentacionProducto(
          response.producto_presentacion.id,
          response.producto_presentacion.porcentaje_ganancia, 
          Number(response.producto_presentacion.pp), 
          response.producto_presentacion.cantidad_presentacion , 
          response.producto_presentacion.presentacion_id,
          response.producto_presentacion.product_id,
          presentacion_geted
        );
        return carrito ;
      }
      return null;
    };

  return { getPresentacionesProducto, getPresentacionProductobyID  };
};
