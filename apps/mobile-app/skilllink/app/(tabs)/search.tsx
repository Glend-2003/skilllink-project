import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  RefreshControl,
  Alert,
  Switch,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Search as SearchIcon, X, DollarSign, Clock, MapPin, Navigation } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Config } from '@/constants/Config';
import { useAuth } from '@/app/context/AuthContext';

const CATEGORY_COLORS: { [key: string]: { bg: string; text: string; border: string } } = {
  'Plomería': { bg: '#EFF6FF', text: '#3B82F6', border: '#3B82F6' },
  'Electricidad': { bg: '#FEF3C7', text: '#F59E0B', border: '#F59E0B' },
  'Carpintería': { bg: '#F3E8FF', text: '#8B5CF6', border: '#8B5CF6' },
  'Limpieza': { bg: '#CFFAFE', text: '#06B6D4', border: '#06B6D4' },
  'Jardinería': { bg: '#ECFCCB', text: '#84CC16', border: '#84CC16' },
  'Pintura': { bg: '#FCE7F3', text: '#EC4899', border: '#EC4899' },
  'Mecánica': { bg: '#FEE2E2', text: '#EF4444', border: '#EF4444' },
  'Tecnología': { bg: '#D1FAE5', text: '#10B981', border: '#10B981' },
};

const getCategoryColors = (categoryName: string) => {
  return CATEGORY_COLORS[categoryName] || { bg: '#F3F4F6', text: '#6B7280', border: '#9CA3AF' };
};

interface Category {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  iconUrl?: string;
  isActive: boolean;
  displayOrder: number;
  serviceCount: number;
}

interface Service {
  serviceId: number;
  providerId: number;
  serviceTitle: string;
  serviceDescription: string;
  basePrice: string;
  priceType: string;
  estimatedDurationMinutes?: number;
  isActive: boolean;
  isVerified: boolean;
  category: {
    categoryId: number;
    categoryName: string;
    categoryDescription?: string;
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
  reviewCount?: number;
  distance_km?: number; // Added for location-based search
}

export default function SearchScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Location states
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState(10);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const MIN_RADIUS = 1;
  const MAX_RADIUS = 50;
  const DISPLAY_MARKS = [5, 10, 15, 20, 30, 40, 50];
  const SLIDER_WIDTH = Dimensions.get('window').width - 80;
  const pan = useRef(new Animated.Value(0)).current;
  const initialPositionRef = useRef(0);
  const isDraggingRef = useRef(false);

  const getRadiusFromPosition = (position: number) => {
    const percentage = Math.max(0, Math.min(1, position / SLIDER_WIDTH));
    const radius = Math.round(MIN_RADIUS + percentage * (MAX_RADIUS - MIN_RADIUS));
    return Math.max(MIN_RADIUS, Math.min(MAX_RADIUS, radius));
  };

