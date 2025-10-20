import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const styles = {
    container: { padding: '20px', maxWidth: '800px', margin: 'auto' },
    title: { fontSize: '28px', fontWeight: 'bold' },
    item: { display: 'flex', borderBottom: '1px solid #eee', padding: '10px 0' },
    itemDetails: { flex: 1, padding: '0 10px' },
    itemTotal: { fontWeight: 'bold' },
    footer: { marginTop: '20px', textAlign: 'right' },
    granTotal: { fontSize: '24px', fontWeight: 'bold' },
    checkoutButton: { padding: '10px 20px', background: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '18px', marginLeft: '10px' }
};

function Carrito() {
    const { cartItems, removeFromCart, clearCart, loading } = useCart();
    const navigate = useNavigate();

    const calcularGranTotal = () => {
        return cartItems.reduce((total, item) => total + item.subtotal, 0);
    };

    const handleCheckout = async () => {
        try {
            const response = await api.post('/cart/checkout', { nota: "" });
            alert(`¡Pedido #${response.data.pedido_id} realizado con éxito!`);
            clearCart(); // Limpia el estado local
            navigate('/historial');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al realizar pedido');
        }
    };

    if (loading) return <p>Cargando carrito...</p>;

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>🛒 Mi Carrito</h1>
            <Link to="/historial">Ver historial de pedidos</Link>
            
            <div style={{ margin: '20px 0' }}>
                {cartItems.length === 0 ? (
                    <p>Tu carrito está vacío. <Link to="/menu">¡Ve al menú!</Link></p>
                ) : (
                    cartItems.map(item => (
                        <div key={item.carrito_id} style={styles.item}>
                            <div style={styles.itemDetails}>
                                <h4>{item.nombre} (x{item.cantidad})</h4>
                                <p style={{color: '#555', fontSize: '14px'}}>Opciones: {item.opciones_nombres || 'Ninguna'}</p>
                                <p style={{color: '#555', fontSize: '14px'}}>Nota: {item.nota_cocina || 'N/A'}</p>
                            </div>
                            <div style={styles.itemTotal}>
                                <p>${item.subtotal.toFixed(2)}</p>
                                <button onClick={() => removeFromCart(item.carrito_id)} style={{color: 'red', border: 'none', background: 'none', cursor: 'pointer'}}>
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {cartItems.length > 0 && (
                <div style={styles.footer}>
                    <h2 style={styles.granTotal}>Total: ${calcularGranTotal().toFixed(2)}</h2>
                    <button onClick={handleCheckout} style={styles.checkoutButton}>
                        Realizar Pedido
                    </button>
                </div>
            )}
        </div>
    );
}

export default Carrito;