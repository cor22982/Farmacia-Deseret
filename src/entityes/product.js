import { Sequelize, DataTypes } from 'sequelize';
import  sequelize from '../coneccion/conn.js';

const Product = sequelize.define('products', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  forma_farmaceutica: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  descripcion_uso: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  costo: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  pp: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  presentacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  principio_activo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  existencias: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  controlado: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  proveedor: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  ganancia: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  dosificacion: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  accion_farmacologica: {
    type: DataTypes.STRING,
    allowNull: true,
  },

}, {
  tableName: 'products',
  timestamps: false,
});


export default Product;