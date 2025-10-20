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
                            <p className="text-sm sm:text-base text-gray-600">Usa un correo valido y elige una contraseña segura</p>
                        </div>
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                <input type="text" placeholder="Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-3 sm:py-4 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base transition-all" required />
                <input type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} className="w-full px-4 py-3 sm:py-4 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base transition-all" required />
                <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 sm:py-4 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base transition-all" required />



            <div class="flex items-center justify-center lex flex-col w-full">
                <label block text-sm sm:text-base font-medium text-gray-900 mb-2>Foto de perfil (opcional):</label>

                <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click para subir tu imagen</span> o arrastrala y sueltala</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                    </div>
                    <input id="dropzone-file" type="file" class="hidden" onChange={(e) => setFoto(e.target.files[0])} />
                </label>
            </div> 
                <button type="submit" className='w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 sm:py-4 rounded-lg transition-colors duration-200 text-sm sm:text-base mt-6'>Registrarse</button>
            </form>
            {mensaje && <p className = "text-sm sm:text-base text-gray-600">{mensaje}</p>}
            </div>
        </div>
    );
}

export default Register;

