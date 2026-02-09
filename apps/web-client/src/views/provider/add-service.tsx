import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './add-service.css';

interface ServiceCategory {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  isActive: boolean;
}

export default function AddService() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    categoryId: 0,
    serviceTitle: '',
    serviceDescription: '',
    basePrice: '0',
    priceType: 'fixed' as 'fixed' | 'hourly' | 'negotiable',
    estimatedDurationMinutes: '',
    isActive: true,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadProviderProfile(), loadCategories()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line
  }, []);

  const loadProviderProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/provider/profile`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      if (response.ok) {
        const profile = await response.json();
        console.log('Provider profile loaded:', profile);
        setProviderId(profile.providerId);
      } else {
        console.error('Failed to load provider profile');
        alert('No se pudo cargar tu perfil de proveedor');
      }
    } catch (error) {
      console.error('Error loading provider profile:', error);
      alert('Error al cargar el perfil');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Categories loaded:', data);
        setCategories(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to load categories:', response.status);
        alert('No se pudieron cargar las categorías');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      alert('Error de conexión al cargar categorías');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'categoryId') {
      // Convertir a número para categoryId
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceTitle.trim()) {
      alert('El título del servicio es requerido');
      return;
    }

    if (!formData.serviceDescription.trim()) {
      alert('La descripción es requerida');
      return;
    }

    if (formData.categoryId === 0) {
      alert('Selecciona una categoría');
      return;
    }

    if (!providerId) {
      alert('No se pudo obtener tu ID de proveedor. Recarga la página.');
      return;
    }

    const basePrice = parseFloat(formData.basePrice);
    if (isNaN(basePrice) || basePrice < 0) {
      alert('El precio base debe ser un número válido mayor o igual a 0');
      return;
    }

    setSaving(true);

    try {
      // Payload con todos los campos requeridos por el backend
      const payload = {
        providerId: providerId,
        categoryId: formData.categoryId,
        serviceTitle: formData.serviceTitle,
        serviceDescription: formData.serviceDescription,
        basePrice: basePrice,
        priceType: formData.priceType,
        estimatedDurationMinutes: formData.estimatedDurationMinutes
          ? parseInt(formData.estimatedDurationMinutes)
          : null,
        isActive: formData.isActive,
      };

      console.log('Payload enviado:', payload);

      const response = await fetch(`${API_BASE_URL}/api/v1/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Service created:', data);
        alert('Servicio creado correctamente. Ahora estará pendiente de aprobación por un administrador.');
        navigate('/provider/services');
      } else {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          alert(errorData.message || 'No se pudo crear el servicio');
        } catch {
          alert(`Error ${response.status}: ${errorText || 'No se pudo crear el servicio'}`);
        }
      }
    } catch (error) {
      console.error('Error creating service:', error);
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="add-service-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-service-container">
      <div className="service-header">
        <button onClick={() => navigate('/provider/services')} className="back-button">
          ← Volver
        </button>
        <h1>Agregar Servicio</h1>
        <div></div>
      </div>

      <div className="service-content">
        <form onSubmit={handleSubmit} className="service-form">
          <div className="form-section">
            <h2>Información Básica</h2>
            
            <div className="form-group">
              <label htmlFor="categoryId">
                Categoría <span className="required">*</span>
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value={0}>Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="form-hint error">No hay categorías disponibles. Contacta al administrador.</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="serviceTitle">
                Título del Servicio <span className="required">*</span>
              </label>
              <input
                id="serviceTitle"
                name="serviceTitle"
                type="text"
                placeholder="Ej: Reparación de plomería"
                value={formData.serviceTitle}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="serviceDescription">
                Descripción <span className="required">*</span>
              </label>
              <textarea
                id="serviceDescription"
                name="serviceDescription"
                placeholder="Describe en detalle tu servicio, qué incluye, requisitos, etc."
                value={formData.serviceDescription}
                onChange={handleChange}
                required
                rows={5}
                className="form-textarea"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Precio y Duración</h2>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="priceType">Tipo de Precio</label>
                <select
                  id="priceType"
                  name="priceType"
                  value={formData.priceType}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="fixed">Precio Fijo</option>
                  <option value="hourly">Por Hora</option>
                  <option value="negotiable">Negociable</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="basePrice">
                  Precio Base ($) <span className="required">*</span>
                </label>
                <input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  placeholder="50.00"
                  min="0"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                <p className="form-hint">Ingresa 0 si el precio es negociable</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="estimatedDurationMinutes">Duración Estimada (minutos)</label>
              <input
                id="estimatedDurationMinutes"
                name="estimatedDurationMinutes"
                type="number"
                placeholder="60"
                min="1"
                value={formData.estimatedDurationMinutes}
                onChange={handleChange}
                className="form-input"
              />
              <p className="form-hint">Tiempo aproximado que toma completar el servicio</p>
            </div>
          </div>

          <div className="form-section">
            <h2>Estado del Servicio</h2>
            
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">
                Servicio activo (visible para clientes)
              </span>
            </label>
            <p className="checkbox-description">
              Si desactivas esta opción, el servicio no será visible para los clientes hasta que lo actives
            </p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/provider/services')}
              className="cancel-btn"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={saving || categories.length === 0}
            >
              {saving ? '⏳ Creando...' : '✓ Crear Servicio'}
            </button>
          </div>

          {categories.length === 0 && (
            <div className="warning-box">
              <span className="warning-icon">⚠️</span>
              <p>No puedes crear servicios hasta que haya categorías disponibles.</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
