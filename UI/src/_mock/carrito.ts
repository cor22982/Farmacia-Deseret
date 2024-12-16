import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";

export class Carrito {
  id: number;

  total: number;

  hora: string;

  fecha: string;

  cantidad_total: number | null;

  constructor(id: number, total: number, hora: string, fecha: string, cantidad_total: number | null) {
    this.id = id;
    this.total = total;
    this.hora = hora;
    this.fecha = fecha;
    this.cantidad_total = cantidad_total;
  }
}

export const useCarrito = () => {
  const { llamadowithoutbody:nuevo_carrito } = useApi(`${source_link}/carritonuevo`);
  const { llamadowithoutbody: obtener_carritos } = useApi(`${source_link}/getcarritos`);
  const {llamado} = useApi(`${source_link}/getcarritoid`);

  const newCarrito = async (): Promise<number|null> => {
    const response = await nuevo_carrito("GET");

    if (response.success) {
      const id = response.carrito;
      return id ;
    }
    return null;
  };

  const getCarritos = async (): Promise<Carrito[]> => {
    const response = await obtener_carritos("GET");

    if (response.success && Array.isArray(response.carritos)) {
      const carritos = response.carritos.map(
        (carrito: { id: number; total: string; hora: string;  fecha: string;}) =>
          new Carrito(carrito.id, Number(carrito.total), carrito.hora, carrito.fecha, null)
      );
      return  carritos ;
    }
    return [];
  };

  const getCarrito_byId = async (id: number): Promise<Carrito | null> => {
    const body = { id };
    const response = await llamado(body, "POST");
    if (response.success) {
      const carrito = new Carrito(response.carrito.id,Number(response.carrito.total), response.carrito.hora, response.carrito.fecha , response.carrito.cantidad_total);
      return carrito ;
    }
    return null;
  };

  

  return { newCarrito , getCarritos, getCarrito_byId};
};