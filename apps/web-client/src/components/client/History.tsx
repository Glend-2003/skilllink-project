import { Clock, CheckCircle, XCircle, AlertCircle, Star, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { mockServiceRequests, categoryNames } from '../../data/mockData';
import { ServiceRequest } from '../../types';
import { toast } from 'sonner';

interface HistoryProps {
  onViewChange: (view: string) => void;
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    icon: Clock,
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  accepted: {
    label: 'Aceptada',
    icon: CheckCircle,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  completed: {
    label: 'Completada',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  cancelled: {
    label: 'Cancelada',
    icon: XCircle,
    color: 'bg-red-100 text-red-700 border-red-200',
  },
};

export function History({ onViewChange }: HistoryProps) {
  const pendingRequests = mockServiceRequests.filter(r => r.status === 'pending' || r.status === 'accepted');
  const completedRequests = mockServiceRequests.filter(r => r.status === 'completed');
  const cancelledRequests = mockServiceRequests.filter(r => r.status === 'cancelled');

  const handleRateService = (requestId: string) => {
    toast.success('Calificación enviada');
  };

  const handleCancelRequest = (requestId: string) => {
    toast.success('Solicitud cancelada');
  };

  const RequestCard = ({ request }: { request: ServiceRequest }) => {
    const status = statusConfig[request.status];
    const StatusIcon = status.icon;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={request.providerAvatar} alt={request.providerName} />
              <AvatarFallback>{request.providerName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-semibold text-lg">{request.serviceName}</h3>
                  <p className="text-slate-600">{request.providerName}</p>
                  <p className="text-sm text-slate-500">{categoryNames[request.category]}</p>
                </div>
                <Badge className={status.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(request.date).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}</span>
                </div>
                <div className="font-semibold text-slate-900">
                  ${request.price}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {request.status === 'pending' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleCancelRequest(request.id)}>
                      Cancelar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewChange('chat')}
                      className="gap-1"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contactar
                    </Button>
                  </>
                )}

                {request.status === 'accepted' && (
                  <>
                    <Button size="sm" variant="outline" className="gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Ver detalles
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewChange('chat')}
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
                      onClick={() => handleRateService(request.id)}
                      className="gap-1"
                    >
                      <Star className="w-4 h-4" />
                      Calificar
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

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Historial de solicitudes</h1>
          <p className="text-slate-600">Gestiona todas tus solicitudes de servicio</p>
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active" className="gap-2">
              Activas
              {pendingRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {pendingRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              Completadas
              {completedRequests.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {completedRequests.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Canceladas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {pendingRequests.length > 0 ? (
              pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">No hay solicitudes activas</h3>
                <p className="text-slate-600 mb-4">Explora proveedores y solicita servicios</p>
                <Button onClick={() => onViewChange('search')}>
                  Buscar proveedores
                </Button>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedRequests.length > 0 ? (
              completedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">No hay solicitudes completadas</h3>
                <p className="text-slate-600">Aquí aparecerán tus servicios finalizados</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledRequests.length > 0 ? (
              cancelledRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))
            ) : (
              <Card className="p-12 text-center">
                <XCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="font-bold text-lg mb-2">No hay solicitudes canceladas</h3>
                <p className="text-slate-600">Las solicitudes canceladas aparecerán aquí</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
