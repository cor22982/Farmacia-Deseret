import express from 'express';
import { getUsers, verifyUserCredentials } from './database/database.js';
const app = express();
const port = 3000;
import { generateToken } from './coneccion/jwt.js';
import { md5 } from "js-md5";

// Middleware para procesar el cuerpo de las solicitudes JSON
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Farmacia Deseret');
});

app.post('/login', async (req, res) => {
  try {
    let password_login = md5(req.body.password);
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
