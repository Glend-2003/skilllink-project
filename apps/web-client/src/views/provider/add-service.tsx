import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { toast } from 'sonner';

interface ServiceCategory {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  isActive: boolean;
}

export default function AddService() {
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
    basePrice: '0',
    priceType: 'fixed' as 'fixed' | 'hourly' | 'negotiable',
    estimatedDurationMinutes: '',
    isActive: true,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([loadProviderProfile(), loadCategories()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    // eslint-disable-next-line
  }, []);

  const loadProviderProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/provider/profile`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      if (response.ok) {
        const profile = await response.json();
        setProviderId(profile.providerId);
      } else {
        console.error('Failed to load provider profile');
        toast.error('No se pudo cargar tu perfil de proveedor');
      }
    } catch (error) {
      console.error('Error loading provider profile:', error);
      toast.error('Error al cargar el perfil');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/categories`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to load categories:', response.status);
        toast.error('No se pudieron cargar las categorías');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Error de conexión al cargar categorías');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'categoryId') {
      // Convertir a número para categoryId
      setFormData({ ...formData, [name]: parseInt(value) || 0 });
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

    if (formData.categoryId === 0) {
      toast.error('Selecciona una categoría');
      return;
    }

    if (!providerId) {
      toast.error('No se pudo obtener tu ID de proveedor. Recarga la página.');
      return;
    }

    const basePrice = parseFloat(formData.basePrice);
    if (isNaN(basePrice) || basePrice < 0) {
      toast.error('El precio base debe ser un número válido mayor o igual a 0');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        providerId: providerId,
        categoryId: formData.categoryId,
        serviceTitle: formData.serviceTitle,
        serviceDescription: formData.serviceDescription,
        basePrice: basePrice,
        priceType: formData.priceType,
        estimatedDurationMinutes: formData.estimatedDurationMinutes
          ? parseInt(formData.estimatedDurationMinutes)
          : null,
        isActive: formData.isActive,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Servicio creado correctamente. Estará pendiente de aprobación por un administrador.');
        navigate('/provider/services');
      } else {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          toast.error(errorData.message || 'No se pudo crear el servicio');
        } catch {
          toast.error(`Error ${response.status}: ${errorText || 'No se pudo crear el servicio'}`);
        }
      }
    } catch (error) {
      console.error('Error creating service:', error);
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
          <p className="text-slate-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Agregar Servicio</h1>
          <p className="text-slate-600">Crea un nuevo servicio para tu negocio</p>
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
                {categories.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">No hay categorías disponibles</p>
                )}
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
              disabled={saving || categories.length === 0}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Creando...' : 'Crear Servicio'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );}