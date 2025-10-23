import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers 
import { AuthProvider } from './context/AuthContext.jsx'; 
import CartProvider from './context/CartContext.jsx'; 

// Componentes 
import Login from './components/login.jsx';
import Register from './components/register.jsx';
import Profile from './components/client/profile.jsx';
import Menu from './components/Menu.jsx';
import Carrito from './components/client/Carrito.jsx';
import HistorialPedidos from './components/client/HistorialPedidos.jsx';
import ProductsAdmin from './components/admin/ProductsAdmin.jsx';
import KitchenQueue from './components/admin/KitchenQueue.jsx';
import OptionsAdmin from './components/admin/OptionsAdmin.jsx';
import Invitado from './components/Invitado.jsx';

// Ruta publica
import PublicRoute from './context/PublicRoute.jsx';

// Componentes con rutas protegidas
import ProtectedRoute from './context/ProtectedRoute.jsx'; 
import AdminRoute from './components/admin/AdminRoute.jsx';
import Footer from './components/Footer.jsx';


function App() {

    return (
        <AuthProvider> 
            <CartProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Rutas Públicas */}
                        <Route path="/" element={<Navigate to="/menu" replace />} />
                        <Route path="/menu" element={<PublicRoute><Menu/></PublicRoute>}/>
                        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                        <Route path="/invitado" element={<PublicRoute><Invitado /></PublicRoute>} />
                        
                        {/* Rutas de Usuario Normal */}
                        <Route 
                            path="/profile" 
                            element={<ProtectedRoute><Profile /></ProtectedRoute>} 
                        />
                        
                        <Route 
                            path="/cart"
                            element={<ProtectedRoute><Carrito/></ProtectedRoute>} 
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
                  {<Footer/>}
        </AuthProvider>
    );
}

export default App;