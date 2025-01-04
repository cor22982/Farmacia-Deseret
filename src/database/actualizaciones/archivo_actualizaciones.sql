alter table products add column dosificacion text;
alter table products add column accion_farmacologica text;


-- Actualizar el Trigger
DROP TRIGGER IF EXISTS trigger_actualizar_presentaciones ON presentacion_producto;

CREATE OR REPLACE TRIGGER trigger_actualizar_presentaciones
AFTER INSERT OR UPDATE ON presentacion_producto
FOR EACH ROW
EXECUTE FUNCTION actualizar_presentaciones();
