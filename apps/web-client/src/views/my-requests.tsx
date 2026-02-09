import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/Config';
import './my-requests.css';

interface ServiceRequest {
  requestId: number;
  requestTitle: string;
  requestDescription: string;
  serviceAddress: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost: number | null;
  finalCost: number | null;
  preferredDate: string;
  preferredTime: string;
  createdAt: string;
  review?: {
    reviewId: number;
    rating: number;
  };
  service: {
    serviceName: string;
    category: {
      categoryName: string;
    };
  };
  provider: {
    providerId: number;
    businessName: string;
    user?: {
      userId: number;
      profileImageUrl?: string;
    };
  };
}

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  pending: { color: 'pending', label: 'Pendiente', icon: '⏳' },
  accepted: { color: 'accepted', label: 'Aceptada', icon: '✅' },
  in_progress: { color: 'in-progress', label: 'En Progreso', icon: '🔄' },
  completed: { color: 'completed', label: 'Completada', icon: '✓' },
  cancelled: { color: 'cancelled', label: 'Cancelada', icon: '❌' },
};

export default function MyRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line
  }, []);

  const loadRequests = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/requests/mine`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to load requests:', res.status, res.statusText, errorText);
        
        if (res.status === 404) {
          setError('El endpoint de solicitudes no está disponible. Contacta al administrador.');
        } else if (res.status === 401 || res.status === 403) {
          setError('No tienes permisos para ver las solicitudes. Inicia sesión nuevamente.');
        } else {
          setError(`Error al cargar solicitudes: ${res.status} ${res.statusText}`);
        }
        
        setRequests([]);
        return;
      }
      
      const data = await res.json();
      console.log('Requests loaded:', data);
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading requests:', e);
      setError(`Error de conexión: ${e instanceof Error ? e.message : 'No se pudo conectar con el servidor'}`);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredRequests = selectedStatus
    ? requests.filter((r) => r.status === selectedStatus)
    : requests;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCost = (cost: number | null | undefined) => {
    if (cost === null || cost === undefined || isNaN(cost)) {
      return 'Por definir';
    }
    return `₡${Number(cost).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="requests-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="requests-container">
      <div className="requests-header">
        <button onClick={() => navigate('/')} className="back-button">
          ← Inicio
        </button>
        <h1>Mis Solicitudes</h1>
        <button 
          onClick={() => loadRequests(true)} 
          className="refresh-button"
          disabled={refreshing}
        >
          🔄 {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      <div className="filter-tabs">
        <button
          className={`filter-tab ${selectedStatus === null ? 'active' : ''}`}
          onClick={() => setSelectedStatus(null)}
        >
          Todas
        </button>
        {Object.entries(STATUS_CONFIG).map(([status, config]) => (
          <button
            key={status}
            className={`filter-tab ${selectedStatus === status ? 'active' : ''}`}
            onClick={() => setSelectedStatus(status)}
          >
            {config.icon} {config.label}
          </button>
        ))}
      </div>

      <div className="requests-content">
        {error ? (
          <div className="error-state">
            <div className="error-icon">⚠️</div>
            <h3>Error al cargar solicitudes</h3>
            <p>{error}</p>
            <button 
              className="retry-btn"
              onClick={() => loadRequests(true)}
              disabled={refreshing}
            >
              {refreshing ? '⏳ Reintentando...' : '🔄 Reintentar'}
            </button>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No hay solicitudes</h3>
            <p>
              {selectedStatus 
                ? `No tienes solicitudes con estado "${STATUS_CONFIG[selectedStatus].label}"`
                : 'Aún no has realizado ninguna solicitud de servicio'
              }
            </p>
          </div>
        ) : (
          <div className="requests-grid">
            {filteredRequests.map((req) => {
              const statusConfig = STATUS_CONFIG[req.status];
              return (
                <div key={req.requestId} className="request-card">
                  <div className="request-header">
                    <h3>{req.requestTitle}</h3>
                    <span className={`status-badge ${statusConfig.color}`}>
                      {statusConfig.icon} {statusConfig.label}
                    </span>
                  </div>

                  <div className="request-meta">
                    <div className="meta-item">
                      <span className="meta-icon">🏷️</span>
                      <span>{req.service.serviceName}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-icon">📁</span>
                      <span>{req.service.category.categoryName}</span>
                    </div>
                  </div>

                  <div className="provider-info">
                    <span className="provider-icon">👤</span>
                    <div>
                      <strong>Proveedor</strong>
                      <p>{req.provider.businessName}</p>
                    </div>
                  </div>

                  <p className="request-description">{req.requestDescription}</p>

                  <div className="request-details">
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <div>
                        <strong>Dirección</strong>
                        <p>{req.serviceAddress}</p>
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📅</span>
                      <div>
                        <strong>Fecha preferida</strong>
                        <p>{formatDate(req.preferredDate)} a las {req.preferredTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="request-cost">
                    <div className="cost-item">
                      <span>Costo estimado</span>
                      <strong>{formatCost(req.estimatedCost)}</strong>
                    </div>
                    {req.finalCost && (
                      <div className="cost-item final">
                        <span>Costo final</span>
                        <strong>{formatCost(req.finalCost)}</strong>
                      </div>
                    )}
                  </div>

                  <div className="request-footer">
                    <span className="created-date">
                      Creada: {formatDate(req.createdAt)}
                    </span>
                    {req.status === 'completed' && (
                      <button
                        className={`review-btn ${req.review ? 'reviewed' : ''}`}
                        onClick={() => navigate(`/review/${req.requestId}`)}
                      >
                        {req.review ? '⭐ Ver Reseña' : '⭐ Reseñar'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
