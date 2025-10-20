// src/components/Register.jsx
import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [foto, setFoto] = useState(null); 
    const [mensaje, setMensaje] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('nombre_completo', nombre);
        formData.append('correo', correo);
        formData.append('password', password);
        if (foto) {
            formData.append('foto', foto);
        }

        try {
            const response = await api.post('/auth/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMensaje(response.data.message);
            navigate('/login'); 
        } catch (error) {
            setMensaje(error.response?.data?.message || 'Error al registrar.');
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
                    <div className="text-center mb-8 sm:mb-10">
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Crea una cuenta</h1>
                            <p className="text-sm sm:text-base text-gray-600">Inicia sesión para continuar</p>
                        </div>
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <input type="text" placeholder="Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-3 sm:py-4 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base transition-all" required />
                <input type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} className="w-full px-4 py-3 sm:py-4 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base transition-all" required />
                <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 sm:py-4 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base transition-all" required />
                <div>
                    <label>Foto de perfil (opcional):</label>
                    <input type="file" onChange={(e) => setFoto(e.target.files[0])} />
                </div>
                <button type="submit">Registrarse</button>
            </form>
            {mensaje && <p>{mensaje}</p>}
            </div>
        </div>
    );
}

export default Register;