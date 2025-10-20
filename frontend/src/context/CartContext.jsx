import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);
const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const response = await api.get('/cart');
            setCartItems(response.data);
        } catch (error) {
            console.error('Error al cargar carrito:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCart();
        } else {
            setLoading(false);
        }
    }, []);

    const addToCart = async (productId, cantidad, nota, opcionIds) => {
        try {
            await api.post('/cart', {
                producto_id: productId,
                cantidad: cantidad,
                nota_cocina: nota,
                opcion_ids: opcionIds 
            });
            await fetchCart(); // Recargar el carrito
        } catch (error) {
            console.error('Error al añadir al carrito:', error);
            alert(error.response?.data?.message || 'Error al añadir');
        }
    };

    const removeFromCart = async (carritoId) => {
        try {
            await api.delete(`/cart/${carritoId}`);
            await fetchCart(); // Recargar
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
        }
    };

    const clearCart = async () => {
         try {
            await api.delete('/cart/all'); // Endpoint para vaciar
            setCartItems([]);
        } catch (error) {
            console.error('Error al vaciar el carrito:', error);
        }
    };

    return (
        <CartContext.Provider value={{ cartItems, fetchCart, addToCart, removeFromCart, clearCart, loading }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartProvider;