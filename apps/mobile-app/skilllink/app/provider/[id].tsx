import React, { useState, useEffect } from 'react';
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

interface Provider {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  description: string;
  hourlyRate: number;
  verified: boolean;
  yearsExperience: number;
  reviewCount: number;
}

interface Service {
  id: string;
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

const { width } = Dimensions.get('window');

export default function ProviderDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const providerId = id as string;

  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('services');

  useEffect(() => {
    const loadProviderDetails = async () => {
      try {
        console.log('Loading provider with ID:', providerId);
        
        // Fetch provider details
        const providerRes = await fetch(
          `${Config.PROVIDER_SERVICE_URL}/api/providers/${providerId}`
        );
        console.log('Provider response status:', providerRes.status);
        
        if (providerRes.ok) {
          const providerData = await providerRes.json();
          console.log('Provider data:', providerData);
          setProvider(providerData);
        } else {
          console.error('Provider API error:', providerRes.status);
          const errorText = await providerRes.text();
          console.error('Error response:', errorText);
          Alert.alert('Error', `Error al cargar proveedor: ${providerRes.status}`);
        }

        // Fetch services
        const servicesRes = await fetch(
          `${Config.PROVIDER_SERVICE_URL}/api/providers/${providerId}/services`
        );
        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData);
        }

        // Fetch reviews
        const reviewsRes = await fetch(
          `${Config.PROVIDER_SERVICE_URL}/api/providers/${providerId}/reviews`
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
      console.log('User data:', user);
      console.log('Creating conversation with provider:', providerId);
      console.log('Chat Service URL:', Config.CHAT_SERVICE_URL);
      console.log('Payload:', {
        participant1_user_id: user.userId,
        participant2_user_id: parseInt(providerId as string),
      });

      // Create or get conversation
      const response = await fetch(`${Config.CHAT_SERVICE_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant1_user_id: user.userId,
          participant2_user_id: parseInt(providerId as string),
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        const conversationId = data.conversation_id;
        console.log('Navigating to chat:', conversationId);
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
          <Ionicons name="arrow-back" size={24} color="#3b82f6" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil del Proveedor</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Provider Card */}
        <View style={styles.providerCard}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {provider.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Provider Info */}
          <View style={styles.providerInfo}>
            <View style={styles.nameSection}>
              <Text style={styles.providerName}>{provider.name}</Text>
              {provider.verified && (
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
                    name={i < Math.floor(provider.rating) ? 'star' : 'star-outline'}
                    size={16}
                    color="#f59e0b"
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>
                {provider.rating.toFixed(1)} ({provider.reviewCount} reseñas)
              </Text>
            </View>

            {/* Details */}
            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color="#6b7280"
                />
                <Text style={styles.detailText}>{provider.location}</Text>
              </View>

              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="briefcase"
                  size={16}
                  color="#6b7280"
                />
                <Text style={styles.detailText}>
                  {provider.yearsExperience} años de experiencia
                </Text>
              </View>

              <View style={styles.detailItem}>
                <MaterialCommunityIcons
                  name="cash"
                  size={16}
                  color="#6b7280"
                />
                <Text style={styles.detailText}>
                  Desde ${provider.hourlyRate}/hora
                </Text>
              </View>
            </View>

            <Text style={styles.description}>{provider.description}</Text>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleContactProvider}
              >
                <MaterialCommunityIcons
                  name="message-text"
                  size={20}
                  color="white"
                />
                <Text style={styles.contactButtonText}>Contactar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.scheduleButton}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color="#3b82f6"
                />
                <Text style={styles.scheduleButtonText}>Agendar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

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
                  <View style={styles.serviceFooter}>
                    <View style={styles.durationBadge}>
                      <MaterialCommunityIcons
                        name="clock"
                        size={14}
                        color="#6b7280"
                      />
                      <Text style={styles.durationText}>{service.duration}</Text>
                    </View>
                    <TouchableOpacity style={styles.serviceButton}>
                      <Text style={styles.serviceButtonText}>Solicitar</Text>
                    </TouchableOpacity>
                  </View>
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
              reviews.map((review) => (
                <View key={review.id} style={styles.reviewCard}>
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
              <View
                style={[
                  styles.verificationBadge,
                  { backgroundColor: provider.verified ? '#d1fae5' : '#fee2e2' },
                ]}
              >
                <MaterialCommunityIcons
                  name={
                    provider.verified ? 'check-circle' : 'alert-circle'
                  }
                  size={20}
                  color={provider.verified ? '#059669' : '#dc2626'}
                />
                <Text
                  style={{
                    color: provider.verified ? '#059669' : '#dc2626',
                    marginLeft: 8,
                    fontWeight: '600',
                  }}
                >
                  {provider.verified
                    ? 'Cuenta verificada'
                    : 'Cuenta no verificada'}
                </Text>
              </View>
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
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
});
