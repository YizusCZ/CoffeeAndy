import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [password, setPassword] = useState('');
    const [foto, setFoto] = useState(null); 
    const [mensaje, setMensaje] = useState('');
    const [fileError, setFileError] = useState(''); 
    const navigate = useNavigate();

    // VALIDACION PORQUE SEGURAMENTE ALGUIEN SE VA A QUERER PASAR DE LISTO
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return; // no hacer nada

        // Validar tipo de archivo
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setFileError('Tipo de archivo no válido. Sube un JPG, PNG o WEBP.');
            setFoto(null); // Limpiar la foto
            return;
        }

        // Validar tamaño 
        const maxSizeInBytes = 2 * 1024 * 1024; // 2 MB
        if (file.size > maxSizeInBytes) {
            setFileError('El archivo es demasiado grande. El máximo es 2 MB.');
            setFoto(null); // Limpiar 
            return;
        }
        
        // si ta bien
        setFileError('');
        setFoto(file); // Guardar el archivo 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // No enviar si hay un error con el archivo
        if (fileError) {
            setMensaje('Por favor, corrige el error en la imagen antes de registrarte.');
            return;
        }
        
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
            setTimeout(() => {
                navigate('/login');
            }, 2000); 
        } catch (error) {
            setMensaje(error.response?.data?.message || 'Error al registrar.');
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-100 flex items-center justify-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8 md:p-10">
                <div className="text-center mb-8 sm:mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Crea una cuenta</h1>
                    <p className="text-sm sm:text-base text-gray-600">Usa un correo válido y elige una contraseña segura</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    <input type="text" placeholder="Nombre Completo" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full px-4 py-3 sm:py-4 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base transition-all" required />
                    <input type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} className="w-full px-4 py-3 sm:py-4 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base transition-all" required />
                    <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 sm:py-4 bg-gray-800 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base transition-all" required />

                    <div className="flex flex-col w-full">
                        <label className="block text-sm sm:text-base font-medium text-gray-900 mb-2">Foto de perfil (opcional):</label>

                        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                {foto ? (
                                    <>
                                        {/* Cuando hay un archivo cargado */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 mb-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p className="font-semibold text-gray-700">{foto.name}</p>
                                        <p className="text-xs text-gray-500">{(foto.size / 1024).toFixed(1)} KB</p>
                                    </>
                                ) : (
                                    <>
                                        {/* Sino */}
                                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Haz clic para subir</span> o arrastra</p>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF (MAX. 2MB)</p>
                                    </>
                                )}
                            </div>
                            <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} />
                        </label>
                        {fileError && <p className="mt-2 text-sm text-red-600 text-center">{fileError}</p>}
                    </div> 
                    
                    <button type="submit" className='w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 sm:py-4 rounded-lg transition-colors duration-200 text-sm sm:text-base mt-6'>Registrarse</button>
                </form>
                {mensaje && <p className="mt-4 text-sm text-gray-600 text-center">{mensaje}</p>}
            </div>
        </div>
    );
}

export default Register;