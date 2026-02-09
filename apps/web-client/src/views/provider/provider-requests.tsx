import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import './provider-requests.css';

interface ServiceRequest {
  requestId: number;
  requestTitle: string;
  requestDescription: string;
  serviceAddress: string;
  addressDetails?: string;
  contactPhone?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost: number;
  finalCost: number | null;
  preferredDate: string;
  preferredTime: string;
  createdAt: string;
  clientUserId: number;
  service: {
    serviceName: string;
    category: {
      categoryName: string;
    };
  };
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export default function ProviderRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);

  // Modal states
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [finalCost, setFinalCost] = useState('');

  useEffect(() => {
    loadProviderProfile();
  }, []);

  const loadProviderProfile = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/providers/user/${user.userId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (response.ok) {
        const provider = await response.json();
        const actualProviderId = provider.id || provider.providerId;
        console.log('Provider ID found:', actualProviderId);
        setProviderId(actualProviderId);
        loadRequests(actualProviderId);
      } else {
        console.error('No se encontró el perfil de proveedor');
        alert('No se encontró tu perfil de proveedor. Asegúrate de tener una cuenta de proveedor activa.');
        navigate('/profile');
      }
    } catch (error) {
      console.error('Error loading provider profile:', error);
      alert('Error al cargar el perfil de proveedor');
      setLoading(false);
    }
  };

  const loadRequests = async (provId: number) => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/requests/provider/${provId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      console.log('Provider requests response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Provider requests loaded:', data);
        setRequests(data);
      } else {
        const errorText = await response.text();
        console.error('Error loading requests:', response.status, errorText);
        alert('No se pudieron cargar las solicitudes');
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      alert('Error al cargar las solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: number, status: string, cost?: number) => {
    try {
      const body: any = { status };
      if (cost !== undefined) {
        body.finalCost = cost;
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert('Solicitud actualizada correctamente');
        if (providerId) {
          loadRequests(providerId);
        }
        return true;
      } else {
        alert('Error al actualizar la solicitud');
        return false;
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Error al actualizar la solicitud');
      return false;
    }
  };

  const handleAcceptRequest = () => {
    if (!selectedRequest) return;

    const cost = parseFloat(finalCost);
    if (isNaN(cost) || cost <= 0) {
      alert('Ingresa un costo válido');
      return;
    }

    if (window.confirm(`¿Deseas aceptar esta solicitud por ₡${cost.toLocaleString()}?`)) {
      updateRequestStatus(selectedRequest.requestId, 'accepted', cost).then((success) => {
        if (success) {
          setShowAcceptModal(false);
          setSelectedRequest(null);
          setFinalCost('');
        }
      });
    }
  };

  const openAcceptModal = (request: ServiceRequest) => {
    setSelectedRequest(request);
    setFinalCost(request.estimatedCost.toString());
    setShowAcceptModal(true);
  };

  const filteredRequests = selectedStatus
    ? requests.filter((r) => r.status === selectedStatus)
    : requests;

  if (loading) {
    return (
      <div className="provider-requests-container">
        <div className="loading">⏳ Cargando solicitudes...</div>
      </div>
    );
  }

  return (
    <div className="provider-requests-container">
      <div className="provider-requests-header">
        <h1 className="provider-requests-title">Mis Solicitudes</h1>
        <button onClick={() => navigate('/profile')} className="back-button">
          ← Volver
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${!selectedStatus ? 'active' : ''}`}
          onClick={() => setSelectedStatus(null)}
        >
          Todas ({requests.length})
        </button>
        {Object.entries(STATUS_LABELS).map(([status, label]) => {
          const count = requests.filter((r) => r.status === status).length;
          return (
            <button
              key={status}
              className={`filter-tab ${selectedStatus === status ? 'active' : ''}`}
              onClick={() => setSelectedStatus(status)}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Requests Grid */}
      {filteredRequests.length === 0 ? (
        <div className="empty-state">
          <h3>📭 No hay solicitudes</h3>
          <p>
            {selectedStatus
              ? `No tienes solicitudes con estado "${STATUS_LABELS[selectedStatus]}"`
              : 'Aún no has recibido solicitudes de clientes'}
          </p>
        </div>
      ) : (
        <div className="requests-grid">
          {filteredRequests.map((request) => (
            <div key={request.requestId} className={`request-card ${request.status}`}>
              <div className="request-card-header">
                <div style={{ flex: 1 }}>
                  <h3 className="request-title">{request.requestTitle}</h3>
                  <p className="request-service">
                    🔧 {request.service?.serviceName || 'Servicio'}
                  </p>
                  <p className="request-category">
                    📂 {request.service?.category?.categoryName || 'Sin categoría'}
                  </p>
                </div>
                <span className={`status-badge ${request.status}`}>
                  {STATUS_LABELS[request.status]}
                </span>
              </div>

              <p className="request-description">{request.requestDescription}</p>

              <div className="request-info-grid">
                <div className="request-info-item">
                  <span className="request-info-label">Fecha Preferida</span>
                  <span className="request-info-value">
                    {new Date(request.preferredDate).toLocaleDateString('es-ES')}
                  </span>
                </div>
                <div className="request-info-item">
                  <span className="request-info-label">Hora</span>
                  <span className="request-info-value">{request.preferredTime}</span>
                </div>
                <div className="request-info-item">
                  <span className="request-info-label">Dirección</span>
                  <span className="request-info-value" style={{ fontSize: '13px' }}>
                    {request.serviceAddress}
                  </span>
                </div>
                <div className="request-info-item">
                  <span className="request-info-label">
                    {request.finalCost ? 'Costo Final' : 'Costo Estimado'}
                  </span>
                  <span className="request-info-value request-cost">
                    ₡{(request.finalCost || request.estimatedCost).toLocaleString()}
                  </span>
                </div>
              </div>

              {request.contactPhone && (
                <div className="request-info-item" style={{ marginTop: '12px' }}>
                  <span className="request-info-label">Teléfono</span>
                  <span className="request-info-value">📱 {request.contactPhone}</span>
                </div>
              )}

              <div className="request-actions">
                {request.status === 'pending' && (
                  <>
                    <button
                      className="action-button accept-button"
                      onClick={() => openAcceptModal(request)}
                    >
                      ✓ Aceptar
                    </button>
                    <button
                      className="action-button cancel-button"
                      onClick={() => {
                        if (window.confirm('¿Deseas cancelar esta solicitud?')) {
                          updateRequestStatus(request.requestId, 'cancelled');
                        }
                      }}
                    >
                      ✕ Rechazar
                    </button>
                  </>
                )}

                {request.status === 'accepted' && (
                  <button
                    className="action-button progress-button"
                    onClick={() => {
                      if (window.confirm('¿Iniciar trabajo en esta solicitud?')) {
                        updateRequestStatus(request.requestId, 'in_progress');
                      }
                    }}
                  >
                    ▶ Iniciar Trabajo
                  </button>
                )}

                {request.status === 'in_progress' && (
                  <button
                    className="action-button complete-button"
                    onClick={() => {
                      if (window.confirm('¿Marcar esta solicitud como completada?')) {
                        updateRequestStatus(request.requestId, 'completed');
                      }
                    }}
                  >
                    ✓ Completar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept Modal */}
      {showAcceptModal && selectedRequest && (
        <div className="modal-overlay" onClick={() => setShowAcceptModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Aceptar Solicitud</h2>
              <button className="modal-close" onClick={() => setShowAcceptModal(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <p style={{ marginBottom: '16px', color: '#6b7280' }}>
                Solicitud: <strong>{selectedRequest.requestTitle}</strong>
              </p>

              <div className="form-group">
                <label className="form-label">Costo Final del Servicio (₡)</label>
                <input
                  type="number"
                  className="form-input"
                  value={finalCost}
                  onChange={(e) => setFinalCost(e.target.value)}
                  placeholder="Ingresa el costo"
                  min="0"
                  step="0.01"
                />
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                  Costo estimado por el cliente: ₡{selectedRequest.estimatedCost.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-button secondary"
                onClick={() => setShowAcceptModal(false)}
              >
                Cancelar
              </button>
              <button className="modal-button primary" onClick={handleAcceptRequest}>
                Aceptar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
