import { Sequelize, DataTypes } from 'sequelize';
import  sequelize from '../coneccion/conn.js';
 
const Ubicacion = sequelize.define('ubicaciones', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  ubicacion: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'ubicaciones',
  timestamps: false,    // Desactiva `createdAt` y `updatedAt` si no los usas
});


export default Ubicacion;