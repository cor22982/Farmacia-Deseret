import { Sequelize, DataTypes } from 'sequelize';
import  sequelize from '../coneccion/conn.js';
 
const Venta = sequelize.define('venta', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  jornada: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cantidad:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  fecha:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  product:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isoferta:{
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  id_carrito:{
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  

}, {
  tableName: 'venta',
  timestamps: false,    // Desactiva `createdAt` y `updatedAt` si no los usas
});


export default Venta;