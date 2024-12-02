import { Sequelize, DataTypes } from 'sequelize';
import  sequelize from '../coneccion/conn.js';
 
const Supplier= sequelize.define('proveedores', {
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
  direccion: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contacto: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  proveedor_alternativo: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  estadisponible: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  contacto_2: {
    type: DataTypes.STRING,
    allowNull: true,
  }
}, {
  tableName: 'proveedores',
  timestamps: false,
});


export default Supplier;