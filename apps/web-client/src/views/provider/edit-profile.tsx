import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Clock, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Switch } from '../../ui/switch';
import { toast } from 'sonner';

interface ProviderProfile {
  providerId: number;
  userId: number;
  businessName?: string;
  businessDescription?: string;
  latitude?: number;
  longitude?: number;
  yearsExperience?: number;
  serviceRadiusKm?: number;
  isVerified: boolean;
  verificationDate?: string;
  trustBadge: boolean;
  availableForWork: boolean;
}

interface UserProfile {
  userId: number;
  email: string;
  profileImageUrl?: string;
  phoneNumber?: string;
  createdAt?: string;
}

export default function EditProviderProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    latitude: '',
    longitude: '',
    yearsExperience: '',
    serviceRadiusKm: '',
    availableForWork: true,
  });

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadProviderProfile(),
        loadUserProfile()
      ]);
      setLoading(false);
    };
    loadData();
    // eslint-disable-next-line
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      if (response.ok) {
        const profile: UserProfile = await response.json();
        console.log('=== User Profile from Auth Endpoint ===');
        console.log('Full profile response:', profile);
        console.log('profileImageUrl:', profile.profileImageUrl);
        console.log('All keys in profile:', Object.keys(profile));
        setUserProfile(profile);
      } else {
        console.log('Could not load user profile, status:', response.status);
        const text = await response.text();
        console.log('Response body:', text);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadProviderProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/provider/profile`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      if (response.ok) {
        const profile: ProviderProfile = await response.json();
        setFormData({
          businessName: profile.businessName || '',
          businessDescription: profile.businessDescription || '',
          latitude: profile.latitude?.toString() || '',
          longitude: profile.longitude?.toString() || '',
          yearsExperience: profile.yearsExperience?.toString() || '',
          serviceRadiusKm: profile.serviceRadiusKm?.toString() || '',
          availableForWork: profile.availableForWork,
        });
      } else if (response.status === 404) {
        // El proveedor aún no existe, dejar formulario vacío
        console.log('Provider profile not found, will create new one');
      } else {
        alert('No se pudo cargar el perfil de proveedor');
      }
    } catch (error) {
      console.error('Error loading provider profile:', error);
      alert('Error de conexión');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName.trim()) {
      toast.error('El nombre del negocio es requerido');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/provider/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          businessDescription: formData.businessDescription,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
          serviceRadiusKm: formData.serviceRadiusKm ? parseInt(formData.serviceRadiusKm) : null,
          availableForWork: formData.availableForWork,
        }),
      });

      if (response.ok) {
        toast.success('Perfil actualizado correctamente');
        navigate('/profile');
      } else {
        const data = await response.json();
        toast.error(data.message || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating provider profile:', error);
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Mi Perfil Profesional</h1>
          <p className="text-slate-600">Administra tu información y servicios</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Información personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="relative">
                  <div className="text-xs text-slate-500 mb-2">
                    Foto: {userProfile?.profileImageUrl ? '✓ Cargada' : '✗ No disponible'}
                  </div>
                  <Avatar className="w-24 h-24">
                    <AvatarImage 
                      src={userProfile?.profileImageUrl} 
                      alt="Avatar" 
                      onError={(e) => {
                        console.log('Avatar image failed to load, src was:', (e.target as any).src);
                      }}
                      onLoad={(e) => {
                        console.log('Avatar image loaded successfully from:', (e.target as any).src);
                      }}
                    />
                    <AvatarFallback>{formData.businessName.charAt(0) || 'P'}</AvatarFallback>
                  </Avatar>
                  <Button 
                    size="icon" 
                    className="absolute bottom-0 right-0 rounded-full"
                    variant="secondary"
                    type="button"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <div>
                    <Label htmlFor="businessName">Nombre del Negocio</Label>
                    <Input
                      id="businessName"
                      name="businessName"
                      type="text"
                      placeholder="Ej: Plomería García"
                      value={formData.businessName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessDescription">Descripción profesional</Label>
                    <Textarea 
                      id="businessDescription"
                      name="businessDescription"
                      placeholder="Describe tu experiencia y especialidades..."
                      value={formData.businessDescription}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="yearsExperience">Años de experiencia</Label>
                      <Input 
                        id="yearsExperience"
                        name="yearsExperience"
                        type="number"
                        min="0"
                        max="80"
                        value={formData.yearsExperience}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="serviceRadiusKm">Radio de servicio (km)</Label>
                      <Input 
                        id="serviceRadiusKm"
                        name="serviceRadiusKm"
                        type="number"
                        min="1"
                        max="500"
                        value={formData.serviceRadiusKm}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <Label className="text-sm font-medium">Estado de disponibilidad</Label>
                    <p className="text-sm text-slate-600">
                      {formData.availableForWork ? 'Aceptando nuevos clientes' : 'No disponible actualmente'}
                    </p>
                  </div>
                </div>
                <Switch 
                  checked={formData.availableForWork}
                  onCheckedChange={(checked) => setFormData({ ...formData, availableForWork: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitud</Label>
                  <Input
                    id="latitude"
                    name="latitude"
                    type="text"
                    placeholder="14.6349"
                    value={formData.latitude}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitud</Label>
                  <Input
                    id="longitude"
                    name="longitude"
                    type="text"
                    placeholder="-90.5069"
                    value={formData.longitude}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-sm text-blue-700">
                  💡 Obtén tus coordenadas desde Google Maps: Click derecho en el mapa → "¿Qué hay aquí?"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => navigate('/profile')}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              disabled={saving}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
