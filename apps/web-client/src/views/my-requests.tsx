import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, AlertCircle, Star, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/Config';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import './my-requests.css';

interface ServiceRequest {
  requestId: number;
  requestTitle: string;
  requestDescription: string;
  serviceAddress: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost: number | null;
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

const STATUS_CONFIG: Record<string, { 
  color: string; 
  label: string; 
  icon: React.ComponentType<any>;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  pending: { 
    color: 'pending', 
    label: 'Pendiente', 
    icon: Clock,
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200'
  },
  accepted: { 
    color: 'accepted', 
    label: 'Aceptada', 
    icon: CheckCircle,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  in_progress: { 
    color: 'in-progress', 
    label: 'En Progreso', 
    icon: Clock,
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200'
  },
  completed: { 
    color: 'completed', 
    label: 'Completada', 
    icon: CheckCircle,
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    borderColor: 'border-green-200'
  },
  cancelled: { 
    color: 'cancelled', 
    label: 'Cancelada', 
    icon: XCircle,
    bgColor: 'bg-red-100',
    textColor: 'text-red-700',
    borderColor: 'border-red-200'
  },
};

export default function MyRequests() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line
  }, []);

  const loadRequests = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    
    setError(null);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/requests/mine`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Failed to load requests:', res.status, res.statusText, errorText);
        
        if (res.status === 404) {
          setError('El endpoint de solicitudes no está disponible. Contacta al administrador.');
        } else if (res.status === 401 || res.status === 403) {
          setError('No tienes permisos para ver las solicitudes. Inicia sesión nuevamente.');
        } else {
          setError(`Error al cargar solicitudes: ${res.status} ${res.statusText}`);
        }
        
        setRequests([]);
        return;
      }
      
      const data = await res.json();
      console.log('Requests loaded:', data);
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading requests:', e);
      setError(`Error de conexión: ${e instanceof Error ? e.message : 'No se pudo conectar con el servidor'}`);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRateService = (requestId: number) => {
    navigate(`/review/${requestId}`);
  };

  const handleCancelRequest = (requestId: number) => {
    toast.success('Solicitud cancelada');
  };

  const filteredRequests = selectedStatus
    ? requests.filter((r) => r.status === selectedStatus)
    : requests;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCost = (cost: number | null | undefined) => {
    if (cost === null || cost === undefined || isNaN(cost)) {
      return 'Por definir';
    }
    return `₡${Number(cost).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // RequestCard Component
  const RequestCard = ({ request }: { request: ServiceRequest }) => {
    const status = STATUS_CONFIG[request.status];
    const StatusIcon = status.icon;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Avatar className="w-16 h-16">
              {request.provider?.user?.profileImageUrl ? (
                <AvatarImage src={request.provider.user.profileImageUrl} alt={request.provider.businessName} />
              ) : (
                <AvatarFallback>{request.provider.businessName.charAt(0)}</AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{request.requestTitle}</h3>
                  <p className="text-slate-600">{request.provider.businessName}</p>
                  <p className="text-sm text-slate-500">{request.service.category.categoryName}</p>
                </div>
                <Badge className={`${status.bgColor} ${status.textColor} ${status.borderColor} border`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(request.preferredDate)} a las {request.preferredTime}</span>
                </div>
                <div className="font-semibold text-slate-900">
                  {formatCost(request.finalCost || request.estimatedCost)}
                </div>
              </div>

              <p className="text-sm text-slate-700 mb-4">{request.requestDescription}</p>

              <div className="flex flex-wrap gap-2">
                {request.status === 'pending' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleCancelRequest(request.requestId)}>
                      Cancelar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate('/chat')}
                      className="gap-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contactar
                    </Button>
                  </>
                )}

                {(request.status === 'accepted' || request.status === 'in_progress') && (
                  <>
                    <Button size="sm" variant="outline" className="gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Ver detalles
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate('/chat')}
                      className="gap-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chatear
                    </Button>
                  </>
                )}

                {request.status === 'completed' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => handleRateService(request.requestId)}
                      className="gap-1"
                    >
                      <Star className="w-4 h-4" />
                      {request.review ? 'Ver Reseña' : 'Calificar'}
                    </Button>
                    <Button size="sm" variant="outline">
                      Solicitar de nuevo
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
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

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={() => navigate('/')} className="text-slate-600 hover:text-slate-900 text-sm mb-2">
              ← Inicio
            </button>
            <h1 className="text-3xl font-bold mb-2">Historial de solicitudes</h1>
            <p className="text-slate-600">Gestiona todas tus solicitudes de servicio</p>
          </div>
          <Button 
            onClick={() => loadRequests(true)} 
            variant="outline"
            disabled={refreshing}
          >
            🔄 {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>

        <Tabs defaultValue="all" value={selectedStatus || 'all'} onValueChange={(val) => setSelectedStatus(val === 'all' ? null : val)} className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full md:w-auto">
            <TabsTrigger value="all">
              Todas
              {requests.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {requests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1">
              <Clock className="w-3 h-3" />
              Pendientes
              {requests.filter(r => r.status === 'pending').length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {requests.filter(r => r.status === 'pending').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="accepted" className="gap-1">
              <CheckCircle className="w-3 h-3" />
              Aceptadas
              {requests.filter(r => r.status === 'accepted').length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {requests.filter(r => r.status === 'accepted').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="gap-1">
              <Clock className="w-3 h-3" />
              En Progreso
              {requests.filter(r => r.status === 'in_progress').length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {requests.filter(r => r.status === 'in_progress').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-1">
              <CheckCircle className="w-3 h-3" />
              Completadas
              {requests.filter(r => r.status === 'completed').length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {requests.filter(r => r.status === 'completed').length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="gap-1">
              <XCircle className="w-3 h-3" />
              Canceladas
              {requests.filter(r => r.status === 'cancelled').length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {requests.filter(r => r.status === 'cancelled').length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {error ? (
              <Card className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">Error al cargar solicitudes</h3>
                <p className="text-slate-600 mb-4">{error}</p>
                <Button 
                  onClick={() => loadRequests(true)}
                  disabled={refreshing}
                >
                  {refreshing ? 'Reintentando...' : 'Reintentar'}
                </Button>
              </Card>
            ) : filteredRequests.length === 0 ? (
              <Card className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">No hay solicitudes</h3>
                <p className="text-slate-600 mb-4">
                  {selectedStatus 
                    ? `No tienes solicitudes con este estado`
                    : 'Aún no has realizado ninguna solicitud de servicio'
                  }
                </p>
                <Button onClick={() => navigate('/search')}>
                  Buscar proveedores
                </Button>
              </Card>
            ) : (
              filteredRequests.map((request) => (
                <RequestCard key={request.requestId} request={request} />
              ))
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
