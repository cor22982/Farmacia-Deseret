import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { getUsers, verifyUserCredentials, 
  insertarUbicacion, getUbicaciones, 
  insertarSupplier, insertarHorario, 
  getHorarios_byId, getProveedoresConHorarios, getProveedores_id,
insertarProducto, insertarProducto_Details, actualizarPP,
getInfoId, getProductDetails, getProduct, getProduct_id } from './database/database.js';
  
import { generateToken, validateToken, decodeToken } from './coneccion/jwt.js';
import cors from 'cors';
// Middleware para procesar el cuerpo de las solicitudes JSON

const app = express();
const port = 3000;

const corsOptions = {
  origin: ['http://127.0.0.1:3000', 'http://localhost:4000'], // Permite tanto el dominio de Netlify como el local
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './imagenes_productos');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

app.use(cors(corsOptions));
const upload = multer({ storage });
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Farmacia Deseret');
});



//Upload Imagen

app.post('/upload', upload.single('file'), (req, res) => {
  const filePath = path.join('./imagenes_productos', req.file.filename);
  console.log(req.body)
  // Read the image file and encode it to base64
  fs.readFile(filePath, (err, data) => {
      if (err) {
          return res.status(500).json({ error: err });
      }
      
      // Encode the file to base64
      const base64Image = data.toString('base64');
      
      // Create the JSON response
      res.json({
          filename: req.file.filename,
          image: base64Image,
      });
  });
});


//GET

app.post('/getProdutsGanancia', async (req, res) => {
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    if (validate_token && rol ==='admin'){
      const allproductsdetails = await getInfoId(req.body.id);
      res.status(200).json({ success: true, message: 'Se obtuvo todas las ganancias', productinfoganancia: allproductsdetails});
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para obtener las ganancias'});
    }
  }catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.post('/getProductDetails', async (req, res) => {
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    if (validate_token && rol ==='admin'){
      const allproductsdetails = await getProductDetails(req.body.id);
      res.status(200).json({ success: true, message: 'Se obtuvo todos los detalles', productdetails: allproductsdetails});
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para obtener los detalles'});
    }
  }catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});


app.post('/getProducts', async (req, res) => {
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    if (validate_token && rol ==='admin'){
      const allproducts = await getProduct();
      res.status(200).json({ success: true, message: 'Se obtuvo todos los productos', products: allproducts});
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para obtener los productos'});
    }
  }catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});


app.post('/getImage',  (req, res) => {
  const { image_product } = req.body;
  const filePath = path.join('./imagenes_productos', image_product);
  fs.readFile(filePath, (err, data) => {
      if (err) {
          return res.status(500).json({ error: err });
      }
      
      // Encode the file to base64
      const base64Image = data.toString('base64');
      
      // Create the JSON response
      res.json({
          success: true,
          image: base64Image,
      });
  });
});

app.post('/ubicaciones', async (req, res) => {
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    if (validate_token && rol ==='admin'){
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


app.post('/proveedores', async (req, res) => {
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    if (validate_token && rol ==='admin'){
      const allsuppliers = await getProveedoresConHorarios()
      res.status(200).json({ success: true, proveedores: allsuppliers});
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para obtener los proveedores'});
    }
  }catch (error) {
    console.error('Error al obtener los proveedores:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});


app.post('/proveedores_byid', async (req, res) => {
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    if (validate_token && rol ==='admin'){
      const allsuppliers = await getProveedores_id()
      res.status(200).json({ success: true, proveedores: allsuppliers});
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para obtener los proveedores'});
    }
  }catch (error) {
    console.error('Error al obtener los proveedores:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});


app.get('/products_id', async (req, res) => {
  try {
    const allproducts = await getProduct_id()
    res.status(200).json({ success: true, products: allproducts});
  }catch (error) {
    console.error('Error al obtener los proveedores:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.post('/horarios_byId', async (req, res) => {
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    if (validate_token && rol ==='admin'){
      const allhorarios = await getHorarios_byId(req.body.proveedor)
      res.status(200).json({ success: true, allhorarios: allhorarios});      
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para obtener los horarios'});
    }
  }catch (error) {
    console.error('Error al obtener las ubicacion:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

//POSTS


app.post('/insertProduct', upload.single('file'), async(req, res) => {
  const filePath = path.join('./imagenes_productos', req.file.filename);

  try {
    const {rol} = await decodeToken(req.body.token)
    const validate_token = await validateToken(req.body.token)
    if (validate_token && rol ==='admin'){
      const { nombre, forma_f, presentacion, id_supplier, activo_principal, isControlado, descripcion} = req.body;
      const response = await insertarProducto(nombre, forma_f, presentacion, id_supplier, activo_principal, isControlado, descripcion, req.file.filename);
      if (response) {
        res.status(200).json({ success: true, message: 'Se inserto de manera exitosa', id: response});
      } else {
        res.status(401).json({ success: false, message: 'No se inserto de manera exitosa'});
      }
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para insertar'});
    }

    
  } catch (error) {
    console.error('Error al insertar el producto:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
  
});


app.post('/insertProductDetails', async(req, res) => {
  try {
    const {rol} = await decodeToken(req.body.token)
    const validate_token = await validateToken(req.body.token)
    if (validate_token && rol ==='admin'){
      const { cantidad, fechac, fechav, costo, id_product, id_ubicacion } = req.body;
      const response = await insertarProducto_Details(cantidad, fechac, fechav, costo, id_product, id_ubicacion);
      if (response) {
        res.status(200).json({ success: true, message: 'Se inserto de manera exitosa'});
      } else {
        res.status(401).json({ success: false, message: 'No se inserto de manera exitosa'});
      }
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para insertar'});
    }

    
  } catch (error) {
    console.error('Error al insertar el producto details:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
  
});


app.post('/insertUbicacion', async (req, res) => {
  try {
    const {rol} = await decodeToken(req.body.token)
    const validate_token = await validateToken(req.body.token)
    if (validate_token && rol ==='admin'){
      const response = await insertarUbicacion(req.body.ubicacion, req.body.lugar_farmacia);
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


app.post('/insertHorario', async (req, res) => {
  try {  
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    const {dia, horario_a, horario_c, proveedor}  = req.body;
    if (validate_token && rol ==='admin'){
      const response = await insertarHorario(dia, horario_a, horario_c, proveedor);
      if (response) {
        res.status(200).json({ success: true, message: 'Se inserto de manera exitosa'});
      } else {
        res.status(401).json({ success: false, message: 'No se inserto de manera exitosa'});
      }
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para insertar'});
    }

    
  } catch (error) {
    console.error('Error al insertar la horario:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});




app.post('/insertarSupplier', async (req, res) => {
  try {  
    const validate_token = await validateToken(req.body.token);
    const {rol} = await decodeToken(req.body.token)
    const { nombre, direccion, telefono, proveedor_alternativo, contacto, segundo_contacto } = req.body;
    if (validate_token && rol ==='admin'){
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

// UPDATES
app.put('/updatePP', async(req, res) => {
  try {
    const {rol} = await decodeToken(req.body.token)
    const validate_token = await validateToken(req.body.token)
    if (validate_token && rol ==='admin'){
      const {id, pp} = req.body;
      const response = await actualizarPP(id, pp)
      if (response) {
        res.status(200).json({ success: true, message: 'Se actualizo de manera exitosa'});
      } else {
        res.status(401).json({ success: false, message: 'No se actualizo de manera exitosa'});
      }
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para actualizar el PP'});
    }

    
  } catch (error) {
    console.error('Error al actualizar el pp:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
  
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});