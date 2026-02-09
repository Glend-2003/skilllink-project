import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { router } from 'expo-router';
import { Search as SearchIcon, X, DollarSign, Clock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Config } from '@/constants/Config';

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
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchQuery, selectedCategory, services]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        fetch(`${Config.API_GATEWAY_URL}/api/v1/categories`).catch(() => null),
        fetch(`${Config.API_GATEWAY_URL}/api/v1/services`).catch(() => null),
      ]);

      if (categoriesRes?.ok) {
        const categoriesData = await categoriesRes.json();
        setCategories(categoriesData.filter((cat: Category) => cat.isActive));
      }

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInitialData();
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

  const renderService = ({ item }: { item: Service }) => {
    const serviceImage = item.gallery && item.gallery.length > 0 
      ? item.gallery.sort((a, b) => a.displayOrder - b.displayOrder)[0].imageUrl 
      : null;
    
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
          <Text style={styles.resultsTitle}>
            {searchQuery || selectedCategory ? 'Resultados' : 'Todos los servicios'}
          </Text>
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
});
