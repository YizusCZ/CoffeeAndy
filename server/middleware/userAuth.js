// backend/middleware/userAuth.js
const jwt = require('jsonwebtoken');

// Este middleware solo revisa si el token en la COOKIE es válido
const userAuth = (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No autenticado.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next(); 
    } catch (error) {
        // Si el token es inválido o expirado, limpiar la cookie
        res.clearCookie('authToken');
        if (error.name === 'TokenExpiredError') {
             return res.status(401).json({ message: 'Sesión expirada.' });
        }
        return res.status(401).json({ message: 'Token inválido.' });
    }
};

module.exports = userAuth;