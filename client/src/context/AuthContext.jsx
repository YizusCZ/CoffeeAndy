// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    const checkUserSession = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/auth/profile');
            setUser(response.data); 
        } catch (error) {
            console.log('No hay sesión activa o token inválido.');
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkUserSession();
    }, [checkUserSession]);

    const login = async () => {
        await checkUserSession();
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout'); 
        } catch (error) {
            console.error('Error durante el logout en backend:', error);
        } finally {
            setUser(null); 
        }
    };


    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

