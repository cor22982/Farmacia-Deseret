import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: 'src/coneccion/.env' });

const { Client } = pg;

const client = new Client({
  user: process.env.USERDB,
  host: 'localhost',
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: 5432,
});

client.connect()
  .then(() => console.log('Database connected successfully (Owner)'))
  .catch(err => console.error('Error connecting to the database (Owner):', err.stack));

export default client;
