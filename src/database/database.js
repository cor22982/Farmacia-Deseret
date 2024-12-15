import User from "../entityes/user.js";
import {Supplier, Schedule, Ubicacion, Product, ProductDetail, Car} from "../entityes/relationships.js";
import { response } from "express";


export async function insertarCarrito() {
  try {
    const fechaHoraActual = new Date();


    const hora = fechaHoraActual.toLocaleTimeString('es-ES', { hour12: false })
    const fecha = fechaHoraActual.toISOString();

    const resultado = await Car.create({
      total: 0,
      hora: hora,
      fecha: fecha,
    });

    console.log('Se insertó con el id:', resultado.id);
    return resultado.id;
  } catch (error) {
    console.error('Error al insertar el carrito:', error);
    return null;
  }
}

export async function getCarritos() {
  try{
    const carritos = await Car.findAll({});
    return carritos;
  }catch (error) {
    throw error;
  }
}


export async function getCarritoId(id) {
  try{
    const carrito = await Car.findOne({
      where: { id: id }
    });
    return carrito;
  }catch (error) {
    console.error('Error al obtener el carrito:', error);
    throw error;
  }
}

export async function getUsers() {
  try{
    const users = await User.findAll({
      attributes: ['user_name'],
    });
    const userNames = users.map(user => user.user_name);
    console.log('Nombres de los usuarios:', userNames);
    return userNames;
  }catch (error) {
    console.error('Error al obtener los nombres de los usuarios:', error);
    throw error;
  }
}

export async function getUbicaciones() {
  try{
    const places = await Ubicacion.findAll({
      attributes: ['id','ubicacion', 'lugar_farmacia'],
    });
    return places;
  }catch (error) {
    throw error;
  }
}

export async function getHorarios_byId(proveedor) {
  try{
    const horarios = await Schedule.findAll({
      attributes: ['id','dia', 'horario_apertura', 'horario_cierre'],
      where: {
        id_proveedor: proveedor,
      }
    });
    return horarios;
  }catch (error) {
    throw error;
  }
}


export async function getProveedores_id() {
  try{
    const proveedores = await Supplier.findAll({
      attributes: ['id','nombre'],
    });
    return proveedores;
  }catch (error) {
    throw error;
  }
}

export async function getProduct_id() {
  try{
    const products = await Product.findAll({
      attributes: ['id','nombre'],
    });
    return products;
  }catch (error) {
    throw error;
  }
}

export async function getProveedoresConHorarios() {
  try {
    const proveedores = await Supplier.findAll({
      include: [
        {
          model: Schedule,
          as: 'horarios',
        },
        {
          model: Supplier, // Relación con proveedor alternativo
          as: 'alternativo',
          attributes: ['nombre'], // Solo trae el atributo `nombre`
        },
      ],
    });
    return proveedores;
  } catch (error) {
    console.error('Error al obtener proveedores con horarios:', error);
    throw error;
  }
}





export async function verifyUserCredentials(userName, password) {
  try {
    const user = await User.findOne({
      where: { user_name: userName },
    });

    if (!user) {
      console.log('Usuario no encontrado');
      return { success: false, message: 'Usuario no encontrado', role: null };
    }

    // Comparar la contraseña proporcionada con la almacenada
    if (user.password === password) {
      console.log('Credenciales válidas');
      return { success: true, message: 'Credenciales válidas', role: user.rol };
    } else {
      console.log('Contraseña incorrecta');
      return { success: false, message: 'Contraseña incorrecta', role: null };
    }
  } catch (error) {
    console.error('Error al verificar las credenciales:', error);
    throw error;
  }
}

export async function insertarUbicacion(nuevaUbicacion, lugarf) {
  try {
    const resultado = await Ubicacion.create({
      ubicacion: nuevaUbicacion,
      lugar_farmacia: lugarf
    });
    console.log('Registro insertado:', resultado);
    return true;
  } catch (error) {
    console.error('Error al insertar ubicación:', error);
    return false;
  }
}


export async function insertarHorario(dia, horario_a, horario_c, proveedor) {
  try {
    const response =  await  Schedule.create({
        dia: dia,
        horario_apertura: horario_a,
        horario_cierre: horario_c,
        id_proveedor: proveedor
    });
    console.log('Se inserto de manera exitosa',response)
    return true;
  } catch (error) {
    console.error('Error al insertar ubicación:', error);
    return false;
  }
}


export async function insertarSupplier(nombre, direccion, telefono, proveedor_alternativo, contacto, segundo_contacto) {
  try {
    const resultado = await Supplier.create({
      nombre: nombre,
      direccion: direccion,
      tipo: '',
      telefono: telefono,
      proveedor_alternativo: proveedor_alternativo,
      estadisponible:true,
      contacto: contacto,
      contacto_2: segundo_contacto
    });
    console.error('Se inserto con el id:', resultado.id);
    return resultado.id;
  } catch (error) {
    console.error('Error al insertar ubicación:', error);
    return null;
  }
}

export async function insertarProducto(nombre, forma_f, presentacion, id_supplier, activo_principal, isControlado, descripcion, imagen) {
  try {
    const resultado = await Product.create({
      nombre: nombre,
      forma_farmaceutica: forma_f,
      descripcion_uso: descripcion,
      imagen: imagen,
      costo: 0,
      pp:0,
      presentacion: presentacion,
      principio_activo: activo_principal,
      existencias: 0,
      controlado: isControlado,
      proveedor: id_supplier,
      ganancia: 0,
      tipo: 'normal'
    });
    console.error('Se inserto con el id:', resultado.id);
    return resultado.id;
  } catch (error) {
    console.error('Error al insertar el producto:', error);
    return null;
  }
}


export async function insertarProducto_Details(cantidad, fechac, fechav, costo, id_product, id_ubicacion) {
  try {
    const resultado = await ProductDetail.create({
      cantidad: cantidad,
      fecha_compra: fechac,
      fecha_vencimiento: fechav,
      costo: costo,
      id_product: id_product,
      ubicacion_id: id_ubicacion
    });
    console.error('Se inserto con el id:', resultado.id);
    return true;
  } catch (error) {
    console.error('Error al insertar los detalles del producto:', error);
    return false;
  }
}


export async function actualizarPP(id, pp) {
  try {
    const [updatedRows] = await Product.update({
      pp: pp
    }, {
      where: { id: id }
    });

    if (updatedRows === 0) {
      console.error('No se encontró ningún registro con el id proporcionado.');
      return false;
    }

    console.log('Se actualizó el registro con id:', id);
    return true;
  } catch (error) {
    console.error('Error al actualizar los detalles del producto:', error);
    return false;
  }
}


export async function getInfoId(id) {
  try{
    const products = await Product.findOne({
      attributes: ['id','ganancia', 'costo','pp'],
      where: { id: id }
    });
    console.log('Se otuvo los productos:');
    return products;
  }catch (error) {
    console.error('Error al obtener los nombres de los usuarios:', error);
    throw error;
  }
}


export async function getProductDetails(id) {
  try{
    const products = await ProductDetail.findAll({
      attributes: ['id', 'cantidad', 'fecha_compra', 'fecha_vencimiento', 'costo'],
      where: { id_product: id },
      include: [
        {
          model: Ubicacion,
          as: 'ubicacion_product_detail',
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


export async function getProduct() {
  try{
    const products = await Product.findAll({
      include: [
        {
          model: Supplier,
          as: 'proveedor_id_product',
          attributes: ['id', 'tipo', 'proveedor_alternativo', 'estadisponible', 'nombre'],
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
