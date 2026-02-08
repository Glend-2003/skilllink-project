import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';

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
  const [requests, setRequests] = useState<ProviderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const url = filter === 'all'
        ? `${API_BASE_URL}/api/v1/admin/provider-requests`
        : `${API_BASE_URL}/api/v1/admin/provider-requests?status=${filter}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleAction = async (requestId: number, action: 'approve' | 'reject') => {
    setProcessingId(requestId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/provider-requests/${requestId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      if (response.ok) {
        loadRequests();
      } else {
        alert('Error al procesar la solicitud');
      }
    } catch (e) {
      alert('Error de red');
    }
    setProcessingId(null);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>Solicitudes de Proveedor</h2>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setFilter('pending')} style={{ marginRight: 8, background: filter==='pending'?'#2563eb':'#eee', color: filter==='pending'?'#fff':'#222' }}>Pendientes</button>
        <button onClick={() => setFilter('approved')} style={{ marginRight: 8, background: filter==='approved'?'#2563eb':'#eee', color: filter==='approved'?'#fff':'#222' }}>Aprobadas</button>
        <button onClick={() => setFilter('rejected')} style={{ marginRight: 8, background: filter==='rejected'?'#2563eb':'#eee', color: filter==='rejected'?'#fff':'#222' }}>Rechazadas</button>
        <button onClick={() => setFilter('all')} style={{ background: filter==='all'?'#2563eb':'#eee', color: filter==='all'?'#fff':'#222' }}>Todas</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Negocio</th>
            <th>Descripción</th>
            <th>Servicios</th>
            <th>Ubicación</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.requestId} style={{ borderBottom: '1px solid #eee' }}>
              <td>{req.userEmail}</td>
              <td>{req.businessName}</td>
              <td>{req.description}</td>
              <td>{req.services}</td>
              <td>{req.location}</td>
              <td>{req.status}</td>
              <td>
                {req.status === 'pending' && (
                  <>
                    <button disabled={processingId===req.requestId} onClick={() => handleAction(req.requestId, 'approve')} style={{ marginRight: 8 }}>Aprobar</button>
                    <button disabled={processingId===req.requestId} onClick={() => handleAction(req.requestId, 'reject')}>Rechazar</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
