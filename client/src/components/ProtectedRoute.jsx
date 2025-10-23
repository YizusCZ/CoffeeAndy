// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();  

  if (loading) {
    return <div>Cargando sesión...</div>; 
  }

  return user ? children : <Navigate to="/login" replace />;
}

export default ProtectedRoute;