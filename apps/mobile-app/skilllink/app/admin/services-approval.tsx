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
import { Stack } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Config } from '@/constants/Config';
import { CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react-native';

interface PendingService {
  serviceId: number;
  providerId: number;
  providerBusinessName: string;
  providerEmail: string;
  categoryId: number;
  categoryName: string;
  serviceTitle: string;
  serviceDescription: string;
  basePrice?: number;
  priceType: string;
  estimatedDurationMinutes?: number;
  isActive: boolean;
  approvalStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function ServicesApprovalScreen() {
  const { user } = useAuth();
  const [services, setServices] = useState<PendingService[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    loadServices();
  }, [filter]);

  const loadServices = async () => {
    try {
      const endpoint = filter === 'pending' 
        ? '/api/v1/services/admin/pending'
        : '/api/v1/services/admin/all';

      const response = await fetch(
        `${Config.API_GATEWAY_URL}${endpoint}`,
        {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setServices(data);
      } else if (response.status === 403) {
        Alert.alert('Acceso Denegado', 'No tienes permisos de administrador');
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

  const onRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const handleApprove = (serviceId: number, title: string) => {
    Alert.alert(
      'Aprobar Servicio',
      `¿Aprobar "${title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Aprobar',
          style: 'default',
          onPress: () => approveService(serviceId),
        },
      ]
    );
  };

  const handleReject = (serviceId: number, title: string) => {
    Alert.alert(
      'Rechazar Servicio',
      `¿Rechazar "${title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Rechazar',
          style: 'destructive',
          onPress: () => rejectService(serviceId),
        },
      ]
    );
  };

  const approveService = async (serviceId: number) => {
    try {
      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/services/admin/${serviceId}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
          },
        }
      );

      if (response.ok) {
        Alert.alert('Éxito', 'Servicio aprobado');
        loadServices();
      } else {
        Alert.alert('Error', 'No se pudo aprobar el servicio');
      }
    } catch (error) {
      console.error('Error approving service:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const rejectService = async (serviceId: number) => {
    try {
      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/services/admin/${serviceId}/reject`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: 'Contenido inapropiado o incompleto' }),
        }
      );

      if (response.ok) {
        Alert.alert('Éxito', 'Servicio rechazado');
        loadServices();
      } else {
        Alert.alert('Error', 'No se pudo rechazar el servicio');
      }
    } catch (error) {
      console.error('Error rejecting service:', error);
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const getPriceDisplay = (service: PendingService) => {
    if (!service.basePrice) return 'Precio a negociar';
    
    const priceNum = typeof service.basePrice === 'string' 
      ? parseFloat(service.basePrice) 
      : service.basePrice;
    
    const price = `$${priceNum.toFixed(2)}`;
    
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderService = ({ item }: { item: PendingService }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.headerTop}>
          <Text style={styles.serviceTitle}>{item.serviceTitle}</Text>
          <View 
            style={[
              styles.statusBadge, 
              { backgroundColor: getStatusColor(item.approvalStatus) + '20' }
            ]}
          >
            <Text style={[styles.statusText, { color: getStatusColor(item.approvalStatus) }]}>
              {item.approvalStatus === 'pending' && '⏳ Pendiente'}
              {item.approvalStatus === 'approved' && '✓ Aprobado'}
              {item.approvalStatus === 'rejected' && '✗ Rechazado'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.providerInfo}>
          Proveedor: {item.providerBusinessName} ({item.providerEmail})
        </Text>
      </View>

      <Text style={styles.categoryText}>{item.categoryName}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {item.serviceDescription}
      </Text>

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

      {item.approvalStatus === 'pending' && (
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => handleReject(item.serviceId, item.serviceTitle)}
            style={[styles.actionButton, styles.rejectButton]}
          >
            <XCircle size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Rechazar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => handleApprove(item.serviceId, item.serviceTitle)}
            style={[styles.actionButton, styles.approveButton]}
          >
            <CheckCircle size={20} color="#fff" />
            <Text style={styles.actionButtonText}>Aprobar</Text>
          </TouchableOpacity>
        </View>
      )}
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
          title: 'Aprobación de Servicios',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
        }}
      />
      
      <View style={styles.container}>
        <View style={styles.filterContainer}>
          <TouchableOpacity
            onPress={() => setFilter('pending')}
            style={[
              styles.filterButton,
              filter === 'pending' && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'pending' && styles.filterButtonTextActive,
              ]}
            >
              Pendientes
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={() => setFilter('all')}
            style={[
              styles.filterButton,
              filter === 'all' && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === 'all' && styles.filterButtonTextActive,
              ]}
            >
              Todos
            </Text>
          </TouchableOpacity>
        </View>

        {services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filter === 'pending' ? 'No hay servicios pendientes' : 'No hay servicios'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={services}
            renderItem={renderService}
            keyExtractor={(item) => item.serviceId.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  filterButtonTextActive: {
    color: '#fff',
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
    marginBottom: 12,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  providerInfo: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  categoryText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
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
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
