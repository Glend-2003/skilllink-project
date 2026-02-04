import React, { useEffect, useState } from 'react';
import { Users, DollarSign, TrendingUp, AlertCircle, UserCheck, UserX, ListTree } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { UserService, type User } from '../../services/userService';
import { MarketplaceService, type Provider } from '../../services/marketplaceService';


interface AdminDashboardProps {
  onViewChange: (view: string) => void;
}

export function AdminDashboard({ onViewChange }: AdminDashboardProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [activeProviders, setActiveProviders] = useState<Provider[]>([]);
  const [inactiveProviders, setInactiveProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        const [userData, allProviders, verifiedProviders, unverifiedProviders] = await Promise.all([
          UserService.getAllUsers(),
          MarketplaceService.getProviders(),
          MarketplaceService.getVerifiedProviders(),
          MarketplaceService.getUnverifiedProviders()
        ]);

        console.log("Estadísticas:", {
          totalUsuarios: userData.length,
          totalProveedores: allProviders.length,
          verificados: verifiedProviders.length,
          noVerificados: unverifiedProviders.length
        });

        setUsers(userData);
        setActiveProviders(verifiedProviders);  
        setInactiveProviders(unverifiedProviders);  
        
        const stats = [
          {
            title: 'Total Usuarios',
            value: userData.length,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
            change: '+12%',
          },
          {
            title: 'Proveedores Verificados',
            value: verifiedProviders.length,
            icon: UserCheck,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
            change: '+8%',
          },
          {
            title: 'Proveedores por Verificar',
            value: unverifiedProviders.length,
            icon: AlertCircle,
            color: 'text-amber-600',
            bgColor: 'bg-amber-100',
            change: '+5%',
          },
          {
            title: 'Total Proveedores',
            value: allProviders.length,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
            change: '+15%',
          },
        ];
        
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast.error("Error al sincronizar con la base de datos");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) return <div>Cargando usuarios reales...</div>;

  const stats = [
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
      value: activeProviders.length,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
    },
    {
      title: 'Proveedores Inactivos',
      value: inactiveProviders.length,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
    },
  ];

  const recentActivity = [
    { type: 'new_user', message: 'Nuevo usuario registrado: María González', time: 'Hace 5 min' },
    { type: 'new_provider', message: 'Nuevo proveedor: Carlos Electricista', time: 'Hace 15 min' },
    { type: 'completed', message: 'Servicio completado: Reparación de plomería', time: 'Hace 30 min' },
    { type: 'review', message: 'Nueva reseña de 5 estrellas para Juan Pérez', time: 'Hace 1 hora' },
    { type: 'alert', message: 'Reporte de contenido en revisión', time: 'Hace 2 horas' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel Administrativo</h1>
          <p className="text-slate-600">Gestiona la plataforma SkillLink</p>
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
                onClick={() => onViewChange('admin-categories')}
              >
                <ListTree className="w-5 h-5" />
                Gestionar categorías
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
                <span className="font-bold">{'verifiedProviders'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  <span className="font-medium">Pendientes verificación</span>
                </div>
                <span className="font-bold">{'totalProviders -' + ' verifiedProviders'}</span>
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
              {activeProviders.slice(0, 5).map((provider, index) => (
                <div key={provider.id} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{provider.firstName + ' ' + provider.lastName}</p>
                    <p className="text-sm text-slate-600">
                      {'provider.rating'} ★ • {'provider.reviewCount'} reseñas
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
