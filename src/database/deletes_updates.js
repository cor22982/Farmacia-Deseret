import User from "../entityes/user.js";
import {Supplier, Schedule, Ubicacion, Product, ProductDetail} from "../entityes/relationships.js";


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