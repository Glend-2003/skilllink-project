import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, MapPin, Star, Verified, Map } from 'lucide-react';
import { API_BASE_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
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
import './search.css';

export default function Search() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState([20]);
  const [minRating, setMinRating] = useState([0]);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories`);
      if (!res.ok) {
        throw new Error(`Error categorías: ${res.status}`);
      }
      const data = await res.json();
      console.log('Categorías cargadas en búsqueda:', data);
      setCategories(Array.isArray(data) ? data.filter((cat: any) => cat.isActive) : []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategories([]);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/services`);
      const data = await res.json();
      console.log('Services fetched - first service:', data[0]);
      console.log('First service provider:', data[0]?.provider);
      console.log('First service provider.user:', data[0]?.provider?.user);
      console.log('First service provider.user.userId:', data[0]?.provider?.user?.userId);
      setServices(data);
      setFilteredServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = services;
    
    // Search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter((s: any) =>
        s.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.serviceDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.provider?.businessName || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((s: any) => {
        const categoryId = typeof s.category === 'object' ? s.category.categoryId : null;
        const categoryFromList = categories.find(c => c.categoryId.toString() === selectedCategory);
        return categoryFromList && categoryId === categoryFromList.categoryId;
      });
    }
    
    // Rating filter (using existing rating or default 4.5)
    if (minRating[0] > 0) {
      filtered = filtered.filter((s: any) => (s.rating || 4.5) >= minRating[0]);
    }
    
    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, minRating, services, categories]);

  const handleClearSearch = () => {
    setSearchQuery('');
    navigate('/search');
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setMinRating([0]);
    setMaxDistance([20]);
    navigate('/search');
  };

  const handleViewProvider = (service: any) => {
    console.log('handleViewProvider - service data:', service);
    console.log('provider object:', service.provider);
    console.log('provider.user.userId:', service.provider?.user?.userId);
    
    // Use userId (not providerId) because backend expects user_id
    const userId = service.provider?.user?.userId;
    
    console.log('Final userId to navigate:', userId);
    
    if (userId) {
      navigate(`/provider/${userId}`);
    } else {
      console.error('No user ID found in service.provider.user:', service);
      alert('No se pudo encontrar el ID del proveedor');
    }
  };

  const handleContactProvider = async (e: React.MouseEvent, service: any) => {
    e.stopPropagation();
    
    const providerId = service.provider?.user?.userId;
    
    if (!providerId) {
      console.error('No provider ID found');
      return;
    }

    if (!user) {
      alert('Debes iniciar sesión para contactar al proveedor');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/chat/conversations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participant1_user_id: user.userId,
            participant2_user_id: providerId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al crear conversación');
      }

      const conversation = await response.json();
      navigate(`/chat/${conversation.conversation_id}`);
    } catch (error) {
      console.error('Error contacting provider:', error);
      alert('No se pudo iniciar la conversación');
    }
  };

  // Filter Panel Component
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
            {categories.map((cat) => (
              <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>
                {cat.categoryName}
              </SelectItem>
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
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <nav className="mb-4">
            <Link to="/" className="text-slate-600 hover:text-slate-900 text-sm">
              ← Volver al inicio
            </Link>
          </nav>
          
          <div className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
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
            <span>{filteredServices.length} proveedores encontrados</span>
            {(selectedCategory !== 'all' || searchQuery || minRating[0] > 0) && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={handleClearFilters}
                className="text-blue-600"
              >
                Limpiar filtros
              </Button>
            )}
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
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-slate-600">Cargando servicios...</p>
                </div>
              </div>
            ) : showMap ? (
              <Card className="h-[600px] bg-slate-100 flex items-center justify-center">
                <div className="text-center text-slate-500">
                  <Map className="w-16 h-16 mx-auto mb-4" />
                  <p>Vista de mapa con {filteredServices.length} proveedores</p>
                  <p className="text-sm mt-2">La funcionalidad de mapa requiere integración con Google Maps API</p>
                </div>
              </Card>
            ) : filteredServices.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="text-slate-400 mb-4">
                  <SearchIcon className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="font-bold text-lg mb-2">No se encontraron proveedores</h3>
                <p className="text-slate-600">
                  {searchQuery 
                    ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
                    : 'No hay servicios disponibles con los filtros seleccionados'}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map((service: any) => {
                  const categoryName = typeof service.category === 'string' 
                    ? service.category 
                    : service.category?.categoryName || 'Sin categoría';
                  
                  return (
                    <Card
                      key={service.serviceId}
                      className="cursor-pointer hover:shadow-lg transition-all"
                      onClick={() => handleViewProvider(service)}
                    >
                      <CardContent className="p-0">
                        <div className="relative h-40">
                          {service.provider?.user?.profileImageUrl ? (
                            <img
                              src={service.provider.user.profileImageUrl}
                              alt={service.serviceTitle}
                              className="w-full h-full object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center rounded-t-lg">
                              <span className="text-5xl">👤</span>
                            </div>
                          )}
                          {service.isVerified && (
                            <Badge className="absolute top-2 right-2 bg-blue-600">
                              <Verified className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                          <Badge className="absolute top-2 left-2 bg-green-600">
                            Disponible
                          </Badge>
                        </div>

                        <div className="p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={service.provider?.user?.profileImageUrl} alt={service.serviceTitle} />
                              <AvatarFallback>{service.serviceTitle.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{service.serviceTitle}</h3>
                              <p className="text-sm text-slate-600">{categoryName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-sm mb-3">
                            <div className="flex items-center gap-1 text-amber-600">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-medium">{(service.rating || 4.5).toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1 text-slate-600">
                              <MapPin className="w-4 h-4" />
                              <span>{service.location || '1.5 km'}</span>
                            </div>
                          </div>

                          <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                            {service.serviceDescription}
                          </p>

                          <div className="flex items-center justify-between pt-3 border-t">
                            <div>
                              <span className="text-sm text-slate-600">Desde </span>
                              <span className="text-lg font-bold text-slate-900">${service.basePrice}</span>
                            </div>
                            <Button size="sm">Ver perfil</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