  const getPositionForRadius = (radius: number) => {
    const percentage = (radius - MIN_RADIUS) / (MAX_RADIUS - MIN_RADIUS);
    return percentage * SLIDER_WIDTH;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_, gestureState) => {
        isDraggingRef.current = true;
        initialPositionRef.current = (pan as any).__getValue();
        pan.setOffset(initialPositionRef.current);
        pan.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const newPosition = initialPositionRef.current + gestureState.dx;
        const clampedPosition = Math.max(0, Math.min(SLIDER_WIDTH, newPosition));
        const clampedDx = clampedPosition - initialPositionRef.current;
        pan.setValue(clampedDx);
      },
      onPanResponderRelease: (_, gestureState) => {
        pan.flattenOffset();
        
        const finalPosition = Math.max(0, Math.min(SLIDER_WIDTH, initialPositionRef.current + gestureState.dx));
        const newRadius = getRadiusFromPosition(finalPosition);
        
        const targetPosition = getPositionForRadius(newRadius);
        Animated.timing(pan, {
          toValue: targetPosition,
          duration: 100,
          useNativeDriver: false,
        }).start(() => {
          isDraggingRef.current = false;
        });
        
        setRadiusKm(newRadius);
      },
    })
  ).current;

  useEffect(() => {
    if (!isDraggingRef.current) {
      const targetPosition = getPositionForRadius(radiusKm);
      Animated.timing(pan, {
        toValue: targetPosition,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [radiusKm]);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (locationEnabled && userLocation) {
      loadLocationBasedServices();
    } else if (!loading) {
      filterServices();
    }
  }, [searchQuery, selectedCategory, locationEnabled, radiusKm]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Se necesitan permisos de ubicación para buscar servicios cercanos.'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting location:', error);
      return false;
    }
  };

  const getUserLocation = async () => {
    setGettingLocation(true);
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLocationEnabled(false);
        setGettingLocation(false);
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
      };
      setUserLocation(coords);
      setGettingLocation(false);
      return coords;
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación');
      setGettingLocation(false);
      setLocationEnabled(false);
      return null;
    }
  };

  const loadInitialData = async () => {
    try {
      // Load categories
      const categoriesRes = await fetch(`${Config.API_GATEWAY_URL}/api/v1/categories`).catch(() => null);
      if (categoriesRes?.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.filter((cat: Category) => cat.isActive));
      }

      // Load all services normally
      const servicesRes = await fetch(`${Config.API_GATEWAY_URL}/api/v1/services`).catch(() => null);
      if (servicesRes?.ok) {
        const servicesData = await servicesRes.json();
        setServices(servicesData);
        setFilteredServices(servicesData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocationBasedServices = async () => {
    if (!userLocation || !user?.userId) return;
    
    setSearching(true);
    try {
      const url = `${Config.API_GATEWAY_URL}/api/v1/recommendations/${user.userId}?radius_km=${radiusKm}&lat=${userLocation.lat}&lon=${userLocation.lon}`;
      const recommendationsRes = await fetch(url);
      
      if (recommendationsRes.ok) {
        const data = await recommendationsRes.json();
        const transformedServices = await transformRecommendationsToServices(data.providers);
        setServices(transformedServices);
        setFilteredServices(transformedServices);
      }
    } catch (error) {
      console.error('Error loading location services:', error);
    } finally {
      setSearching(false);
    }
  };

  const transformRecommendationsToServices = async (providers: any[]) => {
    // Fetch all services to map provider services to full service objects
    try {
      const servicesRes = await fetch(`${Config.API_GATEWAY_URL}/api/v1/services`);
      const allServices = await servicesRes.json();
      
      // Create a map of provider IDs to distance
      const providerDistances = new Map(
        providers.map((p: any) => [p.provider_id, p.distance_km])
      );
      
      // Filter services that belong to recommended providers and add distance
      const recommendedServices = allServices
        .filter((service: Service) => providerDistances.has(service.providerId))
        .map((service: Service) => {
          const distance = providerDistances.get(service.providerId);
          return {
            ...service,
            distance_km: distance || 0,
          };
        })
        .filter((service: any) => service.distance_km <= radiusKm)
        .sort((a: any, b: any) => a.distance_km - b.distance_km);
      
      return recommendedServices;
    } catch (error) {
      console.error('Error transforming recommendations:', error);
      return [];
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (locationEnabled && userLocation) {
      await loadLocationBasedServices();
    } else {
      await loadInitialData();
    }
    setRefreshing(false);
  };

  const filterServices = () => {
    setSearching(true);
    let filtered = services;

    if (selectedCategory) {
      const selectedCategoryName = categories.find(c => c.categoryId === selectedCategory)?.categoryName;
      
      if (selectedCategoryName) {
        filtered = filtered.filter(service => 
          service.category.categoryName.toLowerCase().trim() === selectedCategoryName.toLowerCase().trim()
        );
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.serviceTitle.toLowerCase().includes(query) ||
        service.serviceDescription.toLowerCase().includes(query) ||
        service.category.categoryName.toLowerCase().includes(query) ||
        service.provider.businessName.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
    setSearching(false);
  };

  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleLocationToggle = async (value: boolean) => {
    if (value) {
      const location = await getUserLocation();
      if (location) {
        setLocationEnabled(true);
        // Load services with location after getting GPS
        await loadLocationBasedServices();
      }
    } else {
      setLocationEnabled(false);
      setUserLocation(null);
      // Reload all services without location filter
      setLoading(true);
      await loadInitialData();
    }
  };

  const handleServicePress = (service: Service) => {
    // Always use userId from provider.user - this is the user_id that the API expects
    const userId = service.provider?.user?.userId;
    if (userId) {
      router.push(`/provider/${userId}`);
    } else {
      Alert.alert('Error', 'No se pudo obtener la información del proveedor');
    }
  };

  const getPriceDisplay = (service: Service) => {
    if (!service.basePrice || service.basePrice === '0' || service.basePrice === '0.00') return 'A consultar';
    
    const price = `$${Number(service.basePrice).toFixed(2)}`;
    
    if (service.priceType === 'hourly') return `${price}/hora`;
    if (service.priceType === 'negotiable') return `${price} (negociable)`;
    return price;
  };

  const getDurationDisplay = (minutes?: number) => {
    if (!minutes) return null;
    
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const renderCategory = ({ item }: { item: Category }) => {
    const colors = getCategoryColors(item.categoryName);
    const isSelected = selectedCategory === item.categoryId;
    
    return (
      <TouchableOpacity
        key={item.categoryId}
        style={[
          styles.categoryCard,
          { 
            backgroundColor: isSelected ? colors.bg : '#fff',
            borderColor: isSelected ? colors.border : '#E5E7EB',
          }
        ]}
        onPress={() => handleCategoryPress(item.categoryId)}
      >
        <View style={styles.categoryContent}>
          <Text
            style={[
              styles.categoryName,
              { color: isSelected ? colors.text : '#374151' }
            ]}
          >
            {item.categoryName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderService = ({ item }: { item: any }) => {
    const serviceImage = item.gallery && item.gallery.length > 0 
      ? item.gallery.sort((a: any, b: any) => a.displayOrder - b.displayOrder)[0].imageUrl 
      : null;
    
    const hasDistance = item.distance_km !== undefined && item.distance_km !== null;
    
    return (
      <TouchableOpacity style={styles.serviceCard} onPress={() => handleServicePress(item)}>
        <View style={styles.providerGradient}>
          {serviceImage && (
            <View style={styles.serviceImageContainer}>
              <Image source={{ uri: serviceImage }} style={styles.serviceImageFull} />
            </View>
          )}
          
          <View style={styles.serviceHeader}>
            <View style={styles.serviceInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.serviceName}>{item.serviceTitle}</Text>
              </View>
              <View style={styles.categoryBadgeContainer}>
                <View style={styles.categoryDotSmall} />
                <Text style={styles.categoryBadgeText}>{item.category.categoryName}</Text>
              </View>
              <View style={styles.ratingRow}>
                <Text style={styles.ratingStar}>★</Text>
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
                <Text style={styles.providerName}>• {item.provider?.businessName || 'Proveedor'}</Text>
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

          <View style={styles.serviceFooter}>
            <View style={styles.footerLeft}>
              <Text style={styles.priceLabel}>Desde</Text>
              <Text style={styles.priceText}>{getPriceDisplay(item)}</Text>
            </View>
            {hasDistance && (
              <View style={styles.distanceContainer}>
                <MapPin size={14} color="#3B82F6" />
                <Text style={styles.distanceText}>
                  {item.distance_km < 1 
                    ? `${Math.round(item.distance_km * 1000)}m`
                    : `${item.distance_km.toFixed(1)}km`
                  }
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#3B82F6']}
          tintColor="#3B82F6"
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Buscar Servicios</Text>
        <Text style={styles.subtitle}>
          Encuentra el servicio perfecto para ti
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchIcon size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar servicios, proveedores..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <X size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Location Filter Section */}
      <View style={styles.locationSection}>
        <View style={styles.locationHeader}>
          <View style={styles.locationTitleRow}>
            <Navigation size={20} color="#3B82F6" />
            <Text style={styles.locationTitle}>Buscar por ubicación</Text>
          </View>
          {gettingLocation ? (
            <ActivityIndicator size="small" color="#3B82F6" />
          ) : (
            <Switch
              value={locationEnabled}
              onValueChange={handleLocationToggle}
              trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
              thumbColor={locationEnabled ? '#3B82F6' : '#F3F4F6'}
            />
          )}
        </View>
        
        {locationEnabled && userLocation && (
          <View style={styles.radiusContainer}>
            <View style={styles.radiusHeader}>
              <View>
                <Text style={styles.radiusLabel}>Radio de búsqueda</Text>
                <Text style={styles.radiusSubLabel}>Desliza para ajustar</Text>
              </View>
              <View style={styles.radiusValueContainer}>
                <Text style={styles.radiusValue}>{radiusKm}</Text>
                <Text style={styles.radiusUnit}>km</Text>
              </View>
            </View>
            
            <View style={styles.sliderWrapper}>
              <View style={styles.sliderTrack}>
                <Animated.View 
                  style={[
                    styles.sliderFill,
                    {
                      width: pan.interpolate({
                        inputRange: [0, SLIDER_WIDTH],
                        outputRange: ['0%', '100%'],
                        extrapolate: 'clamp',
                      }),
                    }
                  ]} 
                />
                {/* Mini ticks para referencia visual */}
                <View style={styles.ticksContainer}>
                  {Array.from({ length: 10 }, (_, i) => (
                    <View key={i} style={styles.miniTick} />
                  ))}
                </View>
                <Animated.View
                  {...panResponder.panHandlers}
                  style={[
                    styles.sliderThumb,
                    {
                      transform: [
                        {
                          translateX: pan.interpolate({
                            inputRange: [0, SLIDER_WIDTH],
                            outputRange: [0, SLIDER_WIDTH],
                            extrapolate: 'clamp',
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.thumbInner}>
                    <View style={styles.thumbRipple} />
                  </View>
                </Animated.View>
              </View>
              
              <View style={styles.sliderMarks}>
                {DISPLAY_MARKS.map((km) => (
                  <TouchableOpacity
                    key={km}
                    style={styles.sliderMark}
                    onPress={() => {
                      setRadiusKm(km);
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                  >
                    <View style={[
                      styles.markDot,
                      radiusKm === km && styles.markDotActive
                    ]} />
                    <Text style={[
                      styles.markLabel,
                      radiusKm === km && styles.markLabelActive
                    ]}>
                      {km}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Categories Section */}
      <View style={styles.categoriesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          {selectedCategory && (
            <TouchableOpacity onPress={() => setSelectedCategory(null)}>
              <Text style={styles.clearFilter}>Limpiar filtro</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Categories Grid */}
        <View style={styles.categoriesGrid}>
          {categories.map((item, index) => {
            if (index % 2 === 0) {
              const nextItem = categories[index + 1];
              return (
                <View key={item.categoryId} style={styles.categoryRow}>
                  {renderCategory({ item })}
                  {nextItem && renderCategory({ item: nextItem })}
                </View>
              );
            }
            return null;
          })}
        </View>
      </View>

      {/* Results Section */}
      <View style={styles.resultsSection}>
        <View style={styles.resultsHeader}>
          <View>
            <Text style={styles.resultsTitle}>
              {searchQuery || selectedCategory ? 'Resultados' : locationEnabled ? 'Servicios cercanos' : 'Todos los servicios'}
            </Text>
            {locationEnabled && userLocation && (
              <Text style={styles.resultsSubtitle}>
                Dentro de {radiusKm} km de tu ubicación
              </Text>
            )}
          </View>
          <Text style={styles.resultsCount}>
            {filteredServices.length} resultado{filteredServices.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {searching ? (
          <ActivityIndicator size="small" color="#3B82F6" style={{ marginTop: 20 }} />
        ) : filteredServices.length === 0 ? (
          <View style={styles.emptyState}>
            <SearchIcon size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
            <Text style={styles.emptyText}>
              Intenta con otros términos de búsqueda
            </Text>
          </View>
        ) : (
          <View style={styles.servicesList}>
            {filteredServices.map((item) => (
              <View key={item.serviceId}>
                {renderService({ item })}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
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
  categoriesSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  clearFilter: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  categoriesGrid: {
    gap: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryContent: {
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultsSection: {
    backgroundColor: '#F8FAFC',
    paddingBottom: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  resultsSubtitle: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
    fontWeight: '500',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  servicesList: {
    paddingHorizontal: 20,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#1e40af',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  providerGradient: {
    padding: 20,
    backgroundColor: '#fafbfc',
  },
  serviceImageContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  serviceImageFull: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
  },
  categoryBadgeContainer: {
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
  categoryBadgeText: {
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
  ratingStar: {
    fontSize: 14,
    color: '#fbbf24',
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400e',
    marginLeft: 2,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  providerName: {
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
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerLeft: {
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
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
    letterSpacing: -0.3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  locationSection: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderRadius: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  radiusContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  radiusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  radiusLabel: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  radiusSubLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  radiusValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  radiusValue: {
    fontSize: 24,
    color: '#3B82F6',
    fontWeight: '700',
  },
  radiusUnit: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 2,
  },
  sliderWrapper: {
    paddingHorizontal: 4,
  },
  sliderTrack: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    position: 'relative',
    overflow: 'visible',
  },
  ticksContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  miniTick: {
    width: 2,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  sliderFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    left: 0,
  },
  sliderThumb: {
    position: 'absolute',
    width: 32,
    height: 32,
    top: -12,
    marginLeft: -16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbRipple: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
  },
  sliderMarks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 2,
  },
  sliderMark: {
    alignItems: 'center',
    gap: 8,
  },
  markDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E5E7EB',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  markDotActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#93C5FD',
    transform: [{ scale: 1.4 }],
  },
  markLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  markLabelActive: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 13,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
