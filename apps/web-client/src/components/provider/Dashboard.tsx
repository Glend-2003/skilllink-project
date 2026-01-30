import { TrendingUp, DollarSign, Star, Eye, MessageCircle, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { marketplaceService } from '../../services/marketplaceService';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

export function Dashboard({ onViewChange }: DashboardProps) {
  const recentRequests = mockServiceRequests.slice(0, 3);
  const recentMessages = mockConversations.slice(0, 3);

  const stats = [
    /*{
      title: 'Solicitudes totales',
      value: providerStats.totalRequests,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },*/
    {
      title: 'Servicios completados',
      value: providerStats.completedRequests,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Ganancias totales',
      value: `$${providerStats.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Calificación promedio',
      value: providerStats.averageRating.toFixed(1),
      icon: Star,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    /*{
      title: 'Vistas este mes',
      value: providerStats.viewsThisMonth,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },*/
    {
      title: 'Tasa de éxito',
      value: `${Math.round((providerStats.completedRequests / providerStats.totalRequests) * 100)}%`,
      icon: TrendingUp,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard del Proveedor</h1>
          <p className="text-slate-600">Gestiona tu negocio y revisa tus estadísticas</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Requests */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Solicitudes recientes</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewChange('history')}
                >
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                  <Avatar>
                    <AvatarImage src={request.providerAvatar} alt={request.providerName} />
                    <AvatarFallback>{request.providerName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{request.serviceName}</h4>
                    <p className="text-sm text-slate-600">{request.providerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${request.price}</p>
                    <Badge 
                      variant={request.status === 'completed' ? 'default' : 'secondary'}
                      className="text-xs mt-1"
                    >
                      {request.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mensajes recientes</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => onViewChange('chat')}
                >
                  Ver todos
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentMessages.map((conversation) => (
                <div 
                  key={conversation.id} 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => onViewChange('chat')}
                >
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={conversation.providerAvatar} alt={conversation.providerName} />
                      <AvatarFallback>{conversation.providerName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {conversation.unreadCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 w-5 h-5 rounded-full p-0 flex items-center justify-center bg-red-600 text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{conversation.providerName}</h4>
                    <p className="text-sm text-slate-600 truncate">{conversation.lastMessage}</p>
                  </div>
                  <MessageCircle className="w-5 h-5 text-slate-400" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col gap-2"
                onClick={() => onViewChange('provider-profile')}
              >
                <Calendar className="w-6 h-6" />
                <span>Editar servicios</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col gap-2"
                onClick={() => onViewChange('provider-plans')}
              >
                <TrendingUp className="w-6 h-6" />
                <span>Mejorar plan</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto p-4 flex-col gap-2"
                onClick={() => onViewChange('chat')}
              >
                <MessageCircle className="w-6 h-6" />
                <span>Ver mensajes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
