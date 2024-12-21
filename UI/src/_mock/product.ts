import useApi from "src/hooks/useApi";
import useToken from "src/hooks/useToken";
import source_link from "src/repository/source_repo";
import { Supplier} from "./supplier";
import { ProductDetail, useGetProduct_Details } from "./product_detail";
import { Place } from "./places";
import { PresentacionProducto, useGetPresentacionesProducto } from "./presentacion_producto";


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

  listpresentaciones: PresentacionProducto[];

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
    listpresentaciones: PresentacionProducto[],

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
    this.listpresentaciones = listpresentaciones;
  }
}


export const useGetProducts = () =>{
  const { llamado } = useApi(`${source_link}/getProducts`);
  const { llamado:imagen_get } = useApi(`${source_link}/getImage`);
  const {llamadowithoutbody} = useApi(`${source_link}/products_id`);
  const {llamadowithoutbody: get_productos} = useApi(`${source_link}/infoproductos`);
  const {llamadowithoutbody: get_productos_info} = useApi(`${source_link}/infoproductos_allinfo`);
  const {getPresentacionesProducto} = useGetPresentacionesProducto();
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
          const productos_presentaciones = await getPresentacionesProducto( product.id);
          const body2 = { image_product: product.imagen || '' };
          const response2 = product.imagen ? await imagen_get(body2, "POST") : { image: '' };

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
            product.imagen,
            productos_presentaciones,
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
      '',
      []
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
            '',
            []
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

  
  const getProductInfo_whitout = async (): Promise<Product[]> => {
    const response = await get_productos("GET");

    if (response.success && Array.isArray(response.productos)) {
      // Procesamos todos los productos con `Promise.all`
      const products = await Promise.all(
        response.productos.map(async (product: {
          id: number;
          nombre: string;
          forma_farmaceutica: string;
          imagen: string;
          pp: string;
          presentacion: string;
          proveedor_id_product: {
            id: number;
            nombre: string;
          };
        }) => {
          const supplier = new Supplier(
            product.proveedor_id_product.id,
            product.proveedor_id_product.nombre,
            '',
            '',
            '',
            0,
            true,
            '',
            '',
            [],
            ''
          );
          
          const productos_presentaciones = await getPresentacionesProducto( product.id);
          const body2 = { image_product: product.imagen || '' };
          const response2 = product.imagen ? await imagen_get(body2, "POST") : { image: '' };

          return new Product(
            product.id,
            product.nombre,
            product.forma_farmaceutica,
            '',
            response2.image,
            0,
            Number(product.pp),
            product.presentacion,
            '',
            0,
            false,
            supplier,
            0,
            '',
            [],
            product.imagen,
            productos_presentaciones
          );
        })
      );

      return products;
    }

    return [];
  };

  const getProductInfo_whitout_info = async (): Promise<Product[]> => {
    const response = await get_productos_info("GET");

    if (response.success && Array.isArray(response.productos)) {
      // Procesamos todos los productos con `Promise.all`
      const products = await Promise.all(
        response.productos.map(async (product: {
          id: number;
          nombre: string;
          forma_farmaceutica: string;
          descripcion_uso: string;
          pp: number;
          imagen: string;
          presentacion: string;
          principio_activo: string;
          existencias: number;
          proveedor_id_product: {
            id: number;
            nombre: string;
          };
          product_details: Array<{
            id: number;
            cantidad: number;
            fecha_compra: string;
            fecha_vencimiento: string;
            ubicacion_product_detail: {
              id: number;
              ubicacion: string;
              lugar_farmacia: string;
            };
          }>;
        }) => {
          const supplier = new Supplier(
            product.proveedor_id_product?.id || 0, // Usar 0 si `id` no existe
            product.proveedor_id_product?.nombre || "Desconocido",
            '',
            '',
            '',
            0,
            true,
            '',
            '',
            [],
            ''
          );
          
          const productos_presentaciones = await getPresentacionesProducto(product.id);
          
          const body2 = { image_product: product.imagen || '' };
          const response2 = product.imagen ? await imagen_get(body2, "POST") : { image: '' };

          const productDetails = product.product_details.map(detail => {
            const place = new Place(
              detail.ubicacion_product_detail.id.toString(),
              detail.ubicacion_product_detail.ubicacion,
              detail.ubicacion_product_detail.lugar_farmacia
            );
            return new ProductDetail(
              detail.id,
              detail.cantidad,
              detail.fecha_compra,
              detail.fecha_vencimiento,
              0,
              product.id,
              place
            );
          });
          
          return new Product(
            product.id,
            product.nombre,
            product.forma_farmaceutica,
            product.descripcion_uso,
            response2.image,
            0,
            Number(product.pp),
            product.presentacion,
            '',
            product.existencias,
            false,
            supplier,
            0,
            '',
            productDetails,
            product.imagen,
            productos_presentaciones
          );
        })
      );

      return products;
    }

    return [];
  };
  return { getProductInfo, getGanancia ,  getProducts_OnlyId, getOneProductById, getProductInfo_whitout, getProductInfo_whitout_info};

}