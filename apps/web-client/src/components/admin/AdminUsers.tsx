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
import { toast } from 'sonner';
import type { User } from '../../services/userService';
import { UserService} from '../../services/userService';

interface AdminUsersProps {
  currentUser: User | null;
  onViewChange: (view: string) => void;
}

export function AdminUsers({ currentUser, onViewChange }: AdminUsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
      const loadDashboardData = async () => {
        try {
          setLoading(true);
          
          const userData = await UserService.getAllUsers();
          
          setUsers(userData);
        } catch (error) {
          console.error("Error al cargar datos:", error);
          toast.error("Error al sincronizar con la base de datos");
        } finally {
          setLoading(false);
        }
      };
  
      loadDashboardData();
    }, []);

  // Combine current user and providers for demonstration
  const allUsers = [
    { ...currentUser, type: currentUser?.role, status: currentUser?.isActive},
    ...users.map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      //avatar: p.avatar,
      //type: 'provider',
      status: p.isActive ? 'Activo' : 'Inactivo',
      //joinDate: '2025-12-01',
      //rating: p.rating,
      //reviewCount: p.reviewCount,
    })),
  ];

  const filteredUsers = allUsers.filter(currentUser => {
    const matchesSearch = currentUser.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         currentUser.email?.toLowerCase().includes(searchQuery.toLowerCase());
    //const matchesFilter = filterType === 'all' || currentUser. === filterType;
    return matchesSearch; //&& matchesFilter;
  });

  const handleVerifyUser = (userId: number, userName: string) => {
    toast.success(`Usuario ${userName} verificado`);
  };

  const handleSuspendUser = (userId: number, userName: string) => {
    toast.error(`Usuario ${userName} suspendido`);
  };

  const handleDeleteUser = (userId: number, userName: string) => {
    toast.error(`Usuario ${userName} eliminado`);
  };

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
                {"{allUsers.filter(u => u.type === 'client').length}"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Proveedores</p>
              <p className="text-2xl font-bold">
                {"{allUsers.filter(u => u.type === 'provider').length}"}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-slate-600 mb-1">Verificados</p>
              <p className="text-2xl font-bold">
                {allUsers.filter(u => u.status === 'verified').length}
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
                            {/*<AvatarImage src={user.avatar} alt={user.name} />*/}
                            <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-slate-600">{user.email}</p>
                            {/*{user.type === 'provider' && (
                              <p className="text-xs text-amber-600">
                                {user.rating} ★ • {user.reviewCount} reseñas
                              </p>
                            )}*/}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {/*<Badge variant={user.type === 'provider' ? 'default' : 'secondary'}>
                          {user.type === 'provider' ? 'Proveedor' : 'Cliente'}
                        </Badge>*/}
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
                        {/*{new Date(user.joinDate).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}*/}
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
                            {/*{user.status !== 'verified' && user.type === 'provider' && (
                              <DropdownMenuItem 
                                onClick={() => handleVerifyUser(user.id, user.name)}
                                className="text-green-600"
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Verificar
                              </DropdownMenuItem>
                            )}*/}
                            <DropdownMenuItem>
                              Enviar mensaje
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleSuspendUser(user.id!, user.name!)}
                              className="text-amber-600"
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Suspender
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id!, user.name!)}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
