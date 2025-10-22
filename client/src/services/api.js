import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3001/api' 
});

// Interceptor para añadir el token a todas las peticiones (excepto login/register)
api.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default api;