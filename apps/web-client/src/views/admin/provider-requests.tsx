import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { toast } from 'sonner';
import { confirmToast } from '../../utils/confirmToast';
import { RefreshCw } from 'lucide-react';

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
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700' },
  approved: { bg: 'bg-green-100', text: 'text-green-700' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700' },
};

export default function AdminProviderRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ProviderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line
  }, []);

  const loadRequests = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);
      
      setError(null);

      // Try multiple endpoints
      let response = await fetch(`${API_BASE_URL}/api/v1/provider-requests`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      // If main endpoint fails, try alternative
      if (!response.ok) {
        console.warn(`Main endpoint failed (${response.status}), trying alternative...`);
        response = await fetch(`${API_BASE_URL}/api/v1/providers/requests`, {
          headers: { 'Authorization': `Bearer ${user?.token}` },
        });
      }

      if (response.ok) {
        const data = await response.json();
        setRequests(Array.isArray(data) ? data : []);
        setError(null);
      } else if (response.status === 403) {
        setError('No tienes permisos de administrador');
        navigate('/profile');
      } else {
        console.error('Both endpoints failed with status:', response.status);
        setError(`No se pudieron cargar las solicitudes. Código de error: ${response.status}`);
        setRequests([]);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setError('Error de conexión. Verifica tu conexión a internet e intenta nuevamente.');
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleReview = async (requestId: number, status: 'approved' | 'rejected') => {
    const statusText = status === 'approved' ? 'aprobar' : 'rechazar';
    
    const confirmed = await confirmToast(
      `¿Estás seguro de que quieres ${statusText} esta solicitud?`
    );
    if (!confirmed) {
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
        }),
      });

      if (response.ok) {
        toast.success(`Solicitud ${statusText}ada exitosamente`);
        loadRequests();
      } else {
        toast.error(`No se pudo ${statusText} la solicitud`);
      }
    } catch (error) {
      console.error(`Error ${statusText}ing request:`, error);
      toast.error('Error de conexión');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = selectedStatus
    ? requests.filter((r) => r.status === selectedStatus)
    : requests;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Solicitudes de Proveedores</h1>
            <p className="text-slate-600">Gestiona y aprueba solicitudes de nuevos proveedores</p>
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="text-3xl">ℹ️</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">Solicitudes no disponibles temporalmente</h3>
                  <p className="text-blue-800 mb-4">
                    Los datos de solicitudes de proveedores no están disponibles en este momento. 
                    Por favor, intenta más tarde.
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={() => loadRequests(true)}
                      disabled={refreshing}
                      variant="outline"
                      className="gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                      {refreshing ? 'Reintentando...' : 'Reintentar'}
                    </Button>
                    <Button 
                      onClick={() => navigate('/profile')}
                      variant="outline"
                    >
                      Volver al perfil
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Solicitudes de Proveedores</h1>
            <p className="text-slate-600">Gestiona y aprueba solicitudes de nuevos proveedores</p>
          </div>
          <Button
            onClick={() => loadRequests(true)}
            disabled={refreshing}
            variant="outline"
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>

        <Tabs value={selectedStatus || 'all'} onValueChange={(value) => setSelectedStatus(value === 'all' ? null : value)}>
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-6">
            <TabsTrigger value="all">Todas ({requests.length})</TabsTrigger>
            {Object.entries(STATUS_LABELS).map(([status, label]) => {
              const count = requests.filter((r) => r.status === status).length;
              return (
                <TabsTrigger key={status} value={status}>
                  {label} ({count})
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={selectedStatus || 'all'}>
            {filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-5xl mb-4">📭</div>
                  <h3 className="text-xl font-bold mb-2">No hay solicitudes</h3>
                  <p className="text-slate-600">
                    {selectedStatus && selectedStatus !== 'all'
                      ? `No hay solicitudes ${STATUS_LABELS[selectedStatus].toLowerCase()}`
                      : 'No hay solicitudes de proveedores en este momento'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredRequests.map((request) => (
                  <Card key={request.requestId}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6 justify-between">
                        <div className="flex-1">
                          {/* Header */}
                          <div className="flex items-start gap-3 mb-4">
                            <div className="text-4xl">👤</div>
                            <div className="flex-1">
                              <h3 className="text-lg font-bold">{request.businessName}</h3>
                              <p className="text-sm text-slate-600">{request.userEmail}</p>
                              <p className="text-xs text-slate-500 mt-1">
                                Solicitud: {formatDate(request.createdAt)}
                              </p>
                            </div>
                          </div>

                          {/* Status Badge */}
                          <div className="mb-4">
                            <Badge 
                              className={`${STATUS_COLORS[request.status].bg} ${STATUS_COLORS[request.status].text}`}
                            >
                              {STATUS_LABELS[request.status]}
                            </Badge>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {request.location && (
                              <div>
                                <span className="text-sm text-slate-600">📍 Ubicación</span>
                                <p className="font-medium">{request.location}</p>
                              </div>
                            )}
                            {request.hourlyRate && (
                              <div>
                                <span className="text-sm text-slate-600">💵 Tarifa por Hora</span>
                                <p className="font-medium">${request.hourlyRate}/hora</p>
                              </div>
                            )}
                            {request.experience && (
                              <div>
                                <span className="text-sm text-slate-600">💼 Experiencia</span>
                                <p className="font-medium">{request.experience}</p>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          <div className="mb-4">
                            <span className="text-sm font-semibold text-slate-900">Descripción</span>
                            <p className="text-slate-700 text-sm mt-1">{request.description}</p>
                          </div>

                          {/* Services */}
                          <div className="mb-4">
                            <span className="text-sm font-semibold text-slate-900">Servicios Ofrecidos</span>
                            <p className="text-slate-700 text-sm mt-1">{request.services}</p>
                          </div>

                          {/* Additional Info */}
                          {request.portfolio && (
                            <div className="mb-4">
                              <span className="text-sm font-semibold text-slate-900">Portafolio</span>
                              <p className="text-slate-600 text-sm mt-1 break-all">{request.portfolio}</p>
                            </div>
                          )}

                          {request.certifications && (
                            <div>
                              <span className="text-sm font-semibold text-slate-900">Certificaciones</span>
                              <p className="text-slate-700 text-sm mt-1">{request.certifications}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {request.status === 'pending' && (
                          <div className="flex flex-col gap-2 md:min-w-[180px]">
                            <Button
                              onClick={() => handleReview(request.requestId, 'rejected')}
                              disabled={processingId === request.requestId}
                              variant="outline"
                              className="w-full"
                            >
                              {processingId === request.requestId ? '⏳' : '❌'} Rechazar
                            </Button>
                            <Button
                              onClick={() => handleReview(request.requestId, 'approved')}
                              disabled={processingId === request.requestId}
                              className="w-full"
                            >
                              {processingId === request.requestId ? '⏳' : '✅'} Aprobar
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
