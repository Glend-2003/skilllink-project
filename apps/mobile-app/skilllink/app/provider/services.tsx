import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Config } from '@/constants/Config';
import { Plus, Edit2, Trash2, DollarSign, Clock } from 'lucide-react-native';
import { ServiceGalleryView } from '@/components/ServiceGalleryView';

interface Service {
  serviceId: number;
  providerId: number;
  categoryId: number;
  categoryName: string;
  serviceTitle: string;
  serviceDescription: string;
  basePrice?: number;
  priceType: string;
  estimatedDurationMinutes?: number;
  isActive: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
  createdAt: string;
}

export default function ServicesScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch(`${Config.AUTH_SERVICE_URL.replace('/api/auth', '')}/api/provider/services`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else {
        Alert.alert('Error', 'No se pudieron cargar los servicios');
      }
    } catch (error) {
      console.error('Error loading services:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const handleDelete = (serviceId: number, title: string) => {
    Alert.alert(
      'Eliminar Servicio',
      `¿Estás seguro de eliminar "${title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deleteService(serviceId),
        },
      ]
    );
  };

  const deleteService = async (serviceId: number) => {
    try {
      const response = await fetch(
        `${Config.AUTH_SERVICE_URL.replace('/api/auth', '')}/api/provider/services/${serviceId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert('Éxito', 'Servicio eliminado');
        loadServices();
      } else {
        Alert.alert('Error', 'No se pudo eliminar el servicio');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const getPriceDisplay = (service: Service) => {
    if (!service.basePrice) return 'Precio a negociar';
    
    const price = `$${service.basePrice.toFixed(2)}`;
    
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

  const renderService = ({ item }: { item: Service }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.serviceTitle}>{item.serviceTitle}</Text>
          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
          {item.approvalStatus && (
            <View style={[
              styles.approvalBadge,
              item.approvalStatus === 'approved' && styles.approvedBadge,
              item.approvalStatus === 'pending' && styles.pendingBadge,
              item.approvalStatus === 'rejected' && styles.rejectedBadge,
            ]}>
              <Text style={styles.approvalText}>
                {item.approvalStatus === 'approved' && '✓ Aprobado'}
                {item.approvalStatus === 'pending' && '⌛ Pendiente'}
                {item.approvalStatus === 'rejected' && '✗ Rechazado'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => router.push(`/provider/edit-service?id=${item.serviceId}`)}
            style={styles.actionButton}
          >
            <Edit2 size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDelete(item.serviceId, item.serviceTitle)}
            style={styles.actionButton}
          >
            <Trash2 size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.categoryText}>{item.categoryName}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {item.serviceDescription}
      </Text>

      <ServiceGalleryView
        serviceId={item.serviceId}
        showUploadButton={false}
        maxImagesToShow={3}
      />

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <DollarSign size={16} color="#666" />
          <Text style={styles.infoText}>{getPriceDisplay(item)}</Text>
        </View>
        
        {item.estimatedDurationMinutes && (
          <View style={styles.infoItem}>
            <Clock size={16} color="#666" />
            <Text style={styles.infoText}>{getDurationDisplay(item.estimatedDurationMinutes)}</Text>
          </View>
        )}
      </View>

      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, item.isActive ? styles.activeBadge : styles.inactiveBadge]}>
          <Text style={styles.statusText}>
            {item.isActive ? 'Activo' : 'Inactivo'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Mis Servicios',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
        }}
      />
      <View style={styles.container}>
        <FlatList
          data={services}
          renderItem={renderService}
          keyExtractor={(item) => item.serviceId.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tienes servicios registrados</Text>
              <Text style={styles.emptySubtext}>Agrega tu primer servicio</Text>
            </View>
          }
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/provider/add-service')}
        >
          <Plus size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  verifiedBadge: {
    backgroundColor: '#34C759',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadge: {
    backgroundColor: '#E8F5E9',
  },
  inactiveBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  approvalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  approvedBadge: {
    backgroundColor: '#D1FAE5',
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
  },
  rejectedBadge: {
    backgroundColor: '#FEE2E2',
  },
  approvalText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
