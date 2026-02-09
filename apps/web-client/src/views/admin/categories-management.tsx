import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './categories-management.css';

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
  const navigate = useNavigate();
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
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else if (response.status === 403) {
        alert('Acceso denegado. No tienes permisos de administrador');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    
    if (name === 'displayOrder') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: type === 'checkbox' ? target.checked : value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryName.trim()) {
      alert('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory 
        ? `${API_BASE_URL}/api/v1/admin/categories/${editingCategory.categoryId}` 
        : `${API_BASE_URL}/api/v1/admin/categories`;
      
      const payload: any = {
        categoryName: formData.categoryName.trim(),
      };

      if (formData.categoryDescription.trim()) {
        payload.categoryDescription = formData.categoryDescription.trim();
      }

      if (formData.iconUrl.trim()) {
        payload.iconUrl = formData.iconUrl.trim();
      }

      payload.isActive = formData.isActive;
      payload.displayOrder = formData.displayOrder;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingCategory ? 'Categoría actualizada' : 'Categoría creada');
        setModalVisible(false);
        setEditingCategory(null);
        setFormData({ categoryName: '', categoryDescription: '', iconUrl: '', isActive: true, displayOrder: 0 });
        loadCategories();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al guardar la categoría');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error de red');
    }
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

  const handleDelete = (cat: Category) => {
    if (cat.serviceCount > 0) {
      alert(`Esta categoría tiene ${cat.serviceCount} servicio(s) asociado(s). No se puede eliminar.`);
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar "${cat.categoryName}"?`)) {
      deleteCategory(cat.categoryId);
    }
  };

  const deleteCategory = async (categoryId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      if (response.ok) {
        alert('Categoría eliminada');
        loadCategories();
      } else {
        const data = await response.json();
        alert(data.message || 'No se pudo eliminar la categoría');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar');
    }
  };

  const toggleCategoryStatus = async (categoryId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories/${categoryId}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      if (response.ok) {
        loadCategories();
      } else {
        alert('No se pudo cambiar el estado');
      }
    } catch (error) {
      console.error('Error toggling category:', error);
      alert('Error de red');
    }
  };

  if (loading) {
    return (
      <div className="categories-management-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-management-container">
      <div className="categories-header">
        <button onClick={() => navigate('/profile')} className="back-button">
          ← Volver
        </button>
        <h1>Gestión de Categorías</h1>
      </div>

      <div className="categories-content">
        <div className="content-header">
          <div className="stats">
            <span className="stat-count">{categories.length}</span>
            <span className="stat-label">categoría{categories.length !== 1 ? 's' : ''}</span>
          </div>
          <button onClick={() => {
            setEditingCategory(null);
            setFormData({ categoryName: '', categoryDescription: '', iconUrl: '', isActive: true, displayOrder: 0 });
            setModalVisible(true);
          }} className="add-button">
            ➕ Nueva Categoría
          </button>
        </div>

        {categories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>No hay categorías</h3>
            <p>Crea tu primera categoría para comenzar</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map(cat => (
              <div key={cat.categoryId} className="category-card">
                <div className="category-header">
                  <h3>{cat.categoryName}</h3>
                  <span className={`status-badge ${cat.isActive ? 'active' : 'inactive'}`}>
                    {cat.isActive ? '✓ Activa' : '✕ Inactiva'}
                  </span>
                </div>

                {cat.categoryDescription && (
                  <p className="category-description">{cat.categoryDescription}</p>
                )}

                <div className="category-meta">
                  <span className="meta-item">📊 Orden: {cat.displayOrder}</span>
                  <span className="meta-item">🔧 {cat.serviceCount} servicio{cat.serviceCount !== 1 ? 's' : ''}</span>
                </div>

                <div className="category-actions">
                  <button 
                    onClick={() => toggleCategoryStatus(cat.categoryId)} 
                    className="action-btn toggle-btn"
                    title={cat.isActive ? 'Desactivar' : 'Activar'}
                  >
                    {cat.isActive ? '👁️' : '🚫'}
                  </button>
                  <button onClick={() => handleEdit(cat)} className="action-btn edit-btn">
                    ✏️ Editar
                  </button>
                  <button 
                    onClick={() => handleDelete(cat)} 
                    className="action-btn delete-btn"
                    disabled={cat.serviceCount > 0}
                    title={cat.serviceCount > 0 ? 'No se puede eliminar (tiene servicios)' : 'Eliminar'}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalVisible && (
        <div className="modal-overlay" onClick={() => setModalVisible(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <button onClick={() => setModalVisible(false)} className="close-btn">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  name="categoryName"
                  placeholder="Ej: Plomería, Electricidad"
                  value={formData.categoryName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  name="categoryDescription"
                  placeholder="Descripción de la categoría"
                  value={formData.categoryDescription}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Icono URL</label>
                <input
                  type="text"
                  name="iconUrl"
                  placeholder="URL del icono (opcional)"
                  value={formData.iconUrl}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Orden de visualización</label>
                <input
                  type="number"
                  name="displayOrder"
                  placeholder="0"
                  value={formData.displayOrder}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span>Activa</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setModalVisible(false)} className="btn-cancel">
                  Cancelar
                </button>
                <button type="submit" className="btn-submit">
                  {editingCategory ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
