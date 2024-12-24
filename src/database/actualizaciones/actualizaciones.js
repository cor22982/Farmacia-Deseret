import client from "../../coneccion/conection_actualizar.js";
import fs from 'fs/promises';
import dotenv from 'dotenv';

const envPath = 'src\\database\\actualizaciones\\.env';

// Función para leer directamente una variable del archivo .env
const getEnvVariable = async (key) => {
  try {
    const envFileContent = await fs.readFile(envPath, 'utf-8');
    const envLine = envFileContent.split('\n').find((line) => line.startsWith(`${key}=`));
    if (envLine) {
      return envLine.split('=')[1].trim();
    }
    return null;
  } catch (error) {
    console.error(`Error al leer el archivo .env: ${error.message}`);
    return null;
  }
};

// Función para modificar una variable en el archivo .env
const modifyEnvVariable = async (key, value) => {
  try {
    // Leer el contenido del archivo .env
    const envFileContent = await fs.readFile(envPath, 'utf-8');

    // Actualizar la variable en el archivo
    const updatedContent = envFileContent
      .split('\n')
      .map((line) => {
        if (line.startsWith(`${key}=`)) {
          return `${key}=${value}`;
        }
        return line;
      })
      .join('\n');

    // Guardar el archivo actualizado
    await fs.writeFile(envPath, updatedContent, 'utf-8');

    // Recargar las variables desde el archivo .env
    dotenv.config({ path: envPath });
  } catch (error) {
    console.error(`Error al modificar el archivo .env: ${error.message}`);
    throw error;
  }
};

// Función principal para actualizar
export async function actualizar() {
  try {
    const filePath = 'src\\database\\actualizaciones\\archivo_actualizaciones.sql';
    const versionNueva = '1';

    // Leer la versión actual directamente desde el archivo .env
    const versionActual = await getEnvVariable('version');
    console.log('Versión actualizada del archivo .env:', versionActual);

    if (versionActual !== versionNueva) {
      // Leer y ejecutar el archivo SQL
      const sql = await fs.readFile(filePath, 'utf-8');
      const result = await client.query(sql);

      // Actualizar la versión en el archivo .env
      await modifyEnvVariable('version', versionNueva);
      return result;
    } else {
      console.log('No es necesario actualizar. La versión ya está actualizada.');
      return null;
    }
  } catch (error) {
    console.error(`Error al cargar el archivo SQL: ${error.message}`);
    throw error;
  }
}
