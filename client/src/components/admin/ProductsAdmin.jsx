// src/components/ProductsAdmin.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import ProductModal from '../client/ProductModal.jsx';
import NavbarAdmin from './NavbarAdmin.jsx'; 

const styles = {
    container: { fontFamily: 'Arial, sans-serif', padding: '20px' }, 
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    title: { fontSize: '28px', fontWeight: 'bold' },
    searchBar: { padding: '10px', width: '300px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' },
    filters: { marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' },
    filterButton: { padding: '8px 15px', fontSize: '14px', borderRadius: '20px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' },
    activeFilter: { background: 'lightblue', fontWeight: 'bold' },
    addButton: { fontSize: '24px', cursor: 'pointer', border: 'none', background: 'none', padding: '0 10px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' },
    productCard: { border: '1px solid #ddd', borderRadius: '8px', padding: '10px', position: 'relative', background: 'white', display: 'flex', flexDirection: 'column' },
    productImage: { width: '100%', height: '140px', background: '#eee', borderRadius: '4px', overflow: 'hidden' },
    productCategory: { fontSize: '11px', color: '#555', position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.8)', padding: '2px 5px', borderRadius: '4px' },
    productInfo: { marginTop: '10px', flexGrow: 1, display: 'flex', flexDirection: 'column' },
    productDetails: { marginBottom: '10px' },
    productName: { fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '16px' },
    especialIcon: { color: 'orange', fontSize: '16px' },
    productPrice: { color: '#333', fontSize: '14px' },
    productStock: { fontSize: '13px', fontWeight: 'bold', marginTop: '4px' },
    productActions: { display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '10px', marginTop: 'auto' },
    actionButton: { cursor: 'pointer', fontSize: '20px', background: 'none', border: 'none', padding: '5px' }
};

function ProductsAdmin() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroCategoria, setFiltroCategoria] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const backendUrl = 'http://localhost:3001';

    const fetchProducts = async () => { 
        setLoading(true);
        try {
            const response = await api.get('/products');
            setProductos(response.data);
        } catch (error) {
            console.error('Error al cargar productos:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchProducts(); }, []);
    const handleOpenCreateModal = () => { 
        setCurrentProduct(null);
        setIsModalOpen(true);
    };
    const handleOpenEditModal = async (producto) => { 
        setCurrentProduct(producto);
        setIsModalOpen(true);
     };
    const handleToggleActive = async (id, estadoActual) => { 
        try {
            await api.put(`/products/${id}/toggle`, { activo: !estadoActual });
            fetchProducts();
        } catch (error) {
            console.error('Error al cambiar estado activo:', error);
            alert('No se pudo actualizar el estado activo.');
        }
     };
    const handleToggleEspecial = async (id, estadoActual) => { 
        try {
            await api.put(`/products/${id}/toggle-especial`, { especial: !estadoActual });
            fetchProducts();
        } catch (error) {
            console.error('Error al cambiar estado especial:', error);
            alert('No se pudo actualizar el estado especial.');
        }
    };
    const handleDelete = async (id, nombre) => { 
        if (window.confirm(`¿Estás seguro de que quieres eliminar "${nombre}"? Esta acción no se puede deshacer.`)) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Error al eliminar el producto:', error);
                alert('No se pudo eliminar el producto.');
            }
        }
     };

    const productosMostrados = productos.filter(p =>
        !filtroCategoria || p.categoria_nombre === filtroCategoria
    );

    if (loading) return (
        <div>
            <NavbarAdmin />
            <div style={styles.container}> 
                <p>Cargando productos...</p>
            </div>
        </div>
    );

    return (
        <div>
            <NavbarAdmin />

            <div style={styles.container}>
                {isModalOpen && (
                    <ProductModal
                        product={currentProduct}
                        onClose={() => setIsModalOpen(false)}
                        onSave={() => {
                            fetchProducts(); 
                        }}
                    />
                )}

                {/* --- Encabezado --- */}
                <header style={styles.header}>
                    <h1 style={styles.title}>Administrar Productos</h1>
                    <input type="search" placeholder="Buscar producto..." style={styles.searchBar} />
                    <button style={styles.addButton} onClick={handleOpenCreateModal} title="Añadir Nuevo Producto">➕</button>
                </header>

                {/* --- Filtros  --- */}
                <div style={styles.filters}>
                     <button
                        style={!filtroCategoria ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton}
                        onClick={() => setFiltroCategoria(null)}
                    >
                        Todos
                    </button>
                    <button
                        style={filtroCategoria === 'Comida' ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton}
                        onClick={() => setFiltroCategoria('Comida')}
                    >
                        Comida
                    </button>
                    <button
                        style={filtroCategoria === 'Bebida' ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton}
                        onClick={() => setFiltroCategoria('Bebida')}
                    >
                        Bebidas
                    </button>
                    <button
                        style={filtroCategoria === 'Snack' ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton}
                        onClick={() => setFiltroCategoria('Snack')}
                    >
                        Snacks
                    </button>
                </div>

                {/* --- Grid de Productos --- */}
                <div style={styles.grid}>
                    {productosMostrados.length === 0 && <p>No hay productos para mostrar.</p>}
                    {productosMostrados.map(prod => (
                        <div key={prod.id} style={styles.productCard}>
                            {/* Imagen y Overlay */}
                            <div style={{...styles.productImage, position: 'relative'}}>
                                {prod.imagen_url &&
                                    <img src={`${backendUrl}/${prod.imagen_url.replace(/\\/g, '/')}`}
                                         alt={prod.nombre}
                                         style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
                                {!prod.activo && (
                                    <div style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(100,100,100,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold'}}>
                                        INACTIVO
                                    </div>
                                )}
                                <div style={styles.productCategory}>{prod.categoria_nombre || 'Sin Cat.'}</div>
                            </div>

                            {/* Info y Acciones */}
                            <div style={styles.productInfo}>
                                <div style={styles.productDetails}>
                                    <div style={styles.productName}>
                                        {prod.nombre}
                                        {prod.especial ? <span style={styles.especialIcon} title="Especial del Día">⭐</span> : null}
                                    </div>
                                    <div style={styles.productPrice}>${parseFloat(prod.precio).toFixed(2)}</div>
                                    <div
                                        style={{
                                            ...styles.productStock,
                                            color: prod.stock <= 5 ? 'red' : (prod.stock <= 15 ? 'orange' : 'green')
                                        }}
                                    >
                                        Stock: {prod.stock}
                                    </div>
                                </div>

                                <div style={styles.productActions}>
                                    <button style={styles.actionButton} title="Editar" onClick={() => handleOpenEditModal(prod)}>✏️</button>
                                    <button
                                        style={styles.actionButton}
                                        title={prod.activo ? "Desactivar" : "Activar"}
                                        onClick={() => handleToggleActive(prod.id, prod.activo)}
                                    >
                                        {prod.activo ? '🔌' : '🚫'}
                                    </button>
                                    <button
                                        style={{...styles.actionButton, color: prod.especial ? 'orange' : '#ccc'}}
                                        title={prod.especial ? "Quitar de Especiales" : "Marcar como Especial"}
                                        onClick={() => handleToggleEspecial(prod.id, prod.especial)}
                                    >
                                        ⭐
                                    </button>
                                    <button
                                        style={{...styles.actionButton, color: 'red'}}
                                        title="Eliminar"
                                        onClick={() => handleDelete(prod.id, prod.nombre)}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div> 
        </div> 
    );
}

export default ProductsAdmin;