import User from "../entityes/user.js";
import {
  Supplier, 
  Schedule, 
  Ubicacion, 
  Product, 
  ProductDetail, 
  Car, 
  Car_Products, 
  Pago, 
  Presentaciones,
  PresentacionProducto, Venta} from "../entityes/relationships.js";
import { response } from "express";
import { Sequelize } from 'sequelize';
import { Op } from "sequelize";



export async function insertVenta(jornada, 
                                  cantidad, 
                                  fecha, 
                                  product, 
                                  isOferta, 
                                  id_carrito,  
                                  id_producto_cantidad, 
                                  id_producto_presentacion) {

  try {
    const resultado = await Venta.create({
      jornada: jornada,
      cantidad: cantidad,
      fecha: fecha,
      product: product,
      isoferta: isOferta,
      id_carrito: id_carrito,
      id_producto_cantidad: id_producto_cantidad,
      id_producto_presentacion: id_producto_presentacion
    });

    const productos_cantidades = await ProductDetail.findOne({

      where:{id: id_producto_cantidad}
    })

    const mi_producto = await Product.findOne({

      where:{id: product}
    })


    const cantidad_restada_cantidades = parseInt(productos_cantidades.cantidad, 10) - parseInt(cantidad, 10);
    const cantidad_restada_productos = parseInt(mi_producto.existencias, 10) - parseInt(cantidad, 10);

    const [updatedRows] = await Product.update({
      existencias: cantidad_restada_productos
    }, {
      where:{id: product}
    });


    const [updatedRows_Detail]  = await ProductDetail.update({
      cantidad: cantidad_restada_cantidades
    }, {
      where:{id: id_producto_cantidad}
    })


    return resultado.id;
  }catch (error) {
    console.error('Error al insertar la venta:', error);
    return null;
  }
}

export async function insertarPago(pago, tipo, id_carrito) {
  try {
    const resultado = await Pago.create({
      pago: pago,
      tipo: tipo,
      id_carrito: id_carrito,
    });

    console.log('Se insertó con el id:', resultado.id);
    return resultado.id;
  } catch (error) {
    console.error('Error al insertar el pago:', error);
    return null;
  }
}


export async function insertarPresentacionProducto(pp, cantidad_presentacion, presentacion_id, product_id, imagen_presentacion) {
  try {
    const resultado = await PresentacionProducto.create({
      pp,
      cantidad_presentacion,
      presentacion_id,
      product_id,
      imagen_presentacion,
    });

    console.log('Se insertó con el id:', resultado.id);
    return resultado.id;
  } catch (error) {
    console.error('Error al insertar la presentación del producto:', error);
    return null;
  }
}


export async function insertarPresentaciones(nombre, descripcion) {
  try {
    const resultado = await Presentaciones.create({
      nombre: nombre,
      descripcion: descripcion,
    });

    console.log('Se insertó con el id:', resultado.id);
    return resultado.id;
  } catch (error) {
    console.error('Error al insertar la presentación:', error);
    return null;
  }
}

export async function obtenerPresentaciones() {
  try {
    const resultados = await Presentaciones.findAll();
    return resultados;
  } catch (error) {
    console.error('Error al obtener las presentaciones:', error);
    return [];
  }
}

