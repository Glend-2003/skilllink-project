import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, MessageCircle, Verified, Calendar, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import ServiceGalleryView from '../../components/ServiceGalleryView';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Separator } from '../../ui/separator';
import { toast } from 'sonner';
import './ProviderDetail.css';

interface Provider {
  id?: string;
  providerId?: number;
  name?: string;
  businessName?: string;
  description?: string;
  businessDescription?: string;
  yearsExperience?: number;
  verified?: boolean;
  isVerified?: boolean;
  email?: string;
  profileImageUrl?: string;
  rating?: number;
  reviewCount?: number;
  serviceRadius?: number;
  user?: {
    userId: number;
    profileImageUrl?: string;
    email: string;
  };
  category?: {
    categoryId: number;
    categoryName: string;
  };
}

interface Service {
  serviceId: number;
  serviceTitle: string;
  serviceDescription: string;
  basePrice: number;
  priceUnit: string;
  isActive: boolean;
  category?: {
    categoryName: string;
  };
}

interface Review {
  reviewId: number;
  rating: number;
  comment: string;
  title?: string;
  createdAt: string;
  client?: {
    email: string;
    profileImageUrl?: string;
    image?: string;
  };
  clientEmail?: string;
  email?: string;
  user?: {
    email: string;
    profileImageUrl?: string;
    image?: string;
  };
  userName?: string;
  username?: string;
}

