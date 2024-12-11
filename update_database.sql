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
