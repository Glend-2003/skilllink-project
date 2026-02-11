import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, MapPin, Star, Verified, Map } from 'lucide-react';
import { API_BASE_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import ServiceImageBg from '../components/ServiceImageBg';
import ServiceDistance from '../components/ServiceDistance';
import ServiceRatingFromReviews from '../components/ServiceRatingFromReviews';
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

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function Search() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [maxDistance, setMaxDistance] = useState([20]);
  const [minRating, setMinRating] = useState([0]);
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  // New: Handle location toggle
  const handleLocationToggle = async () => {
    if (useLocation) {
      setUseLocation(false);
      setUserLocation(null);
    } else {
      setLoadingLocation(true);
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setUserLocation({
                lat: position.coords.latitude,
                lon: position.coords.longitude,
              });
              setUseLocation(true);
            },
            (error) => {
              console.error('Error getting location:', error);
              toast.error('No se pudo acceder a tu ubicación. Verifica los permisos del navegador.');
            }
          );
        } else {
          toast.error('Tu navegador no soporta geolocalización');
        }
      } finally {
        setLoadingLocation(false);
      }
    }
  };

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
    
    // Rating filter
    if (minRating[0] > 0) {
      filtered = filtered.filter((s: any) => (s.rating || 4.5) >= minRating[0]);
    }

    // Location filter
    if (useLocation && userLocation) {
      filtered = filtered.filter((s: any) => {
        const providerLat = s.provider?.latitude;
        const providerLon = s.provider?.longitude;
        
        if (providerLat === undefined || providerLon === undefined || 
            providerLat === null || providerLon === null) {
          return false;
        }
        
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          parseFloat(providerLat),
          parseFloat(providerLon)
        );
        
        return distance <= maxDistance[0];
      });
    }
    
    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, minRating, services, categories, useLocation, userLocation, maxDistance]);

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
    // First try to get userId from provider.user.userId
    const userId = service.provider?.user?.userId;
    // Fallback to providerId if userId not available
    const providerId = service.provider?.providerId;
    
    const idToUse = userId || providerId;
    
    console.log('Final ID to navigate:', idToUse, '(userId:', userId, 'providerId:', providerId + ')');
    
    if (idToUse) {
      // Save provider data to localStorage to avoid backend API calls
      const providerData = {
        providerId: service.provider?.providerId,
        businessName: service.provider?.businessName,
        businessDescription: service.provider?.businessDescription,
        yearsExperience: service.provider?.yearsExperience,
        isVerified: service.provider?.isVerified,
        email: service.provider?.user?.email,
        profileImageUrl: service.provider?.user?.profileImageUrl,
        rating: service.rating,
      };
      localStorage.setItem(`provider_${idToUse}`, JSON.stringify(providerData));
      navigate(`/provider/${idToUse}`);
    } else {
      console.error('No valid ID found:', service);
      toast.error('No se pudo encontrar el ID del proveedor');
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
      toast.warning('Debes iniciar sesión para contactar al proveedor');
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
            recipient_id: providerId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error creating conversation');
      }

      const conversation = await response.json();
      navigate(`/chat/${conversation.conversationId}`);
    } catch (error) {
      console.error('Error contacting provider:', error);
      toast.error('No se pudo crear la conversación');
    }
  };

  // Filter Panel Component
  const FilterPanel = () => (
    <div className="space-y-5">
      {/* Location Filter */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Label className="text-sm font-medium text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-600" />
            Ubicación
          </Label>
          <button
            onClick={handleLocationToggle}
            disabled={loadingLocation}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              useLocation ? 'bg-blue-600' : 'bg-slate-200'
            } ${loadingLocation ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                useLocation ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        {useLocation && userLocation && (
          <div className="text-xs text-slate-600 mb-3 pl-6">
            Tu ubicación está activa
          </div>
        )}
        
        {useLocation && (
          <div className="pl-6 mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-600">Distancia máxima</span>
              <span className="text-sm font-semibold text-slate-900">{maxDistance[0]} km</span>
            </div>
            <Slider
              value={maxDistance}
              onValueChange={setMaxDistance}
              max={50}
              min={1}
              step={1}
            />
          </div>
        )}
      </div>

      <div className="border-t pt-5">
        <Label className="text-sm font-medium text-slate-900 mb-3 block">Categoría</Label>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
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

      <div className="border-t pt-5">
        <div className="flex items-center justify-between mb-2">
          <Label className="text-sm font-medium text-slate-900">Calificación mínima</Label>
          <span className="text-sm font-semibold text-slate-900">{minRating[0]} ⭐</span>
        </div>
        <Slider
          value={minRating}
          onValueChange={setMinRating}
          max={5}
          min={0}
          step={0.5}
          className="mt-3"
        />
      </div>

      {(selectedCategory !== 'all' || minRating[0] > 0 || useLocation) && (
        <div className="border-t pt-5">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearFilters}
            className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          >
            Limpiar filtros
          </Button>
        </div>
      )}
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
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <span className="text-lg">×</span>
                </button>
              )}
            </div>
            
            {/* Mobile Filters */}
            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon" className="relative">
                  <SlidersHorizontal className="w-5 h-5" />
                  {(selectedCategory !== 'all' || minRating[0] > 0 || useLocation) && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                      {[selectedCategory !== 'all', minRating[0] > 0, useLocation].filter(Boolean).length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80">
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
            <span>{filteredServices.length} {filteredServices.length === 1 ? 'proveedor encontrado' : 'proveedores encontrados'}</span>
            {(selectedCategory !== 'all' || searchQuery || minRating[0] > 0 || useLocation) && (
              <span className="text-slate-400">•</span>
            )}
            {(selectedCategory !== 'all' || searchQuery || minRating[0] > 0 || useLocation) && (
              <Button 
                variant="link" 
                size="sm" 
                onClick={handleClearFilters}
                className="h-auto p-0 text-blue-600 hover:text-blue-700"
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
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4" />
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
                        <div className="relative h-40 rounded-t-lg overflow-hidden">
                          <ServiceImageBg serviceId={service.serviceId} />
                          {service.isVerified && (
                            <Badge className="absolute top-2 right-2 bg-blue-600 z-10">
                              <Verified className="w-3 h-3 mr-1" />
                              Verificado
                            </Badge>
                          )}
                          <Badge className="absolute top-2 left-2 bg-green-600 z-10">
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
                            <ServiceRatingFromReviews providerId={service.provider?.providerId} />
                            <ServiceDistance service={service} />
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
