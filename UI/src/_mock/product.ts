import useApi from "src/hooks/useApi";
import useToken from "src/hooks/useToken";
import source_link from "src/repository/source_repo";
import { Supplier} from "./supplier";
import { ProductDetail, useGetProduct_Details } from "./product_detail";


export class Product {
  id: number;

  nombre: string;


  forma_farmaceutica: string;

  descripcion_uso: string;

  imagen: string;

  costo: number;

  pp: number;

  presentacion: string;

  principio_activo: string;

  existencias: number;

  controlado: boolean;

  proveedor: Supplier | null;

  ganancia: number;

  tipo: string;

  listdetails : ProductDetail[];

  nombre_image: string;

  constructor(
    id: number,
    nombre: string,
    forma_farmaceutica: string,
    descripcion_uso: string,
    imagen: string,
    costo: number,
    pp: number,
    presentacion: string,
    principio_activo: string,
    existencias: number,
    controlado: boolean,
    proveedor: Supplier | null,
    ganancia: number,
    tipo: string,
    listdetails: ProductDetail[],
    nombre_image: string,

  ) {
    this.id = id;
    this.nombre = nombre;
    this.forma_farmaceutica = forma_farmaceutica;
    this.descripcion_uso = descripcion_uso;
    this.imagen = imagen;
    this.costo = costo;
    this.pp = pp;
    this.presentacion = presentacion;
    this.principio_activo = principio_activo;
    this.existencias = existencias;
    this.controlado = controlado;
    this.proveedor = proveedor;
    this.ganancia = ganancia;
    this.tipo = tipo;
    this.listdetails = listdetails;
    this.nombre_image = nombre_image;
  }
}


export const useGetProducts = () =>{
  const { llamado } = useApi(`${source_link}/getProducts`);
  const { llamado:imagen_get } = useApi(`${source_link}/getImage`);
  const {llamadowithoutbody} = useApi(`${source_link}/products_id`);
  
  const { getDetails_ById } = useGetProduct_Details();
  const {token} = useToken();
  const { llamado: getGanancias_api } = useApi(`${source_link}/getProdutsGanancia`);

  const getProductInfo = async (): Promise<Product[]> => {
    const body = { token };
    const response = await llamado(body, "POST");

    if (response.success && Array.isArray(response.products)) {
      // Procesamos todos los productos con `Promise.all`
      const products = await Promise.all(
        response.products.map(async (product: {
          id: number;
          nombre: string;
          forma_farmaceutica: string;
          descripcion_uso: string;
          imagen: string;
          costo: string;
          pp: string;
          presentacion: string;
          principio_activo: string;
          existencias: number;
          controlado: boolean;
          proveedor: number;
          ganancia: string;
          tipo: string;
          proveedor_id_product: {
            id: number;
            tipo: string;
            proveedor_alternativo: number;
            estadisponible: boolean;
            nombre: string;
          };
        }) => {
          const supplier = new Supplier(
            product.proveedor_id_product.id,
            product.proveedor_id_product.nombre,
            '',
            product.proveedor_id_product.tipo,
            '',
            product.proveedor_id_product.proveedor_alternativo,
            product.proveedor_id_product.estadisponible,
            '',
            '',
            [],
            ''
          );

          const body2 = { image_product: product.imagen };
          const response2 = await imagen_get(body2, "POST");
          const product_details = await getDetails_ById(product.id);

          return new Product(
            product.id,
            product.nombre,
            product.forma_farmaceutica,
            product.descripcion_uso,
            response2.image,
            Number(product.costo),
            Number(product.pp),
            product.presentacion,
            product.principio_activo,
            product.existencias,
            product.controlado,
            supplier,
            Number(product.ganancia),
            product.tipo,
            product_details,
            product.imagen
          );
        })
      );

      return products;
    }

    return [];
  };

  const getGanancia = async (product_id:number): Promise<Product | null> => {
    const body = { token, id:product_id };
    const response = await getGanancias_api(body, "POST");

    if (response.success){
    const ganancia = new Product(
      product_id,
      '',
      '',
      '',
      '',
      Number(response.productinfoganancia.costo),
      Number(response.productinfoganancia.pp),
      '',
      '',
      0,
      true,
      null,
      Number(response.productinfoganancia.ganancia),
      '',
      [],
      ''
    )
    return ganancia
  }
    return null

  }

  const getProducts_OnlyId = async (): Promise<Product[]> => {

    const response = await llamadowithoutbody("GET");

    if (response.success && Array.isArray(response.products)) {
      // Procesamos todos los productos con `Promise.all`
      const products = await Promise.all(
        response.products.map(async (product: {
          id: number;
          nombre: string;
         
          
        }) =>  new Product(
            product.id,
            product.nombre,
            '',
            '',
            '',
            0,
            0,
            '',
            '',
            0,
            true,
            null,
            0,
            '',
            [],
            ''
          )
        )
      );

      return products;
    }

    return []

  }
  const getOneProductById = async (id: number): Promise<Product | null> => {
    const products = await getProductInfo();
    const product = products.find((product_get) => product_get.id === id);
    return product || null;
  };
  return { getProductInfo, getGanancia ,  getProducts_OnlyId, getOneProductById};

}