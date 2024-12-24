import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ path: 'src\\coneccion\\.env' });

const { Client } = pg;

const client = new Client({
  user: process.env.user,
  host: 'localhost',
  database: process.env.database,
  password: process.env.password,
  port: 5432,
});

client.connect()
  .then(() => console.log('Database connected successfully (Owner)'))
  .catch(err => console.error('Error connecting to the database (Owner):', err.stack));

export default client;