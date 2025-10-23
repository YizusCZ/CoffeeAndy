import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api'; 
import { useAuth } from './AuthContext'; 

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]); 
    const [loading, setLoading] = useState(true); 
    const { user, loading: authLoading } = useAuth(); 

    const fetchCart = useCallback(async () => {
        if (!user || authLoading) {
            setCartItems([]); 
            setLoading(false); 
            return;
        }
        try {
            setLoading(true); 
            const response = await api.get('/cart'); 
            setCartItems(response.data); 
        } catch (error) {
            console.error('Error al cargar carrito:', error);
            if (error.response?.status === 401 || error.response?.status === 403) {
                setCartItems([]);
            }
        } finally {
            setLoading(false); 
        }
    }, [user, authLoading]); 

    useEffect(() => {
        if (authLoading) {
            setLoading(true); 
            return;
        }
        if (user) {
            fetchCart();
        } else {
            setCartItems([]);
            setLoading(false);
        }
    }, [user, authLoading, fetchCart]); 

    const addToCart = async (productId, cantidad, nota, opcionIds) => {
        try {
            await api.post('/cart', {
                producto_id: productId,
                cantidad: cantidad,
                nota_cocina: nota || null, 
                opcion_ids: opcionIds || [] 
            });
            await fetchCart();
            alert('Producto añadido al carrito!');
            return true; 
        } catch (error) {
            console.error('Error al añadir al carrito:', error);
            return false; 
        }
    };

    const removeFromCart = async (carritoId) => {
        try {
            await api.delete(`/cart/${carritoId}`);
            await fetchCart();
            return true; 
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
            return false; 
        }
    };

    const clearCart = async () => {
         try {
            await api.delete('/cart/all');
        } catch (error) {
            console.error('Error al vaciar el carrito en el backend:', error);
        } finally {
            setCartItems([]);
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, loading, fetchCart, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;