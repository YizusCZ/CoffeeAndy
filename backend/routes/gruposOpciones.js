// backend/routes/gruposOpciones.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const adminAuth = require('../middleware/adminAuth'); 

router.use(adminAuth);

// 1. OBTENER todos los grupos de opciones con  sus opciones valga la redundancia
router.get('/', async (req, res) => {
    try {
        const [grupos] = await pool.query('SELECT * FROM grupos_opciones ORDER BY nombre ASC');
        const [opciones] = await pool.query('SELECT * FROM opciones ORDER BY nombre ASC');
        
        const gruposConOpciones = grupos.map(grupo => ({
            ...grupo,
            requerido: Boolean(grupo.requerido), 
            opciones: opciones.filter(op => op.grupo_opcion_id === grupo.id)
        }));
        
        res.json(gruposConOpciones);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener grupos de opciones', error });
    }
});

// 2. CREAR un nuevo grupo
router.post('/', async (req, res) => {
    try {
        const { nombre, tipo_seleccion, requerido } = req.body;
        const [result] = await pool.query(
            'INSERT INTO grupos_opciones (nombre, tipo_seleccion, requerido) VALUES (?, ?, ?)',
            [nombre, tipo_seleccion || 'UNICO', requerido || false]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el grupo', error });
    }
});

// 3. ACTUALIZAR un grupo
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, tipo_seleccion, requerido } = req.body;
        await pool.query(
            'UPDATE grupos_opciones SET nombre = ?, tipo_seleccion = ?, requerido = ? WHERE id = ?',
            [nombre, tipo_seleccion, requerido, id]
        );
        res.json({ message: 'Grupo actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el grupo', error });
    }
});

// 4. ELIMINAR un grupo
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [usos] = await pool.query('SELECT * FROM productos_grupos_opciones WHERE grupo_opcion_id = ?', [id]);
        if (usos.length > 0) {
            return res.status(400).json({ message: `No se puede eliminar. ${usos.length} productos están usando este grupo.` });
        }
        
        await pool.query('DELETE FROM grupos_opciones WHERE id = ?', [id]);
        res.json({ message: 'Grupo y sus opciones eliminados' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el grupo', error });
    }
});


// 5. CREAR una nueva opción para un grupo
router.post('/:grupo_id/opciones', async (req, res) => {
    try {
        const { grupo_id } = req.params;
        const { nombre, ajuste_precio } = req.body;
        const [result] = await pool.query(
            'INSERT INTO opciones (grupo_opcion_id, nombre, ajuste_precio) VALUES (?, ?, ?)',
            [grupo_id, nombre, ajuste_precio || 0]
        );
        res.status(201).json({ id: result.insertId, grupo_opcion_id: grupo_id, ...req.body });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la opción', error });
    }
});

// 6. ACTUALIZAR una opción
router.put('/opciones/:opcion_id', async (req, res) => {
    try {
        const { opcion_id } = req.params;
        const { nombre, ajuste_precio } = req.body;
        await pool.query(
            'UPDATE opciones SET nombre = ?, ajuste_precio = ? WHERE id = ?',
            [nombre, ajuste_precio, opcion_id]
        );
        res.json({ message: 'Opción actualizada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la opción', error });
    }
});

// 7. ELIMINAR una opción
router.delete('/opciones/:opcion_id', async (req, res) => {
    try {
        const { opcion_id } = req.params;
        await pool.query('DELETE FROM opciones WHERE id = ?', [opcion_id]);
        res.json({ message: 'Opción eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la opción', error });
    }
});

module.exports = router;