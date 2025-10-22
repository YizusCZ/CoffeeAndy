import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ProductViewModal from './ProductViewModal.jsx'; 
import Navbar from './Navbar.jsx'; 
import { backendUrl } from '../context/AppContext.jsx';


const styles = {
    container: { fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '1200px', margin: '0 auto' },
    filters: { marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' },
    filterButton: { padding: '8px 15px', fontSize: '14px', borderRadius: '20px', border: '1px solid #ccc', background: '#f5f5f5', cursor: 'pointer' },
    activeFilter: { background: 'lightblue', fontWeight: 'bold', borderColor: 'blue' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' },
    productCard: { border: '1px solid #ddd', borderRadius: '8px', padding: '10px', position: 'relative', cursor: 'pointer', transition: 'box-shadow 0.2s', background: 'white' },
    productCardHover: { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
    productImage: { width: '100%', height: '140px', background: '#eee', borderRadius: '4px', overflow: 'hidden' },
    productInfo: { marginTop: '10px' },
    productName: { fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '16px' },
    especialIcon: { color: 'orange', fontSize: '16px' },
    productPrice: { color: '#333', fontSize: '14px' },
    productCategory: { fontSize: '11px', color: '#555', position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.8)', padding: '2px 5px', borderRadius: '4px' },
};

function Menu() {
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroActivo, setFiltroActivo] = useState(null);
    const [searchTerm, setSearchTerm] = useState(''); 

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);



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
        let pasaFiltroCategoria = false;
        if (!filtroActivo) {
            pasaFiltroCategoria = true;
        } else if (filtroActivo === 'especial') {
            pasaFiltroCategoria = p.especial;
        } else {
            pasaFiltroCategoria = p.categoria_nombre === filtroActivo;
        }

        const pasaFiltroBusqueda = searchTerm === '' ||
                                   p.nombre.toLowerCase().includes(searchTerm.toLowerCase());

        return pasaFiltroCategoria && pasaFiltroBusqueda;
    });

    if (loading && productos.length === 0) return (
        <div>
            <Navbar /> 
            <p style={styles.container}>Cargando menú...</p>
        </div>
    );


    return (
        <div>
            <Navbar />

            {/* --- El Modal --- */}
            {isModalOpen && (
                <ProductViewModal
                    productId={selectedProductId}
                    onClose={handleCloseModal}
                />
            )}

            {/* --- Contenido Principal  --- */}
            <div style={styles.container}>

                {/* --- Filtros --- */}
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
                    {productosMostrados.length === 0 && !loading && <p>No se encontraron productos con esos filtros.</p>}
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
                                {!prod.imagen_url && <div style={{width: '100%', height: '100%', background: '#eee'}}></div>}
                            </div>
                            {/* Categoría */}
                            <div style={styles.productCategory}>{prod.categoria_nombre || 'Sin Cat.'}</div>
                            {/* Información */}
                            <div style={styles.productInfo}>
                                <div style={styles.productName}>
                                    {prod.nombre}
                                    {prod.especial ? <span style={styles.especialIcon} title="Especial del Día">⭐</span> : null}
                                </div>
                                <div style={styles.productPrice}>Desde ${parseFloat(prod.precio).toFixed(2)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Menu;