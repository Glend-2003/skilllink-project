import { Menu, User, MessageCircle, History, LayoutDashboard, Settings, LogOut, Home, Search } from 'lucide-react';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './components/ui/avatar';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './components/ui/sheet';
import { useAuth } from "./components/contexts/AuthContext";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userMode: 'client' | 'provider';
  onModeChange: (mode: 'client' | 'provider') => void;
}

export function Navigation({ currentView, onViewChange, userMode, onModeChange }: NavigationProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onViewChange('login');
  };
  
  const clientMenuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'chat', label: 'Mensajes', icon: MessageCircle },
    { id: 'history', label: 'Historial', icon: History },
  ];

  const providerMenuItems = [
    { id: 'provider-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'provider-profile', label: 'Mi Perfil', icon: User },
    { id: 'provider-plans', label: 'Planes', icon: Settings },
  ];

  const menuItems = isProvider ? providerMenuItems : clientMenuItems;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center justify-between px-6 py-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            SkillLink
          </h1>
          <div className="flex gap-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'default' : 'ghost'}
                  onClick={() => onViewChange(item.id)}
                  className="gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-50">
            <Label htmlFor="mode-switch" className="text-sm cursor-pointer">
              {isProvider ? 'Modo Proveedor' : 'Modo Cliente'}
            </Label>
            <Switch
              id="mode-switch"
              checked={isProvider}
              onCheckedChange={(checked) => onModeChange(checked ? 'provider' : 'client')}
            />
          </div>
          <Avatar className="cursor-pointer">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-50">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
          SkillLink
        </h1>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Menú</SheetTitle>
              <SheetDescription>
                Navega por la aplicación
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                <Avatar>
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{currentUser.name}</p>
                  <p className="text-sm text-slate-600">{currentUser.email}</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                <Label htmlFor="mobile-mode-switch" className="text-sm cursor-pointer font-medium">
                  {isProvider ? 'Modo Proveedor' : 'Modo Cliente'}
                </Label>
                <Switch
                  id="mobile-mode-switch"
                  checked={isProvider}
                  onCheckedChange={(checked) => onModeChange(checked ? 'provider' : 'client')}
                />
              </div>

              <div className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={currentView === item.id ? 'default' : 'ghost'}
                      onClick={() => onViewChange(item.id)}
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  );
                })}
              </div>

              <div className="pt-4 border-t space-y-2">
                <Button variant="ghost" className="w-full justify-start gap-2 text-slate-600">
                  <Settings className="w-4 h-4" />
                  Configuración
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-2 text-red-600">
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </>
  );
}