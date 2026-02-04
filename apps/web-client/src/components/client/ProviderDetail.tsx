import React, { useEffect, useState } from 'react';
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, MessageCircle, Verified, Calendar, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import { MarketplaceService } from '../../services/marketplaceService';

interface ProviderDetailProps {
  providerId: string;
  onViewChange: (view: string) => void;
}

export function ProviderDetail({ providerId, onViewChange }: ProviderDetailProps) {
  const [provider, setProvider] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProviderDetails = async () => {
      try {
        setLoading(true);
        const userId = Number(providerId);
        const profileData = await MarketplaceService.getProviderByUserId(userId);
        
        if (profileData) {
          setProvider(profileData);

          const realProviderId = profileData.provider_id || profileData.providerId || profileData.id;

          if (realProviderId) {
            const [servicesData, reviewsData] = await Promise.all([
              MarketplaceService.getProviderServices2(realProviderId).catch(() => []),
              MarketplaceService.getProviderReviews(realProviderId).catch(() => [])
            ]);
            setServices(servicesData);
            setReviews(reviewsData);
          }
        }
      } catch (error) {
        console.error("Error cargando detalles:", error);
        toast.error("No se pudo cargar la información del proveedor");
      } finally {
        setLoading(false);
      }
    };

    if (providerId) {
      loadProviderDetails();
    }
  }, [providerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-blue-600">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
          <p>Cargando perfil profesional...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-xl text-slate-600 mb-4">Proveedor no encontrado</p>
        <Button onClick={() => onViewChange('search')}>Volver a buscar</Button>
      </div>
    );
  }

  // Helpers para manejo de contacto
  const handleContactProvider = () => {
    toast.success('Iniciando chat...');
    setTimeout(() => onViewChange('chat'), 1000);
  };

  const handleRequestService = (serviceName: string) => {
    toast.success(`Solicitud enviada para: ${serviceName}`);
  };

  const businessName = provider.businessName || provider.business_name || "Nombre no disponible";
  const description = provider.businessDescription || provider.business_description || "Sin descripción detallada.";
  const rating = provider.rating || 0;
  const reviewCount = provider.reviewCount || reviews.length || 0;
  const avatarUrl = provider.profileImage || provider.profile_image_url;
  const bannerUrl = provider.bannerImage || provider.banner_url;
  const locationText = provider.location || provider.city || "Ubicación no especificada";

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white border-b sticky top-[57px] md:top-[73px] z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={() => onViewChange('search')}
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
                <AvatarImage src={avatarUrl} alt={businessName} />
                <AvatarFallback>{businessName.charAt(0)}</AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-wrap items-start gap-3 mb-3">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-1">{businessName}</h1>
                    <p className="text-slate-600">{provider.categoryName || provider.category_name || "Profesional"}</p>
                  </div>
                  {provider.verified && (
                    <Badge className="bg-blue-600">
                      <Verified className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                  {provider.plan === 'pro' && (
                    <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                      PRO
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-current" />
                    <span className="font-bold text-lg">{rating}</span>
                    <span className="text-slate-600">({reviewCount} reseñas)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-5 h-5" />
                    {/* <span>{provider.distance} km • {provider.location.city}</span>*/}
                    <span>{locationText}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-5 h-5" />
                    <span>Responde en {provider.responseTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {provider.isAvailable ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-green-600 font-medium">Disponible ahora</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-600">No disponible</span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-slate-700 mb-4">{provider.description}</p>

                <div className="flex flex-wrap gap-3">
                  <Button 
                    onClick={handleContactProvider}
                    className="gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contactar
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <Calendar className="w-4 h-4" />
                    Agendar cita
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="reviews">Reseñas</TabsTrigger>
            <TabsTrigger value="gallery">Galería</TabsTrigger>
            <TabsTrigger value="about">Acerca de</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card key={service.service_id || service.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span>{service.service_title || service.title}</span>
                      <span className="text-blue-600 font-bold">${service.base_price || service.price}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 mb-3">{service.service_description || service.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{service.estimated_duration || "Duración variable"}</span>
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => handleRequestService(service.service_title)}
                      >
                        Solicitar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Reseñas de clientes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {reviews.map((review, index) => (
                  <div key={review.review_id || index}>
                    {index > 0 && <Separator className="my-6" />}
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarImage src={review.user_avatar} alt={review.userName} />
                        <AvatarFallback>{(review.user_name || "A").charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{review.user_name || "Usuario"}</h4>
                          <span className="text-sm text-slate-600">{review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? 'text-amber-500 fill-current'
                                  : 'text-slate-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-slate-700">{review.comment}</p>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {review.images.map((img: string, i: number) => (
                              <img
                                key={i}
                                src={img}
                                alt="Review"
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gallery Tab */}
          <TabsContent value="gallery">
            {provider.gallery.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {provider.gallery.map((image: string, index: number) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                    <img
                      src={image}
                      alt={`Trabajo ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                ))}
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
                <div>
                  <h4 className="font-semibold mb-2">Experiencia</h4>
                  <p className="text-slate-700">{provider.experience}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Ubicación</h4>
                  <p className="text-slate-700">{provider.location.address}</p>
                  <p className="text-slate-600">{provider.location.city}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Tiempo de respuesta</h4>
                  <p className="text-slate-700">{provider.responseTime}</p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Plan</h4>
                  <Badge variant={provider.plan === 'pro' ? 'default' : 'secondary'}>
                    {provider.plan === 'pro' ? 'PRO' : 'Gratuito'}
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