import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  isActive?: boolean;
}

export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    userType: string;
  };
}

export const UserService = {
  getMyProfile: async () => {
    const response = await api.get('/api/v1/users/profile');
    return response.data;
  },

  getUserById: async (id: number) => {
    const response = await api.get(`/api/v1/users/${id}`);
    return response.data;
  },

  createProfile: async (profileData: any) => {
    const response = await api.post('/api/v1/users/profile', profileData);
    return response.data;
  },

  updateProfile: async (profileData: any) => {
    const response = await api.patch('/api/v1/users/profile', profileData);
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/api/v1/users/allUsers'); 
    return response.data;
  },
};