import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// --- Componentes de las paginas ---
import CartProvider from './context/CartContext.jsx'; 
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import Profile from './components/Profile.jsx';
import Menu from './components/Menu.jsx';
import Carrito from './components/Carrito.jsx';
import HistorialPedidos from './components/HistorialPedidos.jsx';
import ProductsAdmin from './components/ProductsAdmin.jsx';
import KitchenQueue from './components/KitchenQueue.jsx';
import OptionsAdmin from './components/OptionsAdmin.jsx';

// --- Componentes para Rutas Protegidas ---
import ProtectedRoute from './components/ProtectedRoute.jsx'; 
import AdminRoute from './components/AdminRoute.jsx';

function App() {
    return (
        <CartProvider>
            <BrowserRouter>
                <Routes>
                    {/* --- Rutas Públicas --- */}
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    {/* --- Rutas de Usuario Normal (Protegidas) --- */}
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
                    
                    {/* --- Ruta de Administrador --- */}
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

                    {/* Redirige cualquier ruta no encontrada a la página de menú */}
                    <Route path="*" element={<Navigate to="/menu" replace />} />
                </Routes>
            </BrowserRouter>
        </CartProvider>
    );
}

export default App;

