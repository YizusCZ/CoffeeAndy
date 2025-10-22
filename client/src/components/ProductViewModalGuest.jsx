// src/components/ProductViewModalGuest.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';

// --- Estilos ---
const modalStyles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modal: { background: 'white', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', zIndex: 1001 },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px' },
    title: { fontSize: '24px', fontWeight: 'bold', margin: 0 },
    grupo: { margin: '15px 0' },
    grupoTitle: { fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '5px' },
    opcion: { margin: '5px 0', display: 'flex', alignItems: 'center' },
    opcionLabel: { marginLeft: '8px', display: 'flex', justifyContent: 'space-between', flexGrow: 1 }, 
    opcionPrecio: { fontWeight: 'bold' }, 
    footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #ccc' },
    precioTotal: { fontSize: '20px', fontWeight: 'bold' },
    formRow: { display: 'flex', gap: '10px', alignItems: 'center', margin: '10px 0' },
    label: { fontWeight: 'bold' },
    input: { padding: '8px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' },
    button: {padding: '10px 15px', background: 'blue', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'}
};

function ProductViewModalGuest({ productId, onClose }) {
    const [producto, setProducto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOptions, setSelectedOptions] = useState({});
    const [precioTotal, setPrecioTotal] = useState(0);
    const [cantidad, setCantidad] = useState(1);

    // Cargar detalles del producto
    useEffect(() => {
        if (!productId) return;
        setLoading(true);
        api.get(`/menu_guest/products_guest/${productId}`)
            .then(res => {
                setProducto(res.data);
                let initialPrice = res.data.precio_base;
                const inicial = {};
                Object.keys(res.data.grupos_opciones).forEach(nombreGrupo => {
                    const grupo = res.data.grupos_opciones[nombreGrupo];
                    if (grupo.tipo_seleccion === 'UNICO' && grupo.requerido && grupo.opciones?.length > 0) {
                        inicial[nombreGrupo] = grupo.opciones[0].opcion_id;
                        initialPrice += grupo.opciones[0].ajuste_precio;
                    }
                });
                setSelectedOptions(inicial);
                // Inicializar precio total con la cantidad inicial (1)
                setPrecioTotal(initialPrice * cantidad);
            })
            .catch(err => console.error("Error cargando producto", err))
            .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productId]); 

    // Recalcular el precio total
    useEffect(() => {
        if (!producto) return;
        let totalOpciones = 0;
        const { grupos_opciones } = producto;
        Object.keys(selectedOptions).forEach(nombreGrupo => {
            const opcionIdSeleccionada = selectedOptions[nombreGrupo];
            const grupo = grupos_opciones[nombreGrupo];
            if (grupo?.opciones && grupo.tipo_seleccion === 'UNICO') {
                const opcion = grupo.opciones.find(o => o.opcion_id === opcionIdSeleccionada);
                if (opcion) totalOpciones += opcion.ajuste_precio;
            }
        });
        setPrecioTotal((producto.precio_base + totalOpciones) * cantidad);
    }, [selectedOptions, producto, cantidad]);


    const handleOptionChange = (nombreGrupo, tipo, opcionId) => {
        setSelectedOptions(prev => ({ ...prev, [nombreGrupo]: opcionId }));
    };

    const handleCantidadChange = (e) => {
        let val = parseInt(e.target.value);
        if (val < 1 || isNaN(val)) val = 1;
        setCantidad(val);
    };

    if (loading) { return <div style={modalStyles.overlay}><div style={modalStyles.modal}><p>Cargando...</p></div></div>; }
    if (!producto) return null;

    return (
        <div style={modalStyles.overlay} onClick={onClose}>
            <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>

                <div style={modalStyles.header}>
                    <h2 style={modalStyles.title}>{producto.nombre}</h2>
                    <button onClick={onClose} style={{fontSize: '20px', border: 'none', background: 'none', cursor: 'pointer'}}>✖</button>
                </div>

                {Object.keys(producto.grupos_opciones).length === 0 && (
                    <p style={{color: '#777', marginTop: '10px'}}>Este producto no tiene opciones adicionales.</p>
                )}
                {Object.keys(producto.grupos_opciones).map(nombreGrupo => {
                    const grupo = producto.grupos_opciones[nombreGrupo];
                    return (
                        <div key={nombreGrupo} style={modalStyles.grupo}>
                            <h4 style={modalStyles.grupoTitle}>{nombreGrupo} {grupo.requerido ? '*' : '(Opcional)'}</h4>

                            {grupo.tipo_seleccion === 'UNICO' && grupo.opciones.map(opcion => {
                                const precioOpcionFinal = producto.precio_base + opcion.ajuste_precio;

                                return (
                                    <div key={opcion.opcion_id} style={modalStyles.opcion}>
                                        <input
                                            type="radio"
                                            id={`opcion-${opcion.opcion_id}`}
                                            name={nombreGrupo}
                                            value={opcion.opcion_id}
                                            checked={selectedOptions[nombreGrupo] === opcion.opcion_id}
                                            onChange={() => handleOptionChange(nombreGrupo, 'UNICO', opcion.opcion_id)}
                                        />
                                        <label htmlFor={`opcion-${opcion.opcion_id}`} style={modalStyles.opcionLabel}>
                                            <span>{opcion.opcion}</span>
                                            <span style={modalStyles.opcionPrecio}>${precioOpcionFinal.toFixed(2)}</span>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}

                <hr style={{marginTop: '20px'}}/>
            </div>
        </div>
    );
}

export default ProductViewModalGuest;