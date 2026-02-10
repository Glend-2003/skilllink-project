import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ServiceGalleryUpload from '../../components/ServiceGalleryUpload';
import ServiceGalleryView from '../../components/ServiceGalleryView';
import { toast } from 'sonner';

interface ServiceCategory {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  isActive: boolean;
}

interface Service {
  serviceId: number;
  categoryId: number;
  serviceTitle: string;
  serviceDescription: string;
  basePrice?: number;
  priceType: string;
  estimatedDurationMinutes?: number;
  isActive: boolean;
}

export default function EditService() {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('id');
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
    basePrice: '',
    priceType: 'fixed' as 'fixed' | 'hourly' | 'negotiable',
    estimatedDurationMinutes: '',
    isActive: true,
  });

  useEffect(() => {
    if (!serviceId) {
      toast.error('ID de servicio no proporcionado');
      navigate('/provider/services');
      return;
    }
    loadData();
    // eslint-disable-next-line
  }, [serviceId]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadCategories(), loadProviderInfo(), loadService()]);
    } finally {
      setLoading(false);
    }
  };

  const loadProviderInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/provider/profile`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProviderId(data.providerId);
      }
    } catch (error) {
      console.error('Error loading provider info:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadService = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/services/${serviceId}`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      if (response.ok) {
        const service: Service = await response.json();
        setFormData({
          categoryId: service.categoryId,
          serviceTitle: service.serviceTitle,
          serviceDescription: service.serviceDescription,
          basePrice: service.basePrice?.toString() || '',
          priceType: service.priceType as 'fixed' | 'hourly' | 'negotiable',
          estimatedDurationMinutes: service.estimatedDurationMinutes?.toString() || '',
          isActive: service.isActive,
        });
      } else {
        toast.error('No se pudo cargar el servicio');
        navigate('/provider/services');
      }
    } catch (error) {
      console.error('Error loading service:', error);
      toast.error('Error al cargar el servicio');
      navigate('/provider/services');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'categoryId') {
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceTitle.trim()) {
      toast.error('El título del servicio es requerido');
      return;
    }

    if (!formData.serviceDescription.trim()) {
      toast.error('La descripción es requerida');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        categoryId: formData.categoryId || null,
        serviceTitle: formData.serviceTitle,
        serviceDescription: formData.serviceDescription,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
        priceType: formData.priceType,
        estimatedDurationMinutes: formData.estimatedDurationMinutes
          ? parseInt(formData.estimatedDurationMinutes)
          : null,
        isActive: formData.isActive,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Servicio actualizado correctamente');
        navigate('/provider/services');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'No se pudo actualizar el servicio');
      }
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="add-service-container">
        <div className="add-service-loading">Cargando servicio...</div>
      </div>
    );
  }

  return (
    <div className="add-service-container">
      <div className="add-service-header">
        <button onClick={() => navigate('/provider/services')} className="back-button">← Volver</button>
        <h1>Editar Servicio</h1>
      </div>

      <form onSubmit={handleSubmit} className="add-service-form">
        <div className="form-group">
          <label htmlFor="categoryId">Categoría</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="form-control"
          >
            <option value={0}>Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.categoryName}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="serviceTitle">Título del Servicio *</label>
          <input
            type="text"
            id="serviceTitle"
            name="serviceTitle"
            value={formData.serviceTitle}
            onChange={handleChange}
            placeholder="Ej: Reparación de plomería"
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="serviceDescription">Descripción *</label>
          <textarea
            id="serviceDescription"
            name="serviceDescription"
            value={formData.serviceDescription}
            onChange={handleChange}
            placeholder="Describe en detalle tu servicio"
            rows={4}
            className="form-control"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="priceType">Tipo de Precio</label>
          <select
            id="priceType"
            name="priceType"
            value={formData.priceType}
            onChange={handleChange}
            className="form-control"
          >
            <option value="fixed">Precio Fijo</option>
            <option value="hourly">Por Hora</option>
            <option value="negotiable">Negociable</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="basePrice">Precio Base ($)</label>
          <input
            type="number"
            id="basePrice"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleChange}
            placeholder="Ej: 50.00"
            step="0.01"
            min="0"
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label htmlFor="estimatedDurationMinutes">Duración Estimada (minutos)</label>
          <input
            type="number"
            id="estimatedDurationMinutes"
            name="estimatedDurationMinutes"
            value={formData.estimatedDurationMinutes}
            onChange={handleChange}
            placeholder="Ej: 60"
            min="0"
            className="form-control"
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
            <span>Servicio Activo</span>
          </label>
        </div>

        {serviceId && providerId && (
          <>
            <div className="gallery-section">
              <h3>Galería del Servicio</h3>
              <ServiceGalleryView serviceId={parseInt(serviceId)} editable={true} />
            </div>

            <div className="gallery-section">
              <h3>Agregar Más Fotos</h3>
              <ServiceGalleryUpload
                serviceId={parseInt(serviceId)}
                providerId={providerId}
                onUploadComplete={(images) => {
                  toast.success('Fotos agregadas correctamente');
                  loadService();
                }}
              />
            </div>
          </>
        )}

        <button type="submit" className="submit-button" disabled={saving}>
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </form>
    </div>
  );
}
