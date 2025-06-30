import User from "../entityes/user.js";
import {Supplier, Schedule, Ubicacion, Product, ProductDetail} from "../entityes/relationships.js";
import { Op, literal } from "sequelize";




export async function getProduct__info_usuario(offset = 0, limit = 10, search = '', filter = '') {
  try {
    // Obtener todos los productos si hay filtros especiales
    if (filter === 'bodega' || filter === 'existencias') {
      const allProducts = await Product.findAll({
        include: [
          {
            model: ProductDetail,
            as: 'product_details',
            attributes: ['cantidad'],
            include: [
              {
                model: Ubicacion,
                as: 'ubicacion_product_detail',
                attributes: ['lugar_farmacia'],
              }
            ]
          }
        ]
      });

      let filtered = [];

      if (filter === 'bodega') {
        filtered = allProducts.filter((product) => {
          const totalFarmacia = product.product_details
            .filter((d) => d.ubicacion_product_detail.lugar_farmacia !== 'bodega')
            .reduce((sum, d) => sum + d.cantidad, 0);
          return totalFarmacia < 2;
        });
      }

      if (filter === 'existencias') {
        filtered = allProducts.filter((product) => {
          const total = product.product_details.reduce((sum, d) => sum + d.cantidad, 0);
          return total < 2;
        });
      }

      return filtered.slice(offset, offset + limit);
    }

    // Lógica por defecto: búsqueda por texto o proveedor
    const isNumeric = !isNaN(search);
    const proveedorId = isNumeric ? parseInt(search) : null;

    const where = search
      ? {
          [Op.or]: [
            { nombre: { [Op.iLike]: `${search}%` } },
            { descripcion_uso: { [Op.iLike]: `%${search}%` } },
            ...(isNumeric ? [{ proveedor: proveedorId }] : []),
          ]
        }
      : undefined;

    const order = isNumeric
      ? [['id', 'ASC']]
      : [[
          literal(`CASE 
            WHEN "products"."nombre" ILIKE '${search}%' THEN 0 
            WHEN "products"."descripcion_uso" ILIKE '%${search}%' THEN 1 
            ELSE 2 
          END`),
          'ASC'
        ]];

    const products = await Product.findAll({
      where,
      attributes: [
        'id',
        'nombre',
        'forma_farmaceutica',
        'descripcion_uso',
        'pp',
        'imagen',
        'presentacion',
        'principio_activo',
        'existencias',
        'dosificacion',
        'accion_farmacologica',
        ...(isNumeric ? [] : [[
          literal(`CASE 
            WHEN "products"."nombre" ILIKE '${search}%' THEN 0 
            WHEN "products"."descripcion_uso" ILIKE '%${search}%' THEN 1 
            ELSE 2 
          END`), 'orden_prioridad'
        ]])
      ],
      include: [
        {
          model: Supplier,
          as: 'proveedor_id_product',
          attributes: ['nombre'],
        },
        {
          model: ProductDetail,
          as: 'product_details',
          attributes: ['id', 'cantidad', 'fecha_compra', 'fecha_vencimiento'],
          include: [
            {
              model: Ubicacion,
              as: 'ubicacion_product_detail',
              attributes: ['id', 'ubicacion', 'lugar_farmacia'],
            }
          ],
        },
      ],
      order,
      offset,
      limit,
    });

    return products;
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    throw error;
  }
}


export async function getProduct_usuario() {
  try{
    const products = await Product.findAll({
      attributes: ['id',
          'nombre',
          'forma_farmaceutica',
          'pp',
          'imagen',
          'presentacion',
          'dosificacion',
          'accion_farmacologica'
          ],
      include: [
        {
          model: Supplier,
          as: 'proveedor_id_product',
          attributes: ['id','nombre'],
        },
        
      ],
    });
   
    return products;
  }catch (error) {
    console.error('Error al obtener los productos:', error);
    throw error;
  }
}


export async function getUbicaciones_usuario() {
  try{
    const products = await Ubicacion.findAll();
    //console.log('Se otuvo las ubicaciones:');
    return products;
  }catch (error) {
    console.error('Error al obtener las ubicaciones:', error);
    throw error;
  }
}


export async function getDetailsProduct_user(id) {
  try{
    const products = await ProductDetail.findAll({
      attributes: ['id','cantidad', 'fecha_compra','fecha_vencimiento', 'costo'],
      include: [
        {
            model: Ubicacion,
            as: 'ubicacion_product_detail',
            attributes: ['id','ubicacion', 'lugar_farmacia'],
        }
      ],
      where: { id_product: id }
    });

    return products;
  }catch (error) {
    console.error('Error al obtener los nombres de los usuarios:', error);
    throw error;
  }
}
