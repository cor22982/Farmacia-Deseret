import useToken from "src/hooks/useToken";
import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";

export class Pago {
  id: number;

  pago: number;

  tipo: string;
  
  id_carrito: number;

  constructor(id: number, pago: number, tipo: string, id_carrito: number) {
    this.id = id;
    this.pago = pago;
    this.tipo = tipo;
    this.id_carrito = id_carrito;
  }
}

export const usePagos = () => {
  const { llamado: getPagosCarrito } = useApi(`${source_link}/getPagosCarrito`);

  const getPagos= async (id_carrito: number|null): Promise<Pago[]> => {
      const body = { id_carrito };
      const response = await getPagosCarrito(body, "POST");
  
      if (response.success && Array.isArray(response.pagos)) {
        const pagos = response.pagos.map(
          (pago: { id: number; pago: string; tipo: string; id_carrito: number;}) =>
            new Pago(pago.id, Number(pago.pago), pago.tipo, pago.id_carrito)
        );
        return pagos;
      }
  
      return [];
  };
  return { getPagos };

}