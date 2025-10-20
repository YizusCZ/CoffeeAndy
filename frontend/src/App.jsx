import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers 
import { AuthProvider } from './context/AuthContext.jsx'; 
import CartProvider from './context/CartContext.jsx'; 

// Componentes 
import Login from './components/login.jsx';
import Register from './components/register.jsx';
import Profile from './components/profile.jsx';
import Menu from './components/Menu.jsx';
import Carrito from './components/Carrito.jsx';
import HistorialPedidos from './components/HistorialPedidos.jsx';
import ProductsAdmin from './components/ProductsAdmin.jsx';
import KitchenQueue from './components/KitchenQueue.jsx';
import OptionsAdmin from './components/OptionsAdmin.jsx';

// Componentes con rutas protegidas
import ProtectedRoute from './components/ProtectedRoute.jsx'; 
import AdminRoute from './components/AdminRoute.jsx';

function App() {
    return (
        <AuthProvider> 
            <CartProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Rutas Públicas */}
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        
                        {/* Rutas de Usuario Normal */}
                        <Route 
                            path="/profile" 
                            element={<ProtectedRoute><Profile /></ProtectedRoute>} 
                        />
                        <Route 
                            path="/menu"
                            element={<ProtectedRoute><Menu /></ProtectedRoute>} 
                        />
                        <Route 
                            path="/cart"
                            element={<ProtectedRoute><Carrito /></ProtectedRoute>} 
                        />
                        <Route 
                            path="/historial"
                            element={<ProtectedRoute><HistorialPedidos /></ProtectedRoute>} 
                        />
                        
                        {/* Rutas de Administrador */}
                        <Route
                            path="/admin/products"
                            element={<AdminRoute><ProductsAdmin /></AdminRoute>}
                        />
                        <Route
                            path="/admin/queue" 
                            element={<AdminRoute><KitchenQueue /></AdminRoute>}
                        />
                        <Route
                            path="/admin/options" 
                            element={<AdminRoute><OptionsAdmin /></AdminRoute>}
                        />

                        {/* Redirige cualquier ruta no encontrada */}
                        <Route path="*" element={<Navigate to="/menu" replace />} />
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;