export default function ProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'reviews' | 'gallery' | 'about'>('services');

  useEffect(() => {
    if (id) {
      // Try to load from localStorage first
      const cachedProvider = localStorage.getItem(`provider_${id}`);
      if (cachedProvider) {
        try {
          const providerData = JSON.parse(cachedProvider);
          setProvider(providerData as Provider);
          
          // Use providerId directly from cache if available
          const actualProviderId = providerData.providerId || id;
          console.log('Loaded from cache, using providerId:', actualProviderId);
          
          // Load services and reviews
          (async () => {
            try {
              let servicesRes = await fetch(`${API_BASE_URL}/api/v1/providers/${actualProviderId}/services`);
              if (!servicesRes.ok && servicesRes.status === 500) {
                console.log('Trying alternative services endpoint...');
                servicesRes = await fetch(`${API_BASE_URL}/api/v1/services/provider/${actualProviderId}`);
              }
              if (servicesRes.ok) {
                const servicesData = await servicesRes.json();
                setServices(Array.isArray(servicesData) ? servicesData.filter((s: Service) => s.isActive) : []);
              }
            } catch (e) {
              console.error('Error loading services:', e);
            }
            
            try {
              const reviewsEndpoints = [
                `${API_BASE_URL}/api/v1/providers/${actualProviderId}/reviews`,
                `${API_BASE_URL}/api/v1/reviews/provider/${actualProviderId}`,
                `${API_BASE_URL}/api/v1/reviews`,
              ];
              
              let reviewsData = null;
              for (const url of reviewsEndpoints) {
                try {
                  const reviewsRes = await fetch(url);
                  if (reviewsRes.ok) {
                    const data = await reviewsRes.json();
                    if (url.includes('/api/v1/reviews') && !url.includes('provider') && !url.includes('providers')) {
                      reviewsData = Array.isArray(data) 
                        ? data.filter((r: any) => r.providerId === actualProviderId || r.provider?.providerId === actualProviderId)
                        : [];
                    } else {
                      reviewsData = data;
                    }
                    console.log('Reviews loaded from:', url);
                    break;
                  }
                } catch (e) {
                  console.error('Error trying reviews endpoint:', url, e);
                }
              }
              
              if (reviewsData) {
                setReviews(Array.isArray(reviewsData) ? reviewsData : []);
              } else {
                console.warn('Could not load reviews from any endpoint');
                setReviews([]);
              }
            } catch (e) {
              console.error('Error loading reviews:', e);
              setReviews([]);
            }
            
            setLoading(false);
          })();
          return; // Don't call loadProviderDetails
        } catch (e) {
          console.warn('Error parsing cached provider data:', e);
        }
      }
      loadProviderDetails();
    }
  }, [id]);

  const loadProviderDetails = async () => {
    setLoading(true);
    
    try {
      let providerData = null;
      let providerRes = null;
      
      // Try multiple endpoints to find the provider
      const endpointsToTry = [
        `${API_BASE_URL}/api/v1/providers/user/${id}`,  // First try: userId format
        `${API_BASE_URL}/api/v1/providers/${id}`,       // Second try: providerId format
      ];
      
      for (const url of endpointsToTry) {
        console.log('Trying provider endpoint:', url);
        try {
          providerRes = await fetch(url);
          console.log('Response status:', providerRes.status);
          
          if (providerRes.ok) {
            providerData = await providerRes.json();
            console.log('Provider loaded from:', url, 'Data:', providerData);
            break;
          }
        } catch (e) {
          console.error('Error trying endpoint:', url, e);
        }
      }
      
      if (providerRes?.ok && providerData) {
        setProvider(providerData);
        
        // Usar el providerId del proveedor para cargar servicios y reviews
        const actualProviderId = providerData.providerId || providerData.id || id;
        console.log('Using providerId for services/reviews:', actualProviderId);
        
        if (!actualProviderId) {
          console.error('Could not determine providerId from provider response');
          setServices([]);
          setReviews([]);
          setLoading(false);
          return;
        }
        
        // Load services from multiple endpoints
        try {
          const servicesEndpoints = [
            `${API_BASE_URL}/api/v1/providers/${actualProviderId}/services`,
            `${API_BASE_URL}/api/v1/services/provider/${actualProviderId}`,
          ];
          
          let servicesData = null;
          for (const url of servicesEndpoints) {
            console.log('Trying services endpoint:', url);
            try {
              const servicesRes = await fetch(url);
              console.log('Services response status:', servicesRes.status);
              if (servicesRes.ok) {
                servicesData = await servicesRes.json();
                console.log('Services loaded from:', url);
                break;
              }
            } catch (e) {
              console.error('Error trying services endpoint:', url, e);
            }
          }
          
          if (servicesData) {
            const activeServices = Array.isArray(servicesData) 
              ? servicesData.filter((s: Service) => s.isActive !== false)
              : [];
            console.log('Filtered services:', activeServices);
            setServices(activeServices);
          } else {
            console.warn('Could not load services from any endpoint');
            setServices([]);
          }
        } catch (servicesError) {
          console.error('Error loading services:', servicesError);
          setServices([]);
        }

        // Load reviews from multiple endpoints
        try {
          const reviewsEndpoints = [
            `${API_BASE_URL}/api/v1/providers/${actualProviderId}/reviews`,
            `${API_BASE_URL}/api/v1/reviews/provider/${actualProviderId}`,
            `${API_BASE_URL}/api/v1/reviews`,  // Try getting all reviews and filter
          ];
          
          let reviewsData = null;
          for (const url of reviewsEndpoints) {
            console.log('Trying reviews endpoint:', url);
            try {
              const reviewsRes = await fetch(url);
              console.log('Reviews response status:', reviewsRes.status);
              if (reviewsRes.ok) {
                const data = await reviewsRes.json();
                // If we got all reviews, filter by provider
                if (url.includes('/api/v1/reviews') && !url.includes('provider') && !url.includes('providers')) {
                  reviewsData = Array.isArray(data) 
                    ? data.filter((r: any) => r.providerId === actualProviderId || r.provider?.providerId === actualProviderId)
                    : [];
                } else {
                  reviewsData = data;
                }
                console.log('Reviews loaded from:', url);
                break;
              }
            } catch (e) {
              console.error('Error trying reviews endpoint:', url, e);
            }
          }
          
          if (reviewsData) {
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
          } else {
            console.warn('Could not load reviews from any endpoint');
            setReviews([]);
          }
        } catch (reviewsError) {
          console.error('Error loading reviews:', reviewsError);
          setReviews([]);
        }
      } else {
        console.error('Failed to load provider from any endpoint');
        setProvider(null);
      }
    } catch (error) {
      console.error('Error in loadProviderDetails:', error);
      setProvider(null);
    } finally {
      setLoading(false);
    }
  };

  const handleContactProvider = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para contactar proveedores');
      navigate('/login');
      return;
    }

    if (!user.userId) {
      toast.error('Sesión inválida. Por favor, cierra sesión e inicia sesión nuevamente.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant1_user_id: user.userId,
          participant2_user_id: parseInt(id as string),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const conversationId = data.conversation_id;
        toast.success('Redirigiendo al chat...');
        setTimeout(() => navigate(`/chat/${conversationId}`), 1000);
      } else {
        toast.error('No se pudo crear la conversación');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Error al intentar contactar al proveedor');
    }
  };

  const handleRequestService = (serviceName: string) => {
    toast.success(`Solicitud enviada para: ${serviceName}`);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return provider?.rating || 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating: number) => {
    return (
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating
                ? 'text-amber-500 fill-current'
                : 'text-slate-300'
            }`}
          />
        ))}
      </>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Helper function to extract email and image from review
  const getReviewClientInfo = (review: Review) => {
    let email = 'Usuario';
    let imageUrl = null;
    
    // Try to find email in various fields
    if (review.client?.email) {
      email = review.client.email;
      // Try to find image from multiple sources on client object
      imageUrl = review.client.profileImageUrl || review.client.image || (review.client as any).avatar || (review.client as any).profileImage || null;
    } else if (review.clientEmail) {
      email = review.clientEmail;
    } else if (review.email) {
      email = review.email;
    } else if (review.user?.email) {
      email = review.user.email;
      // Try to find image from multiple sources on user object
      imageUrl = review.user.profileImageUrl || review.user.image || (review.user as any).avatar || (review.user as any).profileImage || null;
    } else if ((review as any).userName) {
      email = (review as any).userName;
    } else if ((review as any).username) {
      email = (review as any).username;
    }
    
    // Try additional image sources if still not found
    if (!imageUrl) {
      imageUrl = (review as any).profileImageUrl || (review as any).imageUrl || (review as any).image || (review as any).avatar || null;
    }
    
    // Get initial from email
    const initial = email.includes('@') ? email.split('@')[0].charAt(0).toUpperCase() : email.charAt(0).toUpperCase();
    
    console.log(`Review (${email}): imageUrl found: ${imageUrl}`);
    
    return { email, initial, imageUrl };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando perfil del proveedor...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-12 text-center max-w-md">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4 text-slate-900">No se pudo cargar el perfil</h2>
            <p className="text-slate-600 mb-6">
              Parece que hay un problema al intentar cargar los detalles del proveedor (ID: {id}). 
              Esto puede ser un error temporal en el servidor.
            </p>
            <div className="flex gap-3">
              <Button 
                onClick={() => window.location.reload()}
                className="flex-1"
              >
                Reintentar
              </Button>
              <Button 
                onClick={() => navigate('/search')}
                variant="outline"
                className="flex-1"
              >
                Volver a búsqueda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageRating = calculateAverageRating();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/search')}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
        {/* Provider Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage 
                  src={provider.profileImageUrl || provider.user?.profileImageUrl} 
                  alt={provider.name || provider.businessName || 'Proveedor'} 
                />
                <AvatarFallback>
                  {((provider.name || provider.businessName || 'P').charAt(0).toUpperCase())}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">
                      {provider.name || provider.businessName || 'Proveedor'}
                    </h1>
                    {provider.category && (
                      <p className="text-slate-600">{provider.category.categoryName}</p>
                    )}
                  </div>
                  {(provider.verified || provider.isVerified) && (
                    <Badge className="bg-blue-600">
                      <Verified className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                    <span className="font-bold text-lg">{averageRating}</span>
                    <span className="text-slate-600">({reviews.length} reseñas)</span>
                  </div>
                  {provider.serviceRadius && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-5 h-5" />
                      <span>{provider.serviceRadius} km de alcance</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-600 font-medium">Disponible ahora</span>
                  </div>
                </div>

                <p className="text-slate-700 mb-4">
                  {provider.description || provider.businessDescription || 'Sin descripción disponible'}
                </p>

                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={handleContactProvider}
                    className="gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contactar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="services" value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="space-y-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
            <TabsTrigger value="gallery">Galería</TabsTrigger>
            <TabsTrigger value="about">Acerca de</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services">
            {services.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-slate-500">No hay servicios disponibles</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {services.map((service) => {
                  const serviceId = service.serviceId || (service as any).id;
                  return (
                    <Card key={serviceId} className="hover:shadow-lg transition-shadow overflow-hidden">
                      <CardHeader>
                        <CardTitle className="flex items-start justify-between">
                          <span className="text-lg">{service.serviceTitle || (service as any).name}</span>
                          <span className="text-blue-600 font-bold text-lg">₡{(service.basePrice || (service as any).price).toLocaleString()}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-slate-600">{service.serviceDescription || (service as any).description}</p>
                        
                        {serviceId && (
                          <div className="mt-4 pt-4 border-t">
                            <h4 className="text-sm font-semibold text-slate-900 mb-3">Galería de imágenes</h4>
                            <ServiceGalleryView
                              serviceId={serviceId}
                              editable={false}
                              maxImagesToShow={5}
                            />
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="w-4 h-4" />
                            <span>{service.priceUnit || 'Servicio'}</span>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => handleRequestService(service.serviceTitle || (service as any).name)}
                          >
                            Solicitar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reseñas de clientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {reviews.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-500">No hay reseñas aún</p>
                  </div>
                ) : (
                  reviews.map((review, index) => {
                    const { email, initial, imageUrl } = getReviewClientInfo(review);
                    
                    return (
                      <div key={review.reviewId}>
                        {index > 0 && <Separator className="my-6" />}
                        <div className="flex gap-4">
                          <Avatar>
                            {imageUrl && <AvatarImage src={imageUrl} alt={email} />}
                            <AvatarFallback>{initial}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-slate-900">{email}</h4>
                              <span className="text-sm text-slate-600">{formatDate(review.createdAt)}</span>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {renderStars(review.rating)}
                            </div>
                            {review.title && (
                              <p className="font-medium text-slate-800 mb-1">{review.title}</p>
                            )}
                            <p className="text-slate-700">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            {services.length > 0 && services.some(s => s.serviceId || (s as any).id) ? (
              <div className="space-y-6">
                {services.map((service) => {
                  const serviceId = service.serviceId || (service as any).id;
                  return serviceId ? (
                    <Card key={serviceId}>
                      <CardHeader>
                        <CardTitle>{service.serviceTitle || (service as any).name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ServiceGalleryView
                          serviceId={serviceId}
                          editable={false}
                          maxImagesToShow={undefined}
                        />
                      </CardContent>
                    </Card>
                  ) : null;
                })}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <ImageIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No hay imágenes en la galería</p>
              </Card>
            )}
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>Información del proveedor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {provider.yearsExperience && (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2">Experiencia</h4>
                      <p className="text-slate-700">{provider.yearsExperience} años de experiencia</p>
                    </div>
                    <Separator />
                  </>
                )}
                <div>
                  <h4 className="font-semibold mb-2">Descripción</h4>
                  <p className="text-slate-700">
                    {provider.description || provider.businessDescription || 'Sin descripción disponible'}
                  </p>
                </div>
                {provider.serviceRadius && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Área de servicio</h4>
                      <p className="text-slate-700">{provider.serviceRadius} km de alcance</p>
                    </div>
                  </>
                )}
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Estado</h4>
                  <Badge variant={(provider.verified || provider.isVerified) ? 'default' : 'secondary'}>
                    {(provider.verified || provider.isVerified) ? 'Verificado' : 'No verificado'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
