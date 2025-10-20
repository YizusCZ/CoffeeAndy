import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; // Hook de auth

const backendUrl = 'http://localhost:3001'; 

function NavbarAdmin() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth(); 
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const profileImageUrl = user?.foto_url
        ? `${backendUrl}/${user.foto_url.replace(/\\/g, '/')}` 
        : null; // null si no hay foto

    return (
        <nav className="bg-slate-800 text-white p-4 shadow-md sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <Link to="/admin/products" className="text-xl font-bold hover:text-gray-300 transition-colors duration-200">
                    Coffee Andy 
                </Link>

                <div className="hidden md:flex space-x-6 items-center">
                    <Link to="/admin/products" className="hover:text-gray-300 transition-colors duration-200">Productos</Link>
                    <Link to="/admin/queue" className="hover:text-gray-300 transition-colors duration-200">Cola de pedidos</Link>


                    {/* ICONO O IMAGEN DE PERFIL */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="hover:bg-slate-700 rounded-full p-1 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-white" // Efectos hover y focus
                        aria-label="Mi Perfil"
                        title="Mi Perfil"
                    >
                        {authLoading ? (
                            <div className="h-8 w-8 bg-gray-500 rounded-full animate-pulse"></div>
                        ) : profileImageUrl ? (
                            <img
                                src={profileImageUrl}
                                alt="Perfil"
                                className="h-8 w-8 rounded-full object-cover border-2 border-gray-300" // Tamaño, redondeado, ajuste y borde
                            />
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"> 
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </button>
                </div>

                <div className="md:hidden flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/profile')}
                        className="hover:bg-slate-700 rounded-full p-0.5 flex items-center justify-center transition-colors duration-200" 
                        aria-label="Mi Perfil"
                    >
                         {authLoading ? ( <div className="h-7 w-7 bg-gray-500 rounded-full animate-pulse"></div>) 
                         : profileImageUrl ? ( <img src={profileImageUrl} alt="Perfil" className="h-7 w-7 rounded-full object-cover border border-gray-400"/> ) 
                         : ( /* SVG Perfil */ <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> )
                         }
                    </button>
                    {/* Botón Hamburguesa */}
                    <button
                        onClick={toggleMobileMenu}
                        className="text-white focus:outline-none p-1 hover:bg-slate-700 rounded transition-colors duration-200"
                        aria-label="Administrar productos"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {isMobileMenuOpen ? ( <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> )
                            : ( <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /> )}
                        </svg>
                    </button>
                </div>
            </div>

            <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} absolute top-full left-0 right-0 bg-slate-700 shadow-lg z-20`}> 
                <ul className="flex flex-col items-center space-y-4 p-4">
                    <li>
                        <Link to="/admin/products" className="hover:text-gray-300 block transition-colors duration-200" onClick={toggleMobileMenu}>Menú</Link>
                    </li>
                    <li>
                        <Link to="/admin/queue" className="hover:text-gray-300 block transition-colors duration-200" onClick={toggleMobileMenu}>Historial</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default NavbarAdmin;