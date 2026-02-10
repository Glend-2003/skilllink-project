import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { RefreshCw } from 'lucide-react';

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
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      // Try localStorage first (cached from service requests)
      const cachedProv = localStorage.getItem(`provider_${user.userId}`);
      if (cachedProv) {
        try {
          const cached = JSON.parse(cachedProv);
          if (cached.providerId) {
            setProviderId(cached.providerId);
            await loadRequests(cached.providerId);
            return;
          }
        } catch (e) {
          console.warn('Could not parse cached provider:', e);
        }
      }

      // Try API endpoint for provider profile
      const profileResponse = await fetch(`${API_BASE_URL}/api/v1/provider/profile`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (profileResponse.ok) {
        const provider = await profileResponse.json();
        const provId = provider.providerId || provider.id;
        if (provId) {
          setProviderId(provId);
          // Cache for future use
          localStorage.setItem(`provider_${user.userId}`, JSON.stringify({ 
            providerId: provId,
            businessName: provider.businessName
          }));
          await loadRequests(provId);
          return;
        }
      }

      // Try alternative endpoint
      const altResponse = await fetch(`${API_BASE_URL}/api/v1/providers/user/${user.userId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (altResponse.ok) {
        const provider = await altResponse.json();
        const provId = provider.providerId || provider.id;
        if (provId) {
          setProviderId(provId);
          localStorage.setItem(`provider_${user.userId}`, JSON.stringify({ 
            providerId: provId,
            businessName: provider.businessName
          }));
          await loadRequests(provId);
          return;
        }
      }

      console.error('Could not load provider profile from any endpoint');
      toast.error('No se encontró tu perfil de proveedor. Verifica que estés registrado como proveedor.');
      setLoading(false);
    } catch (error) {
      console.error('Error loading provider profile:', error);
      toast.error('Error al cargar el perfil de proveedor');
      setLoading(false);
    }
  };

  const loadRequests = async (provId: number) => {
    try {
      setError(null);
      // Try primary endpoint
      let response = await fetch(`${API_BASE_URL}/api/v1/requests/provider/${provId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      // If primary fails, try alternative endpoints
      if (!response.ok) {
        console.warn(`Primary endpoint failed with status ${response.status}, trying alternatives...`);
        
        // Try alternative 1: /api/v1/provider-requests
        response = await fetch(`${API_BASE_URL}/api/v1/provider-requests`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        });

        // Try alternative 2: /api/v1/providers/requests
        if (!response.ok) {
          response = await fetch(`${API_BASE_URL}/api/v1/providers/requests`, {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
            },
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        setRequests(Array.isArray(data) ? data : []);
        setError(null);
      } else {
        console.error('All endpoints failed with status:', response.status);
        setRequests([]);
        setError('No se pudieron cargar las solicitudes en este momento');
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setRequests([]);
      setError('No se pudieron cargar las solicitudes en este momento');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
        toast.success('Solicitud actualizada correctamente');
        if (providerId) {
          loadRequests(providerId);
        }
        return true;
      } else {
        toast.error('Error al actualizar la solicitud');
        return false;
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Error al actualizar la solicitud');
      return false;
    }
  };

  const handleAcceptRequest = () => {
    if (!selectedRequest) return;

    const cost = parseFloat(finalCost);
    if (isNaN(cost) || cost <= 0) {
      toast.error('Ingresa un costo válido');
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
            <h1 className="text-3xl font-bold mb-2">Mis Solicitudes</h1>
            <p className="text-slate-600">Gestiona las solicitudes de tus clientes</p>
          </div>

          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="text-3xl">ℹ️</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">Solicitudes no disponibles temporalmente</h3>
                  <p className="text-blue-800 mb-4">
                    No podemos cargar tus solicitudes en este momento. Por favor, intenta más tarde.
                  </p>
                  <Button 
                    onClick={() => {
                      setError(null);
                      setRefreshing(true);
                      if (providerId) {
                        loadRequests(providerId).finally(() => setRefreshing(false));
                      } else {
                        loadProviderProfile();
                      }
                    }}
                    disabled={refreshing}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Reintentando...' : 'Reintentar'}
                  </Button>
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
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Mis Solicitudes</h1>
              <p className="text-slate-600">Gestiona las solicitudes de tus clientes</p>
            </div>
            <Button
              onClick={() => {
                setRefreshing(true);
                if (providerId) {
                  loadRequests(providerId).finally(() => setRefreshing(false));
                } else {
                  loadProviderProfile();
                }
              }}
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
          <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-6">
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
                    {selectedStatus
                      ? `No tienes solicitudes con estado "${STATUS_LABELS[selectedStatus]}"`
                      : 'Aún no has recibido solicitudes de clientes'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.requestId}>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{request.requestTitle}</h3>
                          <p className="text-sm text-slate-600 mb-2">{request.service?.serviceName || 'Servicio'}</p>
                          {request.service?.category && (
                            <p className="text-sm text-slate-600">{request.service.category.categoryName}</p>
                          )}
                        </div>

                        <div>
                          <p className="text-xs text-slate-600 mb-1">Fecha preferida</p>
                          <p className="font-semibold">{new Date(request.preferredDate).toLocaleDateString('es-ES')}</p>
                          <p className="text-sm text-slate-600">Hora: {request.preferredTime}</p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-600 mb-1">Dirección</p>
                          <p className="text-sm">{request.serviceAddress}</p>
                          {request.contactPhone && (
                            <p className="text-sm text-slate-600 mt-2">📱 {request.contactPhone}</p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-600 mb-1">
                            {request.finalCost ? 'Costo Final' : 'Costo Estimado'}
                          </p>
                          <p className="text-2xl font-bold text-blue-600">
                            ₡{(request.finalCost || request.estimatedCost).toLocaleString()}
                          </p>
                          <Badge className="mt-2">
                            {request.status === 'pending' && 'Pendiente'}
                            {request.status === 'accepted' && 'Aceptada'}
                            {request.status === 'in_progress' && 'En Progreso'}
                            {request.status === 'completed' && 'Completada'}
                            {request.status === 'cancelled' && 'Cancelada'}
                          </Badge>
                        </div>
                      </div>

                      <div className="border-t pt-4 mb-4">
                        <p className="text-sm text-slate-700">{request.requestDescription}</p>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => openAcceptModal(request)}
                            >
                              ✓ Aceptar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (window.confirm('¿Deseas cancelar esta solicitud?')) {
                                  updateRequestStatus(request.requestId, 'cancelled');
                                }
                              }}
                            >
                              ✕ Rechazar
                            </Button>
                          </>
                        )}

                        {request.status === 'accepted' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              if (window.confirm('¿Iniciar trabajo en esta solicitud?')) {
                                updateRequestStatus(request.requestId, 'in_progress');
                              }
                            }}
                          >
                            ▶ Iniciar Trabajo
                          </Button>
                        )}

                        {request.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              if (window.confirm('¿Marcar esta solicitud como completada?')) {
                                updateRequestStatus(request.requestId, 'completed');
                              }
                            }}
                          >
                            ✓ Completar
                          </Button>
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

      {showAcceptModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Aceptar Solicitud</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600 mb-2">
                  Solicitud: <span className="font-bold text-slate-900">{selectedRequest.requestTitle}</span>
                </p>
                <p className="text-xs text-slate-500">
                  Costo estimado por el cliente: ₡{selectedRequest.estimatedCost.toLocaleString()}
                </p>
              </div>

              <div>
                <Label htmlFor="finalCost">Costo Final del Servicio (₡)</Label>
                <Input
                  id="finalCost"
                  type="number"
                  value={finalCost}
                  onChange={(e) => setFinalCost(e.target.value)}
                  placeholder="Ingresa el costo"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline"
                  onClick={() => setShowAcceptModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAcceptRequest}
                >
                  Aceptar Solicitud
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