export async function getSalesThisWeek(startDate, endDate) {
  try {
    const products = await Product.findAll({
      attributes: ["id", "nombre", "existencias"],
      raw: true,
    });

    const sales = await Venta.findAll({
      where: {
        fecha: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Product,
          as: "venta_product",
          attributes: ["id", "nombre", "existencias"],
        },
        {
          model: ProductDetail,
          as: "venta_producto_cantidad",
          attributes: ["id", "fecha_compra", "fecha_vencimiento"],
        },
        {
          model: PresentacionProducto,
          as: "venta_presentacion",
          attributes: ["pp", "cantidad_presentacion"],
        },
      ],
      attributes: ["jornada", "cantidad", "fecha"],
      raw: true,
    });

    const jornadaMap = {
      "LUNES-AM": 0, "LUNES-PM": 1,
      "MARTES-AM": 2, "MARTES-PM": 3,
      "MIERCOLES-AM": 4, "MIERCOLES-PM": 5,
      "JUEVES-AM": 6, "JUEVES-PM": 7,
      "VIERNES-AM": 8, "VIERNES-PM": 9,
      "SABADO": 10
    };

    const grouped = {};

    const formatMonthYear = (dateString) => {
      const date = new Date(dateString);
      const month = date.toLocaleString("es-ES", { month: "long" });
      const year = date.getFullYear().toString().slice(-2);
      return `${month} - ${year}`;
    };

    // Inicializar grouped con los productos
    products.forEach((product) => {
      grouped[product.id] = {
        productId: product.id,
        producto: product.nombre,
        existencias: product.existencias,
        ventasPorDia: Array(11).fill(0),
        totalCantidadSemana: 0,
        presentacion: null,
        presentacionCantidad: null,
        ventasPorSemana: [0, 0, 0, 0], // 4 semanas
        fecha_compra: '',
        fecha_vencimiento: '',
      };
    });

    // Procesar ventas de la primera consulta (sales)
    sales.forEach((sale) => {
      const productId = sale["venta_product.id"];
      const jornada = sale.jornada;
      const cantidad = sale.cantidad;
      const presentacion = sale["venta_presentacion.pp"];
      const presentacionCantidad = sale["venta_presentacion.cantidad_presentacion"];
      const fecha = new Date(sale.fecha);
      
      const mesInicio = new Date(startDate).getMonth();
      const mesVenta = fecha.getMonth();
      
      // Verifica si la venta es del mes de inicio
      if (mesInicio === mesVenta) {
        if (!grouped[productId]) {
          grouped[productId] = {
            productId: productId,
            ventasPorDia: Array(11).fill(0),
            ventasPorSemana: Array(4).fill(0), // 4 semanas
            totalCantidadSemana: 0,
            producto: sale["venta_product.nombre"],
            presentacion: null,
            presentacionCantidad: null,
          };
        }

        const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1); // Primer día del mes
        const primerLunes = new Date(primerDiaMes);
        primerLunes.setDate(primerDiaMes.getDate() + (primerDiaMes.getDay() === 0 ? 1 : 8 - primerDiaMes.getDay())); // Primer lunes del mes
    
        const diasDesdePrimerLunes = (fecha - primerLunes) / (1000 * 3600 * 24); // Diferencia en días
        let semanaIndex = Math.floor(diasDesdePrimerLunes / 7); // Calculamos la semana (0-3)
    
        // Ajuste para manejar casos en los que la fecha esté fuera del rango (antes del primer lunes o después de 4 semanas)
        if (semanaIndex < 0) {
          semanaIndex = 0; // Si la fecha cae antes del primer lunes
        } else if (semanaIndex > 3) {
          semanaIndex = 3; // Si la fecha está más allá de las 4 semanas del mes
        }

        // Procesamos la venta para ese productId
        const index = jornadaMap[jornada] ?? -1;
        if (index !== -1) {
          grouped[productId].ventasPorDia[index] += cantidad;
        }
        grouped[productId].totalCantidadSemana += cantidad;
        grouped[productId].presentacion = presentacion;
        grouped[productId].presentacionCantidad = presentacionCantidad;
        grouped[productId].fecha_compra = formatMonthYear(sale["venta_producto_cantidad.fecha_compra"]);
        grouped[productId].fecha_vencimiento = formatMonthYear(sale["venta_producto_cantidad.fecha_vencimiento"]);
      }
    });

    // Procesar ventas de la segunda consulta (sales_all)
    await Promise.all(
      products.map(async (product) => {
        const sales_all = await Venta.findAll({
          where: {
            "product": product.id,
          },
          attributes: ["cantidad", "fecha"],
          raw: true,
        });

        sales_all.forEach((sale) => {
          const productId = product.id; // Usamos el id del producto del bucle anterior
          const fecha = new Date(sale.fecha); // Convertir la fecha en un objeto Date
    
          const primerDiaMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1); // Primer día del mes
          const primerLunes = new Date(primerDiaMes);
          primerLunes.setDate(primerDiaMes.getDate() + (primerDiaMes.getDay() === 0 ? 1 : 8 - primerDiaMes.getDay())); // Primer lunes del mes
    
          const diasDesdePrimerLunes = (fecha - primerLunes) / (1000 * 3600 * 24); // Diferencia en días
          let semanaIndex = Math.floor(diasDesdePrimerLunes / 7);  // Calcular la semana
          
          // Verificar que el productId esté en grouped antes de acceder
          if (grouped[productId]) {
            grouped[productId].ventasPorSemana[semanaIndex] += sale.cantidad;  // Accede a la cantidad correctamente
          } else {
            console.log("Error: ProductId no encontrado en grouped", productId);
          }
        });
      })
    );

    return {
      success: true,
      sales: Object.values(grouped),
    };
  } catch (error) {
    console.error("Error fetching total sales by product id: ", error);
    return { success: false, error: "Error fetching total sales" };
  }
}






