import api from './api';

export interface Provider {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
}

export const MarketplaceService = {
  // --- Services ---
  getAllServices: async () => {
    const response = await api.get('/services');
    return response.data;
  },
  
  getServiceById: async (id: number) => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  createService: async (serviceData: any) => {
    const response = await api.post('/services', serviceData);
    return response.data;
  },

  // --- Categories ---
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // --- Providers ---
  getProviders: async () => {
    const response = await api.get('/providers');
    return response.data;
  },
  getProviderByUserId: async (userId: number) => {
    const response = await api.get(`/providers/${userId}`);
    return response.data;
  },
  
  getProviderServices: async (providerId: number) => {
    const response = await api.get(`/providers/${providerId}/services`);
    return response.data;
  },

  getProviderProfile: async (userId: number) => {
    const response = await api.get(`/providers/user/${userId}`); 
    return response.data;
  },

  getProviderReviews: async (providerId: number) => {
    const response = await api.get(`/providers/${providerId}/reviews`);
    return response.data;
  },

  getActiveProviders: async (): Promise<Provider[]> => {
    const response = await api.get(`/providers/active`);
    return response.data;
  },

  getInactiveProviders: async (): Promise<Provider[]> => {
    const response = await api.get(`/providers/inactive`);
    return response.data;
  },
};