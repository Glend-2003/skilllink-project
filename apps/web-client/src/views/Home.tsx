import React, { useEffect, useState } from 'react';
import {  useNavigate } from 'react-router-dom';
import { Search as SearchIcon, Wrench, Zap, Scissors, Car, Palette, Home as HomeIcon, Paintbrush, Hammer, Star, MapPin, Verified } from 'lucide-react';
import { API_BASE_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import ServiceImageBg from '../components/ServiceImageBg';
import ServiceDistance from '../components/ServiceDistance';
import ServiceRatingFromReviews from '../components/ServiceRatingFromReviews';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { toast } from 'sonner';
import './Home.css';

interface Category {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  iconUrl?: string;
  isActive: boolean;
  displayOrder?: number;
  serviceCount?: number;
}

interface Provider {
  id?: string;
  serviceId: number;
  providerId: number;
  serviceTitle: string;
  serviceDescription: string;
  basePrice: string;
  priceType: string;
  isActive: boolean;
  isVerified: boolean;
  category: string | { categoryId: number; categoryName: string };
  provider: {
    providerId: number;
    businessName: string;
    businessDescription: string;
    yearsExperience: number;
    isVerified: boolean;
    user?: { userId: number; profileImageUrl?: string; email: string };
  };
  rating?: number;
  location?: string;
}

const CATEGORY_ICONS: { [key: string]: { icon: React.ComponentType<any>; color: string } } = {
  'Plomería': { icon: Wrench, color: '#3B82F6' },
  'Electricista': { icon: Zap, color: '#F59E0B' },
  'Electricidad': { icon: Zap, color: '#F59E0B' },
  'Técnico': { icon: Hammer, color: '#8B5CF6' },
  'Carpintería': { icon: Hammer, color: '#8B5CF6' },
  'Barbería': { icon: Scissors, color: '#06B6D4' },
  'Limpieza': { icon: HomeIcon, color: '#06B6D4' },
  'Mecánica': { icon: Car, color: '#EF4444' },
  'Jardinería': { icon: Palette, color: '#84CC16' },
  'Pintura': { icon: Paintbrush, color: '#EC4899' },
  'Diseño': { icon: Palette, color: '#EC4899' },
  'Tecnología': { icon: Wrench, color: '#10B981' },
};

const getIconForCategory = (categoryName: string) => {
  return CATEGORY_ICONS[categoryName] || { icon: Wrench, color: '#6B7280' };
};

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeRole, isAdmin } = useRole();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        let categoriesData = [];
        try {
          console.log('Intentando cargar categorías desde:', `${API_BASE_URL}/api/v1/categories`);
          const categoriesResponse = await fetch(`${API_BASE_URL}/api/v1/categories`);
          if (categoriesResponse.ok) {
            categoriesData = await categoriesResponse.json();
            console.log('Categorías cargadas exitosamente:', categoriesData);
          } else {
            console.warn('Error en /api/v1/categories:', categoriesResponse.status);
            const altResponse = await fetch(`${API_BASE_URL}/categories`);
            if (altResponse.ok) {
              categoriesData = await altResponse.json();
              console.log('Categorías cargadas desde endpoint alternativo:', categoriesData);
            }
          }
        } catch (err) {
          console.error('Error al cargar categorías:', err);
        }
        
        setCategories(Array.isArray(categoriesData) ? categoriesData.filter((cat: Category) => cat.isActive) : []);

        const servicesResponse = await fetch(`${API_BASE_URL}/api/v1/services`);
        const servicesData = await servicesResponse.json();
        setAllProviders(Array.isArray(servicesData) ? servicesData : []);
        setFilteredProviders(Array.isArray(servicesData) ? servicesData : []);
        if (Array.isArray(servicesData) && servicesData.length > 0) {
          const featured = [...servicesData]
            .filter(s => s.isVerified)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 4);
          setFeaturedServices(featured);
        }
      } catch (e) {
        console.error('Error loading data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = allProviders;

    if (selectedCategory) {
      filtered = filtered.filter(p => {
        if (typeof p.category === 'string') return p.category === selectedCategory;
        return p.category.categoryName === selectedCategory;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.serviceDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProviders(filtered);
  }, [selectedCategory, allProviders, searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  const handleViewProvider = (service: Provider) => {
    console.log('Home - handleViewProvider - service data:', service);
    console.log('Home - provider:', service.provider);
    console.log('Home - provider.user:', service.provider?.user);
    
    // First try to get userId from provider.user.userId
    const userId = service.provider?.user?.userId;
    // Fallback to providerId if userId not available
    const providerId = service.provider?.providerId;
    
    const idToUse = userId || providerId;
    
    console.log('Home - userId:', userId, 'providerId:', providerId, 'Using:', idToUse);
    
    if (idToUse) {
      // Save provider data to localStorage to avoid backend API calls
      const providerData = {
        userId: userId,  // Add userId explicitly
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
      console.error('Home - No valid ID found in service.provider:', service);
    }
  };

  const handleContactProvider = async (e: React.MouseEvent, service: Provider) => {
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
      toast.error('No se pudo iniciar la conversación');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20 md:pb-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-4 md:px-6 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          

          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {activeRole === 'provider' ? (
              <>Gestiona tus servicios<br />y solicitudes</>
            ) : (
              <>Encuentra el profesional<br />que necesitas</>
            )}
          </h1>
          <p className="text-lg md:text-xl mb-6 text-blue-50">
            {activeRole === 'provider' 
              ? 'Panel de control para proveedores de servicios'
              : 'Conecta con expertos locales verificados cerca de ti'
            }
          </p>
          
          {/* Search Bar */}
          {activeRole !== 'provider' && (
            <div className="bg-white rounded-lg p-2 flex gap-2 shadow-lg max-w-2xl">
              <Input 
                placeholder="¿Qué servicio necesitas?"
                className="border-0 focus-visible:ring-0 text-slate-900"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button 
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <SearchIcon className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {isAdmin ? (
          /* Admin View - Panel de Administrador */
          <div className="admin-dashboard">
            <h2 className="text-2xl font-bold mb-6">Panel de Administrador</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105" 
                onClick={() => navigate('/admin/categories-management')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📂</span>
                  </div>
                  <h3 className="font-bold mb-2">Categorías</h3>
                  <p className="text-sm text-slate-600">Gestiona las categorías de servicios</p>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105" 
                onClick={() => navigate('/admin/provider-requests')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✋</span>
                  </div>
                  <h3 className="font-bold mb-2">Solicitudes de Proveedores</h3>
                  <p className="text-sm text-slate-600">Revisa y aprueba solicitudes</p>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105" 
                onClick={() => navigate('/admin/services-approval')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✅</span>
                  </div>
                  <h3 className="font-bold mb-2">Aprobación de Servicios</h3>
                  <p className="text-sm text-slate-600">Revisa y aprueba nuevos servicios</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : activeRole === 'provider' ? (
          /* Provider View - Solo para proveedores aprobados */
          <div className="provider-dashboard">
            <h2 className="text-2xl font-bold mb-6">Panel de Proveedor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105" 
                onClick={() => navigate('/provider/services')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📋</span>
                  </div>
                  <h3 className="font-bold mb-2">Mis Servicios</h3>
                  <p className="text-sm text-slate-600">Gestiona los servicios que ofreces</p>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105" 
                onClick={() => navigate('/my-requests')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">📬</span>
                  </div>
                  <h3 className="font-bold mb-2">Solicitudes</h3>
                  <p className="text-sm text-slate-600">Revisa solicitudes de clientes</p>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105" 
                onClick={() => navigate('/provider/edit-profile')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">✏️</span>
                  </div>
                  <h3 className="font-bold mb-2">Editar Perfil</h3>
                  <p className="text-sm text-slate-600">Actualiza tu información</p>
                </CardContent>
              </Card>
              
              <Card 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105" 
                onClick={() => navigate('/chat')}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">💬</span>
                  </div>
                  <h3 className="font-bold mb-2">Mensajes</h3>
                  <p className="text-sm text-slate-600">Chat con tus clientes</p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* Client View */
          <>
            {/* Categories */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Categorías populares</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories.slice(0, 6).map(category => {
                  const iconConfig = getIconForCategory(category.categoryName);
                  const IconComponent = iconConfig.icon;
                  const isSelected = selectedCategory === category.categoryName;
                  
                  return (
                    <Card 
                      key={category.categoryId}
                      className={`cursor-pointer hover:shadow-lg transition-all hover:scale-105 ${
                        isSelected ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleCategoryClick(category.categoryName)}
                    >
                      <CardContent className="p-6 text-center">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                          style={{ backgroundColor: iconConfig.color + '20' }}
                        >
                          <IconComponent 
                            className="w-6 h-6" 
                            style={{ color: iconConfig.color }}
                          />
                        </div>
                        <p className="font-medium text-sm">{category.categoryName}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Featured Providers */}
            {!selectedCategory && featuredServices.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Proveedores destacados</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/search')}
                    className="text-blue-600"
                  >
                    Ver todos →
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredServices.map((service) => {
                    const categoryName = typeof service.category === 'string' 
                      ? service.category 
                      : service.category?.categoryName || 'Sin categoría';
                    
                    return (
                      <Card 
                        key={service.serviceId}
                        className="cursor-pointer hover:shadow-xl transition-all"
                        onClick={() => handleViewProvider(service)}
                      >
                        <CardContent className="p-0">
                          <div className="relative h-48 rounded-t-lg overflow-hidden">
                            <ServiceImageBg serviceId={service.serviceId} />
                            {service.isVerified && (
                              <Badge className="absolute top-3 right-3 bg-blue-600 z-10">
                                <Verified className="w-3 h-3 mr-1" />
                                Verificado
                              </Badge>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <div className="flex items-start gap-3 mb-3">
                              <Avatar>
                                <AvatarImage src={service.provider?.user?.profileImageUrl} alt={service.serviceTitle} />
                                <AvatarFallback>{service.serviceTitle.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">{service.serviceTitle}</h3>
                                <p className="text-sm text-slate-600">{categoryName}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between text-sm mb-3">
                              <ServiceRatingFromReviews providerId={service.provider?.providerId} />
                              <ServiceDistance service={service} />
                            </div>
                            
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                              {service.serviceDescription}
                            </p>
                            
                            <div className="mt-3 pt-3 border-t flex items-center justify-between">
                              <div>
                                <span className="text-sm text-slate-600">Desde </span>
                                <span className="text-lg font-bold text-slate-900">${service.basePrice}</span>
                              </div>
                              <Button 
                                size="sm"
                                variant="outline"
                                onClick={(e) => handleContactProvider(e, service)}
                              >
                                💬 Contactar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}

            {/* All Services (when category is selected) */}
            {selectedCategory && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{selectedCategory}</h2>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedCategory(null)}
                    className="text-blue-600"
                  >
                    Ver todas las categorías
                  </Button>
                </div>
                {filteredProviders.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredProviders.map(service => {
                      const categoryName = typeof service.category === 'string' 
                        ? service.category 
                        : service.category?.categoryName || 'Sin categoría';
                      
                      return (
                        <Card 
                          key={service.serviceId}
                          className="cursor-pointer hover:shadow-xl transition-all"
                          onClick={() => handleViewProvider(service)}
                        >
                          <CardContent className="p-0">
                            <div className="relative h-48 rounded-t-lg overflow-hidden">
                              <ServiceImageBg serviceId={service.serviceId} />
                              {service.isVerified && (
                                <Badge className="absolute top-3 right-3 bg-blue-600 z-10">
                                  <Verified className="w-3 h-3 mr-1" />
                                  Verificado
                                </Badge>
                              )}
                            </div>
                            
                            <div className="p-4">
                              <div className="flex items-start gap-3 mb-3">
                                <Avatar>
                                  <AvatarImage src={service.provider?.user?.profileImageUrl} alt={service.serviceTitle} />
                                  <AvatarFallback>{service.serviceTitle.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold truncate">{service.serviceTitle}</h3>
                                  <p className="text-sm text-slate-600">{categoryName}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between text-sm mb-3">
                                <ServiceRatingFromReviews providerId={service.provider?.providerId} />
                                <ServiceDistance service={service} />
                              </div>
                              
                              <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                                {service.serviceDescription}
                              </p>
                              
                              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                                <div>
                                  <span className="text-sm text-slate-600">Desde </span>
                                  <span className="text-lg font-bold text-slate-900">${service.basePrice}</span>
                                </div>
                                <Button 
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => handleContactProvider(e, service)}
                                >
                                  💬 Contactar
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="p-12 text-center">
                    <div className="text-slate-400 mb-4">
                      <SearchIcon className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="font-bold text-lg mb-2">No se encontraron servicios</h3>
                    <p className="text-slate-600">Intenta con otra categoría</p>
                  </Card>
                )}
              </section>
            )}

            {/* Benefits Section */}
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
          </>
        )}
      </div>
    </div>
  );
}
