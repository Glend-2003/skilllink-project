import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Config } from '@/constants/Config';
import { ServiceGalleryView } from '@/components/ServiceGalleryView';

interface Provider {
  id: string;
  providerId: number;
  businessName: string;
  businessDescription: string;
  yearsExperience: number;
  isVerified: boolean;
  user?: {
    userId: number;
    profileImageUrl?: string;
    email: string;
  };
  // Legacy fields for compatibility
  name?: string;
  category?: string;
  rating?: number;
  location?: string;
  description?: string;
  hourlyRate?: number;
  verified?: boolean;
  reviewCount?: number;
  profileImageUrl?: string;
}

interface Service {
  id: string;
  serviceId?: number;
  name: string;
  description: string;
  price: number;
  duration: string;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface ServiceRequest {
  requestId: number;
  requestTitle: string;
  requestDescription: string;
  serviceAddress: string;
  addressDetails?: string;
  contactPhone?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost: number;
  finalCost: number | null;
  preferredDate: string;
  preferredTime: string;
  createdAt: string;
  clientUserId: number;
  service: {
    serviceName: string;
    category: {
      categoryName: string;
    };
  };
}

const { width } = Dimensions.get('window');

export default function ProviderDetailScreen() {
  const params = useLocalSearchParams();
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  
  const providerId = id as string;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = useMemo(() => {
    const result = user?.userId?.toString() === provider?.id;
    return result;
  }, [user?.userId, provider?.id]);

  useEffect(() => {
    const loadProviderDetails = async () => {
      try {
        const url = `${Config.API_GATEWAY_URL}/api/v1/providers/${providerId}`;
        
        const providerRes = await fetch(url);
        if (providerRes.ok) {
          const providerData = await providerRes.json();
          setProvider(providerData);

          if (user?.userId && providerData?.id === user.userId.toString()) {
            await loadRequests(providerId);
          }
        } else {
          console.error('Provider API error:', providerRes.status);
          const errorText = await providerRes.text();
          console.error('Error response:', errorText);
          Alert.alert('Error', `Error al cargar proveedor: ${providerRes.status}`);
        }

        // Fetch services
        const servicesRes = await fetch(
          `${Config.API_GATEWAY_URL}/api/v1/providers/${providerId}/services`
        );
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData);
        }

        // Fetch reviews
        const reviewsRes = await fetch(
          `${Config.API_GATEWAY_URL}/api/v1/providers/${providerId}/reviews`
        );
        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData);
        }
      } catch (error) {
        console.error('Error loading provider details:', error);
        Alert.alert('Error', 'No se pudo cargar los detalles del proveedor');
      } finally {
        setLoading(false);
      }
    };

    if (providerId) {
      loadProviderDetails();
    }
  }, [providerId]);

  const loadRequests = async (provId: string) => {
    setLoadingRequests(true);
    try {
      const token = user?.token;
      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/requests/provider/${provId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleUpdateRequestStatus = async (requestId: number, status: string, finalCost?: number) => {
    try {
      const token = user?.token;
      const body: any = { status };
      if (finalCost !== undefined) {
        body.finalCost = finalCost;
      }

      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/requests/${requestId}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        Alert.alert('Éxito', 'Estado de solicitud actualizado');
        await loadRequests(providerId);
      } else {
        Alert.alert('Error', 'No se pudo actualizar la solicitud');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      Alert.alert('Error', 'Error al actualizar solicitud');
    }
  };

  const handleContactProvider = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para contactar proveedores');
      return;
    }

    if (!user.userId) {
      Alert.alert('Error', 'Sesión inválida. Por favor, cierra sesión e inicia sesión nuevamente.');
      return;
    }

    try {
      const response = await fetch(`${Config.API_GATEWAY_URL}/api/v1/chat/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant1_user_id: user.userId,
          participant2_user_id: parseInt(providerId as string),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const conversationId = data.conversation_id;
        router.push(`/chat/${conversationId}`);
      } else {
        Alert.alert('Error', 'No se pudo crear la conversación');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'Error al intentar contactar al proveedor');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Proveedor no encontrado</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil del Proveedor</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Provider Card */}
        <View style={styles.providerCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {(provider.user?.profileImageUrl || provider.profileImageUrl) ? (
              <Image 
                source={{ uri: provider.user?.profileImageUrl || provider.profileImageUrl }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {provider.businessName?.charAt(0).toUpperCase() || provider.name?.charAt(0).toUpperCase() || 'P'}
                </Text>
              </View>
            )}
          </View>

          {/* Provider Info */}
          <View style={styles.providerInfo}>
            <View style={styles.nameSection}>
              <Text style={styles.providerName}>{provider.businessName || provider.name}</Text>
              {(provider.isVerified || provider.verified) && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color="white"
                  />
                  <Text style={styles.verifiedText}>Verificado</Text>
                </View>
              )}
            </View>

            <Text style={styles.category}>{provider.category}</Text>

            {/* Rating */}
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <MaterialCommunityIcons
                    key={i}
                    name={i < Math.floor(provider.rating || 4.5) ? 'star' : 'star-outline'}
                    size={16}
                    color="#f59e0b"
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {(provider.rating || 4.5).toFixed(1)} ({provider.reviewCount || 0} reseñas)
              </Text>
            </View>

            {/* Details */}
            <View style={styles.detailsContainer}>
              {provider.location && <Text style={styles.detailText}>{provider.location}</Text>}
              <Text style={styles.detailText}>
                {provider.yearsExperience} años de experiencia
              </Text>
              {provider.hourlyRate && (
                <Text style={styles.detailText}>
                  ${provider.hourlyRate}/hora
                </Text>
              )}
            </View>

            <Text style={styles.description}>{provider.businessDescription || provider.description}</Text>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              {isOwnProfile ? (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => router.push('/provider/edit-profile')}
                >
                  <Text style={styles.contactButtonText}>Editar Perfil</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleContactProvider}
                >
                  <Text style={styles.contactButtonText}>Contactar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Solicitudes Recibidas (solo si es perfil propio) */}
        {isOwnProfile && (
          <View style={styles.requestsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Solicitudes Recibidas</Text>
              <View style={styles.requestsBadge}>
                <Text style={styles.requestsBadgeText}>{requests.filter(r => r.status === 'pending').length}</Text>
              </View>
            </View>

            {loadingRequests ? (
              <ActivityIndicator size="small" color="#3b82f6" style={{ marginTop: 16 }} />
            ) : requests.length > 0 ? (
              <View style={styles.requestsList}>
                {requests.slice(0, 3).map((request) => (
                  <TouchableOpacity
                    key={request.requestId}
                    style={styles.requestCard}
                    onPress={() => {
                      Alert.alert(
                        request.requestTitle,
                        `${request.requestDescription}\n\nServicio: ${request.service.serviceName}\nFecha: ${new Date(request.preferredDate).toLocaleDateString()}\nHora: ${request.preferredTime}\nDirecci\u00f3n: ${request.serviceAddress}${request.addressDetails ? `\n${request.addressDetails}` : ''}\nTel\u00e9fono: ${request.contactPhone || 'No especificado'}\nCosto estimado: $${request.estimatedCost}`,
                        request.status === 'pending' ? [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Rechazar',
                            style: 'destructive',
                            onPress: () => handleUpdateRequestStatus(request.requestId, 'cancelled'),
                          },
                          {
                            text: 'Aceptar',
                            onPress: () => {
                              Alert.prompt(
                                'Costo Final',
                                'Ingresa el costo final del servicio:',
                                (text) => {
                                  const cost = parseFloat(text);
                                  if (!isNaN(cost) && cost > 0) {
                                    handleUpdateRequestStatus(request.requestId, 'accepted', cost);
                                  } else {
                                    Alert.alert('Error', 'Ingresa un costo v\u00e1lido');
                                  }
                                },
                                'plain-text',
                                request.estimatedCost.toString()
                              );
                            },
                          },
                        ] : request.status === 'accepted' ? [
                          { text: 'Cerrar', style: 'cancel' },
                          {
                            text: 'Iniciar Trabajo',
                            onPress: () => handleUpdateRequestStatus(request.requestId, 'in_progress'),
                          },
                        ] : request.status === 'in_progress' ? [
                          { text: 'Cerrar', style: 'cancel' },
                          {
                            text: 'Completar',
                            onPress: () => handleUpdateRequestStatus(request.requestId, 'completed'),
                          },
                        ] : [{ text: 'Cerrar' }]
                      );
                    }}
                  >
                    <View style={styles.requestHeader}>
                      <Text style={styles.requestTitle}>{request.requestTitle}</Text>
                      <View style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            request.status === 'pending' ? '#FEF3C7' :
                            request.status === 'accepted' ? '#D1FAE5' :
                            request.status === 'in_progress' ? '#DBEAFE' :
                            request.status === 'completed' ? '#E5E7EB' :
                            '#FEE2E2'
                        }
                      ]}>
                        <Text style={[
                          styles.statusText,
                          {
                            color:
                              request.status === 'pending' ? '#F59E0B' :
                              request.status === 'accepted' ? '#10B981' :
                              request.status === 'in_progress' ? '#3B82F6' :
                              request.status === 'completed' ? '#6B7280' :
                              '#EF4444'
                          }
                        ]}>
                          {request.status === 'pending' ? 'Pendiente' :
                           request.status === 'accepted' ? 'Aceptada' :
                           request.status === 'in_progress' ? 'En Progreso' :
                           request.status === 'completed' ? 'Completada' : 'Cancelada'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.requestService}>{request.service.serviceName}</Text>
                    <Text style={styles.requestDescription} numberOfLines={2}>{request.requestDescription}</Text>
                    <View style={styles.requestFooter}>
                      <Text style={styles.requestInfoText}>
                        {new Date(request.preferredDate).toLocaleDateString()}
                      </Text>
                      <Text style={styles.requestInfoText}>${request.finalCost || request.estimatedCost}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
                {requests.length > 3 && (
                  <TouchableOpacity
                    style={styles.viewAllButton}
                    onPress={() => router.push('/provider/provider-requests')}
                  >
                    <Text style={styles.viewAllText}>Ver todas ({requests.length})</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.emptyRequests}>
                <Text style={styles.emptyRequestsText}>No hay solicitudes</Text>
              </View>
            )}
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {['services', 'reviews', 'about'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab === 'services'
                  ? 'Servicios'
                  : tab === 'reviews'
                  ? 'Reseñas'
                  : 'Acerca de'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'services' && (
          <View style={styles.tabContent}>
            {services.length > 0 ? (
              services.map((service) => (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={styles.serviceHeader}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.servicePrice}>${service.price}</Text>
                  </View>
                  <Text style={styles.serviceDescription}>
                    {service.description}
                  </Text>
                  
                  {service.serviceId && (
                    <View style={styles.serviceGallery}>
                      <ServiceGalleryView
                        serviceId={service.serviceId}
                        editable={false}
                        maxImagesToShow={5}
                      />
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No hay servicios disponibles
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.tabContent}>
            {reviews.length > 0 ? (
              reviews.map((review, index) => (
                <View key={`review-${index}`} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewName}>{review.userName}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <View style={styles.reviewRating}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <MaterialCommunityIcons
                        key={i}
                        name={i < review.rating ? 'star' : 'star-outline'}
                        size={14}
                        color="#f59e0b"
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Sin reseñas aún</Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'about' && (
          <View style={styles.tabContent}>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>Experiencia</Text>
              <Text style={styles.aboutText}>
                {provider.yearsExperience} años en el rubro
              </Text>

              <View style={styles.separator} />

              <Text style={styles.aboutTitle}>Sobre este proveedor</Text>
              <Text style={styles.aboutText}>{provider.description}</Text>

              <View style={styles.separator} />

              <Text style={styles.aboutTitle}>Tarifa</Text>
              <Text style={styles.aboutText}>
                ${provider.hourlyRate} por hora
              </Text>

              <View style={styles.separator} />

              <Text style={styles.aboutTitle}>Verificación</Text>
              <Text style={styles.aboutText}>
                {provider.verified ? 'Cuenta verificada' : 'Cuenta no verificada'}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  backButton: {
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  providerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e0e0e0',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  providerInfo: {
    alignItems: 'center',
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  providerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  category: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailsContainer: {
    width: '100%',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  contactButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scheduleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scheduleButtonText: {
    color: '#3b82f6',
    fontSize: 16,
    fontWeight: '600',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: 'white',
  },
  tabContent: {
    marginBottom: 20,
  },
  serviceCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  serviceDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 10,
  },
  serviceGallery: {
    marginVertical: 12,
    marginHorizontal: -12,
    paddingHorizontal: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  serviceButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  serviceButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  reviewCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  reviewDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  aboutCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  infoSection: {
    width: '100%',
    marginVertical: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  editButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  requestsSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  requestsBadge: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  requestsBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requestTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  requestService: {
    fontSize: 13,
    color: '#3b82f6',
    fontWeight: '500',
    marginBottom: 4,
  },
  requestDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestInfoText: {
    fontSize: 12,
    color: '#6b7280',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  emptyRequests: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyRequestsText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
});
