// src/components/ProductViewModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useCart } from '../context/CartContext';

const modalStyles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', zIndex: 1001 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: '24px', fontWeight: 'bold' },
    grupo: { margin: '15px 0' },
    grupoTitle: { fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '5px' },
    opcion: { margin: '5px 0' },
    // Estilos nuevos
    formRow: { display: 'flex', gap: '10px', alignItems: 'center', margin: '10px 0' },
    label: { fontWeight: 'bold' },
    input: { padding: '8px', flex: 1 },
    // ...
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #ccc' },
    precioTotal: { fontSize: '20px', fontWeight: 'bold' }
};

function ProductViewModal({ productId, onClose }) {
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOptions, setSelectedOptions] = useState({}); 
    const [precioTotal, setPrecioTotal] = useState(0);
    const { addToCart } = useCart();

    const [cantidad, setCantidad] = useState(1);
    const [nota, setNota] = useState("");

    // Cargar detalles del producto
    useEffect(() => {
        if (!productId) return;
        setLoading(true);
        api.get(`/menu/products/${productId}`) 
            .then(res => {
                setProducto(res.data);
                setPrecioTotal(res.data.precio_base);
                
                const inicial = {};
                Object.keys(res.data.grupos_opciones).forEach(nombreGrupo => {
                    const grupo = res.data.grupos_opciones[nombreGrupo];
                    if (grupo.tipo_seleccion === 'UNICO' && grupo.requerido) {
                        if (grupo.opciones && grupo.opciones.length > 0) {
                            inicial[nombreGrupo] = grupo.opciones[0].opcion_id; 
                        }
                    }
                });
                setSelectedOptions(inicial);

            })
            .catch(err => console.error("Error cargando producto", err))
            .finally(() => setLoading(false));
    }, [productId]);

    useEffect(() => {
        if (!producto) return;

        let totalOpciones = 0;
        const { grupos_opciones } = producto;

        Object.keys(selectedOptions).forEach(nombreGrupo => {
            const opcionIdSeleccionada = selectedOptions[nombreGrupo]; 
            const grupo = grupos_opciones[nombreGrupo];
            
            if (grupo && grupo.opciones && grupo.tipo_seleccion === 'UNICO') {
                const opcion = grupo.opciones.find(o => o.opcion_id === opcionIdSeleccionada);
                if (opcion) totalOpciones += opcion.ajuste_precio;
            } 
        });

        setPrecioTotal((producto.precio_base + totalOpciones) * cantidad);

    }, [selectedOptions, producto, cantidad]); 


    const handleOptionChange = (nombreGrupo, tipo, opcionId) => {
        setSelectedOptions(prev => ({
            ...prev,
            [nombreGrupo]: opcionId 
        }));
    };

    const handleAddToCart = () => {
        const opcionIds = Object.values(selectedOptions).filter(id => id != null); 
        
        addToCart(producto.id, cantidad, nota, opcionIds);
        onClose();
    };

    const handleCantidadChange = (e) => {
        let val = parseInt(e.target.value);
        if (val < 1 || isNaN(val)) {
            val = 1;
        }
        setCantidad(val);
    };

    if (loading) {
        return <div style={modalStyles.overlay}><div style={modalStyles.modal}><p>Cargando...</p></div></div>;
    }
    if (!producto) return null;

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}> 
                
                <div style={modalStyles.header}>
                    <h2 style={modalStyles.title}>{producto.nombre}</h2>
                    <button onClick={onClose} style={{fontSize: '20px', border: 'none', background: 'none', cursor: 'pointer'}}>X</button>
                </div>
                
                <p>Precio base: ${producto.precio_base.toFixed(2)}</p>
                <hr />

                {Object.keys(producto.grupos_opciones).length === 0 && (
                    <p style={{color: '#777'}}>Este producto no tiene opciones adicionales.</p>
                )}
                {Object.keys(producto.grupos_opciones).map(nombreGrupo => {
                    const grupo = producto.grupos_opciones[nombreGrupo];
                    return (
                        <div key={nombreGrupo} style={modalStyles.grupo}>
                            <h4 style={modalStyles.grupoTitle}>{nombreGrupo} {grupo.requerido ? '*' : '(Opcional)'}</h4>
                            
                            {grupo.tipo_seleccion === 'UNICO' && grupo.opciones.map(opcion => (
                                <div key={opcion.opcion_id} style={modalStyles.opcion}>
                                    <input 
                                        type="radio"
                                        id={opcion.opcion_id}
                                        name={nombreGrupo}
                                        value={opcion.opcion_id}
                                        checked={selectedOptions[nombreGrupo] === opcion.opcion_id}
                                        onChange={() => handleOptionChange(nombreGrupo, 'UNICO', opcion.opcion_id)}
                                    />
                                    <label htmlFor={opcion.opcion_id}>
                                        {opcion.opcion} 
                                        {opcion.ajuste_precio > 0 && ` (+$${opcion.ajuste_precio.toFixed(2)})`}
                                    </label>
                                </div>
                            ))}
                        </div>
                    );
                })}

                <hr />
                <div style={modalStyles.formRow}>
                    <label style={modalStyles.label} htmlFor="cantidad">Cantidad:</label>
                    <input 
                        id="cantidad"
                        style={{...modalStyles.input, flex: '0.5'}}
                        type="number"
                        min="1"
                        value={cantidad}
                        onChange={handleCantidadChange}
                    />
                </div>
                <div style={modalStyles.formRow}>
                    <label style={modalStyles.label} htmlFor="nota">Nota (opcional):</label>
                    <input 
                        id="nota"
                        style={modalStyles.input}
                        type="text"
                        placeholder="Ej. Sin cebolla"
                        value={nota}
                        onChange={(e) => setNota(e.target.value)}
                    />
                </div>

                <div style={modalStyles.footer}>
                    <span style={modalStyles.precioTotal}>Total: ${precioTotal.toFixed(2)}</span>
                    <button onClick={handleAddToCart} style={{padding: '10px 15px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>
                        Añadir al Carrito
                    </button>
                </div>

            </div>
        </div>
    );
}

export default ProductViewModal;