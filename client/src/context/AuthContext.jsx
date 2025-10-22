// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api'; 
import { jwtDecode } from 'jwt-decode'; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [loading, setLoading] = useState(true);
    const [token, setTokenState] = useState(localStorage.getItem('token')); 

    const fetchUserProfile = useCallback(async (currentToken) => {
        if (!currentToken) {
            setUser(null);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const response = await api.get('/auth/profile'); 
            setUser(response.data);
        } catch (error) {
            console.error('Error al obtener perfil o token inválido:', error);
            setUser(null); 
            localStorage.removeItem('token');
            setTokenState(null); 
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserProfile(token);
    }, [token, fetchUserProfile]);

    // Función para manejar el login 
    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setTokenState(newToken); 
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setTokenState(null);
    };

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    console.log("Token expirado, cerrando sesión.");
                    logout();
                }
            } catch (e) {
                console.error("Token inválido:", e);
                logout();
            }
        }
    }, [token]); 


    return (
        <AuthContext.Provider value={{ user, loading, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider; 