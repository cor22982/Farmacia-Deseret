import User from "../entityes/user.js";
import {Supplier, Schedule, Ubicacion, Product, ProductDetail} from "../entityes/relationships.js";

export async function getProduct__info_usuario() {
  try{
    const products = await Product.findAll({
      attributes: ['id',
          'nombre',
          'forma_farmaceutica',
          'descripcion_uso', 
          'pp',
          'imagen',
          'presentacion',
          'principio_activo',
          'existencias'],
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
                attributes: ['id','ubicacion', 'lugar_farmacia'],
            }
          ],
        },
      ],
    });
    console.log('Se otuvo los productos:');
    return products;
  }catch (error) {
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
          ],
      include: [
        {
          model: Supplier,
          as: 'proveedor_id_product',
          attributes: ['id','nombre'],
        },
        
      ],
    });
    console.log('Se otuvo los productos:');
    return products;
  }catch (error) {
    console.error('Error al obtener los productos:', error);
    throw error;
  }
}


export async function getUbicaciones_usuario() {
  try{
    const products = await Ubicacion.findAll();
    console.log('Se otuvo las ubicaciones:');
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
    console.log('Se otuvo los productos:');
    return products;
  }catch (error) {
    console.error('Error al obtener los nombres de los usuarios:', error);
    throw error;
  }
}
