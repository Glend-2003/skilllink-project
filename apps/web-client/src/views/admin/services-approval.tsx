import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Check, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { confirmToast } from '../../utils/confirmToast';

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
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line
  }, []);

  const loadServices = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/v1/services/admin/all`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else if (response.status === 403) {
        toast.error('No tienes permisos de administrador');
        navigate('/profile');
      } else {
        toast.error('Error al cargar servicios');
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Error de conexión al cargar servicios');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleApprove = async (serviceId: number, title: string) => {
    const confirmed = await confirmToast(`¿Aprobar "${title}"?`);
    if (confirmed) {
      approveService(serviceId);
    }
  };

  const handleReject = async (serviceId: number, title: string) => {
    const confirmed = await confirmToast(`¿Rechazar "${title}"?`);
    if (confirmed) {
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
        toast.success('Servicio aprobado');
        loadServices();
      } else {
        toast.error('No se pudo aprobar el servicio');
      }
    } catch (error) {
      console.error('Error approving service:', error);
      toast.error('Error de conexión');
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
        toast.success('Servicio rechazado');
        loadServices();
      } else {
        toast.error('No se pudo rechazar el servicio');
      }
    } catch (error) {
      console.error('Error rejecting service:', error);
      toast.error('Error de conexión');
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

  const filteredServices = selectedStatus
    ? services.filter((s) => s.approvalStatus === selectedStatus)
    : services;

  const getApprovalBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Aprobación de Servicios</h1>
              <p className="text-slate-600">Revisa y aprueba nuevos servicios enviados por proveedores</p>
            </div>
            <Button
              onClick={() => loadServices(true)}
              disabled={refreshing}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualizando...' : 'Actualizar'}
            </Button>
          </div>
        </div>

        <Tabs value={selectedStatus || 'all'} onValueChange={(value) => setSelectedStatus(value === 'all' ? null : value)}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="all">Todos ({services.length})</TabsTrigger>
            <TabsTrigger value="pending">Pendientes ({services.filter(s => s.approvalStatus === 'pending').length})</TabsTrigger>
            <TabsTrigger value="approved">Aprobados ({services.filter(s => s.approvalStatus === 'approved').length})</TabsTrigger>
            <TabsTrigger value="rejected">Rechazados ({services.filter(s => s.approvalStatus === 'rejected').length})</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedStatus || 'all'}>
            {filteredServices.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-xl font-bold mb-2">No hay servicios</h3>
                  <p className="text-slate-600">
                    {selectedStatus && selectedStatus !== 'all'
                      ? `No hay servicios ${selectedStatus === 'pending' ? 'pendientes' : selectedStatus === 'approved' ? 'aprobados' : 'rechazados'}`
                      : 'No hay servicios para revisar'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredServices.map((service) => (
                  <Card key={service.serviceId}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold">{service.serviceTitle}</h3>
                              <p className="text-sm text-slate-600">
                                Proveedor: <strong>{service.providerBusinessName}</strong> ({service.providerEmail})
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Badge variant={getApprovalBadgeVariant(service.approvalStatus)}>
                                {service.approvalStatus === 'approved' && '✓ Aprobado'}
                                {service.approvalStatus === 'pending' && '⌛ Pendiente'}
                                {service.approvalStatus === 'rejected' && '✗ Rechazado'}
                              </Badge>
                              <Badge variant="secondary">{service.categoryName}</Badge>
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

                        {service.approvalStatus === 'pending' && (
                          <div className="flex gap-2 md:flex-col md:min-w-[140px]">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 flex-1"
                              onClick={() => handleReject(service.serviceId, service.serviceTitle)}
                              disabled={processingId === service.serviceId}
                            >
                              <X className="w-4 h-4" />
                              <span className="hidden md:inline">Rechazar</span>
                            </Button>
                            <Button
                              size="sm"
                              className="gap-2 flex-1"
                              onClick={() => handleApprove(service.serviceId, service.serviceTitle)}
                              disabled={processingId === service.serviceId}
                            >
                              <Check className="w-4 h-4" />
                              <span className="hidden md:inline">Aprobar</span>
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
