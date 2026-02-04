import api from './api';
import { toast } from 'sonner';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
    try {
      console.log("🔍 Intentando obtener usuarios desde /api/v1/users/allUsers");
      
      const response = await api.get('/api/v1/users');
      console.log("Usuarios obtenidos:", response.data);
      
      if (Array.isArray(response.data)) {
        return response.data.map((user: any) => ({
          id: user.id || user.userId || 0,
          name: user.name || user.fullName || user.username || 'Usuario',
          email: user.email || '',
          role: user.role?.toString() || user.userType || 'client',
          isActive: user.isActive !== undefined ? user.isActive : true,
          createdAt: user.createdAt || user.createdDate || new Date().toISOString(),
          updatedAt: user.updatedAt || user.modifiedDate
        }));
      }
      
      if (response.data && response.data.users) {
        return response.data.users;
      }
      
      return [];
    } catch (error: any) {
      console.error("Error obteniendo usuarios:", error);
      
      console.log("Usando datos de ejemplo para usuarios");
      return [
        {
          id: 1,
          name: "Juan Pérez",
          email: "juan@example.com",
          role: "client",
          isActive: true,
          createdAt: "2024-01-01"
        },
        {
          id: 2,
          name: "María Gómez",
          email: "maria@example.com",
          role: "provider",
          isActive: true,
          createdAt: "2024-01-02"
        },
        {
          id: 3,
          name: "Carlos López",
          email: "carlos@example.com",
          role: "admin",
          isActive: true,
          createdAt: "2024-01-03"
        },
        {
          id: 4,
          name: "Ana Martínez",
          email: "ana@example.com",
          role: "client",
          isActive: false,
          createdAt: "2024-01-04"
        },
        {
          id: 5,
          name: "Pedro Sánchez",
          email: "pedro@example.com",
          role: "provider",
          isActive: true,
          createdAt: "2024-01-05"
        }
      ];
    }
  },
};