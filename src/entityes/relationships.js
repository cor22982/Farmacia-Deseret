import Supplier from "./supplier.js";
import Schedule from "./schedule.js";
import Product from "./product.js";
import ProductDetail from "./Product_detail.js";
import Ubicacion from "./ubicacion.js";
import Car from "./Car.js";
import Car_Products from "./Car_Products.js";
import Pago from "./Pago.js";


Supplier.hasMany(Schedule, { foreignKey: 'id_proveedor', as: 'horarios' });
Supplier.belongsTo(Supplier, {
  foreignKey: 'proveedor_alternativo', // Llave foránea que conecta con la misma tabla
  as: 'alternativo',                  // Alias para la relación
});
Schedule.belongsTo(Supplier, { foreignKey: 'id_proveedor', as: 'proveedor' });



Product.belongsTo(Supplier, { foreignKey: 'proveedor', as: 'proveedor_id_product' });
Supplier.hasMany(Product, { foreignKey: 'proveedor', as: 'productos' });


ProductDetail.belongsTo(Product, { foreignKey: 'id_product', as: 'producto_id' });
Product.hasMany(ProductDetail, { foreignKey: 'id_product', as: 'product_details' });

ProductDetail.belongsTo(Ubicacion, { foreignKey: 'ubicacion_id', as: 'ubicacion_product_detail' });
Ubicacion.hasMany(ProductDetail, { foreignKey: 'ubicacion_id', as: 'product_details_ubicaciones' });

Car_Products.belongsTo(Car,{foreignKey: 'carrito', as:'carrito_detalles_carproducts'});
Car.hasMany(Car_Products,{foreignKey: 'carrito', as:'carrito_detalles_carrito'});

Car_Products.belongsTo(Car,{foreignKey: 'producto', as:'producto_detalles_carproducts'});
Product.hasMany(Car_Products, { foreignKey: 'producto', as: 'producto_detalles_producto' });

Pago.belongsTo(Car,{foreignKey: 'id_carrito', as:'carritopago_pago'});
Car.hasMany(Pago,{foreignKey: 'id_carrito', as:'carritopago_carrito'});

export { Supplier, Schedule, Product, ProductDetail, Ubicacion, Car, Pago, Car_Products};