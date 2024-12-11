import useToken from "src/hooks/useToken";
import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";
import { Place } from "./places";

export class ProductDetail {
  id: number;

  cantidad: number;

  fecha_compra: string;

  fecha_vencimiento: string;

  costo: number;

  id_product: number;
  
  ubicacion: Place;

  constructor(
    id: number,
    cantidad: number,
    fecha_compra: string,
    fecha_vencimiento: string,
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

  getDetails_Products(): string {
    return `${this.ubicacion.lugar_farmacia === 'bodega' ? 'Bodega' : 'Cantidad'}: ${this.cantidad}`;
  }

  get_fechas(): string {
    const date = new Date(this.fecha_vencimiento); // Convierte la fecha en un objeto Date
    const day = String(date.getDate()).padStart(2, '0'); // Asegura que el día tenga 2 dígitos
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Asegura que el mes tenga 2 dígitos (getMonth es 0-indexado)
    const year = String(date.getFullYear()).slice(-2); // Extrae los dos últimos dígitos del año
  
    return `Fecha de Vencimiento: ${day}/${month}/${year}`;
  }

  get_Fechasformated(): string {
    const date = new Date(this.fecha_vencimiento); // Convierte la fecha en un objeto Date
    const day = String(date.getDate()).padStart(2, '0'); // Asegura que el día tenga 2 dígitos
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Asegura que el mes tenga 2 dígitos (getMonth es 0-indexado)
    const year = String(date.getFullYear()).slice(-2); // Extrae los dos últimos dígitos del año
  
    return `${day}/${month}/${year}`;
  }
  
}


export const useGetProduct_Details = () =>{
  const { llamado } = useApi(`${source_link}/getProductDetails`);
  const { llamado:getDetails_user } = useApi(`${source_link}/getDetails_user`);
  const {token} = useToken();

  const getDetails_ById = async (product_id:number): Promise<ProductDetail[]> => {
    const body = { token, id: product_id };
    const response = await llamado(body, "POST");

    if (response.success && Array.isArray(response.productdetails)) {
      const details = response.productdetails.map(
        (detail: {
          id: number;
          cantidad: number;
          fecha_compra: string;
          fecha_vencimiento: string;
          costo: string;
          ubicacion_product_detail: { id: number; ubicacion: string; lugar_farmacia: string; };
        }) => {
          const ubicacion_delproducto = new Place(
            detail.ubicacion_product_detail.id.toString(),
            detail.ubicacion_product_detail.ubicacion,
            detail.ubicacion_product_detail.lugar_farmacia,
          )

          return new ProductDetail(
            detail.id,
            detail.cantidad,
            detail.fecha_compra,
            detail.fecha_vencimiento,
            Number(detail.costo),
            detail.ubicacion_product_detail.id,
            ubicacion_delproducto
          );
        }
      );
      return details;
    }

    return [];
  };

  const getDetails_ById_user = async (product_id:number): Promise<ProductDetail[]> => {
    const body = { id: product_id };
    const response = await getDetails_user(body, "POST");

    if (response.success && Array.isArray(response.details_user)) {
      const details = response.details_user.map(
        (detail: {
          id: number;
          cantidad: number;
          fecha_compra: string;
          fecha_vencimiento: string;
          costo: string;
          ubicacion_product_detail: { id: number; ubicacion: string; lugar_farmacia: string; };
        }) => {
          const ubicacion_delproducto = new Place(
            detail.ubicacion_product_detail.id.toString(),
            detail.ubicacion_product_detail.ubicacion,
            detail.ubicacion_product_detail.lugar_farmacia,
          )

          return new ProductDetail(
            detail.id,
            detail.cantidad,
            detail.fecha_compra,
            detail.fecha_vencimiento,
            Number(detail.costo),
            detail.ubicacion_product_detail.id,
            ubicacion_delproducto
          );
        }
      );
      return details;
    }

    return [];
  };

  return { getDetails_ById, getDetails_ById_user };

}