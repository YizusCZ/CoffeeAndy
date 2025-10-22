// src/components/KitchenQueue.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import NavbarAdmin from './NavbarAdmin.jsx'; 


const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    title: { fontSize: '28px', fontWeight: 'bold' },
    columnsContainer: { display: 'flex', gap: '20px', marginTop: '20px' },
    column: { flex: 1, background: '#f4f4f4', borderRadius: '8px', padding: '10px' },
    colTitle: { fontSize: '20px', fontWeight: 'bold', borderBottom: '2px solid #ccc', paddingBottom: '10px', marginBottom: '10px' },
    orderCard: { background: 'white', border: '1px solid #ddd', borderRadius: '5px', padding: '15px', marginBottom: '15px' },
    orderHeader: { display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '18px' },
    itemList: { listStyle: 'none', paddingLeft: '0', marginTop: '10px' },
    item: { borderTop: '1px dashed #eee', paddingTop: '10px', marginTop: '10px' },
    itemOptions: { fontSize: '14px', color: '#555', marginLeft: '10px' },
    itemNote: { fontSize: '14px', color: 'red', marginLeft: '10px' },
    orderNote: { fontSize: '15px', color: 'blue', fontStyle: 'italic', marginTop: '10px' },
    actions: { display: 'flex', gap: '10px', marginTop: '15px' },
    actionButton: { padding: '8px 12px', border: 'none', borderRadius: '5px', cursor: 'pointer', color: 'white' }
};

// --- Tarjeta de Pedido ---
const OrderCard = ({ order, onUpdateStatus }) => (
    <div style={styles.orderCard}>
        <div style={styles.orderHeader}>
            <span>Pedido #{order.id}</span>
            <span>{order.cliente}</span>
        </div>
        <p style={{fontSize: '12px', color: '#777'}}>{new Date(order.fecha_pedido).toLocaleTimeString()}</p>
        
        {order.nota_general && (
            <p style={styles.orderNote}>Nota Pedido: {order.nota_general}</p>
        )}

        <ul style={styles.itemList}>
            {order.items.map(item => (
                <li key={item.pedido_item_id} style={styles.item}>
                    <strong>{item.cantidad}x {item.producto}</strong>
                    {item.opciones_elegidas && (
                        <div style={styles.itemOptions}>Opciones: {item.opciones_elegidas}</div>
                    )}
                    {item.nota_cocina && (
                        <div style={styles.itemNote}>Nota Item: {item.nota_cocina}</div>
                    )}
                </li>
            ))}
        </ul>

        <div style={styles.actions}>
            {order.estado === 'Recibido' && (
                <button 
                    style={{...styles.actionButton, background: 'green'}}
                    onClick={() => onUpdateStatus(order.id, 'En preparación')}
                >
                    Empezar Preparación
                </button>
            )}
            {order.estado === 'En preparación' && (
                <button 
                    style={{...styles.actionButton, background: 'blue'}}
                    onClick={() => onUpdateStatus(order.id, 'Listo para recoger')}
                >
                    Marcar como Listo
                </button>
            )}
            <button 
                style={{...styles.actionButton, background: 'red'}}
                onClick={() => onUpdateStatus(order.id, 'Cancelado')}
            >
                Cancelar
            </button>
        </div>
    </div>
);


// --- Componente Principal de la Cola ---
function KitchenQueue() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQueue = async () => {
        try {
            const response = await api.get('/kitchen/queue');
            const grouped = response.data.reduce((acc, item) => {
                if (!acc[item.num_pedido]) {
                    acc[item.num_pedido] = {
                        id: item.num_pedido,
                        estado: item.estado,
                        cliente: item.nombre_cliente,
                        nota_general: item.nota_general,
                        fecha_pedido: item.fecha_pedido,
                        items: [] // Array para guardar los items
                    };
                }
                acc[item.num_pedido].items.push(item);
                return acc;
            }, {});
            
            setOrders(Object.values(grouped));
        } catch (error) {
            console.error("Error al cargar la cola:", error);
        } finally {
            setLoading(false);
        }
    };

    // Cargar la cola al montar y luego cada 20 segundos
    useEffect(() => {
        fetchQueue(); 
        const interval = setInterval(fetchQueue, 20000); // Auto-refresh cada 20s
        
        return () => clearInterval(interval); 
    }, []);

    const handleUpdateStatus = async (pedidoId, nuevoEstado) => {
        try {
            await api.put(`/kitchen/order/${pedidoId}/status`, { estado: nuevoEstado });
            fetchQueue(); 
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            alert("No se pudo actualizar el estado.");
        }
    };

    const recibidos = orders.filter(o => o.estado === 'Recibido');
    const enPreparacion = orders.filter(o => o.estado === 'En preparación');

    if (loading && orders.length === 0) return <p>Cargando cola de pedidos...</p>;

    return (
    <div>
        <NavbarAdmin />
        <div style={styles.container}>
            <h1 style={styles.title}>Cola de Pedidos</h1>
            <div style={styles.columnsContainer}>
                <div style={styles.column}>
                    <h2 style={styles.colTitle}>Recibidos ({recibidos.length})</h2>
                    {recibidos.length === 0 ? <p>No hay pedidos nuevos.</p> :
                        recibidos.map(order => (
                            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
                        ))
                    }
                </div>
                
                <div style={styles.column}>
                    <h2 style={styles.colTitle}>En Preparación ({enPreparacion.length})</h2>
                    {enPreparacion.length === 0 ? <p>No hay pedidos en preparación.</p> :
                        enPreparacion.map(order => (
                            <OrderCard key={order.id} order={order} onUpdateStatus={handleUpdateStatus} />
                        ))
                    }
                </div>
            </div>
        </div>
    </div>
    );
}

export default KitchenQueue;