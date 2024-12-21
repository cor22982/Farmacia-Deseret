import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";
import { PresentacionProducto, useGetPresentacionesProducto } from "./presentacion_producto";


export class ProductoCarrito {

  carrito_id: number;

  producto_id: number;

  cantidad: number;

  producto_nombre: string;

  precio_unitario: number;

  presentacion: PresentacionProducto | null;

  constructor(
    carrito_id: number,
    producto_id: number,
    cantidad: number,
    producto_nombre: string,
    precio_unitario: number,
    presentacion: PresentacionProducto | null,
  ) {
    this.carrito_id = carrito_id;
    this.producto_id = producto_id;
    this.cantidad = cantidad;
    this.producto_nombre = producto_nombre;
    this.precio_unitario = precio_unitario;
    this.presentacion = presentacion
  }

  getPrecioTotal(): number {
    return this.cantidad*this.precio_unitario;
  }

}

export const useGetProductosCarrito = () => {
  const { llamado:getcarritoproducts } = useApi(`${source_link}/getcarritoproducts`);
  const {getPresentacionProductobyID } = useGetPresentacionesProducto()

  const getCarritoProducts = async (id_carrito: number | null): Promise<ProductoCarrito[]> => {
    if (id_carrito){
    const body = { id_carrito };
    const response = await getcarritoproducts(body, "POST");
    if (response.success && Array.isArray(response.productos_carrito)) {
      const products = await Promise.all(
        response.productos_carrito.map(async (product: {
          carrito: number;
          producto: number;
          presentacion: number;
          cantidad_total: string;
          producto_detalles_carproducts: {
            id: number;
            pp: string;
            nombre: string;
          };
        }) => {
          
          const presentacion_producto = await getPresentacionProductobyID(product.presentacion)
          
          return new ProductoCarrito(
            product.carrito, 
            product.producto, 
            Number(product.cantidad_total), 
            product.producto_detalles_carproducts.nombre, 
            Number(product.producto_detalles_carproducts.pp),
            presentacion_producto
          )
        }
          
          )
      );
  
      return products;
    }
    return [];}
    return [];
  }
  return { getCarritoProducts };

}