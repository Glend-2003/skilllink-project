import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, LogOut } from 'lucide-react'; // Íconos

interface AdminLayoutProps {
  children: ReactNode; // Aquí se inyectará el contenido de cada página (Tabla, Pagos, etc.)
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/admin/users', label: 'Usuarios', icon: <Users size={20} /> },
    { path: '/admin/plans', label: 'Planes y Pagos', icon: <CreditCard size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 1. SIDEBAR (Barra Lateral) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-2xl font-bold text-blue-500">SkillLink</h1>
          <p className="text-xs text-slate-400">Panel Administrativo</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* 2. ÁREA DE CONTENIDO */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white h-16 shadow-sm flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold text-gray-800">Bienvenida, Daisy</h2>
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
            DC
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};