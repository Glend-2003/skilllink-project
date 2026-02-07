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
} from 'react-native';
import { router } from 'expo-router';
import { Search as SearchIcon, X, DollarSign, Clock } from 'lucide-react-native';
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
  id: string;
  providerId: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  description: string;
  hourlyRate: number;
  priceType: string;
  estimatedDuration?: number;
  verified: boolean;
  providerName: string;
  reviewCount: number;
  profileImageUrl?: string;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterServices();
  }, [searchQuery, selectedCategory, services]);

  const loadInitialData = async () => {
    try {
      const [categoriesRes, servicesRes] = await Promise.all([
        fetch(`${Config.AUTH_SERVICE_URL}/categories`).catch(() => null),
        fetch(`${Config.PROVIDER_SERVICE_URL}/api/services`).catch(() => null),
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

  const filterServices = () => {
    setSearching(true);
    let filtered = services;

    if (selectedCategory) {
      const selectedCategoryName = categories.find(c => c.categoryId === selectedCategory)?.categoryName;
      
      if (selectedCategoryName) {
        filtered = filtered.filter(service => 
          service.category.toLowerCase().trim() === selectedCategoryName.toLowerCase().trim()
        );
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query) ||
        service.providerName.toLowerCase().includes(query)
      );
    }

    setFilteredServices(filtered);
    setSearching(false);
  };

  const handleCategoryPress = (categoryId: number) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleServicePress = (service: Service) => {
    router.push(`/provider/${service.providerId}`);
  };

  const getPriceDisplay = (service: Service) => {
    if (!service.hourlyRate || service.hourlyRate === 0) return 'A consultar';
    
    const price = `$${Number(service.hourlyRate).toFixed(2)}`;
    
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

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity style={styles.serviceCard} onPress={() => handleServicePress(item)}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <Text style={styles.providerName}>Por: {item.providerName}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        </View>
        {item.profileImageUrl ? (
          <Image source={{ uri: item.profileImageUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.providerName.charAt(0)}</Text>
          </View>
        )}
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.serviceFooter}>
        <View style={styles.infoRow}>
          <Text style={styles.priceText}>{getPriceDisplay(item)}</Text>
          
          {item.estimatedDuration && (
            <Text style={styles.infoText}> • {getDurationDisplay(item.estimatedDuration)}</Text>
          )}
        </View>

        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>{item.rating.toFixed(1)}</Text>
          {item.verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verificado</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
              <View key={item.id}>
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
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e0e0',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priceText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rating: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F59E0B',
  },
  verifiedBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
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
