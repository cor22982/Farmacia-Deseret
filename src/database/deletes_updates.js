import User from "../entityes/user.js";
import {Supplier, Schedule, Ubicacion, Product, ProductDetail} from "../entityes/relationships.js";

//Update Ubicaciones

export async function actualizarUbicaciones(id, nuevaUbicacion, lugarf) {
  try {
    const [updatedRows] = await Ubicacion.update({
      ubicacion: nuevaUbicacion,
      lugar_farmacia: lugarf
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
    console.error('Error al actualizar los detalles de la ubicacion:', error);
    return false;
  }
}


//Delete Ubicaciones
export async function deleteUbicacionById(id) {
  try {
    const deletedRows = await Ubicacion.destroy({
      where: { id }
    });

    if (deletedRows === 0) {
      throw new Error('Ubicación no encontrada');
    }

    return { message: 'Ubicación eliminada exitosamente' };
  } catch (error) {
    console.log(error)
    throw error;
  }
}


// Delete Prooveedores
export async function deleteProveedoresById(id) {
  try {
    const deletedRows = await Supplier.destroy({
      where: { id }
    });

    if (deletedRows === 0) {
      throw new Error('Proveedor no encontrada');
    }

    return { message: 'Proveedor eliminada exitosamente' };
  } catch (error) {
    console.log(error)
    throw error;
  }
}


// Delete Productos
export async function deleteProductsById(id) {
  try {
    const deletedRows = await Product.destroy({
      where: { id }
    });

    if (deletedRows === 0) {
      throw new Error('Producto no encontrada');
    }

    return { message: 'Producto eliminada exitosamente' };
  } catch (error) {
    console.log(error)
    throw error;
  }
}