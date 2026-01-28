import { useState, useEffect } from 'react';
import { Search, Filter, Star, MapPin, Clock, ChevronRight, Bell, Menu } from 'lucide-react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
// Conectamos con tu servicio real
import { MarketplaceService } from '../../services/marketplaceService';

interface HomeProps {
  onViewChange: (view: string) => void;
  onProviderSelect: (id: string) => void;
}

export function Home({ onViewChange, onProviderSelect }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Categorías estáticas para mantener el diseño visual de Figma
  const categories = ['Todas', 'Hogar', 'Tecnología', 'Salud', 'Educación', 'Mascotas'];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Llamada a tu API externa a través del servicio
        const data = await MarketplaceService.getProviders();
        setProviders(data);
      } catch (error) {
        console.error("Error al cargar proveedores:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Original de Figma */}
      <div className="bg-white px-4 py-6 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              S
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">SkillLink</h1>
              <p className="text-xs text-slate-500">Encuentra expertos ahora</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-6 h-6 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </Button>
            <Button variant="ghost" size="icon">
              <Menu className="w-6 h-6 text-slate-600" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input 
            placeholder="¿Qué servicio buscas hoy?" 
            className="pl-10 bg-slate-100 border-none h-12 text-base"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 bg-blue-600">
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Listado de Proveedores */}
      <div className="px-4 py-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4 text-left">Proveedores destacados</h2>
        
        {loading ? (
          <div className="flex justify-center py-10">Cargando...</div>
        ) : (
          <div className="grid gap-4">
            {providers.map((provider) => (
              <Card 
                key={provider.id} 
                className="overflow-hidden border-none shadow-md"
                onClick={() => onProviderSelect(provider.id)}
              >
                <CardContent className="p-0">
                  <div className="flex p-4">
                    <Avatar className="w-20 h-20 rounded-xl mr-4 border-2 border-slate-100">
                      <AvatarImage src={provider.avatar} />
                      <AvatarFallback>{provider.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-slate-900 text-lg">{provider.name}</h3>
                          <p className="text-blue-600 font-medium text-sm">{provider.category}</p>
                        </div>
                        <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
                          <span className="text-sm font-bold text-yellow-700">{provider.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50 p-3 flex justify-between items-center">
                  <span className="text-slate-600 text-xs flex items-center">
                    <Clock className="w-4 h-4 mr-1" /> Disponible
                  </span>
                  <span className="text-blue-600 font-bold flex items-center">
                    Ver perfil <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}