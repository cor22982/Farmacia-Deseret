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

alter table ubicaciones add column lugar_farmacia varchar(500);




CREATE OR REPLACE FUNCTION actualizar_products_por_details()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET 
        existencias = existencias + NEW.cantidad,
        costo = NEW.costo,
        ganancia = CASE 
                     WHEN pp <> 0 THEN (pp - NEW.costo) / pp
                     ELSE 0
                   END
    WHERE id = NEW.id_product;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER trigger_actualizar_products_por_details
AFTER INSERT ON productos_cantidades
FOR EACH ROW
EXECUTE FUNCTION actualizar_products_por_details();


-- INSERT INTO productos_cantidades (cantidad, fecha_compra, fecha_vencimiento, costo, id_product, ubicacion_id)
-- VALUES (100, '2024-12-01', '2025-12-01', 6.50, 3, 10);



-- Crear función para actualizar ganancia cuando se modifica pp
CREATE OR REPLACE FUNCTION actualizar_ganancia_al_actualizar_pp()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcula la ganancia cuando pp es actualizado, evitando división por cero
    UPDATE products
    SET 
        ganancia = CASE 
                     WHEN NEW.pp <> 0 THEN (NEW.pp - costo) / NEW.pp
                     ELSE 0
                   END
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger que se activa después de un UPDATE en el campo pp
CREATE TRIGGER trigger_actualizar_ganancia_al_actualizar_pp
AFTER UPDATE OF pp ON products
FOR EACH ROW
EXECUTE FUNCTION actualizar_ganancia_al_actualizar_pp();




-- Eliminar restricciones existentes
ALTER TABLE horario DROP CONSTRAINT fk_id_proveedor;
ALTER TABLE proveedores DROP CONSTRAINT fk_proveedor;
ALTER TABLE products DROP CONSTRAINT fk_proveedor;

-- Crear nuevas restricciones con ON DELETE CASCADE
ALTER TABLE horario
    ADD CONSTRAINT fk_id_proveedor FOREIGN KEY (id_proveedor)
    REFERENCES proveedores(id) ON DELETE CASCADE;

ALTER TABLE proveedores
    ADD CONSTRAINT fk_proveedor FOREIGN KEY (proveedor_alternativo)
    REFERENCES proveedores(id) ON DELETE CASCADE;

ALTER TABLE products
    ADD CONSTRAINT fk_proveedor FOREIGN KEY (proveedor)
    REFERENCES proveedores(id) ON DELETE CASCADE;

-- Eliminar la restricción actual si es necesario
ALTER TABLE productos_cantidades DROP CONSTRAINT fk_ubicaciones;

-- Agregar la restricción con ON DELETE CASCADE
ALTER TABLE productos_cantidades
    ADD CONSTRAINT fk_ubicaciones FOREIGN KEY (ubicacion_id)
    REFERENCES ubicaciones(id) ON DELETE CASCADE ON UPDATE CASCADE;



-- AGREGAR ELIMINAR DELETE

-- Modificar la restricción de clave foránea en la tabla productos_cantidades
ALTER TABLE productos_cantidades
DROP CONSTRAINT fk_product,
ADD CONSTRAINT fk_product FOREIGN KEY (id_product) REFERENCES products(id) ON DELETE CASCADE;

-- Modificar la restricción de clave foránea en la tabla carrito_productos
ALTER TABLE carrito_productos
DROP CONSTRAINT fk_producto,
ADD CONSTRAINT fk_producto FOREIGN KEY (producto) REFERENCES products(id) ON DELETE CASCADE;

-- Modificar la restricción de clave foránea en la tabla venta
ALTER TABLE venta
DROP CONSTRAINT fk_venta,
ADD CONSTRAINT fk_venta FOREIGN KEY (product) REFERENCES products(id) ON DELETE CASCADE;

-- Carrito

create table metodo_pago(
	id serial primary key,
	pago  NUMERIC(10, 4),
	tipo VARCHAR(200),
	id_carrito int,
	CONSTRAINT fk_id_carrito FOREIGN KEY (id_carrito) references  carrito(id)
);
alter table carrito_productos add column id serial primary key;


