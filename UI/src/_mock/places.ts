import useToken from "src/hooks/useToken";
import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";

export class Place {
  id: string;
  
  ubicacion: string;

  constructor(id: string, ubicacion: string) {
    this.id = id;
    this.ubicacion = ubicacion;
  }
}

export const useGetPlaces = () => {
  const { llamado } = useApi("");
  const {token} = useToken();
  
  const getPlaces = async (): Promise<Place[]> => {
    const body = { token };
    const response = await llamado(body, "POST");

    if (response.success && Array.isArray(response.ubicaciones)) {
      const places = response.ubicaciones.map(
        (ubicacion: { id: number; ubicacion: string }) =>
          new Place(ubicacion.id.toString(), ubicacion.ubicacion)
      );
      return places;
    }
    return [];
  };

  return { getPlaces };
};