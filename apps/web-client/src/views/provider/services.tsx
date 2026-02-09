import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './services.css';

interface Service {
  serviceId: number;
  providerId: number;
  categoryId: number;
  categoryName: string;
  serviceTitle: string;
  serviceDescription: string;
  basePrice?: number;
  priceType: string;
  estimatedDurationMinutes?: number;
  isActive: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
  createdAt: string;
}

export default function ProviderServices() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);

  useEffect(() => {
    loadProviderProfileAndServices();
    // eslint-disable-next-line
  }, []);

  const loadProviderProfileAndServices = async () => {
    try {
      setLoading(true);
      // Primero obtener el providerId del perfil
      const profileResponse = await fetch(`${API_BASE_URL}/api/v1/provider/profile`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        console.log('Provider profile loaded:', profile);
        setProviderId(profile.providerId);
        // Ahora cargar los servicios con el providerId
        await loadServicesWithProviderId(profile.providerId);
      } else if (profileResponse.status === 404) {
        // El proveedor aún no existe
        console.log('Provider profile not found');
        setServices([]);
      } else {
        console.error('Error loading provider profile');
        alert('No se pudo cargar tu perfil de proveedor');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const loadServicesWithProviderId = async (provId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/services/provider/${provId}`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Services loaded:', data);
        setServices(data);
      } else {
        console.error('Error loading services:', response.status);
        setServices([]);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    }
  };

  const loadServices = async (refresh = false) => {
    if (!providerId) {
      await loadProviderProfileAndServices();
      return;
    }

    try {
      if (refresh) setRefreshing(true);

      await loadServicesWithProviderId(providerId);
    } catch (error) {
      console.error('Error loading services:', error);
      alert('Error de conexión');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = (serviceId: number, title: string) => {
    if (window.confirm(`¿Estás seguro de eliminar "${title}"?`)) {
      deleteService(serviceId);
    }
  };

  const deleteService = async (serviceId: number) => {
    try {
      setDeletingId(serviceId);
      const response = await fetch(`${API_BASE_URL}/api/v1/services/${serviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      if (response.ok) {
        alert('Servicio eliminado');
        loadServices();
      } else {
        alert('No se pudo eliminar el servicio');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Error de conexión');
    } finally {
      setDeletingId(null);
    }
  };

  const getPriceDisplay = (service: Service) => {
    if (!service.basePrice) return 'Precio a negociar';
    
    const priceNum = typeof service.basePrice === 'string' 
      ? parseFloat(service.basePrice) 
      : service.basePrice;
    
    const price = `$${priceNum.toFixed(2)}`;
    
    if (service.priceType === 'hourly') return `${price}/hora`;
    if (service.priceType === 'negotiable') return `${price} (negociable)`;
    return price;
  };

  const getDurationDisplay = (minutes?: number) => {
    if (!minutes) return null;
    
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getApprovalColor = (status: string) => {
    switch (status) {
      case 'approved': return 'approved';
      case 'pending': return 'pending';
      case 'rejected': return 'rejected';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="services-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="services-container">
      <div className="services-header">
        <button onClick={() => navigate('/profile')} className="back-button">
          ← Volver
        </button>
        <h1>Mis Servicios</h1>
        <div className="header-actions">
          <button 
            onClick={() => loadServices(true)} 
            className="refresh-button"
            disabled={refreshing}
          >
            🔄 {refreshing ? 'Actualizando...' : 'Actualizar'}
          </button>
          {services.length > 0 && (
            <button 
              className="add-service-header-btn"
              onClick={() => navigate('/provider/add-service')}
            >
              ➕ Agregar Servicio
            </button>
          )}
        </div>
      </div>

      <div className="services-content">
        {services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No tienes servicios registrados</h3>
            <p>Agrega tu primer servicio para empezar a recibir solicitudes</p>
            <button 
              className="add-service-btn"
              onClick={() => navigate('/provider/add-service')}
            >
              ➕ Agregar Servicio
            </button>
          </div>
        ) : (
          <>
            <div className="services-grid">
              {services.map((service) => (
                <div key={service.serviceId} className="service-card">
                  <div className="service-header">
                    <div className="title-row">
                      <h3>{service.serviceTitle}</h3>
                      <div className="badges">
                        {service.isVerified && (
                          <span className="verified-badge">✓</span>
                        )}
                        <span className={`approval-badge ${getApprovalColor(service.approvalStatus)}`}>
                          {service.approvalStatus === 'approved' && '✓ Aprobado'}
                          {service.approvalStatus === 'pending' && '⌛ Pendiente'}
                          {service.approvalStatus === 'rejected' && '✗ Rechazado'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="category-tag">{service.categoryName}</div>

                  <p className="service-description">{service.serviceDescription}</p>

                  <div className="service-info">
                    <div className="info-item">
                      <span className="info-icon">💵</span>
                      <span>{getPriceDisplay(service)}</span>
                    </div>
                    {service.estimatedDurationMinutes && (
                      <div className="info-item">
                        <span className="info-icon">🕒</span>
                        <span>{getDurationDisplay(service.estimatedDurationMinutes)}</span>
                      </div>
                    )}
                    <div className="info-item">
                      <span className={`status-indicator ${service.isActive ? 'active' : 'inactive'}`}>
                        {service.isActive ? '● Activo' : '○ Inactivo'}
                      </span>
                    </div>
                  </div>

                  <div className="service-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => navigate(`/provider/edit-service?id=${service.serviceId}`)}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDelete(service.serviceId, service.serviceTitle)}
                      disabled={deletingId === service.serviceId}
                    >
                      {deletingId === service.serviceId ? '⏳' : '🗑️'} Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              className="fab"
              onClick={() => navigate('/provider/add-service')}
              title="Agregar servicio"
            >
              ➕
            </button>
          </>
        )}
      </div>
    </div>
  );
}
