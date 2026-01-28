import api from './api'; // Asegúrate de que la ruta sea correcta hacia tu configuración de axios

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  isActive?: boolean;
}

export const UserService = {
  // --- MÉTODOS EXISTENTES (Basados en tu controlador) ---

  // Obtener mi propio perfil (GET /api/v1/users/profile)
  getMyProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Obtener perfil por ID (GET /api/v1/users/{id})
  getUserById: async (id: number) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Crear perfil (POST /api/v1/users/profile)
  createProfile: async (profileData: any) => {
    const response = await api.post('/users/profile', profileData);
    return response.data;
  },

  // Actualizar perfil (PATCH /api/v1/users/profile)
  updateProfile: async (profileData: any) => {
    const response = await api.patch('/users/profile', profileData);
    return response.data;
  },

  // --- NUEVO MÉTODO (EL QUE TE FALTA) ---
  
  // Obtener TODOS los usuarios para el Admin
  getAllUsers: async (): Promise<User[]> => {
    try {
      // Intentamos llamar al backend por si Glend ya creó el endpoint
      const response = await api.get('/users'); 
      return response.data;
    } catch (error) {
      console.warn("Endpoint /users no encontrado o falló. Usando datos de prueba temporales.");
      
      return [
        { id: 1, name: 'Daisy Admin', email: 'admin@skilllink.com', role: 'admin', isActive: true },
        { id: 2, name: 'Juan Proveedor', email: 'juan@taller.com', role: 'provider', isActive: true },
        { id: 3, name: 'Ana Cliente', email: 'ana@gmail.com', role: 'client', isActive: true },
        { id: 4, name: 'Carlos Plomero', email: 'carlos@fix.com', role: 'provider', isActive: false },
        { id: 5, name: 'Maria Diseño', email: 'maria@art.com', role: 'provider', isActive: true },
      ];
    }
  }
};