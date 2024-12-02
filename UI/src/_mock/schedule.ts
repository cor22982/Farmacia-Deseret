import useToken from "src/hooks/useToken";
import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";


export class Schedule {
  id: number;

  horario_apertura: string;

  horario_cierre: string;
  
  id_proveedor: number;

  dia: number;

  constructor(
    id: number,
    horario_apertura: string,
    horario_cierre: string,
    id_proveedor: number,
    dia: number
  ) {
    this.id = id;
    this.horario_apertura = horario_apertura;
    this.horario_cierre = horario_cierre;
    this.id_proveedor = id_proveedor;
    this.dia = dia;
  }


  getDetails(): string {
    return `Abre a las: ${this.horario_apertura} y  Cierra a las: ${this.horario_cierre}`;
  }
}


export const useGetHorario_Proveedor = () => {
  const { llamado } = useApi(`${source_link}/horarios_byId`);
  const {token} = useToken();
  
  const getHorarios_Byid = async (provedor_id:number): Promise<Schedule[]> => {
    const body = { token, proveedor: provedor_id };
    const response = await llamado(body, "POST");

    if (response.success && Array.isArray(response.allhorarios)) {
      const horarios = response.allhorarios.map(
        (horario: { id: number; horario_apertura: string; horario_cierre: string; dia: number; }) =>
          new Schedule(horario.id, horario.horario_apertura, horario.horario_cierre, provedor_id, horario.dia )
      );
      return  horarios;
    }

    return [];
  };

  return { getHorarios_Byid };
};
