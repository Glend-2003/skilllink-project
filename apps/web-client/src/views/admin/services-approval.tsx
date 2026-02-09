import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './services-approval.css';

interface PendingService {
  serviceId: number;
  providerId: number;
  providerBusinessName: string;
  providerEmail: string;
  categoryId: number;
  categoryName: string;
  serviceTitle: string;
  serviceDescription: string;
  basePrice?: number;
  priceType: string;
  estimatedDurationMinutes?: number;
  isActive: boolean;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function ServicesApproval() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<PendingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line
  }, [filter]);

  const loadServices = async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setLoading(true);

      const endpoint = filter === 'pending'
        ? '/api/v1/services/admin/pending'
        : '/api/v1/services/admin/all';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else if (response.status === 403) {
        alert('Acceso denegado. No tienes permisos de admin istrador');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error loading services:', error);
      alert('Error al cargar servicios');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleApprove = (serviceId: number, title: string) => {
    if (window.confirm(`¿Aprobar "${title}"?`)) {
      approveService(serviceId);
    }
  };

  const handleReject = (serviceId: number, title: string) => {
    if (window.confirm(`¿Rechazar "${title}"?`)) {
      rejectService(serviceId);
    }
  };

  const approveService = async (serviceId: number) => {
    try {
      setProcessingId(serviceId);
      const response = await fetch(`${API_BASE_URL}/api/v1/services/admin/${serviceId}/approve`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      if (response.ok) {
        alert('Servicio aprobado');
        loadServices();
      } else {
        alert('No se pudo aprobar el servicio');
      }
    } catch (error) {
      console.error('Error approving service:', error);
      alert('Error de conexión');
    } finally {
      setProcessingId(null);
    }
  };

  const rejectService = async (serviceId: number) => {
    try {
      setProcessingId(serviceId);
      const response = await fetch(`${API_BASE_URL}/api/v1/services/admin/${serviceId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: 'Contenido inapropiado o incompleto' }),
      });

      if (response.ok) {
        alert('Servicio rechazado');
        loadServices();
      } else {
        alert('No se pudo rechazar el servicio');
      }
    } catch (error) {
      console.error('Error rejecting service:', error);
      alert('Error de conexión');
    } finally {
      setProcessingId(null);
    }
  };

  const getPriceDisplay = (service: PendingService) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'approved';
      case 'pending': return 'pending';
      case 'rejected': return 'rejected';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="services-approval-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="services-approval-container">
      <div className="services-header">
        <button onClick={() => navigate('/profile')} className="back-button">
          ← Volver
        </button>
        <h1>Aprobación de Servicios</h1>
        <button 
          onClick={() => loadServices(true)} 
          className="refresh-button"
          disabled={isRefreshing}
        >
          🔄 {isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pendientes
        </button>
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todos
        </button>
      </div>

      <div className="services-content">
        {services.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No hay servicios</h3>
            <p>
              {filter === 'pending' 
                ? 'No hay servicios pendientes de aprobación'
                : 'No se encontraron servicios'
              }
            </p>
          </div>
        ) : (
          <div className="services-grid">
            {services.map((service) => (
              <div key={service.serviceId} className="service-card">
                <div className="service-header">
                  <div className="header-top">
                    <h3>{service.serviceTitle}</h3>
                    <span className={`status-badge ${getStatusColor(service.approvalStatus)}`}>
                      {service.approvalStatus === 'pending' && '⏳ Pendiente'}
                      {service.approvalStatus === 'approved' && '✓ Aprobado'}
                      {service.approvalStatus === 'rejected' && '✗ Rechazado'}
                    </span>
                  </div>
                  <p className="provider-info">
                    Proveedor: <strong>{service.providerBusinessName}</strong> ({service.providerEmail})
                  </p>
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
                    <span className="info-icon">📦</span>
                    <span>{service.priceType}</span>
                  </div>
                </div>

                {service.approvalStatus === 'pending' && (
                  <div className="service-actions">
                    <button
                      className="action-btn reject-btn"
                      onClick={() => handleReject(service.serviceId, service.serviceTitle)}
                      disabled={processingId === service.serviceId}
                    >
                      {processingId === service.serviceId ? '⏳' : '❌'} Rechazar
                    </button>
                    <button
                      className="action-btn approve-btn"
                      onClick={() => handleApprove(service.serviceId, service.serviceTitle)}
                      disabled={processingId === service.serviceId}
                    >
                      {processingId === service.serviceId ? '⏳' : '✅'} Aprobar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
