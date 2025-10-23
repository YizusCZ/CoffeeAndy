// routes/auth.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Para el token de verificación (Node.js built-in)
const multer = require('multer');
const pool = require('../db'); // Conexión DB
const { sendVerificationEmail } = require('../utils/email');
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

// Validación de imagenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // Aceptar 
    } else {
        // Rechazar
        cb(new Error('Tipo de archivo no válido. Solo se permiten imágenes.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 2 // 2 MB
    },
    fileFilter: fileFilter
});



// --- 1. Endpoint de Registro ---
router.post('/register', (req, res) => {
    upload.single('foto')(req, res, async function (err) {

        // Manejo de Errores de Multer 
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ message: 'El archivo es demasiado grande. Máximo 2 MB.' });
                }
                return res.status(400).json({ message: `Error de Multer: ${err.message}` });
            } else if (err instanceof Error) {
                return res.status(400).json({ message: err.message });
            } else {
                return res.status(500).json({ message: 'Error inesperado al subir el archivo.' });
            }
        }
        try {
            const { nombre_completo, correo, password } = req.body;

            // Validar campos
            if (!nombre_completo || !correo || !password) {
                 return res.status(400).json({ message: 'Nombre, correo y contraseña son requeridos.' });
            }

            // Verificar si el correo ya existe (usando 'usuario')
            const [userExists] = await pool.query('SELECT correo FROM usuario WHERE correo = ?', [correo]);
            if (userExists.length > 0) {
                return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
            }

            // Hashear la contraseña
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            // Obtener la ruta de la foto
            const foto_url = req.file ? req.file.path : null;

            // Crear token de verificación
            const token_verificacion = crypto.randomBytes(32).toString('hex');

            // Insertar usuario en la base de datos 
            // Añadir verificado = FALSE por defecto
            await pool.query(
                'INSERT INTO usuario (nombre_completo, correo, password_hash, foto_url, token_verificacion, verificado) VALUES (?, ?, ?, ?, ?, FALSE)',
                [nombre_completo, correo, password_hash, foto_url, token_verificacion]
            );

            // Enviar correo de verificacion
            await sendVerificationEmail(correo, token_verificacion);

            res.status(201).json({ message: 'Registro exitoso. Por favor, revisa tu correo para verificar tu cuenta.' });

        } catch (dbError) {
            console.error("Error durante el registro:", dbError);
            res.status(500).json({ message: 'Error interno del servidor al registrar el usuario.' });
        }
        
    }); 
}); 

// --- 2. Endpoint de Verificacion de Correo ---
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const [user] = await pool.query('SELECT * FROM usuario WHERE token_verificacion = ?', [token]);

        if (user.length === 0) {
            return res.status(400).send('Token inválido o expirado.');
        }

        // Marcar como verificado y limpiar el token
        await pool.query(
            'UPDATE usuario SET verificado = TRUE, token_verificacion = NULL WHERE id = ?',
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
        const [user] = await pool.query('SELECT * FROM usuario WHERE correo = ?', [correo]);
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

        res.cookie('authToken', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', 
            maxAge: 60 * 60 * 1000 
        });

        res.json({ message: 'Login exitoso' });

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// --- 4. Endpoint de Perfil  ---
// Verificacion con el middleware
const authMiddleware = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) { 
        return res.status(401).json({ message: 'Acceso denegado. No autenticado.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        res.clearCookie('authToken');
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Sesión expirada.' });
        }
        res.status(401).json({ message: 'Token inválido.' });
    }
};

// --- 5. Endpoint de Logout ---
router.post('/logout', (req, res) => {
    res.clearCookie('authToken');
    res.json({ message: 'Logout exitoso' });
});

// Ruta protegida que usa el middleware
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.id; 

        const [user] = await pool.query(
            'SELECT nombre_completo, foto_url, rol FROM usuario WHERE id = ?',
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