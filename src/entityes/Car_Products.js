import { Sequelize, DataTypes } from 'sequelize';
import  sequelize from '../coneccion/conn.js';

const Car_Products = sequelize.define('carrito_productos', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  carrito: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  producto: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  presentacion:{
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'carrito_productos',
  timestamps: false,
});


export default Car_Products;