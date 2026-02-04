import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { CategoryService, type Category, type CreateCategoryDto, type UpdateCategoryDto } from '../../services/categoryService';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  category?: Category | null;
}

export function CategoryFormModal({ isOpen, onClose, onSuccess, category }: CategoryFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<CreateCategoryDto>({
    parentCategoryId: 0,
    categoryName: '',
    categoryDescription: '',
    iconUrl: '',
    isActive: true,
    displayOrder: 1
  });

  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (category) {
      setFormData({
        parentCategoryId: category.parentCategoryId,
        categoryName: category.categoryName,
        categoryDescription: category.categoryDescription,
        iconUrl: category.iconUrl || '',
        isActive: category.isActive,
        displayOrder: category.displayOrder
      });
    } else {
      setFormData({
        parentCategoryId: 0,
        categoryName: '',
        categoryDescription: '',
        iconUrl: '',
        isActive: true,
        displayOrder: 1
      });
    }
  }, [category]);

  const loadCategories = async () => {
    try {
      const data = await CategoryService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error al cargar categorías:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryName.trim()) {
      toast.error("El nombre de la categoría es requerido");
      return;
    }

    if (!formData.categoryDescription.trim()) {
      toast.error("La descripción de la categoría es requerida");
      return;
    }

    try {
      setLoading(true);
      
      if (category) {
        const updateData: UpdateCategoryDto = {
          categoryName: formData.categoryName,
          categoryDescription: formData.categoryDescription,
          parentCategoryId: formData.parentCategoryId,
          iconUrl: formData.iconUrl || undefined,
          isActive: formData.isActive,
          displayOrder: formData.displayOrder
        };
        
        await CategoryService.updateCategory(category.categoryId, updateData);
        toast.success("Categoría actualizada exitosamente");
      } else {
        await CategoryService.createCategory(formData);
        toast.success("Categoría creada exitosamente");
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error al guardar categoría:", error);
      toast.error("Error al guardar la categoría");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateCategoryDto, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="categoryName">Nombre de la categoría *</Label>
            <Input
              id="categoryName"
              value={formData.categoryName}
              onChange={(e) => handleChange('categoryName', e.target.value)}
              placeholder="Ej: Plomería, Electricidad, Desarrollo Web"
              disabled={loading}
              className="w-full"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="categoryDescription">Descripción *</Label>
            <Textarea
              id="categoryDescription"
              value={formData.categoryDescription}
              onChange={(e) => handleChange('categoryDescription', e.target.value)}
              placeholder="Describe los servicios que incluye esta categoría"
              disabled={loading}
              rows={3}
              className="w-full"
            />
          </div>

          {/* Categoría Padre */}
          <div className="space-y-2">
            <Label htmlFor="parentCategoryId">Categoría padre</Label>
            <Select
              value={formData.parentCategoryId.toString()}
              onValueChange={(value) => handleChange('parentCategoryId', parseInt(value))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría padre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">(Categoría principal - Sin padre)</SelectItem>
                {categories
                  .filter(c => c.categoryId !== category?.categoryId) // No permitir seleccionarse a sí misma
                  .map((cat) => (
                    <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>
                      {cat.categoryName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500">
              Deja "(Categoría principal)" si esta es una categoría de primer nivel
            </p>
          </div>

          {/* Icono URL */}
          <div className="space-y-2">
            <Label htmlFor="iconUrl">URL del icono (opcional)</Label>
            <Input
              id="iconUrl"
              value={formData.iconUrl}
              onChange={(e) => handleChange('iconUrl', e.target.value)}
              placeholder="https://ejemplo.com/icono.png"
              disabled={loading}
              className="w-full"
            />
            <p className="text-sm text-slate-500">
              Puedes usar iconos de <a href="https://fontawesome.com/icons" target="_blank" className="text-blue-600 hover:underline">FontAwesome</a> o <a href="https://icons8.com" target="_blank" className="text-blue-600 hover:underline">Icons8</a>
            </p>
          </div>

          {/* Orden de visualización */}
          <div className="space-y-2">
            <Label htmlFor="displayOrder">Orden de visualización</Label>
            <Input
              id="displayOrder"
              type="number"
              min="1"
              value={formData.displayOrder}
              onChange={(e) => handleChange('displayOrder', parseInt(e.target.value) || 1)}
              disabled={loading}
              className="w-32"
            />
            <p className="text-sm text-slate-500">
              Número que determina el orden en que aparecen las categorías (menor = primero)
            </p>
          </div>

          {/* Estado activo */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <Label htmlFor="isActive" className="font-medium">Categoría activa</Label>
              <p className="text-sm text-slate-500">
                Las categorías inactivas no se mostrarán en la plataforma
              </p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange('isActive', checked)}
              disabled={loading}
            />
          </div>

          {/* Preview si tiene icono */}
          {formData.iconUrl && (
            <div className="p-4 border rounded-lg">
              <Label>Vista previa del icono</Label>
              <div className="flex items-center gap-3 mt-2">
                {formData.iconUrl.startsWith('http') ? (
                  <img 
                    src={formData.iconUrl} 
                    alt="Icono preview" 
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 bg-slate-200 rounded flex items-center justify-center">
                    <span className="text-xs text-slate-500">URL</span>
                  </div>
                )}
                <div>
                  <p className="font-medium">{formData.categoryName || 'Nombre de ejemplo'}</p>
                  <p className="text-sm text-slate-600">{formData.categoryDescription || 'Descripción de ejemplo'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {category ? 'Actualizar' : 'Crear'} Categoría
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}