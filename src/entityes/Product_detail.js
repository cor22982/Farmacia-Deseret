import { Sequelize, DataTypes } from 'sequelize';
import  sequelize from '../coneccion/conn.js';

const ProductDetail = sequelize.define('productos_cantidades', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fecha_compra: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  fecha_vencimiento: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  costo: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  id_product: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  ubicacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'productos_cantidades',
  timestamps: false,
});


export default ProductDetail;