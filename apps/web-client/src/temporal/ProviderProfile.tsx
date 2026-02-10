import { useState } from 'react';
import { Camera, Plus, Trash2, Save, MapPin, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { mockProviders, categoryNames } from '../../data/mockData';
import { toast } from 'sonner';

interface ProviderProfileProps {
  onViewChange: (view: string) => void;
}

export function ProviderProfile({ onViewChange }: ProviderProfileProps) {
  const provider = mockProviders[0]; // Using first provider as example
  const [isAvailable, setIsAvailable] = useState(provider.isAvailable);
  const [services, setServices] = useState(provider.services);

  const handleSaveProfile = () => {
    toast.success('Perfil actualizado exitosamente');
  };

  const handleAddService = () => {
    const newService = {
      id: `s${services.length + 1}`,
      name: 'Nuevo Servicio',
      description: 'Descripción del servicio',
      price: 0,
      duration: '1 hora',
      category: provider.category,
    };
    setServices([...services, newService]);
    toast.success('Servicio agregado');
  };

  const handleRemoveService = (serviceId: string) => {
    setServices(services.filter(s => s.id !== serviceId));
    toast.success('Servicio eliminado');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Mi Perfil Profesional</h1>
          <p className="text-slate-600">Administra tu información y servicios</p>
        </div>

        {/* Profile Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={provider.avatar} alt={provider.name} />
                  <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full"
                  variant="secondary"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Nombre completo</Label>
                    <Input defaultValue={provider.name} />
                  </div>
                  <div>
                    <Label>Categoría</Label>
                    <Select defaultValue={provider.category}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryNames).map(([key, name]) => (
                          <SelectItem key={key} value={key}>
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Descripción profesional</Label>
                  <Textarea 
                    defaultValue={provider.description}
                    rows={3}
                    placeholder="Describe tu experiencia y especialidades..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Años de experiencia</Label>
                    <Input defaultValue={provider.experience} />
                  </div>
                  <div>
                    <Label>Tiempo de respuesta</Label>
                    <Input defaultValue={provider.responseTime} />
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
                    {isAvailable ? 'Aceptando nuevos clientes' : 'No disponible actualmente'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={isAvailable}
                onCheckedChange={setIsAvailable}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Dirección</Label>
              <Input defaultValue={provider.location.address} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Ciudad</Label>
                <Input defaultValue={provider.location.city} />
              </div>
              <div>
                <Label>Radio de servicio (km)</Label>
                <Input type="number" defaultValue="10" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Servicios ofrecidos</CardTitle>
              <Button onClick={handleAddService} className="gap-2">
                <Plus className="w-4 h-4" />
                Agregar servicio
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service, index) => (
              <Card key={service.id} className="bg-slate-50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline">Servicio {index + 1}</Badge>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => handleRemoveService(service.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm">Nombre del servicio</Label>
                      <Input defaultValue={service.name} />
                    </div>
                    <div>
                      <Label className="text-sm">Descripción</Label>
                      <Textarea 
                        defaultValue={service.description}
                        rows={2}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">Precio ($)</Label>
                        <Input type="number" defaultValue={service.price} />
                      </div>
                      <div>
                        <Label className="text-sm">Duración</Label>
                        <Input defaultValue={service.duration} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Gallery */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Galería de trabajos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {provider.gallery.map((image, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img 
                    src={image} 
                    alt={`Trabajo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="icon" variant="secondary">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <button className="aspect-square rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-600 transition-colors flex items-center justify-center">
                <Plus className="w-8 h-8 text-slate-400" />
              </button>
            </div>
            <p className="text-sm text-slate-600">
              Sube fotos de tus trabajos realizados para mostrar tu experiencia
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onViewChange('provider-dashboard')}>
            Cancelar
          </Button>
          <Button onClick={handleSaveProfile} className="gap-2">
            <Save className="w-4 h-4" />
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
}