export async function getTotalSalesByProductId(startDate, endDate) {
  try {
    const sales = await Venta.findAll({
      where: {
        fecha: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Product,
          as: "venta_product",
          attributes: ["id", "nombre", "existencias"],
        },
      ],
      attributes: ["cantidad"],
      raw: true,
    });

    // Agrupar las ventas por id del producto y sumar las cantidades
    const grouped = sales.reduce((acc, sale) => {
      const productId = sale["venta_product.id"];
      const productName = sale["venta_product.nombre"];
      const existencias = sale["venta_product.existencias"];

      if (!acc[productId]) {
        acc[productId] = {
          productId,
          productName,
          existencias,
          totalCantidad: 0,
        };
      }
      acc[productId].totalCantidad += sale.cantidad;
      return acc;
    }, {});

    return Object.values(grouped);
  } catch (error) {
    console.error("Error fetching total sales by product id: ", error);
  }
}


export async function getTotalSalesByProductIdByMonth(month, year) {
  try {
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const sales = await Venta.findAll({
      where: {
        fecha: {
          [Op.between]: [startDate, endDate],
        },
      },
      include: [
        {
          model: Product,
          as: "venta_product",
          attributes: ["id", "nombre", "existencias"],
        },
      ],
      attributes: ["cantidad"],
      raw: true,
    });

    // Agrupar las ventas por id del producto y sumar las cantidades
    const grouped = sales.reduce((acc, sale) => {
      const productId = sale["venta_product.id"];
      const productName = sale["venta_product.nombre"];
      const existencias = sale["venta_product.existencias"];

      if (!acc[productId]) {
        acc[productId] = {
          productId,
          productName,
          existencias,
          totalCantidad: 0,
        };
      }
      acc[productId].totalCantidad += sale.cantidad;
      return acc;
    }, {});

    return Object.values(grouped);
  } catch (error) {
    console.error("Error fetching total sales by product id for month: ", error);
  }
}


export async function insertarCarrito() {
  try {
    const fechaHoraActual = new Date();


    const hora = fechaHoraActual.toLocaleTimeString('es-ES', { hour12: false })
    const fecha = fechaHoraActual.toISOString();

    const resultado = await Car.create({
      total: 0,
      hora: hora,
      fecha: fecha,
    });

    console.log('Se insertó con el id:', resultado.id);
    return resultado.id;
  } catch (error) {
    console.error('Error al insertar el carrito:', error);
    return null;
  }
}


export async function AgregarProductosCarrito(carrito , producto , cantidad, presentacion, id_producto_cantidad) {
  try {
    const resultado = await Car_Products.create({
      carrito: carrito,
      producto: producto,
      cantidad: cantidad,
      presentacion: presentacion,
      id_producto_cantidad: id_producto_cantidad,
    });
    console.log('Registro insertado:', resultado);
    return true;
  } catch (error) {
    console.error('Error al insertar productos al carrito:', error);
    return false;
  }
}

export async function getPagos_bycarrito(id_carrito) {
  try{
    const pagos = await Pago.findAll({
      where:{id_carrito: id_carrito}
    });
    return pagos;
  }catch (error) {
    throw error;
  }
}

export async function getPresentacionesbyProduct_Id(id_product) {
  try{
    const presentaciones= await PresentacionProducto.findAll({
      where:{product_id: id_product}
    });
    return presentaciones;
  }catch (error) {
    throw error;
  }
}

export async function getCarritos() {
  try{
    const carritos = await Car.findAll({});
    return carritos;
  }catch (error) {
    throw error;
  }
}


export async function getPresentacionProducto_biId(presentacion_id) {
  try{
    const presentacion = await PresentacionProducto.findOne({
      where: {id: presentacion_id}
    });
    return presentacion;
  }catch (error) {
    throw error;
  }
}

export async function getProduct_ById (id_product) {
  try{
    const product = await Product.findOne({
      where: {id: id_product}
    });
    return product;
  }catch (error) {
    throw error;
  }
}


export async function getCarritoId(id) {
  try {
    const carrito = await Car.findOne({
      where: { id: id },
      attributes: [
        'id',
        'total',
        'hora',
        'fecha',
        [Sequelize.fn('SUM', Sequelize.col('carrito_detalles_carrito.cantidad')), 'cantidad_total']
      ],
      include: [
        {
          model: Car_Products,
          as: 'carrito_detalles_carrito', 
          attributes: []
        }
      ],
      group: ['carrito.id']
    });

    return carrito;
  } catch (error) {
    console.error('Error al obtener el carrito:', error);
    throw error;
  }
}


