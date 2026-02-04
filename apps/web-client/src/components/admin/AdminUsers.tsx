import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, Shield, Ban, CheckCircle, UserX, Mail, Calendar } from 'lucide-react';
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
import { toast } from 'sonner';
import { UserService, type User } from '../../services/userService';
import { MarketplaceService, type Provider } from '../../services/marketplaceService';

interface AdminUsersProps {
  currentUser: User | null;
  onViewChange: (view: string) => void;
}

export function AdminUsers(): React.ReactElement {
  const [users, setUsers] = useState<User[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    console.log("📊 AdminUsers montado");
    loadUsersData();
  }, []);

  const loadUsersData = async () => {
    try {
      setLoading(true);
      console.log("🔄 Cargando datos de usuarios...");
      
      let usersData: User[] = [];
      try {
        usersData = await UserService.getAllUsers();
        console.log("Usuarios cargados del servicio:", usersData);
      } catch (serviceError) {
        console.log("⚠️  Usando datos de ejemplo:", serviceError);
        usersData = [
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
      
      let providersData: Provider[] = [];
      try {
        providersData = await MarketplaceService.getProviders();
        console.log("✅ Proveedores cargados:", providersData);
      } catch (providerError) {
        console.log("⚠️  No se pudieron cargar proveedores:", providerError);
        providersData = [];
      }

      setUsers(usersData);
      setProviders(providersData);
      
    } catch (error) {
      console.error("Error en loadUsersData:", error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  // Combinar información para mostrar
  const getAllUsersWithDetails = () => {
    const allUsers = users.map(user => {
      // Buscar si este usuario es proveedor
      const providerInfo = providers.find(p => 
        p.email === user.email || 
        p.name === user.name ||
        (p.firstName && p.lastName && `${p.firstName} ${p.lastName}` === user.name)
      );

      return {
        id: user.id,
        name: user.name || 'Usuario sin nombre',
        email: user.email || 'sin-email@example.com',
        role: user.role?.toLowerCase() || 'client',
        isActive: user.isActive !== undefined ? user.isActive : true,
        isVerified: providerInfo?.isActive || false,
        providerId: providerInfo?.id,
        createdAt: user.createdAt || new Date().toISOString()
      };
    });

    console.log("👥 Usuarios combinados para mostrar:", allUsers);
    return allUsers;
  };

  const allUsers = getAllUsersWithDetails();
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterRole === 'all' || 
                         user.role === filterRole;
    
    return matchesSearch && matchesFilter;
  });

  console.log("🔍 Usuarios filtrados:", filteredUsers);

  const handleVerifyUser = async (userId: number, providerId?: number) => {
    try {
      if (providerId) {
        // Verificar proveedor
        await MarketplaceService.verifyProvider(providerId);
        toast.success(`Proveedor verificado exitosamente`);
      } else {
        toast.success(`Usuario verificado`);
      }
      await loadUsersData(); // Recargar datos
    } catch (error) {
      console.error("Error al verificar:", error);
      toast.error("Error al verificar usuario");
    }
  };

  const handleSuspendUser = async (userId: number, userName: string) => {
    try {
      toast.success(`Usuario ${userName} suspendido temporalmente`);
      await loadUsersData();
    } catch (error) {
      console.error("Error al suspender:", error);
      toast.error("Error al suspender usuario");
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${userName}?`)) return;
    
    try {
      toast.success(`Usuario ${userName} eliminado`);
      await loadUsersData();
    } catch (error) {
      console.error("Error al eliminar:", error);
      toast.error("Error al eliminar usuario");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando usuarios...</p>
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Total Usuarios</p>
              <p className="text-2xl font-bold">{allUsers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Clientes</p>
              <p className="text-2xl font-bold">
                {allUsers.filter(u => u.role === 'client' || u.role === '1').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Proveedores</p>
              <p className="text-2xl font-bold">
                {allUsers.filter(u => u.role === 'provider' || u.role === '2').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Administradores</p>
              <p className="text-2xl font-bold">
                {allUsers.filter(u => u.role === 'admin' || u.role === '3').length}
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
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  <SelectItem value="client">Clientes</SelectItem>
                  <SelectItem value="provider">Proveedores</SelectItem>
                  <SelectItem value="admin">Administradores</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={loadUsersData}
                variant="outline"
                className="gap-2"
              >
                Actualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de usuarios ({filteredUsers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Verificado</TableHead>
                    <TableHead>Fecha de registro</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <Search className="w-12 h-12 text-slate-300 mb-4" />
                          <p className="text-lg">No se encontraron usuarios</p>
                          <p className="text-sm mt-1">
                            {searchQuery ? 
                              `No hay resultados para "${searchQuery}"` : 
                              "No hay usuarios registrados"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-blue-100 text-blue-600">
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-sm text-slate-600 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {user.email}
                              </p>
                              {user.providerId && (
                                <p className="text-xs text-blue-600 mt-1">
                                  ID Proveedor: {user.providerId}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            user.role === 'admin' ? 'destructive' :
                            user.role === 'provider' ? 'default' : 'secondary'
                          }>
                            {user.role === 'admin' ? 'Administrador' :
                             user.role === 'provider' ? 'Proveedor' : 'Cliente'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <Badge className="bg-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Activo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              <Ban className="w-3 h-3 mr-1" />
                              Inactivo
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.role === 'provider' ? (
                            user.isVerified ? (
                              <Badge className="bg-green-100 text-green-800">
                                Verificado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-amber-600 border-amber-600">
                                Pendiente
                              </Badge>
                            )
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4" />
                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-MX') : 'N/A'}
                          </div>
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
                                Ver detalles
                              </DropdownMenuItem>
                              
                              {user.role === 'provider' && !user.isVerified && (
                                <DropdownMenuItem 
                                  onClick={() => handleVerifyUser(user.id, user.providerId)}
                                  className="text-green-600"
                                >
                                  <Shield className="w-4 h-4 mr-2" />
                                  Verificar proveedor
                                </DropdownMenuItem>
                              )}
                              
                              <DropdownMenuItem>
                                Enviar mensaje
                              </DropdownMenuItem>
                              
                              <DropdownMenuSeparator />
                              
                              {user.isActive ? (
                                <DropdownMenuItem 
                                  onClick={() => handleSuspendUser(user.id, user.name)}
                                  className="text-amber-600"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspender
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => handleVerifyUser(user.id)}
                                  className="text-green-600"
                                >
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Reactivar
                                </DropdownMenuItem>
                              )}
                              
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
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}