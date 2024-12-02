import express from 'express';
import { getUsers, verifyUserCredentials, 
  insertarUbicacion, getUbicaciones, insertarSupplier } from './database/database.js';
const app = express();
const port = 3000;
import { generateToken, validateToken } from './coneccion/jwt.js';

import cors from 'cors';
// Middleware para procesar el cuerpo de las solicitudes JSON


const corsOptions = {
  origin: ['http://127.0.0.1:3000', 'http://localhost:4000'], // Permite tanto el dominio de Netlify como el local
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Farmacia Deseret');
});


//GET
app.post('/ubicaciones', async (req, res) => {
  try {
    const validate_token = await validateToken(req.body.token)
    if (validate_token){
      const allubicaciones = await getUbicaciones()
      res.status(200).json({ success: true, ubicaciones: allubicaciones});      
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para obtener las ubicaciones'});
    }
  }catch (error) {
    console.error('Error al obtener las ubicacion:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

//POSTS

app.post('/insertUbicacion', async (req, res) => {
  try {  
    const validate_token = await validateToken(req.body.token)
    if (validate_token){
      const response = await insertarUbicacion(req.body.ubicacion);
      if (response) {
        res.status(200).json({ success: true, message: 'Se inserto de manera exitosa'});
      } else {
        res.status(401).json({ success: false, message: 'No se inserto de manera exitosa'});
      }
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para insertar'});
    }

    
  } catch (error) {
    console.error('Error al insertar la ubicacion:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});



app.post('/insertarSupplier', async (req, res) => {
  try {  
    const validate_token = await validateToken(req.body.token);
    const { nombre, direccion, telefono, proveedor_alternativo, contacto, segundo_contacto } = req.body;
    if (validate_token){
      const response = await insertarSupplier(nombre, direccion, telefono, proveedor_alternativo, contacto, segundo_contacto);
      if (response) {
        res.status(200).json({ success: true, message: 'Se inserto de manera exitosa', id: response});
      } else {
        res.status(401).json({ success: false, message: 'No se inserto de manera exitosa'});
      }
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para insertar'});
    }
   
  } catch (error) {
    console.error('Error al insertar el proveedor:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});



app.post('/login', async (req, res) => {
  try {
    let password_login = req.body.password;
    const uservalidate = await verifyUserCredentials(req.body.username, password_login);

    if (uservalidate.success) {
      res.status(200).json({ success: true, message: 'Inicio de sesión exitoso', acces_token: generateToken({ rol: uservalidate.role, username: req.body.username }) });
    } else {
      res.status(401).json({ success: false, message: 'Inicio de sesión no exitoso', acces_token: null });
    }

  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
