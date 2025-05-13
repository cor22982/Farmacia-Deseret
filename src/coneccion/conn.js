import dotenv from 'dotenv';
import pg from 'pg';
import { Sequelize, DataTypes } from 'sequelize';


dotenv.config({ path: 'src/coneccion/.env' });


const sequelize = new Sequelize(process.env.DATABASE, process.env.USERDB, process.env.PASSWORD, {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
