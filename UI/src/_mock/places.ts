import useToken from "src/hooks/useToken";
import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";

export class Place {
  id: string;

  ubicacion: string;

  lugar_farmacia: string;

  constructor(id: string, ubicacion: string, lugar_farmacia: string) {
    this.id = id;
    this.ubicacion = ubicacion;
    this.lugar_farmacia = lugar_farmacia
  }
}

export const useGetPlaces = () => {
  const { llamado } = useApi(`${source_link}/ubicaciones`);
  const { llamadowithoutbody } = useApi(`${source_link}/ubicaciones_usuario`);
  const {token} = useToken();
  
  const getPlaces = async (): Promise<Place[]> => {
    const body = { token };
    const response = await llamado(body, "POST");

    if (response.success && Array.isArray(response.ubicaciones)) {
      const places = response.ubicaciones.map(
        (ubicacion: { id: number; ubicacion: string; lugar_farmacia: string; }) =>
          new Place(ubicacion.id.toString(), ubicacion.ubicacion, ubicacion.lugar_farmacia === null ? '' : ubicacion.lugar_farmacia)
      );
      return places;
    }

    return [];
  };

  const getPlaces_usuario = async (): Promise<Place[]> => {
    const response = await llamadowithoutbody("GET");

    if (response.success && Array.isArray(response.ubicaciones)) {
      const places = response.ubicaciones.map(
        (ubicacion: { id: number; ubicacion: string; lugar_farmacia: string; }) =>
          new Place(ubicacion.id.toString(), ubicacion.ubicacion, ubicacion.lugar_farmacia === null ? '' : ubicacion.lugar_farmacia)
      );
      return places;
    }

    return [];
  };

  const getPlaceById = async (id: string): Promise<Place | null> => {
    const places = await getPlaces();
    const place = places.find((place_get) => place_get.id === id);
    return place || null;
  };

  return { getPlaces, getPlaceById, getPlaces_usuario };
};