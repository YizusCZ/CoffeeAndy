import React from 'react';
import { useCart } from '../../context/CartContext.jsx'; 
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js'; 
import Navbar from '../Navbar.jsx'; 


const styles = {
    container: { padding: '20px', maxWidth: '800px', margin: 'auto', fontFamily: 'Arial, sans-serif' },
    title: { fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' },
    links: { marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }, // Para links
    item: { display: 'flex', borderBottom: '1px solid #eee', padding: '15px 0', gap: '15px', alignItems: 'center' }, 
    itemDetails: { flex: 1 },
    itemTotal: { fontWeight: 'bold', textAlign: 'right', minWidth: '80px' }, 
    footer: { marginTop: '30px', textAlign: 'right', borderTop: '2px solid #333', paddingTop: '15px' }, 
    granTotal: { fontSize: '24px', fontWeight: 'bold', marginBottom: '15px' },
    checkoutButton: { padding: '12px 25px', background: 'green', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '18px' },
    deleteButton: { color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 5px' } 
};

function Carrito() {
    // Obtener funciones y estado del contexto del carrito
    const { cartItems, removeFromCart, clearCart, loading } = useCart();
    const navigate = useNavigate();

    // Calcula el total sumando los subtotales de cada item
    const calcularGranTotal = () => {
        // Usar || 0 por si subtotal es undefined o null
        return cartItems.reduce((total, item) => total + (item.subtotal || 0), 0);
    };

    // Maneja el proceso de checkout
    const handleCheckout = async () => {
        try {
            // Llama al endpoint del backend 'sp_realizarPedido'
            const response = await api.post('/cart/checkout', { nota: "" }); // Puedes añadir un input para la nota general si quieres
            alert(`✅ ¡Pedido #${response.data.pedido_id} realizado con éxito!`);

            await clearCart();

            navigate('/historial');

        } catch (error) {
            console.error("Error en checkout:", error); 
            alert(`Error al realizar pedido: ${error.response?.data?.message || error.message}`);
        }
    };

    if (loading) return <p style={styles.container}>Cargando carrito...</p>;

    return (
    <div>
    <Navbar />
        <div style={styles.container}>
            <h1 style={styles.title}>🛒 Mi Carrito</h1>
            <div style={styles.links}>
                <Link to="/menu">← Seguir comprando</Link>
                <Link to="/historial">Ver historial de pedidos →</Link>
            </div>

            <div style={{ marginTop: '30px' }}> 
                {cartItems.length === 0 ? (
                    <p>Tu carrito está vacío.</p>
                ) : (
                    // Mapear y mostrar cada item del carrito
                    cartItems.map(item => (
                        <div key={item.carrito_id} style={styles.item}>
                            {/* Detalles del item */}
                            <div style={styles.itemDetails}>
                                <h4>{item.nombre} (x{item.cantidad})</h4>
                                {/* Mostrar opciones si existen */}
                                {item.opciones_nombres && <p style={{color: '#555', fontSize: '14px', margin: '2px 0'}}>Opciones: {item.opciones_nombres}</p>}
                                {/* Mostrar nota si existe */}
                                {item.nota_cocina && <p style={{color: '#555', fontSize: '14px', margin: '2px 0'}}>Nota: {item.nota_cocina}</p>}
                            </div>
                            {/* Subtotal y botón de eliminar */}
                            <div style={styles.itemTotal}>
                                <p>${(item.subtotal || 0).toFixed(2)}</p>
                                <button
                                    onClick={() => removeFromCart(item.carrito_id)}
                                    style={styles.deleteButton}
                                    title="Eliminar item"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {cartItems.length > 0 && (
                <div style={styles.footer}>
                    <div style={styles.granTotal}>Total: ${calcularGranTotal().toFixed(2)}</div>
                    <button onClick={handleCheckout} style={styles.checkoutButton}>
                        Realizar Pedido
                    </button>
                </div>
            )}
        </div>
    </div>
    );
}

export default Carrito;