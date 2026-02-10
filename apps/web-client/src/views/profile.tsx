import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants/Config';
import ProfileImageUploader from '../components/ProfileImageUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { 
  Mail, 
  Phone, 
  Crown, 
  Star, 
  User, 
  Rocket, 
  Wrench, 
  Edit, 
  Inbox, 
  CheckCircle, 
  FolderOpen, 
  LogOut,
  ClipboardList
} from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const { activeRole, isProvider, isAdmin, reloadProviderStatus } = useRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setPhoneNumber(data.phoneNumber || '');
        await reloadProviderStatus();
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-lg">Cargando perfil...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="p-8 text-center max-w-md">
          <CardContent className="pt-6">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <p className="text-lg mb-6">No se pudo cargar el perfil</p>
            <Button onClick={logout} variant="outline">
              <LogOut className="w-4 h-4 mr-2" />
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Profile Header Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="flex-shrink-0">
                <ProfileImageUploader onChange={loadProfile} />
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold">
                    {profile.name || profile.email?.split('@')[0] || 'Usuario'}
                  </h1>
                  <Badge 
                    variant={isAdmin ? 'default' : isProvider ? 'secondary' : 'outline'}
                    className="w-fit mx-auto md:mx-0"
                  >
                    {isAdmin && (
                      <>
                        <Crown className="w-3 h-3 mr-1" />
                        Administrador
                      </>
                    )}
                    {isProvider && !isAdmin && (
                      <>
                        <Star className="w-3 h-3 mr-1" />
                        Proveedor
                      </>
                    )}
                    {!isProvider && !isAdmin && (
                      <>
                        <User className="w-3 h-3 mr-1" />
                        Cliente
                      </>
                    )}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-slate-600">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                  
                  {phoneNumber && (
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Phone className="w-4 h-4" />
                      <span>{phoneNumber}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* Become Provider Card */}
          {!isProvider && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-blue-600" />
                  ¿Quieres ofrecer tus servicios?
                </CardTitle>
                <CardDescription>
                  Únete a nuestra red de proveedores profesionales y comienza a recibir solicitudes 
                  de clientes que necesitan tus servicios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/profile/become-provider')}
                  className="w-full"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  Convertirme en Proveedor
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Client Profile Card */}
          {!isProvider && (
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Mi Perfil
                </CardTitle>
                <CardDescription>
                  Completa y actualiza tu información personal para una mejor experiencia en la búsqueda de servicios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate('/client/edit-profile')}
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Provider Options Card */}
          {isProvider && (
            <Card className="hover:shadow-lg transition-shadow md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-600" />
                  Panel de Proveedor
                </CardTitle>
                <CardDescription>
                  Administra tus servicios, revisa tus solicitudes y mantén tu perfil profesional actualizado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button 
                    onClick={() => navigate('/provider/services')}
                    variant="outline"
                    className="w-full"
                  >
                    <Wrench className="w-4 h-4 mr-2" />
                    Mis Servicios
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/provider/edit-profile')}
                    variant="outline"
                    className="w-full"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/my-requests')}
                    variant="outline"
                    className="w-full"
                  >
                    <Inbox className="w-4 h-4 mr-2" />
                    Mis Solicitudes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Admin Options Card */}
          {isAdmin && (
            <Card className="hover:shadow-lg transition-shadow md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-600" />
                  Panel de Administrador
                </CardTitle>
                <CardDescription>
                  Gestiona la plataforma, aprueba solicitudes de proveedores, servicios y administra las categorías del sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button 
                    onClick={() => navigate('/admin/provider-requests')}
                    variant="outline"
                    className="w-full"
                  >
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Solicitudes de Proveedor
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/admin/services-approval')}
                    variant="outline"
                    className="w-full"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprobar Servicios
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/admin/categories-management')}
                    variant="outline"
                    className="w-full"
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Gestionar Categorías
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Logout Section */}
        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <h3 className="font-semibold text-lg mb-1">Cerrar sesión</h3>
                <p className="text-sm text-slate-600">
                  Sal de tu cuenta de forma segura
                </p>
              </div>
              
              <Button 
                onClick={logout}
                variant="destructive"
                className="w-full md:w-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
