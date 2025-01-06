alter table products add column dosificacion text;
alter table products add column accion_farmacologica text;


CREATE OR REPLACE FUNCTION actualizar_products_por_details_onDelete()
RETURNS TRIGGER AS $$
DECLARE
    ganancia_min NUMERIC(10, 4);
    costo_anterior NUMERIC(10, 4);
BEGIN
    -- Obtengamos el costo anterior
    SELECT costo
    INTO costo_anterior
    FROM productos_cantidades
    ORDER BY id DESC
    LIMIT 1;

    -- Actualizar la presentación del producto
    UPDATE presentacion_producto
    SET 
        porcentaje_ganancia = CASE 
                                WHEN pp <> 0 THEN (pp - (cantidad_presentacion * costo_anterior)) / pp
                                ELSE 0
                              END
    WHERE product_id = OLD.id_product;

    -- Obtener la menor ganancia
    SELECT MIN(porcentaje_ganancia)
    INTO ganancia_min
    FROM presentacion_producto
    WHERE product_id = OLD.id_product AND habilitado = true;

    -- Actualizar el producto
    UPDATE products
    SET 
        existencias = existencias - OLD.cantidad,
        costo = costo_anterior,
        ganancia = CASE 
                     WHEN ganancia_min IS NOT NULL THEN ganancia_min
                     ELSE 0
                   END
    WHERE id = OLD.id_product;    

    -- Retornar la fila eliminada
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Actualizar el Trigger
DROP TRIGGER IF EXISTS trigger_actualizar_products_por_details_onDelete ON productos_cantidades;

CREATE TRIGGER trigger_actualizar_products_por_details_onDelete
AFTER DELETE ON productos_cantidades
FOR EACH ROW
EXECUTE FUNCTION actualizar_products_por_details_onDelete();
