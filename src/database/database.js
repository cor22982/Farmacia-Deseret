import User from "../entityes/user.js";
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
