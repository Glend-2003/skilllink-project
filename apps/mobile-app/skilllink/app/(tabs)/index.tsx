import { View, Text, StyleSheet, TextInput, FlatList, Pressable, ScrollView, TouchableOpacity, Image, Alert, Platform, Animated, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { Config } from '@/constants/Config';

// Interface for provider list items (from GET /api/v1/providers/)
interface ProviderListItem {
  id: string;  // This is the userId
  name: string;
  category: string;
  rating?: number;
  location?: string;
  description?: string;
  hourlyRate?: number;
  verified: boolean;
  yearsExperience?: number;
  reviewCount?: number;
  profileImageUrl?: string;
}

// Interface for service items with nested provider info
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
  category: string | {
    categoryId: number;
    categoryName: string;
    categoryDescription?: string;
    iconUrl?: string;
    isActive: boolean;
    displayOrder?: number;
  };
  provider: {
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
  };
  gallery?: Array<{
    galleryId: number;
    imageUrl: string;
    displayOrder: number;
  }>;
  rating?: number;
  location?: string;
}

export default function HomeScreen() {
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { logout, user } = useAuth();
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: true,
      listener: (event: any) => {
        const currentScrollY = event.nativeEvent.contentOffset.y;
        const diff = currentScrollY - lastScrollY.current;
        
        if (diff > 0 && currentScrollY > 50) {
          // Scrolling down
          Animated.timing(headerTranslateY, {
            toValue: -200,
            duration: 300,
            useNativeDriver: true,
          }).start();
        } else if (diff < 0) {
          // Scrolling up
          Animated.timing(headerTranslateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }
        
        lastScrollY.current = currentScrollY;
      },
    }
  );

  const loadData = async () => {
    try {
      const servicesResponse = await fetch(`${Config.API_GATEWAY_URL}/api/v1/services`);
      
      if (!servicesResponse.ok) {
        throw new Error(`Error servicios: ${servicesResponse.status} ${servicesResponse.statusText}`);
      }
      
      const servicesText = await servicesResponse.text();
      
      const servicesData = servicesText ? JSON.parse(servicesText) : [];
      setAllProviders(Array.isArray(servicesData) ? servicesData : []);
      
      if (Array.isArray(servicesData) && servicesData.length > 0) {
        const featured = [...servicesData]
          .filter(service => service.rating && service.rating > 0)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 5);
        setFeaturedServices(featured);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setAllProviders([]);
      setFeaturedServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={{ paddingVertical: 100, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Cargando servicios...</Text>
        </View>
      </ScrollView>
    );
  }

  // This function is no longer needed - removed

  const handleViewServiceProvider = (service: Provider) => {
    const id = service.provider?.user?.userId;
    
    if (!id) {
      return;
    }
    
    router.push(`/provider/${id}`);
  };

  const handleContactServiceProvider = async (service: Provider) => {
    const providerId = service.provider?.user?.userId;
    
    if (!providerId) {
      console.error('No provider ID found for service:', service);
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must log in to contact the provider');
      return;
    }

    try {
      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/chat/conversations`,
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
      
      router.push(`/chat/${conversation.conversation_id}`);
    } catch (error) {
      console.error('Error contacting provider:', error);
      Alert.alert('Error', 'Could not start conversation');
    }
  };

  const renderFeaturedService = ({ item }: { item: Provider }) => {
    const serviceImage = item.gallery && item.gallery.length > 0 
      ? item.gallery.sort((a, b) => a.displayOrder - b.displayOrder)[0].imageUrl 
      : null;
    
    return (
    <TouchableOpacity 
      style={styles.featuredCard} 
      onPress={() => handleViewServiceProvider(item)}
    >
      <LinearGradient
        colors={['#ffffff', '#f8fafc']}
        style={styles.featuredGradient}
      >
        {serviceImage && (
          <View style={styles.serviceImageContainer}>
            <Image source={{ uri: serviceImage }} style={styles.serviceImage} />
            <View style={styles.imageOverlay} />
          </View>
        )}
        
        <View style={styles.featuredBadgeContainer}>
          <LinearGradient
            colors={['#fbbf24', '#f59e0b']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredBadge}
          >
            <Ionicons name="ribbon" size={11} color="#FFF" />
            <Text style={styles.featuredBadgeText}>Destacado</Text>
          </LinearGradient>
        </View>

        <View style={styles.featuredHeader}>
          <View style={styles.avatarContainer}>
            {item.provider?.user?.profileImageUrl ? (
              <Image source={{ uri: item.provider.user.profileImageUrl }} style={styles.featuredAvatarImage} />
            ) : (
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                style={styles.featuredAvatar}
              >
                <Ionicons name="person-circle-outline" size={28} color="#FFF" />
              </LinearGradient>
            )}
            <View style={styles.avatarBorder} />
          </View>
        </View>

        <View style={styles.featuredRatingContainer}>
          <Ionicons name="star" size={16} color="#fbbf24" />
          <Text style={styles.featuredRatingText}>
            {item.rating && item.rating > 0 ? item.rating.toFixed(1) : 'N/A'}
          </Text>
          {item.rating && item.rating > 0 ? (
            <Text style={styles.featuredRatingLabel}>
              • {item.rating >= 4.5 ? 'Excelente' : item.rating >= 4 ? 'Muy bueno' : item.rating >= 3 ? 'Bueno' : 'Regular'}
            </Text>
          ) : (
            <Text style={styles.featuredRatingLabel}>• Sin calificaciones</Text>
          )}
        </View>

        <Text style={styles.featuredName} numberOfLines={1}>{item.serviceTitle}</Text>
        <View style={styles.featuredCategoryContainer}>
          <View style={styles.categoryDot} />
          <Text style={styles.featuredCategory}>
            {typeof item.category === 'string' ? item.category : item.category?.categoryName || 'Sin categoría'}
          </Text>
        </View>
        <Text style={styles.featuredDescription} numberOfLines={2}>
          {item.serviceDescription}
        </Text>

        <View style={styles.featuredFooter}>
          <View>
            <Text style={styles.featuredPriceLabel}>Desde</Text>
            <Text style={styles.featuredPrice}>${item.basePrice}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
  };

  const renderProvider = ({ item }: { item: Provider }) => {
    const serviceImage = item.gallery && item.gallery.length > 0 
      ? item.gallery.sort((a, b) => a.displayOrder - b.displayOrder)[0].imageUrl 
      : null;
    
    return (
    <TouchableOpacity style={styles.providerCard} onPress={() => handleViewServiceProvider(item)}>
      <LinearGradient
        colors={['#ffffff', '#fafbfc']}
        style={styles.providerGradient}
      >
        {serviceImage && (
          <View style={styles.providerImageContainer}>
            <Image source={{ uri: serviceImage }} style={styles.providerImage} />
          </View>
        )}
        
        <View style={styles.providerHeader}>
          <View style={styles.providerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.providerName}>{item.serviceTitle}</Text>
            </View>
            <View style={styles.providerCategoryRow}>
              <View style={styles.categoryDotSmall} />
              <Text style={styles.providerCategory}>
                {typeof item.category === 'string' ? item.category : item.category?.categoryName || 'Sin categoría'}
              </Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color="#fbbf24" />
              <Text style={styles.rating}>
                {item.rating && item.rating > 0 ? item.rating.toFixed(1) : 'N/A'}
              </Text>
              {item.rating && item.rating > 0 ? (
                <Text style={styles.ratingLabel}>
                  • {item.rating >= 4.5 ? 'Excelente' : item.rating >= 4 ? 'Muy bueno' : item.rating >= 3 ? 'Bueno' : 'Regular'}
                </Text>
              ) : (
                <Text style={styles.ratingLabel}>• Sin calificaciones</Text>
              )}
              <Text style={styles.location}>• {item.provider?.businessName || 'Proveedor'}</Text>
            </View>
          </View>
          <View style={styles.avatarWrapper}>
            {item.provider?.user?.profileImageUrl ? (
              <Image source={{ uri: item.provider.user.profileImageUrl }} style={styles.avatarImage} />
            ) : (
              <LinearGradient
                colors={['#58b9f1', '#2563eb']}
                style={styles.avatar}
              >
                <Ionicons name="person-circle-outline" size={24} color="#FFF" />
              </LinearGradient>
            )}
            <View style={styles.avatarRing} />
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.serviceDescription}
        </Text>

        <View style={styles.providerFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Desde</Text>
            <Text style={styles.rate}>${item.basePrice}</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              handleContactServiceProvider(item);
            }}
          >
            <LinearGradient
              colors={['#3b82f6', '#2563eb']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.contactButton}
            >
              <Ionicons name="paper-plane" size={14} color="#FFF" />
              <Text style={styles.contactButtonText}>Contactar</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            transform: [{ translateY: headerTranslateY }]
          }
        ]}
      >
        <LinearGradient
          colors={['#1e3a8a', '#3b82f6', '#06b6d4']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.headerLeft}>
                  <View style={styles.greetingContainer}>
                    <Text style={styles.greeting}>Bienvenido de nuevo</Text>
                    <View style={styles.greetingLine} />
                  </View>
                  <Text style={styles.title}>Descubre Servicios</Text>
                  <Text style={styles.subtitle}>Los mejores profesionales verificados a tu alcance</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    logout();
                    router.replace('/login');
                  }}
                >
                  <LinearGradient
                    colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                    style={styles.logoutButton}
                  >
                    <Ionicons name="exit-outline" size={20} color="#ffffff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
            progressViewOffset={200}
          />
        }
      >

      {/* Featured Services */}
      {featuredServices.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Servicios Destacados</Text>
            <TouchableOpacity onPress={() => router.push('/search')}>
              <Text style={styles.seeAll}>Ver todos →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={featuredServices}
            keyExtractor={(item) => item.serviceId?.toString() || item.id?.toString() || Math.random().toString()}
            renderItem={renderFeaturedService}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredList}
          />
        </>
      )}

      {/* All Services */}
      <View style={styles.providersHeader}>
        <Text style={styles.sectionTitle}>Todos los Servicios</Text>
        <Text style={styles.resultsCount}>
          {allProviders.length} servicio{allProviders.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={allProviders}
        keyExtractor={(item) => item.serviceId?.toString() || item.id?.toString() || Math.random().toString()}
        renderItem={renderProvider}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No hay servicios disponibles</Text>
            <Text style={styles.emptyText}>Pronto habrá servicios disponibles</Text>
          </View>
        }
      />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  headerOverlay: {
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: 24,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingTop: 200,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  greeting: {
    fontSize: 14,
    color: '#e0f2fe',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  greetingLine: {
    height: 2,
    width: 30,
    backgroundColor: '#60a5fa',
    marginLeft: 12,
    borderRadius: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#dbeafe',
    lineHeight: 20,
    fontWeight: '400',
  },
  logoutButton: {
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  featuredList: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 20,
  },
  featuredCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: '#fff',
  },
  featuredGradient: {
    padding: 20,
    borderRadius: 20,
  },
  serviceImageContainer: {
    width: '100%',
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  featuredBadgeContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    gap: 4,
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  featuredBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  featuredAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  featuredRatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  featuredRatingLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  featuredRatingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
  },
  featuredName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  featuredCategoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3b82f6',
    marginRight: 6,
  },
  featuredCategory: {
    fontSize: 12,
    color: '#3b82f6',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  featuredDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  featuredPriceLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  featuredPrice: {
    fontSize: 22,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: -0.5,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d1fae5',
  },
  verifiedText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
  },
  providersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  providerCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    backgroundColor: '#fff',
  },
  providerGradient: {
    padding: 20,
  },
  providerImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  providerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  providerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  providerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  verifiedBadgeSmall: {
    marginLeft: 8,
  },
  providerCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 6,
  },
  categoryDotSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3b82f6',
    marginRight: 6,
  },
  providerCategory: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
    marginLeft: 2,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarRing: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.15)',
  },
  description: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  providerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  rate: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: -0.3,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    gap: 6,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
});