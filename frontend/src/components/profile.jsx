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
        <div>
            <h1>Perfil de Usuario</h1>
            <img 
                src={fotoUrlCompleta} 
                alt="Foto de perfil" 
                style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }} 
            />
            <h2>{user.nombre_completo}</h2>
            <p><strong>Rol:</strong> {user.rol}</p>
            
            <button onClick={handleLogout}>Cerrar Sesión</button>
        </div>
    );
}

export default Profile;