export async function getCarritoProducts(id_carrito) {
  try {
    const productos = await Car_Products.findAll({
      where: { carrito: id_carrito },
      attributes: [
        'carrito',
        'producto',
        'presentacion',
        [Sequelize.fn('SUM', Sequelize.col('cantidad')), 'cantidad_total'],
        'producto_detalles_carproducts.pp',
        'producto_detalles_carproducts.nombre',
        'id_producto_cantidad'
      ],
      include: [
        {
          model: Product,
          as: 'producto_detalles_carproducts', 
          attributes: ['id', 'pp', 'nombre']
        }
      ],
    
      group: [
        'carrito_productos.carrito',
        'carrito_productos.producto',
        'producto_detalles_carproducts.id',
        'producto_detalles_carproducts.pp',
        'producto_detalles_carproducts.nombre',
        'carrito_productos.presentacion',
        'carrito_productos.id_producto_cantidad'
      ]
    });

    return productos;
  } catch (error) {
    console.error(`Error al obtener los productos del carrito con ID ${id_carrito}:`, error);
    throw new Error('No se pudieron obtener los productos del carrito.');
  }
}

export async function getUsers() {
  try{
    const users = await User.findAll({
      attributes: ['user_name'],
    });
    const userNames = users.map(user => user.user_name);
    console.log('Nombres de los usuarios:', userNames);
    return userNames;
  }catch (error) {
    console.error('Error al obtener los nombres de los usuarios:', error);
    throw error;
  }
}

export async function getUbicaciones() {
  try{
    const places = await Ubicacion.findAll({
      attributes: ['id','ubicacion', 'lugar_farmacia'],
    });
    return places;
  }catch (error) {
    throw error;
  }
}

export async function getHorarios_byId(proveedor) {
  try{
    const horarios = await Schedule.findAll({
      attributes: ['id','dia', 'horario_apertura', 'horario_cierre'],
      where: {
        id_proveedor: proveedor,
      }
    });
    return horarios;
  }catch (error) {
    throw error;
  }
}


export async function getPresentacion_byId(presentacion_id) {
  try{
    const presentacion = await Presentaciones.findOne({
      attributes: ['nombre'],
      where: {
        id: presentacion_id,
      }
    });
    return presentacion;
  }catch (error) {
    throw error;
  }
}

export async function getProveedores_id() {
  try{
    const proveedores = await Supplier.findAll({
      attributes: ['id','nombre'],
    });
    return proveedores;
  }catch (error) {
    throw error;
  }
}

export async function getProduct_id() {
  try{
    const products = await Product.findAll({
      attributes: ['id','nombre'],
    });
    return products;
  }catch (error) {
    throw error;
  }
}

export async function getProveedoresConHorarios() {
  try {
    const proveedores = await Supplier.findAll({
      include: [
        {
          model: Schedule,
          as: 'horarios',
        },
        {
          model: Supplier, // Relación con proveedor alternativo
          as: 'alternativo',
          attributes: ['nombre'], // Solo trae el atributo `nombre`
        },
      ],
    });
    return proveedores;
  } catch (error) {
    console.error('Error al obtener proveedores con horarios:', error);
    throw error;
  }
}





export async function verifyUserCredentials(userName, password) {
  try {
    const user = await User.findOne({
      where: { user_name: userName },
    });

    if (!user) {
      console.log('Usuario no encontrado');
      return { success: false, message: 'Usuario no encontrado', role: null };
    }

    // Comparar la contraseña proporcionada con la almacenada
    if (user.password === password) {
      console.log('Credenciales válidas');
      return { success: true, message: 'Credenciales válidas', role: user.rol };
    } else {
      console.log('Contraseña incorrecta');
      return { success: false, message: 'Contraseña incorrecta', role: null };
    }
  } catch (error) {
    console.error('Error al verificar las credenciales:', error);
    throw error;
  }
}

export async function insertarUbicacion(nuevaUbicacion, lugarf) {
  try {
    const resultado = await Ubicacion.create({
      ubicacion: nuevaUbicacion,
      lugar_farmacia: lugarf
    });
    console.log('Registro insertado:', resultado);
    return true;
  } catch (error) {
    console.error('Error al insertar ubicación:', error);
    return false;
  }
}


export async function insertarHorario(dia, horario_a, horario_c, proveedor) {
  try {
    const response =  await  Schedule.create({
        dia: dia,
        horario_apertura: horario_a,
        horario_cierre: horario_c,
        id_proveedor: proveedor
    });
    console.log('Se inserto de manera exitosa',response)
    return true;
  } catch (error) {
    console.error('Error al insertar ubicación:', error);
    return false;
  }
}


