import { Sequelize, DataTypes } from 'sequelize';
import  sequelize from '../coneccion/conn.js';
import Supplier from './supplier.js';

const Schedule = sequelize.define('horario', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  dia: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  horario_apertura: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  horario_cierre: {
    type: DataTypes.TIME,
    allowNull: true,
  },
  id_proveedor: {
    type: DataTypes.INTEGER,
    allowNull: false,
  }
}, {
  tableName: 'horario',
  timestamps: false,
});


export default Schedule;