// backend/middleware/adminAuth.js
const jwt = require('jsonwebtoken');

const adminAuth = (req, res, next) => {
    const token = req.cookies.authToken;

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado. No autenticado.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.rol === 'admin') {
            req.user = decoded; 
            next(); 
        } else {
            return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador.' }); 
        }

    } catch (error) {
        res.clearCookie('authToken');
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Sesión expirada.' });
        }
        return res.status(401).json({ message: 'Token inválido.' });
    }
};

module.exports = adminAuth;