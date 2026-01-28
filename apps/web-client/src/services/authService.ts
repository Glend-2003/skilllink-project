import api from './api';

export const AuthService = {
  // POST /api/v1/auth/register
  register: async (userData: any) => {
    const response = await api.post('/api/v1/auth/register', userData);
    return response.data;
  },
  
  // POST /api/v1/auth/login
  login: async (credentials: any) => {
    const response = await api.post('/api/v1/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // Opcional: otros métodos de auth
  logout: async () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/v1/auth/profile');
    return response.data;
  }
};