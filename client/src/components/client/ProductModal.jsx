// src/components/ProductModal.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const modalStyles = {
    overlay: { 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        background: 'rgba(0,0,0,0.5)', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        zIndex: 1000 
    },
    modal: { 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        width: '90%', 
        maxWidth: '600px', 
        maxHeight: '90vh', 
        overflowY: 'auto',
        zIndex: 1001 
    },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
    fullWidth: { gridColumn: '1 / -1' },
    label: { fontWeight: 'bold', marginBottom: '5px', display: 'block' },
    input: { width: '100%', padding: '8px', boxSizing: 'border-box' },
    buttonContainer: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    checkboxContainer: { gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }
};

function ProductModal({ product, onClose, onSave }) {
    const [nombre, setNombre] = useState('');
    const [precio, setPrecio] = useState('');
    const [stock, setStock] = useState(0); 
    const [categoriaId, setCategoriaId] = useState('');
    const [especial, setEspecial] = useState(false); 
    const [imagen, setImagen] = useState(null);
    const [selectedGrupos, setSelectedGrupos] = useState([]);

    const [allCategorias, setAllCategorias] = useState([]);
    const [allGrupos, setAllGrupos] = useState([]);
    
    useEffect(() => {
        api.get('/categorias').then(res => setAllCategorias(res.data));
        api.get('/grupos-opciones').then(res => setAllGrupos(res.data));
    }, []);

    useEffect(() => {
        if (product) {
            setNombre(product.nombre || '');
            setPrecio(product.precio || '');
            setStock(product.stock || 0); 
            setCategoriaId(product.categoria_id || '');
            setEspecial(Boolean(product.especial)); 
            setSelectedGrupos([]); 
        } else {
            setNombre('');
            setPrecio('');
            setStock(0);  
            setCategoriaId('');
            setEspecial(false); 
            setImagen(null);
            setSelectedGrupos([]);
        }
    }, [product]);

    const handleGrupoChange = (grupoId) => {
        setSelectedGrupos(prev => 
            prev.includes(grupoId) 
                ? prev.filter(id => id !== grupoId) // Quitar
                : [...prev, grupoId] // Agregar
        );
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('nombre', nombre);
        formData.append('precio', precio);
        formData.append('stock', stock); 
        formData.append('categoria_id', categoriaId);
        formData.append('especial', especial); 
        if (imagen) {
            formData.append('imagen', imagen);
        }
        formData.append('grupos_opciones_ids', JSON.stringify(selectedGrupos));

        try {
            if (product && product.id) {
                await api.put(`/products/${product.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await api.post('/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            onSave(); 
            onClose(); // Cierra el modal
        } catch (error) {
            console.error('Error al guardar producto:', error);
            alert('Error al guardar: ' + (error.response?.data?.message || error.message));
        }
    };

    return (
        <div style={modalStyles.overlay}> 
            <div style={modalStyles.modal}> 
                <h2>{product ? 'Editar Producto' : 'Crear Nuevo Producto'}</h2>
                <form onSubmit={handleSubmit}>
                    <div style={modalStyles.formGrid}>
                        {/* Nombre */}
                        <div style={modalStyles.fullWidth}>
                            <label style={modalStyles.label}>Nombre</label>
                            <input style={modalStyles.input} type="text" value={nombre} onChange={e => setNombre(e.target.value)} required />
                        </div>
                        
                        {/* Precio Base */}
                        <div>
                            <label style={modalStyles.label}>Precio Base ($)</label>
                            <input style={modalStyles.input} type="number" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} required />
                        </div>
                        
                        {/* Stock */}
                        <div>
                            <label style={modalStyles.label}>Stock</label>
                            <input 
                                style={modalStyles.input} 
                                type="number" 
                                step="1" 
                                min="0" // No permitir stock negativo
                                value={stock} 
                                onChange={e => setStock(e.target.value)} 
                                required 
                            />
                        </div>
                        
                        {/* Categoría */}
                        <div>
                            <label style={modalStyles.label}>Categoría</label>
                            <select style={modalStyles.input} value={categoriaId} onChange={e => setCategoriaId(e.target.value)} required>
                                <option value="">Seleccione...</option>
                                {allCategorias.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Checkbox Especial del Día */}
                        <div style={modalStyles.checkboxContainer}>
                             <input 
                                type="checkbox"
                                id="especialCheckModal" 
                                checked={especial}
                                onChange={(e) => setEspecial(e.target.checked)}
                            />
                            <label htmlFor="especialCheckModal" style={modalStyles.label}>¿Es especial del día? ⭐</label>
                        </div>
                        
                        {/* Imagen */}
                        <div style={modalStyles.fullWidth}>
                            <label style={modalStyles.label}>Imagen</label>
                            <input style={modalStyles.input} type="file" onChange={e => setImagen(e.target.files[0])} />
                        </div>

                        {/* Grupos de Opciones */}
                        <div style={modalStyles.fullWidth}>
                            <label style={modalStyles.label}>Grupos de Opciones (Vincular)</label>
                            <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #ccc', padding: '10px' }}>
                                {allGrupos.map(grupo => (
                                    <div key={grupo.id}>
                                        <input 
                                            type="checkbox"
                                            id={`grupoModal-${grupo.id}`} // ID único
                                            checked={selectedGrupos.includes(grupo.id)}
                                            onChange={() => handleGrupoChange(grupo.id)}
                                        />
                                        <label htmlFor={`grupoModal-${grupo.id}`}>{grupo.nombre}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Botones */}
                    <div style={modalStyles.buttonContainer}>
                        <button type="button" onClick={onClose}>Cancelar</button>
                        <button type="submit">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductModal;