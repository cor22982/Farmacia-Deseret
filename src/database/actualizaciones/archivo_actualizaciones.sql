CREATE OR REPLACE FUNCTION actualizar_products_por_details()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE
    ganancia_min numeric(10, 4);
  BEGIN

    -- Ahora updeteamos la presentacion del producto
    
    UPDATE presentacion_producto
    SET 
        porcentaje_ganancia =  CASE 
                                    WHEN pp <> 0 THEN (pp - (cantidad_presentacion*NEW.costo)) / pp
                                    ELSE 0
                               END
    
    WHERE product_id = NEW.id_product;
    

    -- Ahora obtenemos la menor ganancia

    SELECT MIN(porcentaje_ganancia)
    INTO ganancia_min
    FROM presentacion_producto
    WHERE product_id = NEW.id_product AND habilitado = true;

    -- Ahora vamos a updetear en el producto

    UPDATE products
    SET 
    existencias = existencias + NEW.cantidad,
    costo = NEW.costo,
    ganancia = CASE 
                     WHEN ganancia_min <> 0 THEN ganancia_min
                     ELSE 0
                   END
    WHERE id = NEW.id_product;    

    -- Retorna la nueva fila en productos_cantidades
    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql;


-- Actualizar el Trigger
DROP TRIGGER IF EXISTS trigger_actualizar_products_por_details ON productos_cantidades;

CREATE OR REPLACE TRIGGER trigger_actualizar_products_por_details
AFTER INSERT ON productos_cantidades
FOR EACH ROW
EXECUTE FUNCTION actualizar_products_por_details();








CREATE OR REPLACE FUNCTION actualizar_presentaciones()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE
    ganancia_min numeric(10, 4);
    costo_producto numeric(10, 4);
  BEGIN

    SELECT costo
    INTO costo_producto
    FROM products
    WHERE id = NEW.product_id;

    UPDATE presentacion_producto
    SET
        porcentaje_ganancia = CASE 
                                WHEN  NEW.pp <> 0 and costo_producto IS NOT NULL THEN (NEW.pp - (NEW.cantidad_presentacion*costo_producto)) / NEW.pp
                                ELSE 0
                              END
     WHERE id = NEW.id;

    SELECT MIN(porcentaje_ganancia)
    INTO ganancia_min
    FROM presentacion_producto
    WHERE product_id = NEW.product_id AND habilitado = true;

    UPDATE products
    SET 
    ganancia = CASE 
                     WHEN ganancia_min <> 0 THEN ganancia_min
                     ELSE 0
                   END
    WHERE id = NEW.product_id; 

    RETURN NEW;
  END;
END;
$$ LANGUAGE plpgsql;




-- Actualizar el Trigger
DROP TRIGGER IF EXISTS trigger_actualizar_presentaciones ON presentacion_producto;

CREATE OR REPLACE TRIGGER trigger_actualizar_presentaciones
AFTER INSERT ON presentacion_producto
FOR EACH ROW
EXECUTE FUNCTION actualizar_presentaciones();






CREATE OR REPLACE FUNCTION actualizar_presentaciones_onDelete()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE
    ganancia_min numeric(10, 4);
  BEGIN
    -- Obtener el mínimo porcentaje de ganancia para el producto afectado
    SELECT MIN(porcentaje_ganancia)
    INTO ganancia_min
    FROM presentacion_producto
    WHERE product_id = OLD.product_id;

    -- Actualizar la tabla products con el mínimo porcentaje de ganancia encontrado
    UPDATE products
    SET 
        ganancia = COALESCE(ganancia_min, 0)
    WHERE id = OLD.product_id;

    RETURN OLD;
  END;
END;
$$ LANGUAGE plpgsql;

-- Eliminar el trigger existente si lo hubiera
DROP TRIGGER IF EXISTS trigger_actualizar_presentaciones_onDelete ON presentacion_producto;

-- Crear el trigger nuevamente
CREATE TRIGGER trigger_actualizar_presentaciones_onDelete
AFTER DELETE ON presentacion_producto
FOR EACH ROW
EXECUTE FUNCTION actualizar_presentaciones_onDelete();
