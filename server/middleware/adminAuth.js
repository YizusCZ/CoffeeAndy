// backend/middleware/adminAuth.js
const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
    // 1. Obtener el token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' });
    }

    try {
        // 2. Verificacion del token
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Verificar el rol del usuario
        if (decoded.rol === 'admin') {
            req.user = decoded; // Guardar el usuario
            next(); 
        } else {
            // Si esta logueado pero NO es admin
            return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' });
        }

    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

module.exports = adminAuth;

