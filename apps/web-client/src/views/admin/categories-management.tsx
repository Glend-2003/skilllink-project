import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';

interface Category {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  iconUrl?: string;
  isActive: boolean;
  displayOrder: number;
  parentCategoryId?: number;
  createdAt: string;
  serviceCount: number;
}

export default function CategoriesManagement() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    categoryDescription: '',
    iconUrl: '',
    isActive: true,
    displayOrder: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? target.checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Crear o editar
    setLoading(true);
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory ? `${API_BASE_URL}/api/v1/admin/categories/${editingCategory.categoryId}` : `${API_BASE_URL}/api/v1/admin/categories`;
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setModalVisible(false);
        setEditingCategory(null);
        setFormData({ categoryName: '', categoryDescription: '', iconUrl: '', isActive: true, displayOrder: 0 });
        loadCategories();
      } else {
        alert('Error al guardar la categoría');
      }
    } catch (e) {
      alert('Error de red');
    }
    setLoading(false);
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      categoryName: cat.categoryName,
      categoryDescription: cat.categoryDescription || '',
      iconUrl: cat.iconUrl || '',
      isActive: cat.isActive,
      displayOrder: cat.displayOrder,
    });
    setModalVisible(true);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>Gestión de Categorías</h2>
      <button onClick={() => { setEditingCategory(null); setFormData({ categoryName: '', categoryDescription: '', iconUrl: '', isActive: true, displayOrder: 0 }); setModalVisible(true); }} style={{ marginBottom: 16 }}>Agregar Categoría</button>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Icono</th>
            <th>Activa</th>
            <th>Orden</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.categoryId} style={{ borderBottom: '1px solid #eee' }}>
              <td>{cat.categoryName}</td>
              <td>{cat.categoryDescription}</td>
              <td>{cat.iconUrl}</td>
              <td>{cat.isActive ? 'Sí' : 'No'}</td>
              <td>{cat.displayOrder}</td>
              <td>
                <button onClick={() => handleEdit(cat)} style={{ marginRight: 8 }}>Editar</button>
                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modalVisible && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 300 }}>
            <h3>{editingCategory ? 'Editar' : 'Agregar'} Categoría</h3>
            <input name="categoryName" placeholder="Nombre" value={formData.categoryName} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
            <textarea name="categoryDescription" placeholder="Descripción" value={formData.categoryDescription} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
            <input name="iconUrl" placeholder="URL del icono" value={formData.iconUrl} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
            <input name="displayOrder" type="number" placeholder="Orden" value={formData.displayOrder} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
            <label style={{ display: 'block', marginBottom: 8 }}>
              <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} /> Activa
            </label>
            <button type="submit" style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', width: '100%' }}>Guardar</button>
            <button type="button" onClick={() => setModalVisible(false)} style={{ marginTop: 8, width: '100%' }}>Cancelar</button>
          </form>
        </div>
      )}
    </div>
  );
}
