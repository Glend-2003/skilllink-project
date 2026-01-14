import { View, Text, StyleSheet, TextInput, FlatList, Pressable, ScrollView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

interface Provider {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  avatar?: string;
  description: string;
  hourlyRate?: number;
  verified: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const CATEGORIES: Category[] = [
  { id: "1", name: "Plomería", icon: "water", color: "#3B82F6" },
  { id: "2", name: "Electricista", icon: "flash", color: "#F59E0B" },
  { id: "3", name: "Técnico", icon: "settings", color: "#10B981" },
  { id: "4", name: "Barbería", icon: "cut", color: "#8B5CF6" },
  { id: "5", name: "Mecánica", icon: "car", color: "#EF4444" },
  { id: "6", name: "Diseño", icon: "brush", color: "#EC4899" },
  { id: "7", name: "Limpieza", icon: "sparkles", color: "#06B6D4" },
  { id: "8", name: "Jardinería", icon: "leaf", color: "#84CC16" },
];

const PROVIDERS: Provider[] = [
  {
    id: "1",
    name: "Juan Pérez",
    category: "Plomería",
    rating: 4.8,
    location: "Centro, Ciudad",
    description: "Especialista en reparaciones de plomería residencial y comercial",
    hourlyRate: 25,
    verified: true,
  },
  {
    id: "2",
    name: "Ana Martínez",
    category: "Electricista",
    rating: 4.9,
    location: "Norte, Ciudad",
    description: "Instalaciones eléctricas, reparaciones y mantenimiento",
    hourlyRate: 30,
    verified: true,
  },
  {
    id: "3",
    name: "Miguel Torres",
    category: "Barbería",
    rating: 4.7,
    location: "Sur, Ciudad",
    description: "Cortes modernos, afeitados tradicionales y cuidado capilar",
    hourlyRate: 20,
    verified: false,
  },
  {
    id: "4",
    name: "Carlos Ruiz",
    category: "Mecánica",
    rating: 4.6,
    location: "Este, Ciudad",
    description: "Reparación y mantenimiento de vehículos de todas las marcas",
    hourlyRate: 35,
    verified: true,
  },
];

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>(PROVIDERS);
  const { logout } = useAuth();
  useEffect(() => {
    let filtered = PROVIDERS;

    if (searchQuery) {
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(provider => provider.category === selectedCategory);
    }

    setFilteredProviders(filtered);
  }, [searchQuery, selectedCategory]);

  const handleContactProvider = (provider: Provider) => {
    router.push(`/chat/${provider.id}`);
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { backgroundColor: selectedCategory === item.name ? item.color : '#F1F5F9' }
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item.name ? null : item.name)}
    >
      <Ionicons
        name={item.icon as any}
        size={24}
        color={selectedCategory === item.name ? 'white' : item.color}
      />
      <Text style={[
        styles.categoryText,
        { color: selectedCategory === item.name ? 'white' : '#374151' }
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderProvider = ({ item }: { item: Provider }) => (
    <TouchableOpacity style={styles.providerCard} onPress={() => handleContactProvider(item)}>
      <View style={styles.providerHeader}>
        <View style={styles.providerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.providerName}>{item.name}</Text>
            {item.verified && (
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
            )}
          </View>
          <Text style={styles.providerCategory}>{item.category}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.location}>• {item.location}</Text>
          </View>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.providerFooter}>
        <View style={styles.rateContainer}>
          <Text style={styles.rate}>${item.hourlyRate}/hora</Text>
        </View>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => handleContactProvider(item)}
        >
          <Text style={styles.contactButtonText}>Contactar</Text>
          <Ionicons name="chatbubble-outline" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>¿Qué servicio necesitas?</Text>
            <Text style={styles.subtitle}>
              Encuentra profesionales verificados cerca de ti
            </Text>
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

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar servicios o profesionales..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Categorías populares</Text>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesList}
      />

      <View style={styles.providersHeader}>
        <Text style={styles.sectionTitle}>Profesionales destacados</Text>
        <Text style={styles.resultsCount}>
          {filteredProviders.length} resultado{filteredProviders.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={filteredProviders}
        keyExtractor={(item) => item.id}
        renderItem={renderProvider}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No se encontraron resultados</Text>
            <Text style={styles.emptyText}>
              Intenta con otros términos de búsqueda o categorías
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
    paddingBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: '#6B7280',
    lineHeight: 24,
    fontWeight: '400',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  categoriesList: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  providersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  providerCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
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
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  providerCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  description: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },
  providerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rateContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  contactButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginRight: 8,
    letterSpacing: 0.3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
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
    lineHeight: 20,
  },
});