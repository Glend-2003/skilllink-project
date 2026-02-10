import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, DollarSign, Star, Eye, MessageCircle, Calendar, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';

interface ServiceRequest {
  requestId: number;
  requestTitle: string;
  requestDescription: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost: number;
  finalCost: number | null;
  preferredDate: string;
  service?: {
    serviceName: string;
  };
}

interface ProviderStats {
  totalRequests: number;
  completedRequests: number;
  totalEarnings: number;
  averageRating: number;
  viewsThisMonth: number;
}

export default function Provider() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [stats, setStats] = useState<ProviderStats>({
    totalRequests: 0,
    completedRequests: 0,
    totalEarnings: 0,
    averageRating: 0,
    viewsThisMonth: 0,
  });
  const [recentRequests, setRecentRequests] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    loadProviderData();
  }, []);

  const loadProviderData = async () => {
    if (!user) return;

    try {
      const profileResponse = await fetch(`${API_BASE_URL}/api/v1/providers/user/${user.userId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (profileResponse.ok) {
        const provider = await profileResponse.json();
        const actualProviderId = provider.id || provider.providerId;
        setProviderId(actualProviderId);
        await loadStats(actualProviderId);
        await loadRequests(actualProviderId);
      } else {
        console.error('Could not load provider profile');
      }
    } catch (error) {
      console.error('Error loading provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async (provId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/requests/provider/${provId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const requests: ServiceRequest[] = await response.json();

        const completedRequests = requests.filter((r) => r.status === 'completed');
        const totalEarnings = completedRequests.reduce((sum, r) => sum + (r.finalCost || 0), 0);

        setStats({
          totalRequests: requests.length,
          completedRequests: completedRequests.length,
          totalEarnings: totalEarnings,
          averageRating: 4.8,
          viewsThisMonth: Math.floor(Math.random() * 100 + 50),
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRequests = async (provId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/requests/provider/${provId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data: ServiceRequest[] = await response.json();
        setRecentRequests(data.slice(0, 3));
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const statsConfig = [
    {
      title: 'Solicitudes totales',
      value: stats.totalRequests,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Servicios completados',
      value: stats.completedRequests,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Ganancias totales',
      value: `₡${stats.totalEarnings.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Calificación promedio',
      value: stats.averageRating.toFixed(1),
      icon: Star,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      title: 'Vistas este mes',
      value: stats.viewsThisMonth,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Tasa de éxito',
      value: stats.totalRequests > 0 ? `${Math.round((stats.completedRequests / stats.totalRequests) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard del Proveedor</h1>
          <p className="text-slate-600">Gestiona tu negocio y revisa tus estadísticas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statsConfig.map((stat) => {
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Solicitudes recientes</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/provider/provider-requests')}
                >
                  Ver todas
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentRequests.length > 0 ? (
                recentRequests.map((request) => (
                  <div key={request.requestId} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{request.requestTitle}</h4>
                      <p className="text-sm text-slate-600">{request.service?.serviceName || 'Servicio'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₡{request.estimatedCost.toLocaleString()}</p>
                      <Badge 
                        variant={request.status === 'completed' ? 'default' : 'secondary'}
                        className="text-xs mt-1"
                      >
                        {request.status === 'pending' && 'Pendiente'}
                        {request.status === 'accepted' && 'Aceptada'}
                        {request.status === 'in_progress' && 'En Progreso'}
                        {request.status === 'completed' && 'Completada'}
                        {request.status === 'cancelled' && 'Cancelada'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-600 text-center py-8">No hay solicitudes recientes</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col gap-2 justify-start"
                  onClick={() => navigate('/provider/services')}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Mis Servicios</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col gap-2 justify-start"
                  onClick={() => navigate('/provider/provider-requests')}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Solicitudes</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
