// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Para el token de verificación (Node.js built-in)
const multer = require('multer');
const pool = require('../db'); // Conexión DB
const sendVerificationEmail = require('../utils/email'); // Lo crearemos abajo

const router = express.Router();

// --- Configuración de Multer para subir foto en la carpeta de almacenamiento (esperemos que si) ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        // Renombre anti colision
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- 1. Endpoint de Registro ---
router.post('/register', upload.single('foto'), async (req, res) => {
    try {
        const { nombre_completo, correo, password } = req.body;
        
        // Verificar si el correo ya existe
        const [userExists] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'El correo ya está registrado.' });
        }

        // Hashear la contraseña
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Obtener la ruta de la foto 
        const foto_url = req.file ? req.file.path : null;

        // Crear token de verificación
        const token_verificacion = crypto.randomBytes(32).toString('hex');

        // Insertar usuario en la base de datos
        await pool.query(
            'INSERT INTO usuarios (nombre_completo, correo, password_hash, foto_url, token_verificacion) VALUES (?, ?, ?, ?, ?)',
            [nombre_completo, correo, password_hash, foto_url, token_verificacion]
        );

        // Enviar correo de verificacion
        await sendVerificationEmail(correo, token_verificacion);

        res.status(201).json({ message: 'Registro exitoso. Por favor, verifica tu correo.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// --- 2. Endpoint de Verificacion de Correo ---
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const [user] = await pool.query('SELECT * FROM usuarios WHERE token_verificacion = ?', [token]);

        if (user.length === 0) {
            return res.status(400).send('Token inválido o expirado.');
        }

        // Marcar como verificado y limpiar el token
        await pool.query(
            'UPDATE usuarios SET verificado = TRUE, token_verificacion = NULL WHERE id = ?',
            [user[0].id]
        );
        
        res.send('¡Correo verificado con éxito! Ya puedes iniciar sesión.');

    } catch (error) {
        res.status(500).send('Error al verificar el correo.');
    }
});

// --- 3. Endpoint de Login ---
router.post('/login', async (req, res) => {
    try {
        const { correo, password } = req.body;

        // 1. Buscar al usuario
        const [user] = await pool.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
        if (user.length === 0) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }
        
        const usuario = user[0];

        // 2. Verificar si esta verificado (si no pues mi loco dele pa fuera)
        if (!usuario.verificado) {
            return res.status(401).json({ message: 'Debes verificar tu correo antes de iniciar sesión.' });
        }

        // 3. Comparar contraseña
        const isMatch = await bcrypt.compare(password, usuario.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas.' });
        }

        // 4. Crear JWT
        const payload = {
            id: usuario.id,
            rol: usuario.rol // rol del tokenn
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '1h' 
        });

        res.json({ token });

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// --- 4. Endpoint de Perfil  ---
// Verificacion con el middleware
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token inválido.' });
    }
};

// Ruta protegida que usa el middleware
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; 

        const [user] = await pool.query(
            'SELECT nombre_completo, foto_url, rol FROM usuarios WHERE id = ?',
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.json(user[0]);

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});


module.exports = router;