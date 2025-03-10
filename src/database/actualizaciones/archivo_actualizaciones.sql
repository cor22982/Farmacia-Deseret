ALTER TABLE venta ADD COLUMN id_carrito INTEGER;

ALTER TABLE venta 
ADD CONSTRAINT fk_venta_carrito
FOREIGN KEY (id_carrito) 
REFERENCES carrito(id);
