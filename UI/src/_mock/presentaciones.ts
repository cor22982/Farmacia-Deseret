import useToken from "src/hooks/useToken";
import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";

export class Presentacion {
  id: number;

  nombre: string;

  descripcion: string;

  constructor(id: number, nombre: string, descripcion: string) {
    this.id = id;
    this.nombre = nombre;
    this.descripcion = descripcion;
  }
}


export const useGetPresentaciones = () => {
  const { llamado:presentaciones } = useApi(`${source_link}/presentaciones`);
  const {token} = useToken();

  const getPresentaciones = async (): Promise<Presentacion[]> => {
      const body = { token };
      const response = await presentaciones(body, "POST");
  
      if (response.success && Array.isArray(response.presentaciones)) {
        const presentaciones_geted = response.presentaciones.map(
          (p: { id: number; nombre: string; descripcion: string; }) =>
            new Presentacion(p.id, p.nombre,p.descripcion)
        );
        return presentaciones_geted ;
      }
  
      return [];
    };
    return { getPresentaciones };
}