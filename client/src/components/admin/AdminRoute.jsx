// src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function AdminRoute({ children }) {
    const { user, loading } = useAuth(); 

    if (loading) {
        return <div>Cargando sesión...</div>; 
    }

    if (user && user.rol === 'admin') {
        return children;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Navigate to="/menu" replace />;
}
export default AdminRoute;