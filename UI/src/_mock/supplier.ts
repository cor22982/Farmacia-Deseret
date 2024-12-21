import useToken from "src/hooks/useToken";
import useApi from "src/hooks/useApi";
import source_link from "src/repository/source_repo";
import { Schedule } from "./schedule";

export class Supplier {
  id: number;

  direccion: string;

  tipo: string | null;

  telefono: string;

  proveedor_alternativo: number | null;

  estadisponible: boolean;

  contacto: string;

  contacto_2: string | null;

  nombre: string;

  horarios: Schedule[];

  alternativo: string | null;

  constructor(
    id: number,
    nombre: string,
    direccion: string,
    tipo: string | null,
    telefono: string,
    proveedor_alternativo: number | null,
    estadisponible: boolean,
    contacto: string,
    contacto_2: string | null,
    horarios: Schedule[],
    alternativo: string | null
  ) {
    this.id = id;
    this.nombre = nombre;
    this.direccion = direccion;
    this.tipo = tipo;
    this.telefono = telefono;
    this.proveedor_alternativo = proveedor_alternativo;
    this.estadisponible = estadisponible;
    this.contacto = contacto;
    this.contacto_2 = contacto_2;
    this.horarios = horarios;
    this.alternativo = alternativo;
  }
}

export const useGetProveedores = () => {
  const { llamado } = useApi(`${source_link}/proveedores`);
  const { token } = useToken();
  const { llamado: proveedor_id } = useApi(`${source_link}/proveedores_byid`);
  
  const getProveedores_Complete = async (): Promise<Supplier[]> => {
    const body = { token };
    const response = await llamado(body, "POST");

    if (response.success && Array.isArray(response.proveedores)) {

      const proveedores = response.proveedores.map(
        (proveedor: {
          id: number;
          direccion: string;
          tipo: string;
          telefono: string;
          proveedor_alternativo: number;
          estadisponible: boolean;
          contacto: string;
          contacto_2: string;
          nombre: string;
          horarios: { id: number; dia: number; horario_apertura: string; horario_cierre: string; id_proveedor: number }[];
          alternativo: { nombre: string } | null;
        }) => {
          const horarios = proveedor.horarios && Array.isArray(proveedor.horarios) && proveedor.horarios.length > 0
            ? proveedor.horarios.map((horario) => new Schedule(
                horario.id,
                horario.horario_apertura,
                horario.horario_cierre,
                horario.id_proveedor,
                horario.dia,
              ))
            : [];

          return new Supplier(
            proveedor.id,
            proveedor.nombre,
            proveedor.direccion,
            proveedor.tipo,
            proveedor.telefono,
            proveedor.proveedor_alternativo,
            proveedor.estadisponible,
            proveedor.contacto,
            proveedor.contacto_2,
            horarios,
            proveedor.alternativo?.nombre || null
          );
        }
      );
      return proveedores;
    }
    
    return [];
  };

  const getProvedor_ById = async (): Promise<Supplier[]> => {
    const body = { token };
    const response = await proveedor_id(body, "POST");
    if (response.success && Array.isArray(response.proveedores)) {
      return response.proveedores.map(
        (proveedor: { id: number; nombre: string }) =>
          new Supplier(
            proveedor.id,
            proveedor.nombre,
            '',
            '',
            '',
            null,
            true,
            '',
            '',
            [],
            ''
          )
      );
    }
    return [];
  };

  const getOneSupplierById = async (id: number): Promise<Supplier | null> => {
    const suppliers = await getProveedores_Complete();
    const supplier = suppliers.find((supplier_get) => supplier_get.id === id);
    return supplier || null;
  }; 
  

  return { getProveedores_Complete, getProvedor_ById, getOneSupplierById };
};
 