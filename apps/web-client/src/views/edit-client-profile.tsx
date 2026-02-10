import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { AlertCircle, MapPin, User, Calendar, Loader2, ArrowLeft, Mail, Phone } from 'lucide-react';
import './edit-client-profile.css';

interface UserProfile {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  bio: string;
  address_line1: string;
  city: string;
  state_province: string;
  country: string;
  latitude: string;
  longitude: string;
}

export default function EditClientProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingProfile, setExistingProfile] = useState<any>(null);
  
  const [formData, setFormData] = useState<UserProfile>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    gender: '',
    bio: '',
    address_line1: '',
    city: '',
    state_province: '',
    country: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    loadExistingProfile();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            
            console.log('✅ Ubicación obtenida exitosamente:');
            console.log('   Latitud:', latitude);
            console.log('   Longitud:', longitude);
            console.log('   Precisión:', accuracy, 'metros');
            
            setFormData(prev => ({
              ...prev,
              latitude: latitude.toString(),
              longitude: longitude.toString(),
            }));
            
            setSuccess('Ubicación actualizada correctamente');
            setTimeout(() => setSuccess(''), 3000);
          },
          (error) => {
            console.error('❌ Error al obtener ubicación:', error.message);
            console.error('   Código:', error.code);
            
            let errorMsg = 'No se pudo obtener tu ubicación';
            
            if (error.code === 1) {
              errorMsg = 'Permiso de ubicación denegado. Activa la ubicación en tu navegador.';
            } else if (error.code === 2) {
              errorMsg = 'La ubicación no está disponible en este momento.';
            } else if (error.code === 3) {
              errorMsg = 'Tiempo de espera agotado para obtener ubicación.';
            }
            
            setError(errorMsg);
            setTimeout(() => setError(''), 5000);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        console.error('❌ Geolocalización no soportada por este navegador');
        setError('Tu navegador no soporta geolocalización');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error inesperado:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadExistingProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user-profile/me`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      
      if (response.status === 401) {
        setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        return;
      }

      if (response.status === 404) {
        console.log('No profile found, starting fresh');
        return;
      }

      if (response.ok) {
        const text = await response.text();
        
        if (!text || text.trim() === '') {
          console.log('Empty response, no profile data');
          return;
        }

        try {
          const profile = JSON.parse(text);
          if (profile) {
            setExistingProfile(profile);
            
            let formattedDate = profile.date_of_birth || '';
            if (formattedDate && formattedDate.includes('T')) {
              formattedDate = formattedDate.split('T')[0];
            }
            
            setFormData({
              first_name: profile.first_name || '',
              last_name: profile.last_name || '',
              email: profile.email || user?.email || '',
              phone_number: profile.phone_number || '',
              date_of_birth: formattedDate,
              gender: profile.gender || '',
              bio: profile.bio || '',
              address_line1: profile.address_line1 || '',
              city: profile.city || '',
              state_province: profile.state_province || '',
              country: profile.country || '',
              latitude: profile.latitude || '',
              longitude: profile.longitude || '',
            });
          }
        } catch (parseError) {
          console.error('Error parsing profile JSON:', parseError);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) {
      setError('El nombre y apellido son obligatorios para continuar.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/user-profile/me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });

      const responseText = await response.text();

      if (response.ok) {
        setSuccess('¡Tu perfil ha sido actualizado exitosamente!');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      } else {
        try {
          const errorData = JSON.parse(responseText);
          setError(errorData.message || 'No se pudo actualizar el perfil. Intenta nuevamente.');
        } catch {
          setError(`Ocurrió un error en el servidor (${response.status}). Por favor, intenta más tarde.`);
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setError('No se pudo conectar al servidor. Verifica tu conexión a internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-slate-200 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Completar Perfil</h1>
        </div>

        <p className="text-slate-600 text-center mb-8">
          Completa tu información personal para mejorar tu experiencia
        </p>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {success && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="pt-6 flex items-start gap-3">
              <div className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5">✓</div>
              <p className="text-green-800">{success}</p>
            </CardContent>
          </Card>
        )}

        {/* Personal Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="first_name">Nombre *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange('first_name', e.target.value)}
                  placeholder="Tu nombre"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="last_name">Apellido *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange('last_name', e.target.value)}
                  placeholder="Tu apellido"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="tu.email@ejemplo.com"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="phone_number" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Número de Teléfono
                </Label>
                <Input
                  id="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  placeholder="+506 1234-5678"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="date_of_birth">Fecha de Nacimiento</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="gender">Género</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="w-full mt-2 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona tu género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Cuéntanos sobre ti..."
                rows={4}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Ubicación
              {loadingLocation && <Loader2 className="w-4 h-4 animate-spin ml-2" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.latitude && formData.longitude && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    📍 Ubicación detectada:
                  </p>
                  <p className="text-sm text-blue-800 font-mono">
                    Latitud: {parseFloat(formData.latitude).toFixed(6)} <br />
                    Longitud: {parseFloat(formData.longitude).toFixed(6)}
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    ℹ️ Estas coordenadas representan tu ubicación actual aproximada
                  </p>
                </div>
                <Button
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                  variant="outline"
                  className="w-full text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  {loadingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Obteniendo ubicación...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Obtener ubicación actual
                    </>
                  )}
                </Button>
              </div>
            )}

            {!formData.latitude || !formData.longitude ? (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800 mb-4">
                  Aún no hemos obtenido tu ubicación. Haz clic en el botón para acceder a tus coordenadas GPS.
                </p>
                <Button
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loadingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Obteniendo ubicación...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      Obtener mi ubicación
                    </>
                  )}
                </Button>
              </div>
            ) : null}

            <div>
              <Label htmlFor="address_line1">Dirección</Label>
              <Input
                id="address_line1"
                value={formData.address_line1}
                onChange={(e) => handleInputChange('address_line1', e.target.value)}
                placeholder="Calle y número"
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Tu ciudad"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="state_province">Provincia/Estado</Label>
                <Input
                  id="state_province"
                  value={formData.state_province}
                  onChange={(e) => handleInputChange('state_province', e.target.value)}
                  placeholder="Tu provincia o estado"
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Tu país"
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="mt-8 flex gap-4">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Información'
            )}
          </Button>
          <Button
            onClick={() => navigate('/profile')}
            variant="outline"
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
