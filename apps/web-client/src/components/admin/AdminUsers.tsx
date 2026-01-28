import { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Shield, Ban, CheckCircle, UserX } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { UserService, type User } from '../../services/userService';
import { toast } from 'sonner';

interface AdminUsersProps {
  onViewChange: (view: string) => void;
}

interface ExtendedUser extends User {
  avatar?: string;
  rating?: number;
  reviewCount?: number;
  joinDate?: string;
  status: 'active' | 'pending' | 'verified';
}

export function AdminUsers({ onViewChange }: AdminUsersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await UserService.getAllUsers();
      
      // Transformar datos para la vista
      const extendedUsers: ExtendedUser[] = usersData.map(user => ({
        ...user,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
        rating: user.role === 'provider' ? 4.5 : undefined,
        reviewCount: user.role === 'provider' ? 25 : undefined,
        joinDate: new Date(Date.now() - Math.random() * 10000000000).toISOString().split('T')[0],
        status: user.isActive ? (user.role === 'provider' ? 'verified' : 'active') : 'pending',
      }));

      setUsers(extendedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'client' && user.role === 'client') ||
                         (filterType === 'provider' && user.role === 'provider');
    return matchesSearch && matchesFilter;
  });

  const handleVerifyUser = async (userId: number, userName: string) => {
    try {
      // Aquí deberías llamar al endpoint de verificación del backend
      // await api.patch(`/users/${userId}/verify`, { verified: true });
      
      // Actualizar estado local
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isActive: true, status: 'verified' as const }
          : user
      ));
      
      toast.success(`Usuario ${userName} verificado`);
    } catch (error) {
      toast.error('Error al verificar usuario');
    }
  };

  const handleSuspendUser = async (userId: number, userName: string) => {
    try {
      // Aquí deberías llamar al endpoint de suspensión del backend
      // await api.patch(`/users/${userId}/suspend`, { suspended: true });
      
      // Actualizar estado local
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, isActive: false }
          : user
      ));
      
      toast.error(`Usuario ${userName} suspendido`);
    } catch (error) {
      toast.error('Error al suspender usuario');
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario ${userName}?`)) {
      try {
        // Aquí deberías llamar al endpoint de eliminación del backend
        // await api.delete(`/users/${userId}`);
        
        // Actualizar estado local
        setUsers(users.filter(user => user.id !== userId));
        
        toast.error(`Usuario ${userName} eliminado`);
      } catch (error) {
        toast.error('Error al eliminar usuario');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Gestión de Usuarios</h1>
          <p className="text-slate-600">Administra clientes y proveedores de la plataforma</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={loadUsers}
          >
            Actualizar lista
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Total Usuarios</p>
              <p className="text-2xl font-bold">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Clientes</p>
              <p className="text-2xl font-bold">
                {users.filter(u => u.role === 'client').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Proveedores</p>
              <p className="text-2xl font-bold">
                {users.filter(u => u.role === 'provider').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Verificados</p>
              <p className="text-2xl font-bold">
                {users.filter(u => u.status === 'verified').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  <SelectItem value="client">Solo clientes</SelectItem>
                  <SelectItem value="provider">Solo proveedores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de usuarios ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-600">No se encontraron usuarios</p>
                {searchQuery && (
                  <Button 
                    variant="link" 
                    onClick={() => setSearchQuery('')}
                    className="mt-2"
                  >
                    Limpiar búsqueda
                  </Button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Fecha de registro</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar} alt={user.name} />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-slate-600">{user.email}</p>
                              {user.role === 'provider' && user.rating && (
                                <p className="text-xs text-amber-600">
                                  {user.rating} ★ • {user.reviewCount} reseñas
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'provider' ? 'default' : 'secondary'}>
                            {user.role === 'provider' ? 'Proveedor' : 
                             user.role === 'admin' ? 'Administrador' : 'Cliente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.status === 'verified' && (
                            <Badge className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                          {user.status === 'pending' && (
                            <Badge variant="outline" className="text-amber-600 border-amber-600">
                              Pendiente
                            </Badge>
                          )}
                          {user.status === 'active' && (
                            <Badge variant="outline">Activo</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.joinDate ? new Date(user.joinDate).toLocaleDateString('es-MX', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }) : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                Ver perfil
                              </DropdownMenuItem>
                              {user.role === 'provider' && user.status !== 'verified' && (
                                <DropdownMenuItem 
                                  onClick={() => handleVerifyUser(user.id, user.name)}
                                  className="text-green-600"
                                >
                                  <Shield className="w-4 h-4 mr-2" />
                                  Verificar
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                Enviar mensaje
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleSuspendUser(user.id, user.name)}
                                className="text-amber-600"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                {user.isActive ? 'Suspender' : 'Activar'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteUser(user.id, user.name)}
                                className="text-red-600"
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}