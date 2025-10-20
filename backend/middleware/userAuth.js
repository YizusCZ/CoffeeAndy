// backend/middleware/userAuth.js
const jwt = require('jsonwebtoken');

const userAuth = (req, res, next) => {
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
        // Token inválido o expirado
        res.status(401).json({ message: 'Token inválido.' });
    }
};

module.exports = userAuth;