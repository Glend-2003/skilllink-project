import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Plus, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui//button';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';

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
        setProviderId(profile.providerId);
        await loadServicesWithProviderId(profile.providerId);
      } else if (profileResponse.status === 404) {
        console.log('Provider profile not found');
        setServices([]);
      } else {
        console.error('Error loading provider profile');
        toast.error('No se pudo cargar tu perfil de proveedor');
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
        toast.success('Servicio eliminado');
        loadServices();
      } else {
        toast.error('No se pudo eliminar el servicio');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Error de conexión');
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando servicios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mis Servicios</h1>
              <p className="text-slate-600">Gestiona y administra todos tus servicios</p>
            </div>
          </div>
        </div>

        {services.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-xl font-bold mb-2">No tienes servicios registrados</h3>
              <p className="text-slate-600 mb-6">Agrega tu primer servicio para empezar a recibir solicitudes</p>
              <Button 
                onClick={() => navigate('/provider/add-service')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar Servicio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">{services.length} {services.length === 1 ? 'servicio' : 'servicios'}</p>
              <div>
                <Button 
                variant="outline" 
                size="sm"
                onClick={() => loadServices(true)}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </Button>
              <Button 
                variant="outline" 
                disabled={refreshing}
                size="sm"
                onClick={() => navigate('/provider/add-service')}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Agregar Servicio
              </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {services.map((service) => (
                <Card key={service.serviceId}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold">{service.serviceTitle}</h3>
                            <p className="text-sm text-slate-600">{service.categoryName}</p>
                          </div>
                          <div className="flex gap-2">
                            {service.isVerified && (
                              <Badge>✓ Verificado</Badge>
                            )}
                            <Badge 
                              variant={
                                service.approvalStatus === 'approved' ? 'default' : 
                                service.approvalStatus === 'pending' ? 'secondary' : 
                                'destructive'
                              }
                            >
                              {service.approvalStatus === 'approved' && '✓ Aprobado'}
                              {service.approvalStatus === 'pending' && '⌛ Pendiente'}
                              {service.approvalStatus === 'rejected' && '✗ Rechazado'}
                            </Badge>
                            <Badge 
                              variant={service.isActive ? 'default' : 'secondary'}
                            >
                              {service.isActive ? '● Activo' : '● Inactivo'}
                            </Badge>
                          </div>
                        </div>

                        <p className="text-slate-700 mb-3">{service.serviceDescription}</p>

                        <div className="flex flex-wrap gap-4 text-sm">
                          <div>
                            <span className="text-slate-600">Precio: </span>
                            <span className="font-semibold">{getPriceDisplay(service)}</span>
                          </div>
                          {service.estimatedDurationMinutes && (
                            <div>
                              <span className="text-slate-600">Duración: </span>
                              <span className="font-semibold">{getDurationDisplay(service.estimatedDurationMinutes)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 md:flex-col">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => navigate(`/provider/edit-service?id=${service.serviceId}`)}
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden md:inline">Editar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleDelete(service.serviceId, service.serviceTitle)}
                          disabled={deletingId === service.serviceId}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden md:inline">
                            {deletingId === service.serviceId ? 'Eliminando...' : 'Eliminar'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
