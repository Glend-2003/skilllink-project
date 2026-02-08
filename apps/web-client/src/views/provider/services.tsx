import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';

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
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/provider/services`, {
          headers: { 'Authorization': `Bearer ${user?.token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setServices(data);
        } else {
          alert('No se pudieron cargar los servicios');
        }
      } catch (error) {
        alert('Error de red');
      }
      setLoading(false);
    };
    loadServices();
  }, [user]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>Mis Servicios</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Título</th>
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
              <td>{service.categoryName}</td>
              <td>{service.basePrice ?? '-'}</td>
              <td>{service.priceType}</td>
              <td>{service.approvalStatus}</td>
              <td>
                
                <button style={{ marginRight: 8 }}>Editar</button>
                <button>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
