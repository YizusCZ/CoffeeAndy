// src/components/Menu.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import api from '../services/api';
import ProductViewModal from './ProductViewModal';
import { useCart } from '../context/CartContext'; 

const styles = {
    container: { fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' }, // Centrar contenido
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }, // Añadir wrap y gap
    title: { fontSize: '28px', fontWeight: 'bold', margin: 0 },
    searchBar: { padding: '10px', width: '250px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '4px' }, // Ajustar ancho
    filters: { marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }, // Añadir wrap
    filterButton: { padding: '8px 15px', fontSize: '14px', borderRadius: '20px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' },
    activeFilter: { background: 'lightblue', fontWeight: 'bold', borderColor: 'blue' }, // Estilo para el botón activo
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
    productCard: { border: '1px solid #ddd', borderRadius: '8px', padding: '10px', position: 'relative', cursor: 'pointer', transition: 'box-shadow 0.2s', background: 'white' }, 
    productCardHover: { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }, // Efecto hover
    productImage: { width: '100%', height: '140px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }, // Ajustar altura y overflow
    productInfo: { marginTop: '10px' },
    productName: { fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '16px' }, // Para alinear estrella
    especialIcon: { color: 'orange', fontSize: '16px' }, // Para estrella
    productPrice: { color: '#333', fontSize: '14px' },
    productCategory: { fontSize: '11px', color: '#555', position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.8)', padding: '2px 5px', borderRadius: '4px' },
    cartIcon: { fontSize: '30px', cursor: 'pointer', position: 'relative' },
    cartBadge: { position: 'absolute', top: '-5px', right: '-10px', background: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px', border: '1px solid white' } // Borde para mejor visibilidad
};


function Menu() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroActivo, setFiltroActivo] = useState(null); 
    const [searchTerm, setSearchTerm] = useState(''); 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null); 

    // --- Hooks ---
    const { cartItems } = useCart(); 
    const navigate = useNavigate();  

    const backendUrl = 'http://localhost:3001';

    // Cargar productos activos
    useEffect(() => {
        setLoading(true);
        api.get('/menu/products') 
            .then(res => {
                setProductos(res.data);
            })
            .catch(err => console.error('Error al cargar productos:', err))
            .finally(() => setLoading(false));
    }, []);

    const handleOpenModal = (id) => {
        setSelectedProductId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProductId(null);
    };

    const productosMostrados = productos.filter(p => {
        // 1. Filtrar por categoría o especial
        let pasaFiltroCategoria = false;
        if (!filtroActivo) {
            pasaFiltroCategoria = true; 
        } else if (filtroActivo === 'especial') {
            pasaFiltroCategoria = p.especial; 
        } else {
            pasaFiltroCategoria = p.categoria_nombre === filtroActivo; 
        }

        // 2. Filtrar por término de búsqueda 
        const pasaFiltroBusqueda = searchTerm === '' || 
                                   p.nombre.toLowerCase().includes(searchTerm.toLowerCase());

        return pasaFiltroCategoria && pasaFiltroBusqueda;
    });

    if (loading) return <p style={styles.container}>Cargando menú...</p>;

    return (
        <div style={styles.container}>
            {/* --- El Modal --- */}
            {isModalOpen && (
                <ProductViewModal 
                    productId={selectedProductId}
                    onClose={handleCloseModal}
                />
            )}

            <header style={styles.header}>
                <h1 style={styles.title}>Nuestro Menú</h1>
                <input 
                    type="search" 
                    placeholder="Buscar producto..." 
                    style={styles.searchBar} 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Actualizar término de búsqueda
                />
                <div style={styles.cartIcon} onClick={() => navigate('/cart')} title="Ver Carrito">
                    🛒
                    {cartItems.length > 0 && (
                        <span style={styles.cartBadge}>{cartItems.length}</span>
                    )}
                </div>
            </header>

            {/* --- Filtros  --- */}
            <div style={styles.filters}>
                <button 
                    style={!filtroActivo ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton} 
                    onClick={() => setFiltroActivo(null)}
                >
                    Todos
                </button>
                 <button 
                    style={filtroActivo === 'especial' ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton} 
                    onClick={() => setFiltroActivo('especial')}
                >
                    ⭐ Menú del Día
                </button>
                <button 
                    style={filtroActivo === 'Comida' ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton} 
                    onClick={() => setFiltroActivo('Comida')}
                >
                    Comida
                </button>
                <button 
                    style={filtroActivo === 'Bebida' ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton} 
                    onClick={() => setFiltroActivo('Bebida')}
                 >
                     Bebidas
                 </button>
                <button 
                    style={filtroActivo === 'Snack' ? {...styles.filterButton, ...styles.activeFilter} : styles.filterButton} 
                    onClick={() => setFiltroActivo('Snack')}
                 >
                     Snacks
                 </button>
            </div>

            {/* --- Grid de Productos --- */}
            <div style={styles.grid}>
                {productosMostrados.length === 0 && <p>No se encontraron productos con esos filtros.</p>}
                {productosMostrados.map(prod => (
                    <div 
                        key={prod.id} 
                        style={styles.productCard}
                        onClick={() => handleOpenModal(prod.id)}

                        onMouseEnter={(e) => e.currentTarget.style.boxShadow = styles.productCardHover.boxShadow}
                        onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                    >
                        {/* Imagen */}
                        <div style={styles.productImage}>
                            {prod.imagen_url && 
                                <img src={`${backendUrl}/${prod.imagen_url.replace(/\\/g, '/')}`} 
                                     alt={prod.nombre} 
                                     style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
                            {!prod.imagen_url && <div style={{width: '100%', height: '100%', background: '#eee'}}></div>} {/* Placeholder si no hay imagen */}
                        </div>
                        {/* Categoría */}
                        <div style={styles.productCategory}>{prod.categoria_nombre || 'Sin Cat.'}</div>
                        {/* Información */}
                        <div style={styles.productInfo}>
                            <div style={styles.productName}>
                                {prod.nombre} 
                                {/* Mostrar estrella si es comida del dia */}
                                {prod.especial ? <span style={styles.especialIcon} title="Especial del Día">⭐</span> : null}
                            </div>
                            {/* Mostrar precio base */}
                            <div style={styles.productPrice}>Desde ${parseFloat(prod.precio).toFixed(2)}</div> 
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Menu;