import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';

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
  const [services, setServices] = useState<PendingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line
  }, [filter]);

  const loadServices = async () => {
    try {
      const endpoint = filter === 'pending'
        ? '/api/v1/services/admin/pending'
        : '/api/v1/services/admin/all';
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleAction = async (serviceId: number, action: 'approve' | 'reject') => {
    setProcessingId(serviceId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/services/admin/${serviceId}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      if (response.ok) {
        loadServices();
      } else {
        alert('Error al procesar el servicio');
      }
    } catch (e) {
      alert('Error de red');
    }
    setProcessingId(null);
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>Aprobación de Servicios</h2>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setFilter('pending')} style={{ marginRight: 8, background: filter==='pending'?'#2563eb':'#eee', color: filter==='pending'?'#fff':'#222' }}>Pendientes</button>
        <button onClick={() => setFilter('all')} style={{ background: filter==='all'?'#2563eb':'#eee', color: filter==='all'?'#fff':'#222' }}>Todos</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Título</th>
            <th>Proveedor</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {services.map(service => (
            <tr key={service.serviceId} style={{ borderBottom: '1px solid #eee' }}>
              <td>{service.serviceTitle}</td>
              <td>{service.providerBusinessName} ({service.providerEmail})</td>
              <td>{service.categoryName}</td>
              <td>{service.basePrice ?? '-'}</td>
              <td>{service.priceType}</td>
              <td>{service.approvalStatus}</td>
              <td>
                {service.approvalStatus === 'pending' && (
                  <>
                    <button disabled={processingId===service.serviceId} onClick={() => handleAction(service.serviceId, 'approve')} style={{ marginRight: 8 }}>Aprobar</button>
                    <button disabled={processingId===service.serviceId} onClick={() => handleAction(service.serviceId, 'reject')}>Rechazar</button>
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
