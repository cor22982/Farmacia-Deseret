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

  const getGanancias = async (): Promise<Ganancia[]> => {
    const body = { token };
    const response = await getAllGanancias(body, "POST");

    if (response.success && Array.isArray(response.ganancias)) {
      const ganancias = await Promise.all(
              response.ganancias.map(async (ganancia: {
                id: number;
                nombre: string;
                forma_farmaceutica: string;
                descripcion_uso: string;
                imagen: string;
                costo: string;
                pp: string;
                presentacion: string;
                principio_activo: string;
                existencias: number;
                controlado: boolean;
                proveedor: number;
                ganancia: string;
                tipo: string;
                proveedor_id_product: {
                  id: number;
                  tipo: string;
                  proveedor_alternativo: number;
                  estadisponible: boolean;
                  nombre: string;
                };
                dosificacion: string | null;
                accion_farmacologica: string | null;
              }) => {
                const supplier = new Supplier(
                  product.proveedor_id_product.id,
                  product.proveedor_id_product.nombre,
                  '',
                  product.proveedor_id_product.tipo,
                  '',
                  product.proveedor_id_product.proveedor_alternativo,
                  product.proveedor_id_product.estadisponible,
                  '',
                  '',
                  [],
                  ''
                );
                const productos_presentaciones = await getPresentacionesProducto( product.id);
                const body2 = { image_product: product.imagen || '' };
                const response2 = product.imagen ? await imagen_get(body2, "POST") : { image: '' };
      
                const product_details = await getDetails_ById(product.id);
      
                return new Product(
                  product.id,
                  product.nombre,
                  product.forma_farmaceutica,
                  product.descripcion_uso,
                  response2.image,
                  Number(product.costo),
                  Number(product.pp),
                  product.presentacion,
                  product.principio_activo,
                  product.existencias,
                  product.controlado,
                  supplier,
                  Number(product.ganancia),
                  product.tipo,
                  product_details,
                  product.imagen,
                  productos_presentaciones,
                  product.dosificacion,
                  product.accion_farmacologica
                );
              })
            );
            return ganancias;
    }

    return [];

  }

}
