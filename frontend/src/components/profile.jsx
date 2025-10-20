// src/components/Profile.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const backendUrl = 'http://localhost:3001';

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/auth/profile');
                setUser(response.data);
            } catch (error) {
                // redireccion a login con token caducado
                console.error("Error al cargar perfil", error);
                localStorage.removeItem('token'); 
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) {
        return <p>Cargando perfil...</p>;
    }

    if (!user) {
        return <p>No se pudieron cargar los datos.</p>;
    }

    const fotoUrlCompleta = user.foto_url 
        ? `${backendUrl}/${user.foto_url.replace(/\\/g, '/')}` 
        : 'url_de_imagen_por_defecto.png'; 

    return (
        <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-md bg-white flex items-center justify-center rounded-2xl shadow-lg p-6 sm:p-8 md:p-10 flex flex-col">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Perfil de Usuario</h1>

                <img class="rounded-sm w-36 h-36" src={fotoUrlCompleta} alt="Extra large avatar"/> 

            <h2 className="text-1xl sm:text-2xl font-bold text-gray-500 mb-2">{user.nombre_completo}</h2>
            <p className = "text-sm sm:text-base text-gray-600"><strong>Rol:</strong> {user.rol}</p>
            
            <button onClick={handleLogout} className='w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 sm:py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base mt-4'>Cerrar Sesión</button>
        </div>
    </div>
    );
}

export default Profile;