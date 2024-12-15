import { Sequelize, DataTypes } from 'sequelize';
import  sequelize from '../coneccion/conn.js';

const Car = sequelize.define('carrito', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  
  total: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: true,
  },

}, {
  tableName: 'carrito',
  timestamps: false,
});


export default Car;