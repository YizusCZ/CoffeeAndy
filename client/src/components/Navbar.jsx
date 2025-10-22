import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx'; // Hook del carrito
import { useAuth } from '../context/AuthContext.jsx'; // Hook de auth
import { assets, color } from '../assets/assets.js';
import { backendUrl } from '../context/AppContext.jsx';

function Navbar() {
    const navigate = useNavigate();
    const { cartItems } = useCart();
    const { user, loading: authLoading } = useAuth(); 
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const profileImageUrl = user?.foto_url
        ? `${backendUrl}/${user.foto_url.replace(/\\/g, '/')}` 
        : null; // null si no hay foto

    return (
        <nav className="bg-[#0e345b] text-white p-4 shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/menu" className="text-xl font-bold hover:text-gray-300 transition-color duration-200">
                    <img className='h-12' src={assets.logo_amarillo} alt="Logo"/>
                </Link>

                <div className="hidden md:flex space-x-6 items-center">
                    <Link to="/menu" className="hover:text-gray-300 transition-color duration-200">Menú</Link>
                    <Link to="/historial" className="hover:text-gray-300 transition-color duration-200">Historial</Link>

                    {/* Icono Carrito */}
                    <button
                        onClick={() => navigate('/cart')}
                        className="relative hover:bg-[#0e345b] p-2 rounded-full transition-color duration-200" 
                        aria-label="Ver Carrito"
                        title="Ver Carrito"
                    >
                        <img src={assets.carrito} alt="Carrito" className="h-6 w-6" />
                        {cartItems.length > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
                                {cartItems.length}
                            </span>
                        )}
                    </button>

                    {/* ICONO O IMAGEN DE PERFIL */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="hover:bg-[#0e345b] rounded-full p-1 flex items-center justify-center transition-color duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A263D] focus:ring-white"
                        aria-label="Mi Perfil"
                        title="Mi Perfil"
                    >
                        {authLoading ? (
                            <div className="h-8 w-8 bg-gray-500 rounded-full animate-pulse"></div>
                        ) : profileImageUrl ? (
                            <img
                                src={profileImageUrl}
                                alt="Perfil"
                                className="h-8 w-8 rounded-full object-cover border-2 border-gray-300"
                            />
                        ) : (
                            <img src={assets.perfil} alt="Perfil" className="h-6 w-6" />
                        )}
                    </button>
                </div>

                <div className="md:hidden flex items-center space-x-4">
                    {/* Iconos Carrito y Perfil */}
                    <button
                        onClick={() => navigate('/cart')}
                        className="relative hover:bg-[#0e345b] p-1 rounded-full transition-color duration-200"
                        aria-label="Ver Carrito"
                    >
                        <img src={assets.carrito} alt="Carrito" className="h-6 w-6" />
                        {cartItems.length > 0 && ( 
                           <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">{cartItems.length}</span>
                        )}
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                        className="hover:bg-[#0e345b] rounded-full p-0.5 flex items-center justify-center transition-color duration-200" 
                        aria-label="Mi Perfil"
                    >
                         {authLoading ? ( 
                             <div className="h-7 w-7 bg-gray-500 rounded-full animate-pulse"></div>
                         ) : profileImageUrl ? ( 
                             <img src={profileImageUrl} alt="Perfil" className="h-7 w-7 rounded-full object-cover border border-gray-400"/> 
                         ) : ( 
                             <img src={assets.perfil} alt="Perfil" className="h-6 w-6" />
                         )}
                    </button>
                    {/* Botón Hamburguesa */}
                    <button
                        onClick={toggleMobileMenu}
                        className="text-white focus:outline-none p-1 hover:bg-[#0e345b] rounded transition-color duration-200"
                        aria-label="Abrir menú"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMobileMenuOpen ? ( 
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> 
                            ) : ( 
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /> 
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} absolute top-full left-0 right-0 bg-[#0e345b] shadow-lg z-20`}> 
                <ul className="flex flex-col items-center space-y-4 p-4">
                    <li>
                        <Link to="/menu" className="hover:text-gray-300 block transition-color duration-200" onClick={toggleMobileMenu}>Menú</Link>
                    </li>
                    <li>
                        <Link to="/historial" className="hover:text-gray-300 block transition-color duration-200" onClick={toggleMobileMenu}>Historial</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;