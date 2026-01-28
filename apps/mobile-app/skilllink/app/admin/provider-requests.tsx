import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Briefcase,
  MapPin,
  DollarSign,
  FileText,
} from 'lucide-react-native';
import { Config } from '../../constants/Config';

interface ProviderRequest {
  requestId: number;
  userId: number;
  userEmail: string;
  businessName: string;
  description: string;
  services: string;
  experience?: string;
  location: string;
  hourlyRate?: number;
  portfolio?: string;
  certifications?: string;
  status: string;
  createdAt: string;
}

export default function ProviderRequestsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<ProviderRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setIsLoading(true);
      const url = filter === 'all' 
        ? `${Config.AUTH_SERVICE_URL}/provider-requests`
        : `${Config.AUTH_SERVICE_URL}/provider-requests?status=${filter}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else if (response.status === 403) {
        Alert.alert('Acceso Denegado', 'No tienes permisos de administrador');
        router.back();
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      Alert.alert('Error', 'No se pudieron cargar las solicitudes');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadRequests();
  };

  const handleReview = async (requestId: number, status: 'approved' | 'rejected') => {
    const statusText = status === 'approved' ? 'aprobar' : 'rechazar';
    
    Alert.alert(
      `¿${status === 'approved' ? 'Aprobar' : 'Rechazar'} solicitud?`,
      `¿Estás seguro de que quieres ${statusText} esta solicitud?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: status === 'approved' ? 'Aprobar' : 'Rechazar',
          style: status === 'approved' ? 'default' : 'destructive',
          onPress: () => processReview(requestId, status),
        },
      ]
    );
  };

  const processReview = async (requestId: number, status: 'approved' | 'rejected') => {
    try {
      setProcessingId(requestId);

      const response = await fetch(`${Config.AUTH_SERVICE_URL}/provider-requests/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          requestId,
          status,
          reviewNotes: status === 'approved' 
            ? 'Solicitud aprobada. ¡Bienvenido como proveedor!'
            : 'Solicitud rechazada. Por favor revisa los requisitos.',
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Éxito',
          `Solicitud ${status === 'approved' ? 'aprobada' : 'rechazada'} correctamente`
        );
        loadRequests();
      } else {
        Alert.alert('Error', 'No se pudo procesar la solicitud');
      }
    } catch (error) {
      console.error('Error processing review:', error);
      Alert.alert('Error', 'No se pudo procesar la solicitud');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderRequest = (request: ProviderRequest) => (
    <View key={request.requestId} style={styles.requestCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <User color="#2563eb" size={20} />
          </View>
          <View>
            <Text style={styles.businessName}>{request.businessName}</Text>
            <Text style={styles.email}>{request.userEmail}</Text>
          </View>
        </View>
        <View style={styles.dateContainer}>
          <Clock color="#64748b" size={14} />
          <Text style={styles.date}>{formatDate(request.createdAt)}</Text>
        </View>
      </View>

      {/* Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <MapPin color="#64748b" size={16} />
          <Text style={styles.detailText}>{request.location}</Text>
        </View>

        {request.hourlyRate && (
          <View style={styles.detailRow}>
            <DollarSign color="#64748b" size={16} />
            <Text style={styles.detailText}>${request.hourlyRate}/hora</Text>
          </View>
        )}

        {request.experience && (
          <View style={styles.detailRow}>
            <Briefcase color="#64748b" size={16} />
            <Text style={styles.detailText}>{request.experience}</Text>
          </View>
        )}
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Descripción</Text>
        <Text style={styles.sectionText} numberOfLines={3}>
          {request.description}
        </Text>
      </View>

      {/* Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servicios</Text>
        <Text style={styles.sectionText} numberOfLines={2}>
          {request.services}
        </Text>
      </View>

      {/* Actions - Solo para solicitudes pendientes */}
      {request.status === 'pending' && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleReview(request.requestId, 'rejected')}
            disabled={processingId === request.requestId}
          >
            {processingId === request.requestId ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <XCircle color="white" size={18} />
                <Text style={styles.actionButtonText}>Rechazar</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleReview(request.requestId, 'approved')}
            disabled={processingId === request.requestId}
          >
            {processingId === request.requestId ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <CheckCircle color="white" size={18} />
                <Text style={styles.actionButtonText}>Aprobar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Status Badge */}
      {request.status !== 'pending' && (
        <View style={styles.statusBadgeContainer}>
          <View style={[
            styles.statusBadge,
            request.status === 'approved' ? styles.approvedBadge : styles.rejectedBadge
          ]}>
            {request.status === 'approved' ? (
              <CheckCircle color="#10b981" size={16} />
            ) : (
              <XCircle color="#ef4444" size={16} />
            )}
            <Text style={[
              styles.statusBadgeText,
              request.status === 'approved' ? styles.approvedText : styles.rejectedText
            ]}>
              {request.status === 'approved' ? 'Aprobada' : 'Rechazada'}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitudes de Proveedor</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'pending' && styles.filterTabActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.filterTabText, filter === 'pending' && styles.filterTabTextActive]}>
              Pendientes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'approved' && styles.filterTabActive]}
            onPress={() => setFilter('approved')}
          >
            <Text style={[styles.filterTabText, filter === 'approved' && styles.filterTabTextActive]}>
              Aprobadas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'rejected' && styles.filterTabActive]}
            onPress={() => setFilter('rejected')}
          >
            <Text style={[styles.filterTabText, filter === 'rejected' && styles.filterTabTextActive]}>
              Rechazadas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterTabText, filter === 'all' && styles.filterTabTextActive]}>
              Todas
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FileText color="#94a3b8" size={64} />
          <Text style={styles.emptyTitle}>No hay solicitudes</Text>
          <Text style={styles.emptyText}>
            {filter === 'pending' 
              ? 'No hay solicitudes pendientes en este momento'
              : `No hay solicitudes ${filter === 'approved' ? 'aprobadas' : 'rechazadas'}`
            }
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          <View style={styles.content}>
            {requests.map(renderRequest)}
            <View style={{ height: 20 }} />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  filterContainer: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  filterTabActive: {
    backgroundColor: '#2563eb',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  filterTabTextActive: {
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#334155',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    color: '#64748b',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: '#64748b',
  },
  detailsContainer: {
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#475569',
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  sectionText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  approveButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadgeContainer: {
    marginTop: 12,
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  approvedBadge: {
    backgroundColor: '#d1fae5',
  },
  rejectedBadge: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  approvedText: {
    color: '#10b981',
  },
  rejectedText: {
    color: '#ef4444',
  },
});
