import { Users, DollarSign, TrendingUp, AlertCircle, UserCheck, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useEffect, useState } from 'react';
import { UserService } from '../../services/userService';
import { MarketplaceService } from '../../services/marketplaceService';
import { PaymentService } from '../../services/paymentService';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onViewChange: (view: string) => void;
}

interface DashboardStats {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  bgColor: string;
  change: string;
}

interface Activity {
  type: string;
  message: string;
  time: string;
}

interface Provider {
  id: number;
  name: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  avatar?: string;
}

export function AdminDashboard({ onViewChange }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de usuarios
      const users = await UserService.getAllUsers();
      const clients = users.filter(u => u.role === 'client');
      const providers = users.filter(u => u.role === 'provider');
      const verifiedProviders = providers.filter(p => p.isActive);
      
      // Cargar servicios y pagos
      const services = await MarketplaceService.getAllServices();
      const completedServices = services.filter((s: any) => s.status === 'completed');
      
      // Calcular ingresos (esto sería idealmente desde el backend)
      const totalRevenue = completedServices.reduce((sum: number, service: any) => {
        return sum + (service.price || 0);
      }, 0);

      // Actualizar estadísticas
      const newStats: DashboardStats[] = [
        {
          title: 'Total Usuarios',
          value: users.length,
          icon: Users,
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          change: '+12%',
        },
        {
          title: 'Proveedores Activos',
          value: providers.length,
          icon: UserCheck,
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          change: '+8%',
        },
        {
          title: 'Servicios Completados',
          value: completedServices.length,
          icon: TrendingUp,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          change: '+23%',
        },
        {
          title: 'Ingresos Totales',
          value: `$${totalRevenue.toLocaleString()}`,
          icon: DollarSign,
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-100',
          change: '+15%',
        },
      ];

      // Actividad reciente (ejemplo - en producción vendría del backend)
      const activity: Activity[] = [
        { type: 'new_user', message: 'Nuevo usuario registrado: María González', time: 'Hace 5 min' },
        { type: 'new_provider', message: 'Nuevo proveedor: Carlos Electricista', time: 'Hace 15 min' },
        { type: 'completed', message: 'Servicio completado: Reparación de plomería', time: 'Hace 30 min' },
        { type: 'review', message: 'Nueva reseña de 5 estrellas para Juan Pérez', time: 'Hace 1 hora' },
        { type: 'alert', message: 'Reporte de contenido en revisión', time: 'Hace 2 horas' },
      ];

      // Proveedores top (ejemplo)
      const topProviders: Provider[] = providers.slice(0, 5).map((p, index) => ({
        id: p.id,
        name: p.name,
        rating: 4.8 - (index * 0.1), // Datos de ejemplo
        reviewCount: 42 - (index * 5),
        verified: p.isActive || false,
      }));

      setStats(newStats);
      setRecentActivity(activity);
      setProviders(topProviders);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Error al cargar datos del dashboard');
    } finally {
      setLoading(false);
    }
  };

  const verifiedProviders = providers.filter(p => p.verified).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel Administrativo</h1>
          <p className="text-slate-600">Gestiona la plataforma SkillLink</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={loadDashboardData}
          >
            Actualizar datos
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <span className="text-sm font-medium text-green-600">{stat.change}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'alert' ? 'bg-red-600' : 'bg-green-600'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
                onClick={() => onViewChange('admin-users')}
              >
                <Users className="w-5 h-5" />
                Gestionar usuarios
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
              >
                <UserCheck className="w-5 h-5" />
                Verificar proveedores
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
              >
                <AlertCircle className="w-5 h-5" />
                Revisar reportes
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start gap-3"
              >
                <TrendingUp className="w-5 h-5" />
                Ver estadísticas
              </Button>
            </CardContent>
          </Card>

          {/* Providers Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado de Proveedores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Verificados</span>
                </div>
                <span className="font-bold">{verifiedProviders}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="font-medium">Pendientes verificación</span>
                </div>
                <span className="font-bold">{providers.length - verifiedProviders}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50">
                <div className="flex items-center gap-3">
                  <UserX className="w-5 h-5 text-red-600" />
                  <span className="font-medium">Suspendidos</span>
                </div>
                <span className="font-bold">0</span>
              </div>
            </CardContent>
          </Card>

          {/* Top Providers */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Top Proveedores</CardTitle>
                <Button variant="ghost" size="sm">Ver todos</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {providers.map((provider, index) => (
                <div key={provider.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{provider.name}</p>
                    <p className="text-sm text-slate-600">
                      {provider.rating} ★ • {provider.reviewCount} reseñas
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}