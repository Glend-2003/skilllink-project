import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Plus, Edit, Trash2, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Category {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  iconUrl?: string;
  isActive: boolean;
  displayOrder: number;
  parentCategoryId?: number;
  createdAt: string;
  serviceCount: number;
}

export default function CategoriesManagement() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    categoryDescription: '',
    iconUrl: '',
    isActive: true,
    displayOrder: 0,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories`, {
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else if (response.status === 403) {
        toast.error('No tienes permisos de administrador');
        navigate('/profile');
      } else {
        toast.error('Error al cargar categorías');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Error de conexión al cargar categorías');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryName.trim()) {
      toast.error('El nombre de la categoría es obligatorio');
      return;
    }

    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory 
        ? `${API_BASE_URL}/api/v1/admin/categories/${editingCategory.categoryId}` 
        : `${API_BASE_URL}/api/v1/admin/categories`;
      
      const payload: any = {
        categoryName: formData.categoryName.trim(),
      };

      if (formData.categoryDescription.trim()) {
        payload.categoryDescription = formData.categoryDescription.trim();
      }

      if (formData.iconUrl.trim()) {
        payload.iconUrl = formData.iconUrl.trim();
      }

      payload.isActive = formData.isActive;
      payload.displayOrder = formData.displayOrder;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success(editingCategory ? 'Categoría actualizada' : 'Categoría creada');
        setModalVisible(false);
        setEditingCategory(null);
        setFormData({ categoryName: '', categoryDescription: '', iconUrl: '', isActive: true, displayOrder: 0 });
        loadCategories();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al guardar la categoría');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Error de conexión al guardar');
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setFormData({
      categoryName: cat.categoryName,
      categoryDescription: cat.categoryDescription || '',
      iconUrl: cat.iconUrl || '',
      isActive: cat.isActive,
      displayOrder: cat.displayOrder,
    });
    setModalVisible(true);
  };

  const handleDelete = (cat: Category) => {
    if (cat.serviceCount > 0) {
      toast.error(`Esta categoría tiene ${cat.serviceCount} servicio(s) asociado(s). No se puede eliminar.`);
      return;
    }

    if (window.confirm(`¿Estás seguro de eliminar "${cat.categoryName}"?`)) {
      deleteCategory(cat.categoryId);
    }
  };

  const deleteCategory = async (categoryId: number) => {
    try {
      setDeletingId(categoryId);
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      if (response.ok) {
        toast.success('Categoría eliminada');
        loadCategories();
      } else {
        const data = await response.json();
        toast.error(data.message || 'No se pudo eliminar la categoría');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Error de conexión al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleCategoryStatus = async (categoryId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin/categories/${categoryId}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user?.token}` },
      });

      if (response.ok) {
        toast.success('Estado actualizado');
        loadCategories();
      } else {
        toast.error('No se pudo cambiar el estado');
      }
    } catch (error) {
      console.error('Error toggling category:', error);
      toast.error('Error de conexión');
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
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Gestión de Categorías</h1>
              <p className="text-slate-600">Administra las categorías de servicios disponibles</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => loadCategories(true)}
                disabled={refreshing}
                variant="outline"
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </Button>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setFormData({ categoryName: '', categoryDescription: '', iconUrl: '', isActive: true, displayOrder: 0 });
                  setModalVisible(true);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Categoría
              </Button>
            </div>
          </div>
        </div>

        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-5xl mb-4">📂</div>
              <h3 className="text-xl font-bold mb-2">No hay categorías</h3>
              <p className="text-slate-600 mb-6">Crea tu primera categoría para comenzar</p>
              <Button
                onClick={() => {
                  setEditingCategory(null);
                  setFormData({ categoryName: '', categoryDescription: '', iconUrl: '', isActive: true, displayOrder: 0 });
                  setModalVisible(true);
                }}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Categoría
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-slate-600">{categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}</p>
            <div className="grid grid-cols-1 gap-4">
              {categories.map((cat) => (
                <Card key={cat.categoryId}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold">{cat.categoryName}</h3>
                            {cat.categoryDescription && (
                              <p className="text-sm text-slate-600 mt-1">{cat.categoryDescription}</p>
                            )}
                          </div>
                          <Badge variant={cat.isActive ? 'default' : 'secondary'}>
                            {cat.isActive ? '● Activa' : '● Inactiva'}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap gap-4 text-sm mt-3">
                          <div>
                            <span className="text-slate-600">Orden: </span>
                            <span className="font-semibold">{cat.displayOrder}</span>
                          </div>
                          <div>
                            <span className="text-slate-600">Servicios: </span>
                            <span className="font-semibold">{cat.serviceCount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 md:flex-col md:min-w-[140px]">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 flex-1"
                          onClick={() => toggleCategoryStatus(cat.categoryId)}
                        >
                          {cat.isActive ? (
                            <>
                              <Eye className="w-4 h-4" />
                              <span className="hidden md:inline">Ocultar</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4" />
                              <span className="hidden md:inline">Mostrar</span>
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 flex-1"
                          onClick={() => handleEdit(cat)}
                        >
                          <Edit className="w-4 h-4" />
                          <span className="hidden md:inline">Editar</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 flex-1"
                          onClick={() => handleDelete(cat)}
                          disabled={deletingId === cat.categoryId || cat.serviceCount > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden md:inline">
                            {deletingId === cat.categoryId ? 'Eliminando...' : 'Eliminar'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {modalVisible && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</CardTitle>
                <button
                  onClick={() => setModalVisible(false)}
                  className="text-slate-500 hover:text-slate-700 font-bold"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold block mb-2">Nombre *</label>
                  <input
                    type="text"
                    placeholder="Ej: Plomería, Electricidad"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">Descripción</label>
                  <textarea
                    placeholder="Descripción de la categoría"
                    value={formData.categoryDescription}
                    onChange={(e) => setFormData({ ...formData, categoryDescription: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">Icono URL</label>
                  <input
                    type="text"
                    placeholder="URL del icono (opcional)"
                    value={formData.iconUrl}
                    onChange={(e) => setFormData({ ...formData, iconUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-2">Orden de visualización</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isActive" className="text-sm">Categoría activa</label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModalVisible(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                  >
                    {editingCategory ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
