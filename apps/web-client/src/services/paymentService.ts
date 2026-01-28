import { api } from './api';

export interface Plan {
  id: number;
  name: string;
  price: number;
  features: string[];
}

export const PaymentService = {
  getPlans: async () => {
  },

  subscribe: async (planId: number) => {
    const response = await api.post('/payments/subscribe', { planId });
    return response.data;
  }
};