import { View, Text, StyleSheet, TextInput, FlatList, Pressable, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
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
  rating?: number;
  location?: string;
}

interface Category {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  iconUrl?: string;
  isActive: boolean;
  displayOrder?: number;
  serviceCount?: number;
}

const CATEGORY_ICONS: { [key: string]: { icon: string; color: string } } = {
  'Plomería': { icon: 'water', color: '#3B82F6' },
  'Electricidad': { icon: 'flash', color: '#F59E0B' },
  'Carpintería': { icon: 'hammer', color: '#8B5CF6' },
  'Limpieza': { icon: 'sparkles', color: '#06B6D4' },
  'Jardinería': { icon: 'leaf', color: '#84CC16' },
  'Pintura': { icon: 'color-palette', color: '#EC4899' },
  'Mecánica': { icon: 'car', color: '#EF4444' },
  'Tecnología': { icon: 'laptop', color: '#10B981' },
};

const getIconForCategory = (categoryName: string) => {
  return CATEGORY_ICONS[categoryName] || { icon: 'briefcase', color: '#6B7280' };
};

export default function HomeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesResponse = await fetch(`${Config.AUTH_SERVICE_URL}/categories`);
        
        if (!categoriesResponse.ok) {
          throw new Error(`Error categorías: ${categoriesResponse.status} ${categoriesResponse.statusText}`);
        }
        
        const categoriesText = await categoriesResponse.text();
        
        const categoriesData = categoriesText ? JSON.parse(categoriesText) : [];
        setCategories(Array.isArray(categoriesData) ? categoriesData.filter((cat: Category) => cat.isActive) : []);

        const servicesResponse = await fetch(`${Config.API_GATEWAY_URL}/api/v1/services`);
        
        if (!servicesResponse.ok) {
          throw new Error(`Error servicios: ${servicesResponse.status} ${servicesResponse.statusText}`);
        }
        
        const servicesText = await servicesResponse.text();
        
        const servicesData = servicesText ? JSON.parse(servicesText) : [];
        setAllProviders(Array.isArray(servicesData) ? servicesData : []);
        setFilteredProviders(Array.isArray(servicesData) ? servicesData : []);
        
        if (Array.isArray(servicesData) && servicesData.length > 0) {
          const featured = [...servicesData].sort((a, b) => b.rating - a.rating).slice(0, 5);
          setFeaturedServices(featured);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setAllProviders([]);
        setCategories([]);
        setFeaturedServices([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = allProviders;

    if (selectedCategory) {
      filtered = filtered.filter(provider => {
        const categoryName = typeof provider.category === 'string' 
          ? provider.category 
          : provider.category?.categoryName;
        return categoryName === selectedCategory;
      });
    }

    setFilteredProviders(filtered);
  }, [selectedCategory, allProviders]);

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

  const renderCategory = ({ item }: { item: Category }) => {
    const iconConfig = getIconForCategory(item.categoryName);
    const isSelected = selectedCategory === item.categoryName;
    
    return (
      <TouchableOpacity
        style={[
          styles.categoryCard,
          { backgroundColor: isSelected ? iconConfig.color : '#FFFFFF' }
        ]}
        onPress={() => setSelectedCategory(isSelected ? null : item.categoryName)}
      >
        <View style={[
          styles.categoryIconContainer,
          { backgroundColor: isSelected ? 'rgba(255,255,255,0.3)' : iconConfig.color + '15' }
        ]}>
          <Ionicons
            name={iconConfig.icon as any}
            size={28}
            color={isSelected ? 'white' : iconConfig.color}
          />
        </View>
        <Text style={[
          styles.categoryText,
          { color: isSelected ? 'white' : '#1F2937' }
        ]}>
          {item.categoryName}
        </Text>
        {item.serviceCount !== undefined && item.serviceCount > 0 && (
          <Text style={[styles.categoryCount, { color: isSelected ? 'white' : '#6B7280' }]}>
            {item.serviceCount}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderFeaturedService = ({ item }: { item: Provider }) => (
    <TouchableOpacity 
      style={styles.featuredCard} 
      onPress={() => handleViewServiceProvider(item)}
    >
      <View style={styles.featuredHeader}>
        {item.provider?.user?.profileImageUrl ? (
          <Image source={{ uri: item.provider.user.profileImageUrl }} style={styles.featuredAvatarImage} />
        ) : (
          <View style={styles.featuredAvatar}>
            <Ionicons name="person" size={28} color="#FFF" />
          </View>
        )}
        <View style={styles.featuredRating}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.featuredRatingText}>{(item.rating || 4.5).toFixed(1)}</Text>
        </View>
      </View>

      <Text style={styles.featuredName} numberOfLines={1}>{item.serviceTitle}</Text>
      <Text style={styles.featuredCategory}>
        {typeof item.category === 'string' ? item.category : item.category?.categoryName || 'Sin categoría'}
      </Text>
      <Text style={styles.featuredDescription} numberOfLines={2}>
        {item.serviceDescription}
      </Text>

      <View style={styles.featuredFooter}>
        <Text style={styles.featuredPrice}>${item.basePrice}</Text>
        {item.isVerified && (
          <Text style={styles.verifiedText}>Verificado</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderProvider = ({ item }: { item: Provider }) => (
    <TouchableOpacity style={styles.providerCard} onPress={() => handleViewServiceProvider(item)}>
      <View style={styles.providerHeader}>
        <View style={styles.providerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.providerName}>{item.serviceTitle}</Text>
          </View>
          <Text style={styles.providerCategory}>
            {typeof item.category === 'string' ? item.category : item.category?.categoryName || 'Sin categoría'}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.rating}>{item.rating || 4.5}</Text>
            <Text style={styles.location}>• {item.provider?.businessName || 'Proveedor'}</Text>
          </View>
        </View>
        {item.provider?.user?.profileImageUrl ? (
          <Image source={{ uri: item.provider.user.profileImageUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color="#FFF" />
          </View>
        )}
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.serviceDescription}
      </Text>

      <View style={styles.providerFooter}>
        <Text style={styles.rate}>${item.basePrice}</Text>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => {
            handleContactServiceProvider(item);
          }}
        >
          <Text style={styles.contactButtonText}>Contactar</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Bienvenido</Text>
            <Text style={styles.title}>Descubre servicios</Text>
            <Text style={styles.subtitle}>Encuentra profesionales verificados</Text>
          </View>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              logout();
              router.replace('/login');
            }}
          >
            <Ionicons name="log-out-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Featured Services */}
      {!selectedCategory && featuredServices.length > 0 && (
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

      {/* Categories */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categorías</Text>
        {selectedCategory && (
          <TouchableOpacity onPress={() => setSelectedCategory(null)}>
            <Text style={styles.clearFilter}>Limpiar</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.categoryId.toString()}
        renderItem={renderCategory}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />

      {/* Services List */}
      <View style={styles.providersHeader}>
        <Text style={styles.sectionTitle}>
          {selectedCategory || 'Todos los Servicios'}
        </Text>
        <Text style={styles.resultsCount}>
          {filteredProviders.length} servicio{filteredProviders.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={filteredProviders}
        keyExtractor={(item) => item.serviceId?.toString() || item.id?.toString() || Math.random().toString()}
        renderItem={renderProvider}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>No hay servicios disponibles</Text>
            <Text style={styles.emptyText}>
              {selectedCategory 
                ? 'No hay servicios en esta categoría aún' 
                : 'Pronto habrá servicios disponibles'
              }
            </Text>
          </View>
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginTop: 4,
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
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  seeAll: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  clearFilter: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  featuredList: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 16,
  },
  featuredCard: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  featuredBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  featuredBadgeText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  featuredAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredAvatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e0e0',
  },
  featuredRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  featuredRatingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#92400E',
  },
  featuredName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  featuredCategory: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 8,
  },
  featuredDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#059669',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 12,
  },
  categoryCard: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    minWidth: 120,
  },
  categoryIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
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
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 8,
  },
  providerCategory: {
    fontSize: 13,
    color: '#3B82F6',
    marginBottom: 6,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e0e0e0',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 21,
    marginBottom: 16,
  },
  providerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateContainer: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  rate: {
    fontSize: 17,
    fontWeight: '700',
    color: '#059669',
  },
  contactButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
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