// backend/routes/cart.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const userAuth = require('../middleware/userAuth'); 

router.use(userAuth);

// --- 1. OBTENER Carrito ---
router.get('/', async (req, res) => {
    try {
        const usuario_id = req.user.id;
        // Items con sus nombres de opciones y ajuste total de precio
        const [items] = await pool.query(`
            SELECT 
                c.id AS carrito_id, p.nombre, p.imagen_url, c.cantidad, c.nota_cocina, p.precio AS precio_base,
                (SELECT GROUP_CONCAT(o.nombre SEPARATOR ', ') 
                 FROM carrito_opciones co JOIN opciones o ON co.opcion_id = o.id 
                 WHERE co.carrito_id = c.id) AS opciones_nombres,
                (SELECT SUM(o.ajuste_precio) 
                 FROM carrito_opciones co JOIN opciones o ON co.opcion_id = o.id 
                 WHERE co.carrito_id = c.id) AS opciones_total_ajuste
            FROM carrito c
            JOIN productos p ON c.producto_id = p.id
            WHERE c.usuario_id = ?;
        `, [usuario_id]);

        // Calcular subtotal en el servidor
        const itemsConTotal = items.map(item => {
            const ajuste = parseFloat(item.opciones_total_ajuste) || 0;
            const precioBase = parseFloat(item.precio_base);
            const subtotal = (precioBase + ajuste) * item.cantidad;
            return { ...item, subtotal };
        });
        res.json(itemsConTotal);
    } catch (error) {
        console.error("Error al obtener carrito:", error); 
        res.status(500).json({ message: 'Error al obtener carrito', error: error.message });
    }
});

// --- 2. AÑADIR al Carrito ---
router.post('/', async (req, res) => {
    const { producto_id, cantidad, nota_cocina, opcion_ids } = req.body;
    const usuario_id = req.user.id;
    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // sp par agregar al carrito (tarsicio estaria orgulloso)
        const [result] = await connection.query(
            'CALL sp_agregarAlCarrito(?, ?, ?, ?)',
            [usuario_id, producto_id, cantidad, nota_cocina || null]
        );
        
        // Obtener id del nuevo item
        const nuevo_carrito_id = result[0][0].nuevo_carrito_id;

        // Si esta personalizado llevalo a carrito_opciones
        if (opcion_ids && opcion_ids.length > 0) {
            const values = opcion_ids.map(opcion_id => [nuevo_carrito_id, opcion_id]);
            await connection.query(
                'INSERT INTO carrito_opciones (carrito_id, opcion_id) VALUES ?',
                [values]
            );
        }
        await connection.commit();
        res.status(201).json({ message: 'Producto añadido al carrito', carrito_id: nuevo_carrito_id });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Error al añadir al carrito:", error); 
        res.status(500).json({ message: error.message || 'Error al añadir al carrito', code: error.code });
    } finally {
        if (connection) connection.release();
    }
});

// --- 3. ELIMINAR Item del Carrito ---
router.delete('/:carrito_id', async (req, res) => {
    try {
        const { carrito_id } = req.params;
        const usuario_id = req.user.id;
        await pool.query(
            'DELETE FROM carrito WHERE id = ? AND usuario_id = ?',
            [carrito_id, usuario_id]
        );
        res.json({ message: 'Item eliminado del carrito' });
    } catch (error) {
        console.error("Error al eliminar item:", error); // Loguear error
        res.status(500).json({ message: 'Error al eliminar item', error: error.message });
    }
});

// --- 4. VACIAR Carrito ---
router.delete('/all', async (req, res) => {
     try {
        await pool.query('DELETE FROM carrito WHERE usuario_id = ?', [req.user.id]);
        res.json({ message: 'Carrito vaciado' });
    } catch (error) {
        console.error("Error al vaciar carrito:", error); // Loguear error
        res.status(500).json({ message: 'Error al vaciar carrito', error: error.message });
    }
});

// --- 5. REALIZAR PEDIDO ---
router.post('/checkout', async (req, res) => {
    const usuario_id = req.user.id;
    const { nota: nota_general } = req.body; 
    try {
        const [results] = await pool.query(
            'CALL sp_realizarPedido(?, ?)', 
            [usuario_id, nota_general || null] 
        );
        
        const { pedido_id, total } = results[0][0]; 
        
        res.status(201).json({ 
            message: 'Pedido realizado con éxito', 
            pedido_id: pedido_id, 
            total: total 
        });

    } catch (error) {
        console.error("Error en checkout (SP):", error); 
        res.status(500).json({ message: error.message || 'Error al procesar el pedido' });
    }
});

// --- 6. OBTENER Historial de Pedidos ---
router.get('/history', async (req, res) => {
    try {
        const usuario_id = req.user.id;
        // Lista de pedidos del usuario
        const [pedidos] = await pool.query(
            'SELECT id, total, estado, fecha_pedido, nota FROM pedidos WHERE id_usuario = ? ORDER BY fecha_pedido DESC',
            [usuario_id]
        );
        res.json(pedidos);
    } catch (error) {
        console.error("Error al obtener historial:", error); 
        res.status(500).json({ message: 'Error al obtener historial', error: error.message });
    }
});


// --- 7. OBTENER Detalles de UN Pedido ---
router.get('/history/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const usuario_id = req.user.id;

        // Verifica que el pedido exista y pertenezca al usuario
        const [pedido] = await pool.query(
            'SELECT * FROM pedidos WHERE id = ? AND id_usuario = ?',
            [id, usuario_id]
        );

        if (pedido.length === 0) {
            return res.status(404).json({ message: 'Pedido no encontrado o no autorizado.' });
        }

        // Obtiene los items asociados a ese pedido con sus opciones de personalizacion
        const [items] = await pool.query(`
            SELECT 
                pi.cantidad,
                prod.nombre AS producto,
                pi.nota_cocina,
                pi.precio_unitario,
                GROUP_CONCAT(pio.nombre_opcion SEPARATOR ', ') AS opciones_elegidas
            FROM 
                pedidos_items pi
            -- Usar LEFT JOIN por si el producto fue borrado (producto_id es SET NULL)
            LEFT JOIN 
                productos prod ON pi.producto_id = prod.id 
            LEFT JOIN 
                pedidos_items_opciones pio ON pi.id = pio.pedido_item_id
            WHERE 
                pi.pedido_id = ?
            GROUP BY
                pi.id;
        `, [id]);
        
        // Devuelve los datos del pedido junto con sus items
        res.json({ ...pedido[0], items: items });

    } catch (error) {
        console.error("Error al obtener detalles del pedido:", error); 
        res.status(500).json({ message: 'Error al obtener detalles del pedido', error: error.message });
    }
});

module.exports = router;