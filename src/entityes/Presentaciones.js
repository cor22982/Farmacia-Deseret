import { Sequelize, DataTypes } from 'sequelize';
import sequelize from '../coneccion/conn.js';

const Presentaciones = sequelize.define('presentaciones', {
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'presentaciones',
  timestamps: false,
});

export default Presentaciones;