CREATE OR REPLACE FUNCTION actualizar_alinsertar_productos_carrito()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE carrito
    SET 
        total = total + (
            SELECT 
                carrito_productos.cantidad * p.pp AS precio_nuevo
            FROM 
                carrito_productos
            JOIN 
                products p ON p.id = carrito_productos.producto
            WHERE 
                carrito_productos.id = NEW.id
        )
    WHERE id = NEW.carrito;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_actualizar_alinsertar_productos_carrito
AFTER INSERT ON carrito_productos
FOR EACH ROW
EXECUTE FUNCTION actualizar_alinsertar_productos_carrito();


CREATE OR REPLACE FUNCTION actualizar_aleliminar_productos_carrito()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE carrito
    SET 
        total = total - (
            SELECT 
                OLD.cantidad * p.pp AS precio_eliminado
            FROM 
                products p
            WHERE 
                p.id = OLD.producto
        )
    WHERE id = OLD.carrito;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER trigger_aldetallar_productos_carrito
AFTER DELETE ON carrito_productos
FOR EACH ROW
EXECUTE FUNCTION actualizar_aleliminar_productos_carrito();


-- Otorgar permisos de USAGE y UPDATE sobre la secuencia
GRANT USAGE, SELECT, UPDATE ON SEQUENCE carrito_productos_id_seq TO ownerfarmacia;

ALTER TABLE carrito_productos
DROP CONSTRAINT fk_carrito,
ADD CONSTRAINT fk_carrito
FOREIGN KEY (carrito) REFERENCES carrito(id)
ON DELETE CASCADE;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE metodo_pago TO ownerfarmacia;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE metodo_pago_id_seq TO ownerfarmacia;
GRANT SELECT ON TABLE carrito TO ownerfarmacia;


ALTER TABLE metodo_pago DROP CONSTRAINT fk_id_carrito;

ALTER TABLE metodo_pago
ADD CONSTRAINT fk_id_carrito
FOREIGN KEY (id_carrito)
REFERENCES carrito(id)
ON DELETE CASCADE;


ALTER SEQUENCE carrito_id_seq RESTART WITH 1;
ALTER SEQUENCE carrito_productos_id_seq RESTART WITH 1;
ALTER SEQUENCE horario_id_seq RESTART WITH 1;
ALTER SEQUENCE metodo_pago_id_seq RESTART WITH 1;
ALTER SEQUENCE pedidos_bodega_id_seq RESTART WITH 1;
ALTER SEQUENCE productos_cantidades_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE proveedores_id_seq RESTART WITH 1;
ALTER SEQUENCE ubicaciones_id_seq RESTART WITH 1;
ALTER SEQUENCE venta_id_seq RESTART WITH 1;

-- Tercer sprint


CREATE TABLE presentaciones (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255),
    descripcion TEXT
);


CREATE TABLE presentacion_producto (
    id SERIAL PRIMARY KEY,
    porcentaje_ganancia NUMERIC(5, 2),
    pp NUMERIC(10, 2),
    cantidad_presentacion INTEGER,
    presentacion_id INTEGER,
		product_id INTEGER,
    CONSTRAINT fk_presentacion FOREIGN KEY (presentacion_id) REFERENCES presentaciones (id) ON DELETE CASCADE,
		CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE
);

-- Otorgar permisos al usuario sobre la tabla presentaciones
GRANT SELECT, INSERT, UPDATE, DELETE ON public.presentaciones TO ownerfarmacia;

-- Otorgar permisos sobre la secuencia presentaciones_id_seq
GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.presentaciones_id_seq TO ownerfarmacia;

-- Otorgar permisos al usuario sobre la tabla presentacion_producto
GRANT SELECT, INSERT, UPDATE, DELETE ON public.presentacion_producto TO ownerfarmacia;

-- Otorgar permisos sobre la secuencia presentacion_producto_id_seq
GRANT USAGE, SELECT, UPDATE ON SEQUENCE public.presentacion_producto_id_seq TO ownerfarmacia;
