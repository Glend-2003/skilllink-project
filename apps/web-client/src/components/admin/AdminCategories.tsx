import { useState, useEffect } from 'react';
import { 
  Search, Filter, MoreVertical, Plus, Edit, Trash2, 
  CheckCircle, XCircle, ChevronDown, ChevronRight,
  Tag, ListTree, ArrowUpDown, AlertCircle,
  ArrowUp, ArrowDown
} from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { toast } from 'sonner';
import { CategoryService, type Category } from '../../services/categoryService';
import { CategoryFormModal } from './CategoryFormModal';

interface AdminCategoriesProps {
  onViewChange: (view: string) => void;
}

export function AdminCategories({ onViewChange }: AdminCategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  
  // Estados para modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  useEffect(() => {
    console.log("📂 AdminCategories montado");
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log("🔄 Cargando categorías...");
      
      const data = await CategoryService.getCategories();
      console.log("✅ Categorías cargadas:", data);
      
      setCategories(data);
      
      // Expandir categorías principales por defecto
      const mainCategories = data.filter(c => c.parentCategoryId === 0).map(c => c.categoryId);
      setExpandedCategories(mainCategories);
      
      console.log("📊 Estadísticas categorías:", {
        total: data.length,
        activas: data.filter(c => c.isActive).length,
        principales: mainCategories.length,
        subcategorias: data.filter(c => c.parentCategoryId > 0).length
      });
    } catch (error) {
      console.error("❌ Error al cargar categorías:", error);
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryHierarchy = () => {
    const mainCategories = categories.filter(c => c.parentCategoryId === 0)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    
    const result: (Category & { level: number })[] = [];

    const addCategoryWithChildren = (category: Category, level: number) => {
      result.push({ ...category, level });
      if (expandedCategories.includes(category.categoryId)) {
        const children = categories
          .filter(c => c.parentCategoryId === category.categoryId)
          .sort((a, b) => a.displayOrder - b.displayOrder);
        
        children.forEach(child => addCategoryWithChildren(child, level + 1));
      }
    };

    mainCategories.forEach(category => addCategoryWithChildren(category, 0));
    return result;
  };

  const hierarchicalCategories = getCategoryHierarchy();

  const filteredCategories = hierarchicalCategories.filter(category => {
    const matchesSearch = category.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.categoryDescription.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && category.isActive) ||
                         (filterStatus === 'inactive' && !category.isActive);
    
    return matchesSearch && matchesFilter;
  });

  const toggleCategoryExpand = (categoryId: number) => {
    if (expandedCategories.includes(categoryId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== categoryId));
    } else {
      setExpandedCategories([...expandedCategories, categoryId]);
    }
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsFormModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsFormModalOpen(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      // Primero verificar si tiene subcategorías
      const hasChildren = categories.some(c => c.parentCategoryId === categoryToDelete.categoryId);
      if (hasChildren) {
        toast.error("No se puede eliminar: esta categoría tiene subcategorías");
        return;
      }

      await CategoryService.deleteCategory(categoryToDelete.categoryId);
      
      toast.success(`Categoría "${categoryToDelete.categoryName}" eliminada exitosamente`);
      
      // Recargar categorías
      await loadCategories();
      
    } catch (error: any) {
      console.error("Error al eliminar categoría:", error);
      
      if (error.response?.status === 409) {
        toast.error("No se puede eliminar: hay servicios asociados a esta categoría");
      } else {
        toast.error("Error al eliminar la categoría");
      }
    } finally {
      setDeleteConfirmOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleToggleStatus = async (categoryId: number, currentStatus: boolean) => {
    try {
      const category = categories.find(c => c.categoryId === categoryId);
      if (!category) return;

      // Si vamos a desactivar una categoría principal, verificar subcategorías
      if (category.parentCategoryId === 0 && currentStatus === true) {
        const hasActiveChildren = categories.some(c => 
          c.parentCategoryId === categoryId && c.isActive
        );
        
        if (hasActiveChildren) {
          const confirm = window.confirm(
            "Esta categoría principal tiene subcategorías activas. " +
            "¿Deseas desactivarlas también?\n\n" +
            "• Sí: Desactiva esta categoría y todas sus subcategorías\n" +
            "• No: Solo desactiva esta categoría"
          );

          if (confirm) {
            // Desactivar todas las subcategorías también
            const subcategories = categories.filter(c => c.parentCategoryId === categoryId);
            await Promise.all(
              subcategories.map(subcat =>
                CategoryService.updateCategory(subcat.categoryId, { isActive: false })
              )
            );
          }
        }
      }

      await CategoryService.updateCategory(categoryId, { isActive: !currentStatus });
      
      // Actualizar estado local
      setCategories(categories.map(c => 
        c.categoryId === categoryId ? { ...c, isActive: !currentStatus } : c
      ));
      
      toast.success(`Categoría ${!currentStatus ? 'activada' : 'desactivada'}`);
      
    } catch (error) {
      console.error("Error al cambiar estado:", error);
      toast.error("Error al cambiar estado");
    }
  };

  const handleReorder = async (categoryId: number, direction: 'up' | 'down') => {
    try {
      const category = categories.find(c => c.categoryId === categoryId);
      if (!category) return;

      const siblings = categories.filter(c => 
        c.parentCategoryId === category.parentCategoryId
      ).sort((a, b) => a.displayOrder - b.displayOrder);

      const currentIndex = siblings.findIndex(c => c.categoryId === categoryId);
      if (currentIndex === -1) return;

      let newIndex = currentIndex;
      if (direction === 'up' && currentIndex > 0) {
        newIndex = currentIndex - 1;
      } else if (direction === 'down' && currentIndex < siblings.length - 1) {
        newIndex = currentIndex + 1;
      } else {
        return; // No hay movimiento posible
      }

      // Intercambiar órdenes
      const updatedSiblings = [...siblings];
      [updatedSiblings[currentIndex], updatedSiblings[newIndex]] = 
      [updatedSiblings[newIndex], updatedSiblings[currentIndex]];

      // Actualizar órdenes en backend
      await Promise.all(
        updatedSiblings.map((cat, index) =>
          CategoryService.updateCategory(cat.categoryId, { displayOrder: index + 1 })
        )
      );

      toast.success("Orden actualizado");
      await loadCategories(); // Recargar para reflejar cambios
      
    } catch (error) {
      console.error("Error al reordenar:", error);
      toast.error("Error al reordenar");
    }
  };

  const getMaxDisplayOrder = (parentId: number) => {
    const siblings = categories.filter(c => c.parentCategoryId === parentId);
    if (siblings.length === 0) return 1;
    return Math.max(...siblings.map(c => c.displayOrder)) + 1;
  };

  const handleFormSuccess = () => {
    loadCategories();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Gestión de Categorías</h1>
          <p className="text-slate-600">Organiza las categorías de servicios de SkillLink</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Total Categorías</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Activas</p>
              <p className="text-2xl font-bold">
                {categories.filter(c => c.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Categorías Principales</p>
              <p className="text-2xl font-bold">
                {categories.filter(c => c.parentCategoryId === 0).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Subcategorías</p>
              <p className="text-2xl font-bold">
                {categories.filter(c => c.parentCategoryId > 0).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar categorías..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="active">Solo activas</SelectItem>
                  <SelectItem value="inactive">Solo inactivas</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Button 
                  onClick={() => setExpandedCategories(categories.map(c => c.categoryId))}
                  variant="outline"
                  size="sm"
                >
                  Expandir todo
                </Button>
                <Button 
                  onClick={() => setExpandedCategories([])}
                  variant="outline"
                  size="sm"
                >
                  Colapsar todo
                </Button>
                <Button onClick={handleAddCategory} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Nueva Categoría
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>Jerarquía de Categorías ({filteredCategories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Orden</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                          <p className="text-lg">No se encontraron categorías</p>
                          <p className="text-sm mt-1">
                            {searchQuery ? 
                              `No hay resultados para "${searchQuery}"` : 
                              "No hay categorías registradas"}
                          </p>
                          <Button 
                            onClick={handleAddCategory} 
                            className="mt-4 gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Crear primera categoría
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((category) => {
                      const hasChildren = categories.some(c => c.parentCategoryId === category.categoryId);
                      const parentCategory = categories.find(c => c.categoryId === category.parentCategoryId);
                      const siblings = categories.filter(c => 
                        c.parentCategoryId === category.parentCategoryId
                      );
                      const siblingCount = siblings.length;
                      
                      return (
                        <TableRow key={category.categoryId} className="hover:bg-slate-50">
                          <TableCell>
                            <div className="flex items-center gap-2" style={{ paddingLeft: `${category.level * 24}px` }}>
                              {hasChildren ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 hover:bg-slate-200"
                                  onClick={() => toggleCategoryExpand(category.categoryId)}
                                >
                                  {expandedCategories.includes(category.categoryId) ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </Button>
                              ) : (
                                <div className="w-6" />
                              )}
                              <div className="flex items-center gap-2">
                                {category.iconUrl ? (
                                  <img 
                                    src={category.iconUrl} 
                                    alt="" 
                                    className="w-5 h-5 object-contain"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <Tag className="w-5 h-5 text-slate-400" />
                                )}
                                <div>
                                  <span className="font-medium">{category.categoryName}</span>
                                  {parentCategory && (
                                    <p className="text-xs text-slate-500">
                                      Subcategoría de: {parentCategory.categoryName}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="text-sm" title={category.categoryDescription}>
                              {category.categoryDescription || 'Sin descripción'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-medium min-w-6 text-center">{category.displayOrder}</span>
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 hover:bg-slate-200"
                                  onClick={() => handleReorder(category.categoryId, 'up')}
                                  disabled={category.displayOrder <= 1}
                                  title="Mover arriba"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-5 w-5 hover:bg-slate-200"
                                  onClick={() => handleReorder(category.categoryId, 'down')}
                                  disabled={category.displayOrder >= siblingCount}
                                  title="Mover abajo"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {category.isActive ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  <span className="text-sm text-green-600">Activa</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-4 h-4 text-red-600" />
                                  <span className="text-sm text-red-600">Inactiva</span>
                                </>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditCategory(category)}
                                title="Editar"
                                className="hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleToggleStatus(category.categoryId, category.isActive)}
                                title={category.isActive ? "Desactivar" : "Activar"}
                                className={`hover:bg-${category.isActive ? 'amber' : 'green'}-50 hover:text-${category.isActive ? 'amber' : 'green'}-600`}
                              >
                                {category.isActive ? (
                                  <XCircle className="w-4 h-4" />
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </Button>
                            <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                variant="ghost" 
                                size="icon" 
                                title="Más acciones"
                                className="h-8 w-8 hover:bg-slate-100"
                                >
                                <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                                align="end" 
                                className="w-56 bg-white shadow-lg border border-slate-200 rounded-lg"
                                sideOffset={5}
                            >
                                <DropdownMenuLabel className="font-semibold text-slate-700">
                                Acciones
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-200" />
                                <DropdownMenuItem 
                                onClick={() => handleEditCategory(category)}
                                className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
                                >
                                <Edit className="w-4 h-4 mr-2 text-slate-600" />
                                <span>Editar</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                onClick={() => {
                                    // Agregar subcategoría
                                    const newCategoryData = {
                                    parentCategoryId: category.categoryId,
                                    categoryName: '',
                                    categoryDescription: '',
                                    displayOrder: getMaxDisplayOrder(category.categoryId),
                                    isActive: true
                                    };
                                    setSelectedCategory(newCategoryData as any);
                                    setIsFormModalOpen(true);
                                }}
                                className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
                                >
                                <Plus className="w-4 h-4 mr-2 text-slate-600" />
                                <span>Agregar subcategoría</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="cursor-pointer hover:bg-slate-50 focus:bg-slate-50">
                                <ListTree className="w-4 h-4 mr-2 text-slate-600" />
                                <span>Ver servicios asociados</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-slate-200" />
                                <DropdownMenuItem 
                                onClick={() => handleDeleteClick(category)}
                                className="cursor-pointer text-red-600 hover:bg-red-50 focus:bg-red-50"
                                >
                                <Trash2 className="w-4 h-4 mr-2" />
                                <span>Eliminar</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                            </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de formulario */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedCategory(null);
        }}
        onSuccess={handleFormSuccess}
        category={selectedCategory}
      />

      {/* Modal de confirmación de eliminación */}
      {deleteConfirmOpen && categoryToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Eliminar categoría</h3>
                  <p className="text-slate-600">Esta acción no se puede deshacer</p>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="font-medium text-amber-800 mb-1">
                  ¿Estás seguro de eliminar la categoría "{categoryToDelete.categoryName}"?
                </p>
                <p className="text-sm text-amber-700">
                  Se eliminará permanentemente de la base de datos.
                  {categories.some(c => c.parentCategoryId === categoryToDelete.categoryId) && (
                    <span className="font-medium block mt-1">
                      ⚠️ Advertencia: Esta categoría tiene subcategorías que también se eliminarán.
                    </span>
                  )}
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    setCategoryToDelete(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleConfirmDelete}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar permanentemente
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}