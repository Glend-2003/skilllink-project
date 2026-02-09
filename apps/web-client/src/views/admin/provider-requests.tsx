import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './provider-requests.css';

interface ProviderRequest {
  requestId: number;
  userId: number;
  userEmail: string;
  businessName: string;
  description: string;
  services: string;
  experience?: string;
  location: string;
  hourlyRate?: number;
  portfolio?: string;
  certifications?: string;
  status: string;
  createdAt: string;
}

export default function ProviderRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ProviderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line
  }, [filter]);

  const loadRequests = async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setLoading(true);

      const url = filter === 'all'
        ? `${API_BASE_URL}/api/v1/provider-requests`
        : `${API_BASE_URL}/api/v1/provider-requests?status=${filter}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else if (response.status === 403) {
        alert('No tienes permisos de administrador');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      alert('No se pudieron cargar las solicitudes');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleReview = async (requestId: number, status: 'approved' | 'rejected') => {
    const statusText = status === 'approved' ? 'aprobar' : 'rechazar';
    
    if (!window.confirm(`¿Estás seguro de que quieres ${statusText} esta solicitud?`)) {
      return;
    }

    try {
      setProcessingId(requestId);

      const response = await fetch(`${API_BASE_URL}/api/v1/provider-requests/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          requestId,
          status,
          reviewNotes: status === 'approved' 
            ? 'Solicitud aprobada. ¡Bienvenido como proveedor!'
            : 'Solicitud rechazada. Por favor revisa los requisitos.',
        }),
      });

      if (response.ok) {
        alert(`Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente`);
        loadRequests();
      } else {
        alert('No se pudo procesar la solicitud');
      }
    } catch (error) {
      console.error('Error processing review:', error);
      alert('No se pudo procesar la solicitud');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="provider-requests-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="provider-requests-container">
      {/* Header */}
      <div className="provider-requests-header">
        <button onClick={() => navigate('/profile')} className="back-button">
          ← Volver
        </button>
        <h1>Solicitudes de Proveedor</h1>
        <button 
          onClick={() => loadRequests(true)} 
          className="refresh-button"
          disabled={isRefreshing}
        >
          🔄 {isRefreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pendientes
        </button>
        <button
          className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Aprobadas
        </button>
        <button
          className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rechazadas
        </button>
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Todas
        </button>
      </div>

      {/* Content */}
      <div className="provider-requests-content">
        {requests.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No hay solicitudes</h3>
            <p>
              {filter === 'pending' 
                ? 'No hay solicitudes pendientes en este momento'
                : filter === 'all'
                ? 'No se encontraron solicitudes'
                : `No hay solicitudes ${filter === 'approved' ? 'aprobadas' : 'rechazadas'}`
              }
            </p>
          </div>
        ) : (
          <div className="requests-grid">
            {requests.map((request) => (
              <div key={request.requestId} className="request-card">
                {/* Card Header */}
                <div className="card-header">
                  <div className="user-info">
                    <div className="avatar">👤</div>
                    <div className="user-details">
                      <h3>{request.businessName}</h3>
                      <p className="email">{request.userEmail}</p>
                    </div>
                  </div>
                  <div className="date-badge">
                    <span className="date-icon">🕒</span>
                    <span>{formatDate(request.createdAt)}</span>
                  </div>
                </div>

                {/* Details */}
                <div className="card-details">
                  <div className="detail-row">
                    <span className="detail-icon">📍</span>
                    <span>{request.location}</span>
                  </div>
                  {request.hourlyRate && (
                    <div className="detail-row">
                      <span className="detail-icon">💵</span>
                      <span>${request.hourlyRate}/hora</span>
                    </div>
                  )}
                  {request.experience && (
                    <div className="detail-row">
                      <span className="detail-icon">💼</span>
                      <span>{request.experience}</span>
                    </div>
                  )}
                </div>

                {/* Description Section */}
                <div className="card-section">
                  <h4>Descripción</h4>
                  <p>{request.description}</p>
                </div>

                {/* Services Section */}
                <div className="card-section">
                  <h4>Servicios</h4>
                  <p>{request.services}</p>
                </div>

                {/* Actions or Status */}
                {request.status === 'pending' ? (
                  <div className="card-actions">
                    <button
                      className="action-button reject"
                      onClick={() => handleReview(request.requestId, 'rejected')}
                      disabled={processingId === request.requestId}
                    >
                      {processingId === request.requestId ? '⏳' : '❌'} Rechazar
                    </button>
                    <button
                      className="action-button approve"
                      onClick={() => handleReview(request.requestId, 'approved')}
                      disabled={processingId === request.requestId}
                    >
                      {processingId === request.requestId ? '⏳' : '✅'} Aprobar
                    </button>
                  </div>
                ) : (
                  <div className="card-status">
                    <span className={`status-badge ${request.status}`}>
                      {request.status === 'approved' ? '✅ Aprobada' : '❌ Rechazada'}
                    </span>
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
