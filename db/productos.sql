USE auth_db;


CREATE TABLE IF NOT EXISTS categoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS producto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL, 
    stock INT DEFAULT 0,
    categoria_id INT,
    FOREIGN KEY (categoria_id) REFERENCES categoria(id),
    imagen_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE ,
    favorito BOOLEAN DEFAULT FALSE,
    venta INT DEFAULT 0
);


ALTER TABLE producto ADD especial BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS grupo_opcion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo_seleccion ENUM('UNICO', 'MULTIPLE') NOT NULL DEFAULT 'UNICO',
    requerido BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS opcion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    grupo_opcion_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    ajuste_precio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (grupo_opcion_id) REFERENCES grupo_opcion(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS producto_grupo_opcion (
    producto_id INT NOT NULL,
    grupo_opcion_id INT NOT NULL,
    PRIMARY KEY (producto_id, grupo_opcion_id),
    FOREIGN KEY (producto_id) REFERENCES producto(id) ON DELETE CASCADE,
    FOREIGN KEY (grupo_opcion_id) REFERENCES grupo_opcion(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS pedido (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    nombre_cliente VARCHAR(255) NULL,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    nota TEXT, 
    estado ENUM('Recibido', 'En preparación', 'Listo para recoger', 'Cancelado') NOT NULL DEFAULT 'Recibido',
    fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS carrito (
    id INT AUTO_INCREMENT PRIMARY KEY, 
    usuario_id INT NOT NULL,           
    producto_id INT NOT NULL,          
    cantidad INT NOT NULL DEFAULT 1,
    nota_cocina TEXT NULL,             
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES producto(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carrito_opcion (
    carrito_id INT NOT NULL, 
    opcion_id INT NOT NULL,  
    PRIMARY KEY (carrito_id, opcion_id),
    FOREIGN KEY (carrito_id) REFERENCES carrito(id) ON DELETE CASCADE,
    FOREIGN KEY (opcion_id) REFERENCES opcion(id) ON DELETE CASCADE
);


DELIMITER $$

CREATE PROCEDURE sp_agregarAlCarrito(
    IN p_usuario_id INT,
    IN p_producto_id INT,
    IN p_cantidad INT,
    IN p_nota_cocina TEXT
)
BEGIN
    DECLARE v_stock_disponible INT;
    DECLARE v_producto_existe INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    START TRANSACTION;

    SELECT 
        COUNT(*), stock
    INTO 
        v_producto_existe, v_stock_disponible
    FROM 
        producto 
    WHERE 
        id = p_producto_id
    GROUP BY stock; 

    -- Si no existe, lanzar un error
    IF v_producto_existe = 0 THEN
        SIGNAL SQLSTATE '45000' 
        SET MESSAGE_TEXT = 'El producto no existe.';
    END IF;

    -- Validar stock
    IF v_stock_disponible < p_cantidad THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No hay suficiente stock para el producto.';
    END IF;

    -- Insertar el producto en el carrito del usuario
    INSERT INTO carrito (usuario_id, producto_id, cantidad, nota_cocina)
    VALUES (p_usuario_id, p_producto_id, p_cantidad, p_nota_cocina);

    
    SELECT LAST_INSERT_ID() AS nuevo_carrito_id;

    COMMIT;

END$$

DELIMITER ;

-- COLA DE PEDIDOS
SELECT 
    p.id AS num_pedido,
    p.estado,
    p.nombre_cliente,
    p.nota AS nota_general, -- La nota de todo el pedido
    pi.cantidad,
    prod.nombre AS producto,
    pi.nota_cocina, -- La nota específica de ESE producto
    
    -- Concatena todas las opciones elegidas para ESE producto
    GROUP_CONCAT(op.nombre SEPARATOR ', ') AS opciones_elegidas
FROM 
    pedidos p
-- Unir con los items de cada pedido
JOIN 
    pedidos_items pi ON p.id = pi.pedido_id
-- Unir con los nombres de los productos
JOIN 
    productos prod ON pi.producto_id = prod.id
LEFT JOIN 
    pedidos_items_opciones pio ON pi.id = pio.pedido_item_id
LEFT JOIN 
    opciones op ON pio.opcion_id = op.id
WHERE 
    p.estado IN ('Recibido', 'En preparación')
GROUP BY
    pi.id 
ORDER BY
    p.fecha_pedido ASC; 


DELIMITER //

DROP PROCEDURE IF EXISTS sp_obtenerDetallesProducto;

DELIMITER //
CREATE PROCEDURE sp_obtenerDetallesProducto(
    IN p_producto_id INT
)
BEGIN
    SELECT 
        p.id, p.nombre, p.precio AS precio_base, c.nombre AS categoria
    FROM 
        producto p
    LEFT JOIN 
        categoria c ON p.categoria_id = c.id
    WHERE 
        p.id = p_producto_id;

    SELECT 
        go.nombre AS grupo,
        go.tipo_seleccion,
        go.requerido,
        o.id AS opcion_id,  
        o.nombre AS opcion,
        o.ajuste_precio
    FROM 
        producto_grupo_opcion pgo
    JOIN 
        grupo_opcion go ON pgo.grupo_opcion_id = go.id
    JOIN 
        opcion o ON go.id = o.grupo_opcion_id
    WHERE 
        pgo.producto_id = p_producto_id
    ORDER BY
        go.nombre, o.nombre;
END //
DELIMITER ;

CALL sp_obtenerDetallesProducto(2);



CREATE TABLE IF NOT EXISTS pedido_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT ,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL, 
    nota_cocina TEXT,
    FOREIGN KEY (pedido_id) REFERENCES pedido(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES producto(id) ON DELETE SET NULL 
);

CREATE TABLE IF NOT EXISTS pedido_item_opcion (
    pedido_item_id INT NOT NULL,
    opcion_id INT,
    nombre_opcion VARCHAR(100), 
    ajuste_precio DECIMAL(10, 2),
    PRIMARY KEY (pedido_item_id, opcion_id),
    FOREIGN KEY (pedido_item_id) REFERENCES pedido(id) ON DELETE CASCADE,
    FOREIGN KEY (opcion_id) REFERENCES opcion(id) ON DELETE CASCADE
);

DELIMITER $$

CREATE TRIGGER trg_reducirStockDespuesDeInsertar
AFTER INSERT ON pedido_item
FOR EACH ROW
BEGIN
    UPDATE producto
    SET stock = stock - NEW.cantidad
    WHERE id = NEW.producto_id;
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE sp_cancelarPedido(
    IN p_pedido_id INT
)
BEGIN
    DECLARE v_estado_actual ENUM('Recibido', 'En preparación', 'Listo para recoger', 'Cancelado');

    -- Obtener el estado actual para no cancelar un pedido ya cancelado
    SELECT estado INTO v_estado_actual
    FROM pedidos
    WHERE id = p_pedido_id;

    IF v_estado_actual != 'Cancelado' THEN
    
        START TRANSACTION;
        
        BEGIN
            DECLARE EXIT HANDLER FOR SQLEXCEPTION
            BEGIN
                ROLLBACK; 
                RESIGNAL; 
            END;

            -- 1. Actualizar el estado del pedido
            UPDATE pedido
            SET estado = 'Cancelado'
            WHERE id = p_pedido_id;

            -- 2. Devolver el stock a la tabla de productos
            UPDATE producto p
            JOIN pedido_item pi ON p.id = pi.producto_id
            SET p.stock = p.stock + pi.cantidad
            WHERE pi.pedido_id = p_pedido_id;

            COMMIT;
        END;
        
    END IF;
END$$

DELIMITER ;


DELIMITER $$
CREATE PROCEDURE sp_realizarPedido(
    IN p_usuario_id INT,
    IN p_nota_general TEXT
)
BEGIN
    DECLARE v_nombre_cliente VARCHAR(255);
    DECLARE v_gran_total DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_nuevo_pedido_id INT;
    DECLARE v_carrito_id INT;
    DECLARE v_producto_id INT;
    DECLARE v_cantidad INT;
    DECLARE v_nota_cocina TEXT;
    DECLARE v_precio_base DECIMAL(10, 2);
    DECLARE v_opciones_total_ajuste DECIMAL(10, 2);
    DECLARE v_precio_unitario DECIMAL(10, 2);
    DECLARE v_nuevo_pedido_item_id INT;
    DECLARE v_opcion_id INT;
    DECLARE v_opcion_nombre VARCHAR(100);
    DECLARE v_opcion_ajuste DECIMAL(10, 2);
    DECLARE done INT DEFAULT FALSE;

    -- Cursor para iterar sobre los items del carrito
    DECLARE cur_carrito CURSOR FOR 
        SELECT c.id, c.producto_id, c.cantidad, c.nota_cocina, p.precio,
               COALESCE((SELECT SUM(o.ajuste_precio) 
                FROM carrito_opcion co JOIN opcion o ON co.opcion_id = o.id 
                WHERE co.carrito_id = c.id), 0) AS opciones_total_ajuste
        FROM carrito c
        JOIN producto p ON c.producto_id = p.id
        WHERE c.usuario_id = p_usuario_id;

    -- Cursor para iterar sobre las opciones de UN item del carrito
    DECLARE cur_opciones CURSOR FOR
        SELECT co.opcion_id, o.nombre, o.ajuste_precio 
        FROM carrito_opcion co 
        JOIN opcion o ON co.opcion_id = o.id 
        WHERE co.carrito_id = v_carrito_id; -- Usamos el v_carrito_id del item actual

    -- Handler para saber cuándo terminan los cursores
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Handler para errores SQL dentro de la transacción
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL; 
    END;

    -- Verificar si el carrito está vacío ANTES de la transacción
    IF (SELECT COUNT(*) FROM carrito WHERE usuario_id = p_usuario_id) = 0 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tu carrito está vacío.';
    END IF;

    -- Iniciar la transacción principal
    START TRANSACTION;

    -- 1. Obtener nombre del usuario
    SELECT nombre_completo INTO v_nombre_cliente FROM usuario WHERE id = p_usuario_id;

    -- 2. Calcular el gran total (iterando con el cursor)
    OPEN cur_carrito;
    read_loop_items: LOOP
        FETCH cur_carrito INTO v_carrito_id, v_producto_id, v_cantidad, v_nota_cocina, v_precio_base, v_opciones_total_ajuste;
        IF done THEN
            LEAVE read_loop_items;
        END IF;
        SET v_precio_unitario = v_precio_base + v_opciones_total_ajuste;
        SET v_gran_total = v_gran_total + (v_precio_unitario * v_cantidad);
    END LOOP;
    CLOSE cur_carrito;
    SET done = FALSE; -- Resetear 'done' para el siguiente cursor

    -- 3. Crear el Pedido
    INSERT INTO pedido (id_usuario, nombre_cliente, total, nota) 
    VALUES (p_usuario_id, v_nombre_cliente, v_gran_total, p_nota_general);
    SET v_nuevo_pedido_id = LAST_INSERT_ID();

    -- 4. Mover items y opciones, y actualizar 'venta' (iterando de nuevo)
    OPEN cur_carrito;
    move_loop_items: LOOP
        FETCH cur_carrito INTO v_carrito_id, v_producto_id, v_cantidad, v_nota_cocina, v_precio_base, v_opciones_total_ajuste;
        IF done THEN
            LEAVE move_loop_items;
        END IF;
        
        -- Calcular precio unitario de nuevo para guardarlo
        SET v_precio_unitario = v_precio_base + v_opciones_total_ajuste;

        -- Insertar el item en pedidos_items
        INSERT INTO pedido_item (pedido_id, producto_id, cantidad, precio_unitario, nota_cocina) 
        VALUES (v_nuevo_pedido_id, v_producto_id, v_cantidad, v_precio_unitario, v_nota_cocina);
        SET v_nuevo_pedido_item_id = LAST_INSERT_ID();

        -- Actualizar el contador de ventas del producto
        UPDATE producto SET venta = venta + v_cantidad WHERE id = v_producto_id;

        -- Abrir cursor para las opciones de ESTE item
        OPEN cur_opciones;
        move_loop_options: LOOP
            FETCH cur_opciones INTO v_opcion_id, v_opcion_nombre, v_opcion_ajuste;
            IF done THEN
                LEAVE move_loop_options;
            END IF;
            -- Insertar la opción en pedidos_items_opciones
            INSERT INTO pedido_item_opcion (pedido_item_id, opcion_id, nombre_opcion, ajuste_precio) 
            VALUES (v_nuevo_pedido_item_id, v_opcion_id, v_opcion_nombre, v_opcion_ajuste);
        END LOOP;
        CLOSE cur_opciones;
        SET done = FALSE; -- Resetear 'done' para el siguiente item

    END LOOP;
    CLOSE cur_carrito;

    -- 5. Vaciar el carrito del usuario (borra en cascada de carrito_opciones)
    DELETE FROM carrito WHERE usuario_id = p_usuario_id;

    -- Si todo salió bien, confirmar
    COMMIT;
    
    -- Devolver el ID del nuevo pedido y el total
    SELECT v_nuevo_pedido_id AS pedido_id, v_gran_total AS total;

END$$

DELIMITER ;

SELECT * FROM productos;

SELECT * FROM carrito_opciones;