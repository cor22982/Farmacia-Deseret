import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../coneccion/conn.js';

const PresentacionProducto = sequelize.define('presentacion_producto', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  porcentaje_ganancia: {
    type: DataTypes.DECIMAL(5, 2), // numeric(5,2)
    allowNull: true,
  },
  pp: {
    type: DataTypes.DECIMAL(10, 2), // numeric(10,2)
    allowNull: true,
  },
  cantidad_presentacion: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  presentacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'presentacion_producto',
  timestamps: false,
});

export default PresentacionProducto;
