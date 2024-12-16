import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";


export class ProductoCarrito {

  carrito_id: number;

  producto_id: number;

  cantidad: number;

  producto_nombre: string;

  precio_unitario: number;

  constructor(
    carrito_id: number,
    producto_id: number,
    cantidad: number,
    producto_nombre: string,
    precio_unitario: number
  ) {
    this.carrito_id = carrito_id;
    this.producto_id = producto_id;
    this.cantidad = cantidad;
    this.producto_nombre = producto_nombre;
    this.precio_unitario = precio_unitario;
  }

  getPrecioTotal(): number {
    return this.cantidad*this.precio_unitario;
  }

}

export const useGetProductosCarrito = () => {
  const { llamado:getcarritoproducts } = useApi(`${source_link}/getcarritoproducts`);

  const getCarritoProducts = async (id_carrito: number | null): Promise<ProductoCarrito[]> => {
    if (id_carrito){
    const body = { id_carrito };
    const response = await getcarritoproducts(body, "POST");
    if (response.success && Array.isArray(response.productos_carrito)) {
      const products = await Promise.all(
        response.productos_carrito.map((product: {
          carrito: number;
          producto: number;
          cantidad_total: string;
          producto_detalles_carproducts: {
            id: number;
            pp: string;
            nombre: string;
          };
        }) => new ProductoCarrito(
          product.carrito, 
          product.producto, 
          Number(product.cantidad_total), 
          product.producto_detalles_carproducts.nombre, 
          Number(product.producto_detalles_carproducts.pp)
        ))
      );
  
      return products;
    }
    return [];}
    return [];
  }
  return { getCarritoProducts };

}