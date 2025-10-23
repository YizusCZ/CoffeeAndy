// src/components/Profile.jsx
import React from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx'; 
import { backendUrl } from '../context/AppContext.jsx';

function Profile() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout(); 
        navigate('/login'); 
    };

    if (loading) {
        return (
            <div>
                <div className="p-5 text-center">Cargando perfil...</div>
            </div>
        );
    }

    if (!user) {
         return (
             <div>
                <div className="p-5 text-center text-red-600">
                    No se pudo cargar el perfil o no has iniciado sesión.
                    <Link to="/login" className="text-blue-500 hover:underline ml-2">Iniciar sesión</Link>
                </div>
            </div>
         );
    }

    const fotoUrlCompleta = user.foto_url
        ? `${backendUrl}/${user.foto_url.replace(/\\/g, '/')}`
        : '/default-avatar.png'; 

    return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center"> {/* Ajustado max-w-sm */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">Perfil de Usuario</h1> {/* Ajustado tamaño y margen */}

                    <img
                        className="rounded-full w-32 h-32 object-cover border-4 border-gray-300 shadow-md mb-4" // Ajustado tamaño y borde
                        src={fotoUrlCompleta}
                        alt="Foto de perfil"
                    />

                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-1">{user.nombre_completo}</h2>
                    <p className="text-sm sm:text-base text-gray-500 mb-6"><strong>Rol:</strong> {user.rol}</p>

                    {/* Botón de Logout */}
                    <button
                        onClick={handleLogout}
                        className='w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 sm:py-3 rounded-lg transition-colors duration-200 text-sm sm:text-base' // Color rojo
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
    );
}

export default Profile;