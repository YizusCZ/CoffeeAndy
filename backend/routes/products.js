// backend/routes/products.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const adminAuth = require('../middleware/adminAuth');
const multer = require('multer');

// Multer para la carga de imagenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

router.use(adminAuth);

router.get('/', async (req, res) => {
    try {
        const [productos] = await pool.query(`
            SELECT p.*, c.nombre AS categoria_nombre 
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            ORDER BY p.id DESC
        `);
        res.json(productos);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener productos', error });
    }
});

// Detalles de un producto
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [results] = await pool.query('CALL sp_obtenerDetallesProducto(?)', [id]);
        
        if (!results[0] || results[0].length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        
        const producto = results[0][0];
        const opciones = results[1];
        
        const grupos = {};
        opciones.forEach(opt => {
            if (!grupos[opt.grupo]) {
                grupos[opt.grupo] = {
                    tipo_seleccion: opt.tipo_seleccion,
                    requerido: opt.requerido,
                    opciones: []
                };
            }
            grupos[opt.grupo].opciones.push({
                opcion_id: opt.opcion_id, 
                opcion: opt.opcion,
                ajuste_precio: parseFloat(opt.ajuste_precio)
            });
        });

        res.json({ ...producto, grupos_opciones: grupos });
        
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener detalle del producto', error });
    }
});

// 3. Añadir un nuevo producto
router.post('/', upload.single('imagen'), async (req, res) => {
    let connection;
    try {
        const { nombre, precio, categoria_id, grupos_opciones_ids, stock } = req.body;
        const imagen_url = req.file ? req.file.path : null;
        
        connection = await pool.getConnection();
        await connection.beginTransaction();

        const [result] = await connection.query(
            'INSERT INTO productos (nombre, precio, categoria_id, imagen_url, stock) VALUES (?, ?, ?, ?, ?)',
            [nombre, precio, categoria_id, imagen_url, stock || 0] 
        );
        const nuevoProductoId = result.insertId;

        if (grupos_opciones_ids) {
            const ids = JSON.parse(grupos_opciones_ids); 
            if (ids && ids.length > 0) {
                const values = ids.map(grupo_id => [nuevoProductoId, grupo_id]);
                await connection.query(
                    'INSERT INTO productos_grupos_opciones (producto_id, grupo_opcion_id) VALUES ?',
                    [values]
                );
            }
        }
        
        await connection.commit();
        res.status(201).json({ id: nuevoProductoId, ...req.body, imagen_url });

    } catch (error) {
        if (connection) await connection.rollback();
        res.status(500).json({ message: 'Error al crear el producto', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// 4. Activar/Desactivar producto
router.put('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;
        const { activo } = req.body;
        await pool.query('UPDATE productos SET activo = ? WHERE id = ?', [activo, id]);
        res.json({ message: 'Producto actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar producto', error });
    }
});

// 5. Actualizar producto y sus grupos 
router.put('/:id', upload.single('imagen'), async (req, res) => {
     let connection;
    try {
        const { id } = req.params;
        const { nombre, precio, categoria_id, grupos_opciones_ids, stock } = req.body;
        
        connection = await pool.getConnection();
        await connection.beginTransaction();

        await connection.query(
            'UPDATE productos SET nombre = ?, precio = ?, categoria_id = ?, stock = ? WHERE id = ?',
            [nombre, precio, categoria_id, stock || 0, id]
        );

        await connection.query('DELETE FROM productos_grupos_opciones WHERE producto_id = ?', [id]);

        if (grupos_opciones_ids) {
            const ids = JSON.parse(grupos_opciones_ids);
            if (ids && ids.length > 0) {
                const values = ids.map(grupo_id => [id, grupo_id]);
                await connection.query(
                    'INSERT INTO productos_grupos_opciones (producto_id, grupo_opcion_id) VALUES ?',
                    [values]
                );
            }
        }
        
        await connection.commit();
        res.json({ message: 'Producto actualizado con éxito' });
    } catch (error) {
         if (connection) await connection.rollback();
        res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
    } finally {
        if (connection) connection.release();
    }
});


// 6. Eliminar un producto
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM productos WHERE id = ?', [req.params.id]);
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar producto', error });
    }
});


// 7. MARCAR COMO ESPECIAL OSEASE COMIDA DEL DIA 
router.put('/:id/toggle-especial', async (req, res) => {
    try {
        const { id } = req.params;
        const { especial } = req.body; 

        if (typeof especial !== 'boolean') {
            return res.status(400).json({ message: 'El valor de "especial" debe ser true o false.' });
        }
        
        await pool.query('UPDATE productos SET especial = ? WHERE id = ?', [especial, id]);
        res.json({ message: `Producto #${id} actualizado como especial: ${especial}` });
    } catch (error) {
        console.error("Error al cambiar estado 'especial':", error);
        res.status(500).json({ message: 'Error al actualizar el estado especial', error });
    }
});
module.exports = router;