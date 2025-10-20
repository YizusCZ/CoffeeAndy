// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; 

// Verificar si el token es valido y de un admin
const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        return { isAuthenticated: false, isAdmin: false };
    }

    try {
        // Decodificar el token
        const decodedToken = jwtDecode(token);

        const isExpired = decodedToken.exp * 1000 < Date.now();
        if (isExpired) {
            localStorage.removeItem('token'); 
            return { isAuthenticated: false, isAdmin: false };
        }
        
        // Devolver estado de autenticacion y rol
        return {
            isAuthenticated: true,
            isAdmin: decodedToken.rol === 'admin'
        };

    // no quiten la linea de abajo pls
    // eslint-disable-next-line no-unused-vars 
    } catch (error) {
        localStorage.removeItem('token');
        return { isAuthenticated: false, isAdmin: false };
    }
};

function AdminRoute({ children }) {
    const { isAuthenticated, isAdmin } = checkAuth();

    if (!isAuthenticated) {
        // Si no estas logueado, mi loco dele a login
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        // Si estas logueado pero NO es admin, a tu perfil (por ahorita)
        return <Navigate to="/menu" replace />;
    }

    return children;
}

export default AdminRoute;