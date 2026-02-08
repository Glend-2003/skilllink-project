import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/Config';

interface ServiceRequest {
  requestId: number;
  requestTitle: string;
  requestDescription: string;
  serviceAddress: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost: number;
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

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  accepted: '#10B981',
  in_progress: '#3B82F6',
  completed: '#6B7280',
  cancelled: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export default function MyRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line
  }, []);

  const loadRequests = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/requests/my-requests`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      if (!res.ok) throw new Error('Error al cargar solicitudes');
      const data = await res.json();
      setRequests(data);
    } catch (e) {
      alert('Error al cargar solicitudes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredRequests = selectedStatus
    ? requests.filter((r) => r.status === selectedStatus)
    : requests;

  return (
    <div style={{ padding: 24 }}>
      <h2>Mis Solicitudes</h2>
      <div style={{ marginBottom: 16 }}>
        {Object.keys(STATUS_LABELS).map((status) => (
          <button
            key={status}
            style={{
              marginRight: 8,
              background: selectedStatus === status ? STATUS_COLORS[status] : '#f3f4f6',
              color: selectedStatus === status ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              padding: '6px 12px',
              cursor: 'pointer',
            }}
            onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
          >
            {STATUS_LABELS[status]}
          </button>
        ))}
        <button
          style={{ marginLeft: 8, padding: '6px 12px' }}
          onClick={() => loadRequests(true)}
        >
          Refrescar
        </button>
      </div>
      {loading ? (
        <div>Cargando...</div>
      ) : filteredRequests.length === 0 ? (
        <div>No hay solicitudes.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Título</th>
              <th>Servicio</th>
              <th>Proveedor</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((req) => (
              <tr key={req.requestId} style={{ borderBottom: '1px solid #eee' }}>
                <td>{req.requestTitle}</td>
                <td>{req.service.serviceName}</td>
                <td>{req.provider.businessName}</td>
                <td style={{ color: STATUS_COLORS[req.status] }}>{STATUS_LABELS[req.status]}</td>
                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => navigate(`/review/${req.requestId}`)}
                    disabled={req.status !== 'completed' || !!req.review}
                  >
                    {req.review ? 'Ver Reseña' : 'Reseñar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
