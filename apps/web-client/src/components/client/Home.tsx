import React, { useEffect, useState } from 'react';
import { Search, Wrench, Zap, Scissors, Car, Palette, Home as HomeIcon, Paintbrush, Hammer, Star, MapPin, Verified, LayoutGrid } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MarketplaceService } from '../../services/marketplaceService';

interface HomeProps {
  onViewChange: (view: string) => void;
  onProviderSelect: (providerId: string) => void;
}

const categoryIcons: Record<string, any> = {
  "Fontanería": Wrench,
  "Electricidad": Zap,
  "Barbería": Scissors,
  "Mecánica": Car,
  "Diseño": Palette,
  "Limpieza": HomeIcon,
  "Pintura": Paintbrush,
  "Construcción": Hammer,
};

export function Home({ onViewChange, onProviderSelect }: HomeProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProviders, setFeaturedProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [cats, providers] = await Promise.all([
          MarketplaceService.getCategories(),
          MarketplaceService.getProviders()
        ]);
        console.log("Categorías recibidas:", cats); 
        console.log("Proveedores recibidos:", providers);
        setCategories(cats);
        setFeaturedProviders(providers);
      } catch (error) {
        console.error("Error cargando datos de inicio:", error);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  if (loading) return <div className="p-10 text-center text-blue-600">Cargando SkillLink...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Encuentra el profesional<br />que necesitas
          </h1>
          <p className="text-lg md:text-xl mb-6 text-blue-50">
            Conecta con expertos locales verificados cerca de ti
          </p>
          
          {/* Search Bar */}
          <div className="bg-white rounded-lg p-2 flex gap-2 shadow-lg">
            <Input 
              placeholder="¿Qué servicio necesitas?"
              className="border-0 focus-visible:ring-0 text-slate-900"
            />
            <Button 
              onClick={() => onViewChange('search')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-4 h-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Categorías populares</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.categoryName] || LayoutGrid;
              return (
                <Card 
                  key={cat.categoryId}
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => onViewChange('search')}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="font-medium text-sm">{cat.categoryName}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Featured Providers */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Proveedores destacados</h2>
            <Button 
              variant="ghost" 
              onClick={() => onViewChange('search')}
              className="text-blue-600"
            >
              Ver todos →
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProviders.map((provider) => (
              <Card 
                key={provider.userId}
                className="cursor-pointer hover:shadow-xl transition-all"
                onClick={() => {
                  onProviderSelect(provider.userId);
                  onViewChange('provider-detail');
                }}
              >
                <CardContent className="p-0">
                  <div className="relative h-48">
                    <img 
                      src={provider.bannerImage || "https://via.placeholder.com/400x200"}
                      alt={provider.businessName}
                      className="w-full h-full object-cover rounded-t-lg"
                    />
                    {provider.isVerified && (
                      <Badge className="absolute top-3 right-3 bg-blue-600 text-white">
                        <Verified className="w-3 h-3 mr-1 text-white" />
                        Verificado
                      </Badge>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar>
                        <AvatarImage src={provider.profileImage} alt={provider.businessName} />
                        <AvatarFallback>{provider.businessName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate ">{provider.businessName}</h3>
                        <p className="text-sm text-slate-600">{provider.categoryName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-amber-600">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">{provider.rating || 'N/A'}</span>
                        <span className="text-slate-400">({provider.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-4 h-4" />
                        <span>{provider.location || 'Costa Rica'}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-slate-600">
                        Desde <span className="text-lg font-bold text-slate-900">${provider.basePrice || '0'}</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Verified className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold mb-2">Profesionales verificados</h3>
            <p className="text-slate-600">Todos los proveedores son verificados y evaluados</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold mb-2">Encuentra cerca de ti</h3>
            <p className="text-slate-600">Proveedores locales disponibles en tu zona</p>
          </div>
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-bold mb-2">Reseñas reales</h3>
            <p className="text-slate-600">Lee opiniones de clientes verificados</p>
          </div>
        </section>
      </div>
    </div>
  );
}
