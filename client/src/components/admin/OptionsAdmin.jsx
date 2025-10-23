// src/components/OptionsAdmin.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api.js';
import NavbarAdmin from './NavbarAdmin.jsx'; 


const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    title: { fontSize: '28px', fontWeight: 'bold' },
    mainGrid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' },
    column: { background: '#f9f9f9', borderRadius: '8px', padding: '15px' },
    colTitle: { fontSize: '20px', fontWeight: 'bold', borderBottom: '2px solid #ccc', paddingBottom: '10px' },
    item: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', border: '1px solid #ddd', padding: '10px', borderRadius: '5px', margin: '10px 0' },
    form: { display: 'flex', gap: '10px', marginBottom: '15px' },
    input: { flex: 1, padding: '8px', border: '1px solid #ccc', borderRadius: '4px' },
    button: { padding: '8px 12px', border: 'none', background: 'green', color: 'white', borderRadius: '4px', cursor: 'pointer' },
    editButton: { background: 'blue', color: 'white', marginRight: '5px', border: 'none', cursor: 'pointer', padding: '5px 8px' },
    deleteButton: { background: 'red', color: 'white', border: 'none', cursor: 'pointer', padding: '5px 8px' },

    groupCard: { background: 'white', border: '1px solid #ddd', padding: '15px', borderRadius: '5px', margin: '10px 0' },
    groupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    optionItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #eee', paddingTop: '10px', marginTop: '10px' },
    optionForm: { display: 'flex', gap: '10px', marginTop: '15px' }
};

// --- Componente ---
function OptionsAdmin() {
    const [categorias, setCategorias] = useState([]);
    const [grupos, setGrupos] = useState([]);
    
    const [newCatNombre, setNewCatNombre] = useState('');
    const [newGrupoNombre, setNewGrupoNombre] = useState('');
    const [newGrupoTipo, setNewGrupoTipo] = useState('UNICO');
    const [newGrupoReq, setNewGrupoReq] = useState(false);
    
    const fetchData = async () => {
        try {
            const [catRes, grupoRes] = await Promise.all([
                api.get('/categorias'),
                api.get('/grupos-opciones')
            ]);
            setCategorias(catRes.data);
            setGrupos(grupoRes.data);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categorias', { nombre: newCatNombre });
            setNewCatNombre('');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error');
        }
    };
    
    const handleEditCategory = async (id, currentName) => {
        const nombre = prompt('Nuevo nombre de la categoría:', currentName);
        if (nombre && nombre !== currentName) {
            try {
                await api.put(`/categorias/${id}`, { nombre });
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error');
            }
        }
    };

    const handleDeleteCategory = async (id) => {
        if (window.confirm('¿Seguro que quieres eliminar esta categoría?')) {
            try {
                await api.delete(`/categorias/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error');
            }
        }
    };

    const handleAddGroup = async (e) => {
        e.preventDefault();
        try {
            await api.post('/grupos-opciones', { 
                nombre: newGrupoNombre,
                tipo_seleccion: newGrupoTipo,
                requerido: newGrupoReq
            });
            setNewGrupoNombre('');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error');
        }
    };

    const handleDeleteGroup = async (id) => {
        if (window.confirm('¿Seguro que quieres eliminar este grupo? (Se borrarán TODAS sus opciones)')) {
            try {
                await api.delete(`/grupos-opciones/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error');
            }
        }
    };
    
    const handleAddOption = async (e, grupoId) => {
        e.preventDefault();
        const form = e.target;
        const nombre = form.nombre.value;
        const ajuste_precio = form.ajuste_precio.value;
        
        try {
            await api.post(`/grupos-opciones/${grupoId}/opciones`, { nombre, ajuste_precio });
            form.reset();
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error');
        }
    };

    const handleDeleteOption = async (id) => {
        if (window.confirm('¿Seguro que quieres eliminar esta opción?')) {
            try {
                await api.delete(`/grupos-opciones/opciones/${id}`);
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Error');
            }
        }
    };
    
    return (
    <div>
     <NavbarAdmin />
        <div style={styles.container}>
            <h1 style={styles.title}>🔩 Administración de Opciones</h1>
            
            <div style={styles.mainGrid}>
                <div style={styles.column}>
                    <h2 style={styles.colTitle}>Categorías</h2>
                    <form onSubmit={handleAddCategory} style={styles.form}>
                        <input 
                            type="text"
                            placeholder="Nueva categoría"
                            value={newCatNombre}
                            onChange={(e) => setNewCatNombre(e.target.value)}
                            style={styles.input} required
                        />
                        <button type="submit" style={styles.button}>Añadir</button>
                    </form>
                    <div>
                        {categorias.map(cat => (
                            <div key={cat.id} style={styles.item}>
                                <span>{cat.nombre}</span>
                                <div>
                                    <button style={styles.editButton} onClick={() => handleEditCategory(cat.id, cat.nombre)}>✏️</button>
                                    <button style={styles.deleteButton} onClick={() => handleDeleteCategory(cat.id)}>🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={styles.column}>
                    <h2 style={styles.colTitle}>Grupos de Opciones</h2>
                    <form onSubmit={handleAddGroup} style={{...styles.form, flexWrap: 'wrap'}}>
                        <input type="text" placeholder="Nombre del grupo" value={newGrupoNombre} onChange={(e) => setNewGrupoNombre(e.target.value)} style={{...styles.input, flexBasis: '100%'}} required />
                        <select value={newGrupoTipo} onChange={(e) => setNewGrupoTipo(e.target.value)} style={styles.input}>
                            <option value="UNICO">Selección Única</option>
                            <option value="MULTIPLE">Múltiple</option>
                        </select>
                        <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <input type="checkbox" checked={newGrupoReq} onChange={(e) => setNewGrupoReq(e.target.checked)} />
                            Requerido
                        </label>
                        <button type="submit" style={styles.button}>Añadir Grupo</button>
                    </form>
                    
                    <div>
                        {grupos.map(g => (
                            <div key={g.id} style={styles.groupCard}>
                                <div style={styles.groupHeader}>
                                    <span style={{fontWeight: 'bold', fontSize: '18px'}}>{g.nombre}</span>
                                    <div>
                                        <button style={styles.deleteButton} onClick={() => handleDeleteGroup(g.id)}>🗑️ Grupo</button>
                                    </div>
                                </div>
                                <span style={{fontSize: '12px', color: '#555'}}>{g.tipo_seleccion} / {g.requerido ? 'Requerido' : 'Opcional'}</span>
                                
                                <div style={{marginTop: '10px'}}>
                                    {g.opciones.map(opt => (
                                        <div key={opt.id} style={styles.optionItem}>
                                            <span>{opt.nombre}</span>
                                            <span>(+${parseFloat(opt.ajuste_precio).toFixed(2)})</span>
                                            <div>

                                                <button style={styles.deleteButton} onClick={() => handleDeleteOption(opt.id)}>🗑️</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <form onSubmit={(e) => handleAddOption(e, g.id)} style={styles.optionForm}>
                                    <input name="nombre" type="text" placeholder="Nueva opción" style={styles.input} required />
                                    <input name="ajuste_precio" type="number" step="0.50" placeholder="Ajuste (ej. 5.00)" style={styles.input} required />
                                    <button type="submit" style={styles.button}>Añadir Opción</button>
                                </form>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
    );
}

export default OptionsAdmin;