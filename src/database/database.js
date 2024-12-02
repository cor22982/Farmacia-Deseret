import User from "../entityes/user.js";
import Ubicacion from "../entityes/ubicacion.js";
import {Supplier, Schedule} from "../entityes/relationships.js";
import { response } from "express";

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
      attributes: ['id','ubicacion'],
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

export async function getProveedoresConHorarios() {
  try {
    const proveedores = await Supplier.findAll({
      include: {
        model:Schedule,
        as: 'horarios',
      },
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

export async function insertarUbicacion(nuevaUbicacion) {
  try {
    const resultado = await Ubicacion.create({
      ubicacion: nuevaUbicacion,
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