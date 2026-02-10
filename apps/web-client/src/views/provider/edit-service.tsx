import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ServiceGalleryUpload from '../../components/ServiceGalleryUpload';
import ServiceGalleryView from '../../components/ServiceGalleryView';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { ArrowLeft, Save } from 'lucide-react';

interface ServiceCategory {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  isActive: boolean;
}

interface Service {
  serviceId: number;
  categoryId: number;
  serviceTitle: string;
  serviceDescription: string;
  basePrice?: number;
  priceType: string;
  estimatedDurationMinutes?: number;
  isActive: boolean;
}

export default function EditService() {
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get('id');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [providerId, setProviderId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    categoryId: 0,
    serviceTitle: '',
    serviceDescription: '',
    basePrice: '',
    priceType: 'fixed' as 'fixed' | 'hourly' | 'negotiable',
    estimatedDurationMinutes: '',
    isActive: true,
  });

  useEffect(() => {
    if (!serviceId) {
      toast.error('ID de servicio no proporcionado');
      navigate('/provider/services');
      return;
    }
    loadData();
    // eslint-disable-next-line
  }, [serviceId]);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadCategories(), loadProviderInfo(), loadService()]);
    } finally {
      setLoading(false);
    }
  };

  const loadProviderInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/provider/profile`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setProviderId(data.providerId);
      }
    } catch (error) {
      console.error('Error loading provider info:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadService = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/services/${serviceId}`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      if (response.ok) {
        const service: Service = await response.json();
        setFormData({
          categoryId: service.categoryId,
          serviceTitle: service.serviceTitle,
          serviceDescription: service.serviceDescription,
          basePrice: service.basePrice?.toString() || '',
          priceType: service.priceType as 'fixed' | 'hourly' | 'negotiable',
          estimatedDurationMinutes: service.estimatedDurationMinutes?.toString() || '',
          isActive: service.isActive,
        });
      } else {
        toast.error('No se pudo cargar el servicio');
        navigate('/provider/services');
      }
    } catch (error) {
      console.error('Error loading service:', error);
      toast.error('Error al cargar el servicio');
      navigate('/provider/services');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.serviceTitle.trim()) {
      toast.error('El título del servicio es requerido');
      return;
    }

    if (!formData.serviceDescription.trim()) {
      toast.error('La descripción es requerida');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        categoryId: formData.categoryId || null,
        serviceTitle: formData.serviceTitle,
        serviceDescription: formData.serviceDescription,
        basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
        priceType: formData.priceType,
        estimatedDurationMinutes: formData.estimatedDurationMinutes
          ? parseInt(formData.estimatedDurationMinutes)
          : null,
        isActive: formData.isActive,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Servicio actualizado correctamente');
        navigate('/provider/services');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'No se pudo actualizar el servicio');
      }
    } catch (error) {
      console.error('Error updating service:', error);
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
          <p className="text-slate-600">Cargando servicio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/provider/services')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold mb-1">Editar Servicio</h1>
            <p className="text-slate-600">Actualiza la información de tu servicio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categoryId">Categoría <span className="text-red-600">*</span></Label>
                <Select value={formData.categoryId.toString()} onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}>
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>
                        {cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="serviceTitle">Título del Servicio <span className="text-red-600">*</span></Label>
                <Input
                  id="serviceTitle"
                  name="serviceTitle"
                  placeholder="Ej: Reparación de plomería"
                  value={formData.serviceTitle}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="serviceDescription">Descripción <span className="text-red-600">*</span></Label>
                <Textarea
                  id="serviceDescription"
                  name="serviceDescription"
                  placeholder="Describe en detalle tu servicio, qué incluye, requisitos, etc."
                  value={formData.serviceDescription}
                  onChange={handleChange}
                  required
                  rows={5}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Precio y Duración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priceType">Tipo de Precio</Label>
                  <Select value={formData.priceType} onValueChange={(value) => setFormData({ ...formData, priceType: value as any })}>
                    <SelectTrigger id="priceType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Precio Fijo</SelectItem>
                      <SelectItem value="hourly">Por Hora</SelectItem>
                      <SelectItem value="negotiable">Negociable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="basePrice">Precio Base <span className="text-red-600">*</span></Label>
                  <Input
                    id="basePrice"
                    name="basePrice"
                    type="number"
                    placeholder="50.00"
                    min="0"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="estimatedDurationMinutes">Duración Estimada (minutos)</Label>
                <Input
                  id="estimatedDurationMinutes"
                  name="estimatedDurationMinutes"
                  type="number"
                  placeholder="60"
                  min="1"
                  value={formData.estimatedDurationMinutes}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estado del Servicio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 rounded"
                />
                <Label htmlFor="isActive" className="mb-0">Servicio activo (visible para clientes)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Galería */}
          {serviceId && providerId && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Galería del Servicio</CardTitle>
                </CardHeader>
                <CardContent>
                  <ServiceGalleryView serviceId={parseInt(serviceId)} editable={true} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Agregar Más Fotos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ServiceGalleryUpload
                    serviceId={parseInt(serviceId)}
                    providerId={providerId}
                    onUploadComplete={() => {
                      toast.success('Fotos agregadas correctamente');
                      loadService();
                    }}
                  />
                </CardContent>
              </Card>
            </>
          )}

          <div className="flex justify-end gap-3">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => navigate('/provider/services')}
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
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
