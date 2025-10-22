// backend/routes/menu.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const userAuth = require('../middleware/userAuth'); 

router.use(userAuth);

// 1. Productos activos para el menu
router.get('/products', async (req, res) => {
    try {
        const [productos] = await pool.query(`
            SELECT p.*, c.nombre AS categoria_nombre 
            FROM producto p
            LEFT JOIN categoria c ON p.categoria_id = c.id
            WHERE p.activo = TRUE  -- Solo los activos
            ORDER BY p.nombre ASC
        `);
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos', error });
    }
});

// 2. Leer los productos
router.get('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [results] = await pool.query('CALL sp_obtenerDetallesProducto(?)', [id]);
        
        if (!results[0] || results[0].length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        const producto = results[0][0];
        const opciones = results[1];
        
        // Agrupar opciones
        const grupos = {};
        opciones.forEach(opt => {
            const grupoNombre = opt.grupo;
            if (!grupos[grupoNombre]) {
                grupos[grupoNombre] = {
                    tipo_seleccion: opt.tipo_seleccion,
                    requerido: opt.requerido,
                    opciones: []
                };
            }
            
            grupos[grupoNombre].opciones.push({
                opcion_id: opt.opcion_id,      
                opcion: opt.opcion,           
                ajuste_precio: parseFloat(opt.ajuste_precio)
            });
        });

        res.json({ ...producto, precio_base: parseFloat(producto.precio_base), grupos_opciones: grupos });
        
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener detalle del producto', error });
    }
});

module.exports = router;