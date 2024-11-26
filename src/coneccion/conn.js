import dotenv from 'dotenv';
import pg from 'pg';
import { Sequelize, DataTypes } from 'sequelize';


dotenv.config({ path: 'src\\coneccion\\.env' });


const sequelize = new Sequelize(process.env.database, process.env.user, process.env.password, {
  host: 'localhost',
  dialect: 'postgres',
});

export default sequelize;