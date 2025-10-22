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
            const response = await api.get('/cart'); // Llama al backend
            setCartItems(response.data);
        } catch (error) {
            console.error('Error al cargar carrito:', error);
            if (error.response?.status === 401) {
                setCartItems([]); 
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchCart(); // Carga el carrito si hay token
        } else {
            setCartItems([]); 
            setLoading(false);
        }
    }, []); 

    const addToCart = async (productId, cantidad, nota, opcionIds) => {
        try {
            // Llama al backend para añadir el item
            await api.post('/cart', {
                producto_id: productId,
                cantidad: cantidad,
                nota_cocina: nota,
                opcion_ids: opcionIds
            });
            await fetchCart(); // Vuelve a cargar el carrito para reflejar el cambio
        } catch (error) {
            console.error('Error al añadir al carrito:', error);
            alert(`Error al añadir: ${error.response?.data?.message || error.message}`);
        }
    };

    const removeFromCart = async (carritoId) => {
        try {
            // Llama al backend para eliminar el item
            await api.delete(`/cart/${carritoId}`);
            await fetchCart(); // Vuelve a cargar el carrito
        } catch (error) {
            console.error('Error al eliminar del carrito:', error);
            alert(`Error al eliminar: ${error.response?.data?.message || error.message}`);
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

    // El Provider entrega el estado (cartItems, loading) y las funciones
    // a cualquier componente hijo que use el hook useCart()
    return (
        <CartContext.Provider value={{ cartItems, fetchCart, addToCart, removeFromCart, clearCart, loading }}>
            {children}
        </CartContext.Provider>
    );
};
export default CartProvider;