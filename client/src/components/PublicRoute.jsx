// src/components/PublicRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; 

function PublicRoute({ children }) {
  const { token, loading } = useAuth();

  // Verificando toke inicias
  if (loading) {
    return <div>Cargando...</div>; // O un spinner
  }

  // Si hay un usuario logueado redirige a /menu
  if (token && !loading) {
    return <Navigate to="/menu" replace />; // 'replace' evita que el usuario pueda volver atrás
  }

  // muestra las rutas publicass
  return children;
}

export default PublicRoute;