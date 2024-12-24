import client from "../../coneccion/conection_actualizar.js";
import fs from 'fs/promises';

export async function actualizar() {
  try {
    const filePath = 'src\\database\\actualizaciones\\archivo_actualizaciones.sql'
    const sql = await fs.readFile(filePath, 'utf-8');
    const result = await client.query(sql);
    return result;
  } catch (error) {
    console.error(`Error al cargar el archivo SQL: ${error.message}`);
    throw error;
  }
}