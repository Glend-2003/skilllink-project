import { useState } from 'react';
import { Search, SlidersHorizontal, MapPin, Star, Verified, Map } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';
import { mockProviders, categoryNames } from '../../data/mockData';
import { ServiceCategory } from '../../types';

interface SearchProvidersProps {
  onViewChange: (view: string) => void;
  onProviderSelect: (providerId: string) => void;
}

export function SearchProviders({ onViewChange, onProviderSelect }: SearchProvidersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState([5]);
  const [minRating, setMinRating] = useState([0]);
  const [showMap, setShowMap] = useState(false);

  const filteredProviders = mockProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         categoryNames[provider.category].toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || provider.category === selectedCategory;
    const matchesDistance = provider.distance <= maxDistance[0];
    const matchesRating = provider.rating >= minRating[0];
    
    return matchesSearch && matchesCategory && matchesDistance && matchesRating;
  });

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <Label className="mb-3 block">Categoría</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Todas las categorías" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {Object.entries(categoryNames).map(([key, name]) => (
              <SelectItem key={key} value={key}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="mb-3 block">Distancia máxima: {maxDistance[0]} km</Label>
        <Slider
          value={maxDistance}
          onValueChange={setMaxDistance}
          max={20}
          min={1}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <Label className="mb-3 block">Calificación mínima: {minRating[0]} ⭐</Label>
        <Slider
          value={minRating}
          onValueChange={setMinRating}
          max={5}
          min={0}
          step={0.5}
          className="mt-2"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-[57px] md:top-[73px] z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Buscar servicios o profesionales..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Mobile Filters */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                  <SheetDescription>
                    Refina tu búsqueda
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel />
                </div>
              </SheetContent>
            </Sheet>

            <Button 
              variant="outline"
              onClick={() => setShowMap(!showMap)}
              className="gap-2"
            >
              <Map className="w-5 h-5" />
              <span className="hidden md:inline">{showMap ? 'Lista' : 'Mapa'}</span>
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>{filteredProviders.length} proveedores encontrados</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex gap-6">
          {/* Desktop Filters */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filtros
                </h3>
                <FilterPanel />
              </CardContent>
            </Card>
          </aside>

          {/* Results */}
          <div className="flex-1">
            {showMap ? (
              <Card className="h-[600px] bg-slate-100 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <Map className="w-16 h-16 mx-auto mb-4" />
                  <p>Vista de mapa con {filteredProviders.length} proveedores</p>
                  <p className="text-sm mt-2">La funcionalidad de mapa requiere integración con Google Maps API</p>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((provider) => (
                  <Card
                    key={provider.id}
                    className="cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => {
                      onProviderSelect(provider.id);
                      onViewChange('provider-detail');
                    }}
                  >
                    <CardContent className="p-0">
                      <div className="relative h-40">
                        <img
                          src={provider.gallery[0] || provider.avatar}
                          alt={provider.name}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                        {provider.verified && (
                          <Badge className="absolute top-2 right-2 bg-blue-600">
                            <Verified className="w-3 h-3 mr-1" />
                            Verificado
                          </Badge>
                        )}
                        {provider.isAvailable ? (
                          <Badge className="absolute top-2 left-2 bg-green-600">
                            Disponible
                          </Badge>
                        ) : (
                          <Badge className="absolute top-2 left-2 bg-slate-600">
                            No disponible
                          </Badge>
                        )}
                      </div>

                      <div className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={provider.avatar} alt={provider.name} />
                            <AvatarFallback>{provider.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{provider.name}</h3>
                            <p className="text-sm text-slate-600">{categoryNames[provider.category]}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm mb-3">
                          <div className="flex items-center gap-1 text-amber-600">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="font-medium">{provider.rating}</span>
                            <span className="text-slate-400">({provider.reviewCount})</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-600">
                            <MapPin className="w-4 h-4" />
                            <span>{provider.distance} km</span>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {provider.description}
                        </p>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-sm text-slate-600">
                            Desde <span className="text-lg font-bold text-slate-900">${provider.services[0].price}</span>
                          </span>
                          <Button size="sm">Ver perfil</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredProviders.length === 0 && (
              <Card className="p-12 text-center">
                <div className="text-slate-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="font-bold text-lg mb-2">No se encontraron proveedores</h3>
                <p className="text-slate-600">Intenta ajustar tus filtros de búsqueda</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
