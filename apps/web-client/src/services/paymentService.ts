import api from './api';

export const PaymentService = {
  // GET /api/v1/payments/plans
  getPlans: async () => {
    const response = await api.get('/payments/plans');
    return response.data; // Devuelve lista de SubscriptionPlan
  },

  // POST /api/v1/payments/subscribe
  subscribe: async (providerId: number, planId: number) => {
    const response = await api.post('/payments/subscribe', {
      providerId,
      planId
    });
    return response.data;
  },

  // GET /api/v1/payments/history/{userId}
  getHistory: async (userId: number) => {
    const response = await api.get(`/payments/history/${userId}`);
    return response.data;
  }
};