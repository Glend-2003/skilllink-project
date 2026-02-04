import api from './api';
import { toast } from 'sonner';

export interface Category {
  categoryId: number;          
  parentCategoryId: number;    
  categoryName: string;     
  categoryDescription: string;
  iconUrl?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  parentCategoryId: number;
  categoryName: string;
  categoryDescription: string;
  iconUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export interface UpdateCategoryDto {
  parentCategoryId?: number;
  categoryName?: string;
  categoryDescription?: string;
  iconUrl?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export const CategoryService = {
    getCategories: async (): Promise<Category[]> => {
    try {
        const response = await api.get('/api/v1/categories');
        console.log("Respuesta cruda de categorías:", response.data);
        
        const categories = Array.isArray(response.data) ? response.data : [];
        
        return categories.map((cat: any) => {
        let parentId = cat.parentCategoryId;
        if (parentId === null || parentId === undefined || parentId === 'null') {
            parentId = 0;
        }
        
        return {
            categoryId: cat.categoryId || cat.id || 0,
            parentCategoryId: Number(parentId) || 0,
            categoryName: cat.categoryName || cat.name || 'Sin nombre',
            categoryDescription: cat.categoryDescription || cat.description || '',
            iconUrl: cat.iconUrl || cat.icon || '',
            isActive: cat.isActive !== undefined ? cat.isActive : true,
            displayOrder: cat.displayOrder || cat.order || 0,
            createdAt: cat.createdAt,
            updatedAt: cat.updatedAt
        };
        });
        
    } catch (error: any) {
        console.error("Error obteniendo categorías:", error);
        console.log("Headers de error:", error.response?.headers);
        console.log("Config de request:", error.config);
        
        return [
        {
            categoryId: 1,
            parentCategoryId: 0, 
            categoryName: "Hogar",
            categoryDescription: "Servicios para el hogar",
            iconUrl: "https://cdn-icons-png.flaticon.com/512/3067/3067256.png",
            isActive: true,
            displayOrder: 1,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01"
        },
        {
            categoryId: 2,
            parentCategoryId: 0,  
            categoryName: "Tecnología",
            categoryDescription: "Servicios tecnológicos",
            iconUrl: "https://cdn-icons-png.flaticon.com/512/2933/2933245.png",
            isActive: true,
            displayOrder: 2,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01"
        },
        {
            categoryId: 3,
            parentCategoryId: 1,
            categoryName: "Plomería",
            categoryDescription: "Reparaciones de plomería",
            isActive: true,
            displayOrder: 1,
            createdAt: "2024-01-01",
            updatedAt: "2024-01-01"
        }
        ];
    }
    },

  getCategoryById: async (id: number): Promise<Category> => {
    try {
      const response = await api.get(`/api/v1/categories/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error obteniendo categoría ${id}:`, error);
      if (error.response?.status === 404) {
        toast.error("Categoría no encontrada");
      } else {
        toast.error("Error al cargar la categoría");
      }
      throw error;
    }
  },

    createCategory: async (categoryData: CreateCategoryDto): Promise<Category> => {
        try {
            console.log("Datos recibidos del formulario:", categoryData);
            
            const payload: any = {
            categoryName: categoryData.categoryName.trim(),
            categoryDescription: categoryData.categoryDescription?.trim() || "",
            isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
            displayOrder: categoryData.displayOrder || 1
            };
            
            if (categoryData.parentCategoryId && categoryData.parentCategoryId > 0) {
            payload.parentCategoryId = categoryData.parentCategoryId;
            }
            
            if (categoryData.iconUrl?.trim()) {
            payload.iconUrl = categoryData.iconUrl.trim();
            }
            
            console.log("Payload final para enviar:", payload);
            console.log("JSON stringify:", JSON.stringify(payload));
            
            const response = await api.post('/api/v1/categories', payload);
            
            console.log("Respuesta exitosa:", response.data);
            toast.success("Categoría creada exitosamente");
            return response.data;
            
        } catch (error: any) {
            console.error("Error completo:", error);
            
            if (error.response?.data?.message) {
            console.error("Mensaje del servidor:", error.response.data.message);
            toast.error(`Error: ${error.response.data.message}`);
            }
            
            if (error.response?.data?.errors) {
            console.error("Errores de validación:", error.response.data.errors);
            const errors = error.response.data.errors;
            const errorMessages = Object.entries(errors)
                .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                .join('; ');
            toast.error(`Errores: ${errorMessages}`);
            }
            
            throw error;
        }
        },

    updateCategory: async (id: number, categoryData: UpdateCategoryDto): Promise<Category> => {
    try {
        console.log(`📤 Actualizando categoría ${id}:`, categoryData);
        
        const payload: any = {};
        if (categoryData.categoryName !== undefined) payload.categoryName = categoryData.categoryName.trim();
        if (categoryData.categoryDescription !== undefined) payload.categoryDescription = categoryData.categoryDescription.trim();
        if (categoryData.parentCategoryId !== undefined) payload.parentCategoryId = categoryData.parentCategoryId;
        if (categoryData.iconUrl !== undefined) payload.iconUrl = categoryData.iconUrl || null;
        if (categoryData.isActive !== undefined) payload.isActive = categoryData.isActive;
        if (categoryData.displayOrder !== undefined) payload.displayOrder = categoryData.displayOrder;
        
        console.log(`Payload de actualización:`, payload);
        
        const response = await api.patch(`/api/v1/categories/${id}`, payload);
        
        console.log("Respuesta de actualización:", response.data);
        
        if (response.data) {
        toast.success("Categoría actualizada exitosamente");
        return response.data;
        } else {
        throw new Error("Respuesta inválida del servidor");
        }
        
    } catch (error: any) {
        console.error(`Error actualizando categoría ${id}:`, error);
        console.error("Detalles del error:", error.response?.data);
        
        if (error.response?.status === 404) {
        toast.error("Categoría no encontrada");
        } else if (error.response?.status === 400) {
        const errorMsg = error.response.data?.message || "Datos inválidos para actualizar";
        toast.error(`Error: ${errorMsg}`);
        } else {
        toast.error("Error al actualizar categoría");
        }
        
        throw error;
    }
    },

  deleteCategory: async (id: number): Promise<void> => {
    try {
      console.log(`🗑️  Eliminando categoría ${id}`);
      await api.delete(`/api/v1/categories/${id}`);
      
      toast.success("Categoría eliminada exitosamente");
      console.log("Categoría eliminada");
    } catch (error: any) {
      console.error(`Error eliminando categoría ${id}:`, error);
      
      if (error.response?.status === 404) {
        toast.error("Categoría no encontrada");
      } else if (error.response?.status === 409) {
        toast.error("No se puede eliminar: tiene servicios asociados");
      } else {
        toast.error("Error al eliminar categoría");
      }
      
      console.log("Simulando eliminación de categoría", id);
      throw error; 
    }
  },

  getActiveCategories: async (): Promise<Category[]> => {
    try {
      const allCategories = await CategoryService.getCategories();
      return allCategories.filter(category => category.isActive);
    } catch (error) {
      console.error("Error obteniendo categorías activas:", error);
      throw error;
    }
  },

  getMainCategories: async (): Promise<Category[]> => {
    try {
      const allCategories = await CategoryService.getCategories();
      return allCategories.filter(category => category.parentCategoryId === 0);
    } catch (error) {
      console.error("Error obteniendo categorías principales:", error);
      throw error;
    }
  },

  getSubcategories: async (parentId: number): Promise<Category[]> => {
    try {
      const allCategories = await CategoryService.getCategories();
      return allCategories.filter(category => category.parentCategoryId === parentId);
    } catch (error) {
      console.error(`Error obteniendo subcategorías de ${parentId}:`, error);
      throw error;
    }
  },

  getCategoryTree: async (): Promise<(Category & { children: Category[] })[]> => {
    try {
      const allCategories = await CategoryService.getCategories();
      const mainCategories = allCategories.filter(c => c.parentCategoryId === 0);
      
      return mainCategories.map(mainCategory => ({
        ...mainCategory,
        children: allCategories.filter(c => c.parentCategoryId === mainCategory.categoryId)
      }));
    } catch (error) {
      console.error("Error obteniendo árbol de categorías:", error);
      throw error;
    }
  },

  searchCategories: async (query: string): Promise<Category[]> => {
    try {
      const allCategories = await CategoryService.getCategories();
      return allCategories.filter(category =>
        category.categoryName.toLowerCase().includes(query.toLowerCase()) ||
        category.categoryDescription.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error(`Error buscando categorías con "${query}":`, error);
      throw error;
    }
  },

  reorderCategories: async (reorderedItems: { categoryId: number; displayOrder: number }[]): Promise<void> => {
    try {
      console.log("Reordenando categorías:", reorderedItems);
      
      await Promise.all(
        reorderedItems.map(item =>
          api.patch(`/api/v1/categories/${item.categoryId}`, {
            displayOrder: item.displayOrder
          })
        )
      );
      
      toast.success("Orden de categorías actualizado");
    } catch (error: any) {
      console.error("Error reordenando categorías:", error);
      toast.error("Error al reordenar categorías");
      throw error;
    }
  },

  toggleCategoryStatus: async (categoryId: number): Promise<Category> => {
    try {
      const category = await CategoryService.getCategoryById(categoryId);
      return await CategoryService.updateCategory(categoryId, {
        isActive: !category.isActive
      });
    } catch (error) {
      console.error(`Error cambiando estado de categoría ${categoryId}:`, error);
      throw error;
    }
  },

  canDeleteCategory: async (categoryId: number): Promise<boolean> => {
    try {
      const subcategories = await CategoryService.getSubcategories(categoryId);
      return subcategories.length === 0;
    } catch (error) {
      console.error(`❌ Error validando categoría ${categoryId}:`, error);
      return false;
    }
  }
};