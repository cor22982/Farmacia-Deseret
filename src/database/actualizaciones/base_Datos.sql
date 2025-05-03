
SELECT setval('products_id_seq', 1, false);
SELECT setval('presentacion_producto_id_seq', 1, false);

INSERT INTO presentaciones (nombre, descripcion)
VALUES ('SUPOSITORIO', 'Forma farmacéutica sólida destinada a introducirse en el recto, donde se disuelve o funde para ejercer su efecto.');

INSERT INTO presentaciones (nombre, descripcion)
VALUES ('UNIDAD', 'Forma farmacéutica sólida destinada a introducirse en el recto, donde se disuelve o funde para ejercer su efecto.');


