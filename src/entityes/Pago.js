import { Sequelize, DataTypes } from 'sequelize';
import  sequelize from '../coneccion/conn.js';

const Pago = sequelize.define('metodo_pago', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  pago: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  id_carrito: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'metodo_pago',
  timestamps: false,
});


export default Pago;