import React, { useState } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { ArrowLeft, Briefcase, FileText, Wrench, MapPin, AlertCircle, Rocket } from 'lucide-react';
import { toast } from 'sonner';

export default function BecomeProvider() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    services: '',
    location: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.businessName.trim()) {
      toast.error('Por favor ingresa el nombre de tu negocio o servicio');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Por favor describe tus servicios');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Por favor indica tu ubicación');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/provider-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          description: formData.description,
          services: formData.services || formData.description,
          location: formData.location,
        }),
      });

      if (response.ok) {
        toast.success('Tu solicitud ha sido enviada exitosamente');
        setTimeout(() => navigate('/profile'), 1500);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'No se pudo enviar la solicitud');
      }
    } catch (error) {
      console.error('Error submitting provider request:', error);
      toast.error('No se pudo enviar la solicitud. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/profile')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Rocket className="w-8 h-8 text-blue-600" />
            Convertirme en Proveedor
          </h1>
          <p className="text-slate-600">
            Únete a nuestra red de proveedores profesionales
          </p>
        </div>

        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <AlertCircle className="w-5 h-5" />
              ¿Por qué ser proveedor?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-900">
              Como proveedor podrás ofrecer tus servicios profesionales, recibir solicitudes de clientes y 
              gestionar tu propio negocio a través de nuestra plataforma.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información Requerida</CardTitle>
            <CardDescription>
              Completa el formulario para solicitar convertirte en proveedor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-600" />
                  Nombre del Negocio/Servicio *
                </Label>
                <Input
                  id="businessName"
                  name="businessName"
                  placeholder="Ej: Plomería García"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-600" />
                  Descripción de Servicios *
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe detalladamente los servicios que ofreces. Ej: Plomería residencial y comercial, reparación de tuberías, instalación de baños, etc."
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="services" className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-600" />
                  Servicios Específicos (Opcional)
                </Label>
                <Input
                  id="services"
                  name="services"
                  placeholder="Ej: Reparación de fugas, Instalación de tuberías, Mantenimiento"
                  value={formData.services}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-600" />
                  Ubicación *
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Ej: Ciudad de Guatemala, Zona 10"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="pt-6">
                  <p className="text-sm text-amber-900">
                    <strong>*</strong> Campos requeridos. Tu solicitud será revisada por nuestro equipo y te notificaremos cuando 
                    sea aprobada. Una vez aprobado, podrás completar tu perfil con más detalles.
                  </p>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
