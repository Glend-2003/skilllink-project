import api from './api';

export interface Provider {
  id: number;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  isActive: boolean;
  status?: string;
}

export interface Category {
  categoryId: number;          
  parentCategoryId: number;    
  categoryName: string;     
  categoryDescription: string;
  iconUrl?: string;
  isActive: boolean;
  displayOrder: number;
}

export const MarketplaceService = {
  getAllServices: async () => {
    const response = await api.get('/api/v1/services'); 
    return response.data;
  },
  
  getServiceById: async (id: number) => {
    const response = await api.get(`/api/v1/services/${id}`);
    return response.data;
  },

  createService: async (serviceData: any) => {
    const response = await api.post('/api/v1/services', serviceData);
    return response.data;
  },

  // --- Categories ---
  getCategories: async () => {
    const response = await api.get('/api/v1/categories');
    return response.data;
  },
  
  // --- Providers ---
  getFeaturedProviders: async () => {
    const response = await api.get('/api/v1/providers/featured'); 
    return response.data;
  },

  getProviders: async () => {
    try {
      const response = await api.get('/api/v1/providers');
      console.log("Estructura COMPLETA del primer proveedor:", response.data[0]);
      console.log("Todos los campos disponibles:", Object.keys(response.data[0] || {}));
      return response.data;
    } catch (error) {
      console.error("Error obteniendo proveedores:", error);
      return [];
    }
  },

  getProviderByUserId: async (userId: number) => {
    const response = await api.get(`/api/v1/providers/user/${userId}`);
    return response.data;
  },
  
  getProviderServices: async (providerId: number) => {
    const response = await api.get(`/api/v1/providers/${providerId}/services`);
    return response.data;
  },

  getProviderServices2: async (providerId: number) => {
    try {
      const response = await api.get('/api/v1/services');
      const allServices = response.data;

      return allServices.filter((service: any) => 
        service.providerId === providerId || 
        service.provider_id === providerId ||
        (service.provider && service.provider.id === providerId)
      );
    } catch (error) {
      console.error("Error obteniendo servicios:", error);
      return [];
    }
  },

  // Get reviews of each provider
  /*getProviderReviews: async (providerId: number) => {
    try {
      const response = await api.get('/api/v1/reviews');
      const allReviews = response.data;

      return allReviews.filter((review: any) => 
        review.providerId === providerId || 
        review.provider_id === providerId
      );
    } catch (error) {
      console.error("Error obteniendo reseñas:", error);
      return [];
    }
  },*/

  getProviderProfile: async (userId: number) => {
    const response = await api.get(`/api/v1/providers/user/${userId}`); 
    return response.data;
  },

  getProviderReviews: async (providerId: number) => {
    const response = await api.get(`/api/v1/providers/${providerId}/reviews`);
    return response.data;
  },

  getActiveProviders: async (): Promise<Provider[]> => {
    try {
      console.log("Intentando obtener proveedores activos...");
      const response = await api.get(`/api/v1/providers/active`);
      console.log("Respuesta de /providers/active:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error en getActiveProviders:", error);
      try {
        const allProviders = await MarketplaceService.getProviders();
        return allProviders.filter((provider: any) => provider.isActive === true);
      } catch (fallbackError) {
        console.error("Error en fallback:", fallbackError);
        return [];
      }
    }
  },

  getInactiveProviders: async (): Promise<Provider[]> => {
    try {
      console.log("Intentando obtener proveedores inactivos...");
      const response = await api.get(`/api/v1/providers/inactive`);
      console.log("Respuesta de /providers/inactive:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("Error en getInactiveProviders:", error);
      try {
        const allProviders = await MarketplaceService.getProviders();
        return allProviders.filter((provider: any) => provider.isActive === false);
      } catch (fallbackError) {
        console.error("Error en fallback:", fallbackError);
        return [];
      }
    }
  },

  getVerifiedProviders: async (): Promise<Provider[]> => {
    try {
      const response = await api.get(`/api/v1/providers`);
      return response.data.filter((provider: any) => 
        provider.isVerified === true || 
        provider.verified === true ||
        provider.hasTrustBadge === true
      );
    } catch (error) {
      console.error("Error obteniendo proveedores verificados:", error);
      return [];
    }
  },

  getUnverifiedProviders: async (): Promise<Provider[]> => {
    try {
      const response = await api.get(`/api/v1/providers`);
      return response.data.filter((provider: any) => 
        provider.isVerified === false || 
        provider.verified === false ||
        provider.hasTrustBadge === false
      );
    } catch (error) {
      console.error("Error obteniendo proveedores no verificados:", error);
      return [];
    }
  },
};