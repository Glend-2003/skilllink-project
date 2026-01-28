import api from './api';

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
    const response = await api.get(`/providers/user/${userId}`);
    return response.data;
  }
};