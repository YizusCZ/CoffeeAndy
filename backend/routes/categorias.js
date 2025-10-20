// backend/routes/categorias.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const adminAuth = require('../middleware/adminAuth'); 

router.use(adminAuth);

// 1. OBTENER todas las categorías
router.get('/', async (req, res) => {
    try {
        const [categorias] = await pool.query('SELECT * FROM categorias ORDER BY nombre ASC');
        res.json(categorias);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener categorías', error });
    }
});

// 2. CREAR una nueva categoría
router.post('/', async (req, res) => {
    try {
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ message: 'El nombre es requerido' });
        }
        const [result] = await pool.query('INSERT INTO categorias (nombre) VALUES (?)', [nombre]);
        res.status(201).json({ id: result.insertId, nombre });
    } catch (error) {
        // 'ER_DUP_ENTRY' codigo de error para UNIQUE
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Esa categoría ya existe.' });
        }
        res.status(500).json({ message: 'Error al crear la categoría', error });
    }
});

// 3. ACTUALIZAR una categoría
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;
        if (!nombre) {
            return res.status(400).json({ message: 'El nombre es requerido' });
        }
        await pool.query('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre, id]);
        res.json({ message: 'Categoría actualizada' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Ese nombre de categoría ya está en uso.' });
        }
        res.status(500).json({ message: 'Error al actualizar la categoría', error });
    }
});

// 4. ELIMINAR una categoría
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [productos] = await pool.query('SELECT * FROM productos WHERE categoria_id = ?', [id]);
        if (productos.length > 0) {
            return res.status(400).json({ message: `No se puede eliminar. ${productos.length} productos están usando esta categoría.` });
        }
        
        await pool.query('DELETE FROM categorias WHERE id = ?', [id]);
        res.json({ message: 'Categoría eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la categoría', error });
    }
});

module.exports = router;