ALTER TABLE venta ADD COLUMN id_carrito INTEGER;

ALTER TABLE venta 
ADD CONSTRAINT fk_venta_carrito
FOREIGN KEY (id_carrito) 
REFERENCES carrito(id);

ALTER TABLE venta ADD COLUMN id_producto_cantidad INTEGER;

ALTER TABLE venta 
ADD CONSTRAINT fk_producto_cantidad
FOREIGN KEY (id_producto_cantidad) 
REFERENCES productos_cantidades(id);



ALTER TABLE venta ADD COLUMN id_producto_presentacion INTEGER;

ALTER TABLE venta 
ADD CONSTRAINT fk_producto_presentacion
FOREIGN KEY (id_producto_presentacion) 
REFERENCES  presentacion_producto(id);



ALTER TABLE carrito_productos ADD COLUMN id_producto_cantidad INTEGER;

ALTER TABLE carrito_productos 
ADD CONSTRAINT fk_producto_cantidad
FOREIGN KEY (id_producto_cantidad) 
REFERENCES productos_cantidades(id);