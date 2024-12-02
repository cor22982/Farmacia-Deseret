create  table products (
	id SERIAL PRIMARY KEY,
	nombre VARCHAR(200),
	forma_farmaceutica VARCHAR(500),
	descripcion_uso text,
	imagen text,
	costo NUMERIC(10, 4),
	pp NUMERIC(10, 4),
	presentacion VARCHAR(200),
	principio_activo VARCHAR(200),
	existencias int, 
	controlado boolean
	
)


create  table productos_cantidades(
	id SERIAL PRIMARY KEY,
	cantidad int,
	fecha_compra date,
	fecha_vencimiento date,
	costo NUMERIC(10, 4),
	id_product INT NOT null,
	CONSTRAINT fk_product FOREIGN KEY (id_product) references products (id)
)



create table ubicaciones (
 id serial primary key,
 ubicacion VARCHAR(200)
)
ALTER TABLE productos_cantidades
ADD COLUMN ubicacion_id INT;

ALTER TABLE productos_cantidades 
ADD CONSTRAINT fk_ubicaciones FOREIGN KEY (ubicacion_id) REFERENCES ubicaciones (id) 
ON DELETE CASCADE ON UPDATE CASCADE;


create table usuario(
	id serial primary key,
	user_name VARCHAR(100),
	rol VARCHAR(100),
	password VARCHAR(600)
)

create table pedidos_bodega(
	id serial primary key,
	cantidad int,
	fecha date,
	id_product int,
	CONSTRAINT fk_pedidos_b FOREIGN KEY (id_product) references productos_cantidades (id)
)

create table proveedores(
	id serial primary key, 
	direccion text,
	contacto_2 VARCHAR(200),
	tipo VARCHAR(200),
	horario_apertura time,
	horario_cierre time,
	contacto VARCHAR(200),
	telefono VARCHAR(200)
)
ALTER TABLE proveedores
ADD COLUMN proveedor_alternativo INT;

ALTER TABLE proveedores 
ADD CONSTRAINT fk_proveedor FOREIGN KEY (proveedor_alternativo) REFERENCES proveedores (id);

ALTER TABLE products 
ADD COLUMN proveedor INT;

ALTER TABLE products  
ADD CONSTRAINT fk_proveedor FOREIGN KEY (proveedor) REFERENCES proveedores (id);

create table ganancia(
	id serial primary key,
	exitencias int,
	porcentaje_ganancias NUMERIC(10, 2),
	product int,
	CONSTRAINT fk_ganancia FOREIGN KEY (product) references  products(id)
)
create table venta(
	id serial primary key,
	jornada VARCHAR(200),
	cantidad int,
	fecha date,
	product int,
	CONSTRAINT fk_venta FOREIGN KEY (product) references  products(id)
)


create table carrito(
	id serial primary key,
	total NUMERIC(10, 4),
	hora time,
	fecha date
)

create table carrito_productos(
	carrito int,
	producto int, 
	cantidad int,
	CONSTRAINT fk_carrito FOREIGN KEY (carrito) references  carrito(id),
	CONSTRAINT fk_producto FOREIGN KEY (producto) references  products(id)
)

-- SPRINT 2
drop table ganancia;
ALTER TABLE products 
ADD COLUMN ganancia NUMERIC(10, 4);

ALTER TABLE products 
ADD COLUMN tipo VARCHAR(200);


ALTER TABLE venta 
ADD COLUMN isOferta boolean;


alter table proveedores add column estaDisponible boolean;


alter table proveedores drop column horario_cierre;


alter table proveedores drop column horario_apertura;


create table horario(
	id serial primary key,
	dia VARCHAR(200),
	horario_apertura time,
	horario_cierre time,
	id_proveedor int,
	CONSTRAINT fk_id_proveedor FOREIGN KEY (id_proveedor) references  proveedores(id)
);


ALTER TABLE horario 
ADD CONSTRAINT fk_proveedor FOREIGN KEY (proveedor_alternativo) REFERENCES proveedores (id);


alter table ubicaciones drop column ubicacion;

alter table ubicaciones add column ubicacion text;

alter table proveedores drop column contacto_2;

alter table proveedores add column contacto_2 text;


alter table proveedores drop column contacto;


alter table proveedores add column contacto text;

alter table proveedores add column nombre text;

alter table horario drop column dia;

alter table horario add column dia integer;

 GRANT SELECT, INSERT, UPDATE, DELETE ON horario TO ownerfarmacia;

  GRANT USAGE, SELECT, UPDATE ON SEQUENCE horario_id_seq TO ownerfarmacia;