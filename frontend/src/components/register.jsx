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
        <div>
            <h2>Registro</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" placeholder="Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
                <input type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <div>
                    <label>Foto de perfil (opcional):</label>
                    <input type="file" onChange={(e) => setFoto(e.target.files[0])} />
                </div>
                <button type="submit">Registrarse</button>
            </form>
            {mensaje && <p>{mensaje}</p>}
        </div>
    );
}

export default Register;