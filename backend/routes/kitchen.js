// backend/routes/kitchen.js (cocina para los panas)
const express = require('express');
const router = express.Router();
const pool = require('../db');
const adminAuth = require('../middleware/adminAuth'); 

router.use(adminAuth);

// 1. OBTENER LA COLA DE PEDIDOS 
router.get('/queue', async (req, res) => {
    try {
        const [items] = await pool.query(`
            SELECT 
                p.id AS num_pedido,
                p.estado,
                p.nombre_cliente,
                p.nota AS nota_general,
                p.fecha_pedido,
                pi.id AS pedido_item_id,
                pi.cantidad,
                prod.nombre AS producto,
                pi.nota_cocina,
                GROUP_CONCAT(op.nombre SEPARATOR ', ') AS opciones_elegidas
            FROM 
                pedidos p
            JOIN 
                pedidos_items pi ON p.id = pi.pedido_id
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
        `);
        
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la cola de pedidos", error: error.message });
    }
});

// 2. ACTUALIZAR ESTADO DE UN PEDIDO
router.put('/order/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; 

        const validStates = ['Recibido', 'En preparación', 'Listo para recoger', 'Cancelado'];
        if (!validStates.includes(estado)) {
            return res.status(400).json({ message: 'Estado no válido' });
        }

        if (estado === 'Cancelado') {
            await pool.query('CALL sp_cancelarPedido(?)', [id]);
        } else {

            await pool.query(
                'UPDATE pedidos SET estado = ? WHERE id = ?',
                [estado, id]
            );
        }
        
        res.json({ message: `Pedido #${id} actualizado a ${estado}` });

    } catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({ message: "Error al actualizar el estado", error: error.message });
    }
});

module.exports = router;