export async function insertarSupplier(nombre, direccion, telefono, proveedor_alternativo, contacto, segundo_contacto) {
  try {
    const resultado = await Supplier.create({
      nombre: nombre,
      direccion: direccion,
      tipo: '',
      telefono: telefono,
      proveedor_alternativo: proveedor_alternativo,
      estadisponible:true,
      contacto: contacto,
      contacto_2: segundo_contacto
    });
    console.error('Se inserto con el id:', resultado.id);
    return resultado.id;
  } catch (error) {
    console.error('Error al insertar ubicación:', error);
    return null;
  }
}

export async function insertarProducto(nombre, forma_f, presentacion, id_supplier, activo_principal, isControlado, descripcion, imagen, dosificacion, accion_farmacologica) {
  try {
    const resultado = await Product.create({
      nombre: nombre,
      forma_farmaceutica: forma_f,
      descripcion_uso: descripcion,
      imagen: imagen,
      costo: 0,
      pp:0,
      presentacion: presentacion,
      principio_activo: activo_principal,
      existencias: 0,
      controlado: isControlado,
      proveedor: id_supplier,
      ganancia: 0,
      tipo: 'normal',
      dosificacion,
      accion_farmacologica
    });
    console.error('Se inserto con el id:', resultado.id);
    return resultado.id;
  } catch (error) {
    console.error('Error al insertar el producto:', error);
    return null;
  }
}


export async function insertarProducto_Details(cantidad, fechac, fechav, costo, id_product, id_ubicacion) {
  try {
    const resultado = await ProductDetail.create({
      cantidad: cantidad,
      fecha_compra: fechac,
      fecha_vencimiento: fechav,
      costo: costo,
      id_product: id_product,
      ubicacion_id: id_ubicacion
    });
    console.error('Se inserto con el id:', resultado.id);
    return true;
  } catch (error) {
    console.error('Error al insertar los detalles del producto:', error);
    return false;
  }
}


export async function actualizarPP(id, pp) {
  try {
    const [updatedRows] = await Product.update({
      pp: pp
    }, {
      where: { id: id }
    });

    if (updatedRows === 0) {
      console.error('No se encontró ningún registro con el id proporcionado.');
      return false;
    }

    console.log('Se actualizó el registro con id:', id);
    return true;
  } catch (error) {
    console.error('Error al actualizar los detalles del producto:', error);
    return false;
  }
}


export async function getInfoId(id) {
  try{
    const products = await Product.findOne({
      attributes: ['id','ganancia', 'costo','pp'],
      where: { id: id }
    });
    
    return products;
  }catch (error) {
    console.error('Error al obtener los nombres de los usuarios:', error);
    throw error;
  }
}


export async function getProductDetails(id) {
  try{
    const products = await ProductDetail.findAll({
      attributes: ['id', 'cantidad', 'fecha_compra', 'fecha_vencimiento', 'costo'],
      where: { id_product: id },
      include: [
        {
          model: Ubicacion,
          as: 'ubicacion_product_detail',
        },
      ],
   });
   
    return products;
  }catch (error) {
    console.error('Error al obtener los productos:', error);
    throw error;
  }
}


export async function getProduct() {
  try{
    const products = await Product.findAll({
      include: [
        {
          model: Supplier,
          as: 'proveedor_id_product',
          attributes: ['id', 'tipo', 'proveedor_alternativo', 'estadisponible', 'nombre'],
        },
      ],
    });
   
    return products;
  }catch (error) {
    console.error('Error al obtener los productos:', error);
    throw error;
  }
}


export async function getProduct_basicInfo (id) {
  try{
    const product = await Product.findOne({
      attributes: ['id', 'nombre'],
      where: {id: id}
    });
   
    return product;
  }catch (error) {
    console.error('Error al obtener el producto:', error);
    throw error;
  }
}

export async function getGanancias(){
  try{
    const ganacias = await Product.findAll({
      attributes: ['id', 'nombre', 'ganancia', 'existencias', 'costo'],
      include: [
        {
          model: PresentacionProducto,
          as: 'productos_presentacion_producto',
          attributes: ['id', 'pp', 'porcentaje_ganancia', 'cantidad_presentacion', 'presentacion_id'],
        },
      ],

    });
   
    return ganacias;
  }catch (error) {
    console.error('Error al obtener las ganancias:', error);
    throw error;
  }
}