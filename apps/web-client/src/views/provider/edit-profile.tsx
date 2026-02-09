import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './edit-profile.css';

interface ProviderProfile {
  providerId: number;
  userId: number;
  businessName?: string;
  businessDescription?: string;
  latitude?: number;
  longitude?: number;
  yearsExperience?: number;
  serviceRadiusKm?: number;
  isVerified: boolean;
  verificationDate?: string;
  trustBadge: boolean;
  availableForWork: boolean;
}

export default function EditProviderProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    latitude: '',
    longitude: '',
    yearsExperience: '',
    serviceRadiusKm: '',
    availableForWork: true,
  });

  useEffect(() => {
    loadProviderProfile();
    // eslint-disable-next-line
  }, []);

  const loadProviderProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/provider/profile`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      if (response.ok) {
        const profile: ProviderProfile = await response.json();
        setFormData({
          businessName: profile.businessName || '',
          businessDescription: profile.businessDescription || '',
          latitude: profile.latitude?.toString() || '',
          longitude: profile.longitude?.toString() || '',
          yearsExperience: profile.yearsExperience?.toString() || '',
          serviceRadiusKm: profile.serviceRadiusKm?.toString() || '',
          availableForWork: profile.availableForWork,
        });
      } else if (response.status === 404) {
        // El proveedor aún no existe, dejar formulario vacío
        console.log('Provider profile not found, will create new one');
      } else {
        alert('No se pudo cargar el perfil de proveedor');
      }
    } catch (error) {
      console.error('Error loading provider profile:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName.trim()) {
      alert('El nombre del negocio es requerido');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/provider/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          businessDescription: formData.businessDescription,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
          serviceRadiusKm: formData.serviceRadiusKm ? parseInt(formData.serviceRadiusKm) : null,
          availableForWork: formData.availableForWork,
        }),
      });

      if (response.ok) {
        alert('Perfil actualizado correctamente');
        navigate('/profile');
      } else {
        const data = await response.json();
        alert(data.message || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating provider profile:', error);
      alert('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-profile-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-profile-container">
      <div className="profile-header">
        <button onClick={() => navigate('/profile')} className="back-button">
          ← Volver
        </button>
        <h1>Editar Perfil de Proveedor</h1>
        <div></div>
      </div>

      <div className="profile-content">
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2>Información del Negocio</h2>
            
            <div className="form-group">
              <label htmlFor="businessName">
                Nombre del Negocio <span className="required">*</span>
              </label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="Ej: Plomería García"
                value={formData.businessName}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="businessDescription">Descripción</label>
              <textarea
                id="businessDescription"
                name="businessDescription"
                placeholder="Describe tus servicios, experiencia y especialidades..."
                value={formData.businessDescription}
                onChange={handleChange}
                rows={4}
                className="form-textarea"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="yearsExperience">Años de Experiencia</label>
                <input
                  id="yearsExperience"
                  name="yearsExperience"
                  type="number"
                  placeholder="0"
                  min="0"
                  max="80"
                  value={formData.yearsExperience}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="serviceRadiusKm">Radio de Servicio (km)</label>
                <input
                  id="serviceRadiusKm"
                  name="serviceRadiusKm"
                  type="number"
                  placeholder="10"
                  min="1"
                  max="500"
                  value={formData.serviceRadiusKm}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Ubicación</h2>
            <p className="section-description">
              Proporciona tu ubicación para que los clientes puedan encontrarte más fácilmente
            </p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="latitude">Latitud</label>
                <input
                  id="latitude"
                  name="latitude"
                  type="text"
                  placeholder="14.6349"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="longitude">Longitud</label>
                <input
                  id="longitude"
                  name="longitude"
                  type="text"
                  placeholder="-90.5069"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="location-help">
              <span className="help-icon">💡</span>
              <span>
                Puedes obtener tus coordenadas desde Google Maps: Click derecho en el mapa → "¿Qué hay aquí?"
              </span>
            </div>
          </div>

          <div className="form-section">
            <h2>Disponibilidad</h2>
            
            <label className="checkbox-container">
              <input
                type="checkbox"
                name="availableForWork"
                checked={formData.availableForWork}
                onChange={handleChange}
                className="checkbox-input"
              />
              <span className="checkbox-custom"></span>
              <span className="checkbox-label">
                Disponible para recibir nuevas solicitudes
              </span>
            </label>
            <p className="checkbox-description">
              Si desactivas esta opción, los clientes no podrán enviarte nuevas solicitudes
            </p>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="cancel-btn"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="save-btn"
              disabled={saving}
            >
              {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
