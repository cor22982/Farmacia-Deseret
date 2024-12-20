import express, { response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { getUsers, verifyUserCredentials, 
  insertarUbicacion, getUbicaciones, 
  insertarSupplier, insertarHorario, 
  getHorarios_byId, getProveedoresConHorarios, getProveedores_id,
  insertarProducto, insertarProducto_Details, actualizarPP,
  getInfoId, getProductDetails, getProduct, getProduct_id, 
  insertarCarrito, getCarritos , getCarritoId, 
  AgregarProductosCarrito, getCarritoProducts, 
  insertarPago, getPagos_bycarrito, insertarPresentaciones, obtenerPresentaciones} from './database/database.js';

import { deleteUbicacionById , deleteProveedoresById, 
  deleteProductsById, actualizarUbicaciones, 
  actualizarProveedor, deleteHorariosById, actualizarProducto,
  actualizarProducto_whitoutimage, deleteProductosCarrito, 
  deletePagoById, 
  deletePresentacionById} from './database/deletes_updates.js';  
import { getProduct_usuario, getProduct__info_usuario, 
  getUbicaciones_usuario, getDetailsProduct_user } from './database/usuario_methods.js';
import { generateToken, validateToken, decodeToken } from './coneccion/jwt.js';
import cors from 'cors';

// Middleware para procesar el cuerpo de las solicitudes JSON

const app = express();
const port = 3000;
dotenv.config({ path: 'src\\.env' });
const corsOptions = {
  origin: ['http://127.0.0.1:3000', 'http://localhost:4000', `${process.env.myip}:4000`],
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




//Obtener informacion producto

app.get('/infoproductos', async (req, res) => {
  try {
    const allproducto = await getProduct_usuario()
    res.status(200).json({ success: true, productos: allproducto});
  }catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/infoproductos_allinfo', async (req, res) => {
  try {
    const producto = await getProduct__info_usuario();
    res.status(200).json({ success: true, productos: producto});
  }catch (error) {
    console.error('Error al obtener el producto:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/carritonuevo', async (req, res) => {
  try {
    const carrito = await insertarCarrito();
    res.status(200).json({ success: true, carrito: carrito});
  }catch (error) {
    console.error('Error al obtener el carrito nuevo:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/getcarritos', async (req, res) => {
  try {
    const carritos = await getCarritos();
    res.status(200).json({ success: true, carritos: carritos});
  }catch (error) {
    console.error('Error al obtener el carrito nuevo:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});


app.post('/getcarritoid', async (req, res) => {
  try {
    const carrito = await getCarritoId(Number(req.body.id));
    res.status(200).json({ success: true, carrito: carrito });
  }catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.post('/getcarritoproducts', async (req, res) => {
  try {
    const productos_carrito = await getCarritoProducts(req.body.id_carrito);
    res.status(200).json({ success: true, productos_carrito: productos_carrito });
  }catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});


app.post('/agregar_carrito', async (req, res) => {
  try {
    let respuesta = null;
    if (req.body.opcion === 'uno'){
      const {carrito , producto} = req.body;
      
      respuesta = await AgregarProductosCarrito(carrito , producto , 1);
      if (respuesta === true) {

        res.status(200).json({ success: true, message: 'Se inserto de manera correcta' });
      }else{
        res.status(200).json({ success: false, message: 'No se inserto de manera correcta' });
      }
    }else if (req.body.opcion === 'varios'){
      const {carrito , producto , cantidad} = req.body
      respuesta = await AgregarProductosCarrito(carrito , producto , cantidad);
      if (respuesta === true) {

        res.status(200).json({ success: true, message: 'Se inserto de manera correcta' });
      }else{
        res.status(200).json({ success: false, message: 'No se inserto de manera correcta' });
      }
    }
    
  }catch (error) {
    console.error('Error al obtener el carrito:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.get('/ubicaciones_usuario', async (req, res) => {
  try {
    const ubicaciones = await getUbicaciones_usuario();
    res.status(200).json({ success: true, ubicaciones: ubicaciones});
  }catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});


app.post('/getDetails_user', async (req, res) => {
  try {
    const details_user = await getDetailsProduct_user(req.body.id);
    res.status(200).json({ success: true, details_user: details_user});
  }catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});


app.post('/getPagosCarrito', async (req, res) => {
  try {
    const pagos = await getPagos_bycarrito(req.body.id_carrito);
    res.status(200).json({ success: true, pagos});
  }catch (error) {
    console.error('Error al obtener pagos:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});


app.post('/insertMetodo_Pago', async(req, res) => {
  try {
    const { pago, tipo, id_carrito } = req.body;
    const response = await insertarPago(pago, tipo, id_carrito);
    if (response) {
      res.status(200).json({ success: true, message: 'Se inserto de manera exitosa'});
    } else {
      res.status(401).json({ success: false, message: 'No se inserto de manera exitosa'});
    }
    
  } catch (error) {
    console.error('Error al insertar el metodo de pago:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
  
});

app.post('/insertProductDetails_usuario', async(req, res) => {
  try {
    const { cantidad, fechac, fechav, costo, id_product, id_ubicacion } = req.body;
    const response = await insertarProducto_Details(cantidad, fechac, fechav, costo, id_product, id_ubicacion);
    if (response) {
      res.status(200).json({ success: true, message: 'Se inserto de manera exitosa'});
    } else {
      res.status(401).json({ success: false, message: 'No se inserto de manera exitosa'});
    }
    
  } catch (error) {
    console.error('Error al insertar el producto details:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
  
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



app.post('/presentaciones', async (req, res) => {
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    if (validate_token && rol ==='admin'){
      const  allpresentaciones = await obtenerPresentaciones()
      res.status(200).json({ success: true, presentaciones: allpresentaciones});      
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para obtener las presentaciones'});
    }
  }catch (error) {
    console.error('Error al obtener las presentaciones:', error);
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


app.post('/insertPresentaciones', async (req, res) => {
  try {
    const {rol} = await decodeToken(req.body.token)
    const validate_token = await validateToken(req.body.token)
    if (validate_token && rol ==='admin'){
      const {nombre, descripcion} = req.body
      const response = await insertarPresentaciones(nombre, descripcion) ;
      if (response) {
        res.status(200).json({ success: true, message: 'Se inserto de manera exitosa'});
      } else {
        res.status(401).json({ success: false, message: 'No se inserto de manera exitosa'});
      }
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para insertar'});
    }

    
  } catch (error) {
    console.error('Error al insertar la presentacion:', error);
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


// DELETE

app.delete('/deleteubicacion', async(req,res)=>{
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    if (validate_token && rol ==='admin'){
      await deleteUbicacionById(req.body.id);
      res.status(200).json({ success: true, message: 'Se elimino la ubicacion'});
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para eliminar'});
    }
  }catch (error) {
    console.error('Error al obtener al eliminar:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
})


app.delete('/delepresentacion', async(req,res)=>{
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    if (validate_token && rol ==='admin'){
      await deletePresentacionById(req.body.id);
      res.status(200).json({ success: true, message: 'Se elimino la presentacion'});
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para eliminar'});
    }
  }catch (error) {
    console.error('Error al obtener al eliminar:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
})

app.delete('/deleteproveedores', async(req,res)=>{  
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    if (validate_token && rol ==='admin'){
      await deleteProveedoresById(req.body.id);
      res.status(200).json({ success: true, message: 'Se elimino el provedor'});
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para eliminar'});
    }
  }catch (error) {
    console.error('Error al obtener al eliminar:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
})


app.delete('/deletehorarios', async(req,res)=>{  
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    if (validate_token && rol ==='admin'){
      await deleteHorariosById(req.body.id);
      res.status(200).json({ success: true, message: 'Se elimino el horario'});
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para eliminar'});
    }
  }catch (error) {
    console.error('Error al obtener al eliminar:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
})


app.delete('/deleteproductoscarritos', async(req,res)=>{  
  try {
      await deleteProductosCarrito(req.body.id_carrito, req.body.id_product);
      res.status(200).json({ success: true, message: 'Se elimino el producto'});
  }catch (error) {
    console.error('Error al eliminar producto del carrito:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
})



app.delete('/deletepago', async(req,res)=>{  
  try {
      await deletePagoById(req.body.id);
      res.status(200).json({ success: true, message: 'Se elimino el pago'});
  }catch (error) {
    console.error('Error al eliminar el pago del carrito:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
})

app.delete('/deleteproducts', async(req,res)=>{  
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    if (validate_token && rol ==='admin'){
      await deleteProductsById(req.body.id);
      res.status(200).json({ success: true, message: 'Se elimino el producto'});
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para eliminar'});
    }
  }catch (error) {
    console.error('Error al obtener al eliminar:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
})


// UPDATE

app.put('/updateUbicaciones', async(req,res)=>{  
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    const {id, nuevaUbicacion, lugarf} = req.body
    if (validate_token && rol ==='admin'){
      await actualizarUbicaciones(id, nuevaUbicacion, lugarf);
      res.status(200).json({ success: true, message: 'Se actualizo la ubicacion'});
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para actualizar'});
    }
  }catch (error) {
    console.error('Error al obtener al actualizar:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
})


app.put('/updateProveedor', async(req,res)=>{  
  try {
    const validate_token = await validateToken(req.body.token)
    const {rol} = await decodeToken(req.body.token)
    const {id, nombre, direccion, telefono, proveedorid, contacto, contacto2} = req.body
    if (validate_token && rol ==='admin'){
      await actualizarProveedor(id, nombre, direccion, telefono, proveedorid, contacto, contacto2);
      res.status(200).json({ success: true, message: 'Se actualizo el proveedor'});
    } else{
      res.status(401).json({ success: false, message: 'No tienes permisos para actualizar'});
    }
  }catch (error) {
    console.error('Error al obtener al actualizar:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
})


app.put('/updateProduct', upload.single('file'), async (req, res) => {
  try {
    const { rol } = await decodeToken(req.body.token);
    const validate_token = await validateToken(req.body.token);

    if (validate_token && rol === 'admin') {
      const { id, nombre, forma_f, presentacion, id_supplier, activo_principal, isControlado, descripcion, oldImage } = req.body;
      let response = null;

      // Si existe un archivo subido, definimos la ruta; de lo contrario, la dejamos como null.
      const fileName = req.file ? req.file.filename : null;

      if (oldImage !== '') {
        const oldImagePath = path.join('./imagenes_productos', oldImage);
        fs.unlink(oldImagePath, (err) => {
          if (err) {
            console.error('Error al eliminar la imagen antigua:', err);
          } else {
            console.log('Imagen antigua eliminada:', oldImage);
          }
        });
      }

      // Llamamos la función correspondiente dependiendo de si hay un nuevo archivo o no.
      if (fileName) {
        response = await actualizarProducto(id, nombre, forma_f, presentacion, id_supplier, activo_principal, isControlado, descripcion, fileName);
      } else {
        response = await actualizarProducto_whitoutimage(id, nombre, forma_f, presentacion, id_supplier, activo_principal, isControlado, descripcion);
      }

      if (response) {
        res.status(200).json({ success: true, message: 'Se actualizó de manera exitosa' });
      } else {
        res.status(401).json({ success: false, message: 'No se actualizó de manera exitosa' });
      }
    } else {
      res.status(401).json({ success: false, message: 'No tienes permisos para actualizar' });
    }
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
