// src/components/HistorialPedidos.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const styles = {
    container: { padding: '20px', maxWidth: '800px', margin: 'auto' },
    title: { fontSize: '28px', fontWeight: 'bold' },
    pedido: { border: '1px solid #ccc', borderRadius: '8px', padding: '15px', margin: '15px 0', cursor: 'pointer', transition: 'box-shadow 0.2s' },
    pedidoHeader: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '10px' },
    pedidoBody: { paddingTop: '10px' },

    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', zIndex: 1001 },
    modalHeader: { fontSize: '24px', fontWeight: 'bold', borderBottom: '1px solid #ccc', paddingBottom: '10px' },
    modalItem: { borderBottom: '1px solid #eee', padding: '10px 0' },
    modalItemName: { fontWeight: 'bold' },
    modalItemOptions: { fontSize: '14px', color: '#555', marginLeft: '10px' }
};

// Modal
const OrderDetailsModal = ({ pedido, onClose }) => {
    if (!pedido) return null;

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
                <h2 style={styles.modalHeader}>Detalles del Pedido #{pedido.id}</h2>
                <p><strong>Estado:</strong> {pedido.estado}</p>
                <p><strong>Total:</strong> ${parseFloat(pedido.total).toFixed(2)}</p>
                <p><strong>Fecha:</strong> {new Date(pedido.fecha_pedido).toLocaleString()}</p>
                <p><strong>Nota General:</strong> {pedido.nota || 'Ninguna'}</p>
                
                <h3 style={{marginTop: '20px'}}>Items del Pedido:</h3>
                {pedido.items && pedido.items.length > 0 ? (
                    pedido.items.map((item, index) => (
                        <div key={index} style={styles.modalItem}>
                            <div style={styles.modalItemName}>
                                {item.cantidad} x {item.producto} 
                                <span> (${parseFloat(item.precio_unitario).toFixed(2)} c/u)</span>
                            </div>
                            {item.opciones_elegidas && (
                                <div style={styles.modalItemOptions}>Opciones: {item.opciones_elegidas}</div>
                            )}
                            {item.nota_cocina && (
                                <div style={styles.modalItemOptions}>Nota: {item.nota_cocina}</div>
                            )}
                        </div>
                    ))
                ) : (
                    <p>No se encontraron items para este pedido.</p>
                )}
                
                <button onClick={onClose} style={{marginTop: '20px'}}>Cerrar</button>
            </div>
        </div>
    );
};

function HistorialPedidos() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        api.get('/cart/history')
            .then(res => setPedidos(res.data))
            .catch(err => console.error('Error al cargar historial', err))
            .finally(() => setLoading(false));
    }, []);

    const handleOrderClick = async (id) => {
        setLoadingDetails(true);
        setIsModalOpen(true);
        try {
            // Llamar al endpoint
            const response = await api.get(`/cart/history/${id}`);
            setSelectedPedido(response.data);
        } catch (error) {
            console.error("Error al cargar detalles:", error);
            alert("No se pudieron cargar los detalles.");
            setIsModalOpen(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPedido(null);
    };

    if (loading) return <p>Cargando historial...</p>;

    return (
        <div style={styles.container}>
            {isModalOpen && (
                <OrderDetailsModal 
                    pedido={loadingDetails ? {id: '...'} : selectedPedido} 
                    onClose={closeModal} 
                />
            )}

            <h1 style={styles.title}>📋 Mi Historial de Pedidos</h1>
            <Link to="/menu">Ir al menú</Link>

            {pedidos.length === 0 ? (
                <p>No tienes pedidos anteriores.</p>
            ) : (
                pedidos.map(pedido => (
                    <div 
                        key={pedido.id} 
                        style={styles.pedido}
                        onClick={() => handleOrderClick(pedido.id)} 
                    >
                        <div style={styles.pedidoHeader}>
                            <span>Pedido #{pedido.id} ({new Date(pedido.fecha_pedido).toLocaleString()})</span>
                            <span style={{color: pedido.estado === 'Cancelado' ? 'red' : 'green'}}>
                                {pedido.estado}
                            </span>
                        </div>
                        <div style={styles.pedidoBody}>
                            <p><strong>Total:</strong> ${parseFloat(pedido.total).toFixed(2)}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
}

export default HistorialPedidos;