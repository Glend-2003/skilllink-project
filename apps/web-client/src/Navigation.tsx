import { MessageCircle, History, LayoutDashboard, Settings, LogOut, Home, Search, UserIcon } from 'lucide-react';
import { Button } from './components/ui/button';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Switch } from './components/ui/switch';
import { Label } from './components/ui/label';
import type { UserMode } from './types/index';
import type { User } from './services/userService';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userMode: UserMode;
  onModeChange: (mode: UserMode) => void;
  currentUser: User | null;
}

export function Navigation({ currentView, onViewChange, userMode, onModeChange, currentUser }: NavigationProps) {
  const isProvider = userMode === 'provider';

  const clientMenuItems = [
    { id: 'home', label: 'Inicio', icon: Home },
    { id: 'search', label: 'Buscar', icon: Search },
    { id: 'chat', label: 'Mensajes', icon: MessageCircle },
    { id: 'history', label: 'Historial', icon: History },
  ];

  const providerMenuItems = [
    { id: 'provider-dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'provider-profile', label: 'Mi Perfil', icon: UserIcon },
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
            {/*<AvatarImage src={currentUser.avatar} alt={currentUser.name} />*/}
            <AvatarFallback>{currentUser?.name?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
        </div>
      </nav>
    </>
  );
}