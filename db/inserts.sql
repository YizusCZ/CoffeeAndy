INSERT INTO productos (nombre, precio, categoria_id) 
VALUES ('Agua de Limón', 15.00, 2); -- id=2 (Bebida)

INSERT INTO grupos_opciones (nombre, tipo_seleccion, requerido) 
VALUES ('Tamaño Bebida', 'UNICO', TRUE);

SELECT * from productos;

INSERT INTO opciones (grupo_opcion_id, nombre, ajuste_precio) 
VALUES 
(6, 'Pequeña', 0.00),
(6, 'Grande', 7.00);

INSERT INTO categorias (id, nombre) VALUES
(1, 'Comida'),
(2, 'Bebida'),
(3, 'Snack');

INSERT INTO productos (id, nombre, precio, categoria_id) VALUES
(1, 'Torta', 40.00, 1),
(2, 'Huarache', 50.00, 1),
(3, 'Chilaquiles sin Huevo', 45.00, 1),
(4, 'Chilaquiles con Huevo', 55.00, 1),
(5, 'Chilaquiles con Huevo al Gusto', 60.00, 1),
(6, 'Huevo al Gusto', 55.00, 1),
(7, 'Molletes', 25.00, 1), 
(8, 'Quesadillas', 25.00, 1), 
(9, 'Sincronizadas', 45.00, 1), 
(10, 'Sandwich', 30.00, 1),
(11, 'Burritos', 25.00, 1), 
(12, 'Tacos', 15.00, 3), 
(13, 'Ensalada', 60.00, 1),
(14, 'Bagette', 60.00, 1)



INSERT INTO grupos_opciones (id, nombre, tipo_seleccion, requerido) VALUES
(1, 'Elige tu Guisado', 'UNICO', TRUE),
(2, 'Tipo de Preparacion (Torta)', 'UNICO', TRUE),
(3, 'Tipo de Preparacion (Huarache)', 'UNICO', TRUE),
(4, 'Acompañamiento (Ensalada)', 'UNICO', TRUE),
(5, 'Tipo de Bagette', 'UNICO', TRUE);


TRUNCATE TABLE opciones;
-- Grupo 1: Guisados
INSERT INTO opciones (grupo_opcion_id, nombre, ajuste_precio) VALUES
(1, 'Bistec', 0.00), (1, 'Pastor', 0.00), (1, 'Chorizo', 0.00),
(1, 'Jamón', 0.00), (1, 'Lomo', 0.00), (1, 'Milanesa', 0.00), (1, 'Salchicha', 0.00);
-- Grupo 2: Tipo de Torta
INSERT INTO opciones (grupo_opcion_id, nombre, ajuste_precio) VALUES
(2, 'Sencilla (1 Guisado)', 0.00), (2, 'Combinada', 5.00), (2, 'Cubana', 10.00);
-- Grupo 3: Tipo de Huarache
INSERT INTO opciones (grupo_opcion_id, nombre, ajuste_precio) VALUES
(3, 'Sencillo (1 Guisado)', 0.00), (3, 'Combinado', 5.00), (3, 'Campechano', 10.00);
-- Grupo 4: Acompañamiento Ensalada
INSERT INTO opciones (grupo_opcion_id, nombre, ajuste_precio) VALUES
(4, 'Jamón', 0.00), (4, 'Atún', 0.00), (4, 'Pollo', 0.00);
-- Grupo 5: Tipo de Bagette
INSERT INTO opciones (grupo_opcion_id, nombre, ajuste_precio) VALUES
(5, 'Jamón', 0.00), (5, 'Vegetariano', 0.00);


INSERT INTO productos_grupos_opciones (producto_id, grupo_opcion_id) VALUES
(1, 1), (1, 2), -- Torta
(2, 1), (2, 3), -- Huarache
(11, 1),        -- Burritos
(12, 1),        -- Tacos
(13, 4),        -- Ensalada
(14, 5);        -- Bagette

SELECT * FROM producto;