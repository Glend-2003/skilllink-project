import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Config } from '@/constants/Config';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../../components/CustomAlert';

interface ServiceRequest {
  requestId: number;
  requestTitle: string;
  requestDescription: string;
  serviceAddress: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost: number;
  finalCost: number | null;
  preferredDate: string;
  preferredTime: string;
  createdAt: string;
  review?: {
    reviewId: number;
    rating: number;
  };
  service?: {
    serviceTitle?: string;
    category?: {
      categoryName?: string;
    };
  };
  provider: {
    providerId: number;
    businessName: string;
    user?: {
      userId: number;
      profileImageUrl?: string;
    };
  };
}

const STATUS_COLORS = {
  pending: '#F59E0B',
  accepted: '#10B981',
  in_progress: '#3B82F6',
  completed: '#6B7280',
  cancelled: '#EF4444',
};

const STATUS_LABELS = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  in_progress: 'En Progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export default function MyRequestsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    showCancel?: boolean;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = user?.token;
      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/requests/mine`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      } else {
        setAlert({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'No se pudieron cargar las solicitudes. Intenta nuevamente.',
        });
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Error al cargar solicitudes.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    loadRequests(true);
  }, []);

  const cancelRequest = async (requestId: number) => {
    setAlert({
      visible: true,
      type: 'warning',
      title: 'Cancelar Solicitud',
      message: '¿Estás seguro de que deseas cancelar esta solicitud?',
      showCancel: true,
      onConfirm: async () => {
        try {
          const token = user?.token;
          const response = await fetch(
            `${Config.API_GATEWAY_URL}/api/v1/requests/${requestId}`,
            {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            setAlert({
              visible: true,
              type: 'success',
              title: '¡Listo!',
              message: 'La solicitud ha sido cancelada.',
            });
            loadRequests();
          } else {
            setAlert({
              visible: true,
              type: 'error',
              title: 'Error',
              message: 'No se pudo cancelar la solicitud. Intenta nuevamente.',
            });
          }
        } catch (error) {
          console.error('Error cancelling request:', error);
          setAlert({
            visible: true,
            type: 'error',
            title: 'Error',
            message: 'Error al cancelar la solicitud.',
          });
        }
      },
    });
  };

  const filteredRequests = selectedStatus
    ? requests.filter((r) => r.status === selectedStatus)
    : requests;

  const openDetailsModal = (item: ServiceRequest) => {
    setSelectedRequest(item);
    setModalVisible(true);
  };

  const closeDetailsModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedRequest(null), 300);
  };

  const renderStatusFilter = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterChip, !selectedStatus && styles.filterChipActive]}
        onPress={() => setSelectedStatus(null)}
      >
        <Text style={[styles.filterText, !selectedStatus && styles.filterTextActive]}>
          Todas ({requests.length})
        </Text>
      </TouchableOpacity>

      {Object.entries(STATUS_LABELS).map(([status, label]) => {
        const count = requests.filter((r) => r.status === status).length;
        if (count === 0) return null;

        return (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterChip,
              selectedStatus === status && styles.filterChipActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === status && styles.filterTextActive,
              ]}
            >
              {label} ({count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderRequest = ({ item }: { item: ServiceRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.requestTitleContainer}>
          <Text style={styles.requestTitle}>{item.requestTitle}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: STATUS_COLORS[item.status] },
            ]}
          >
            <Text style={styles.statusText}>
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.requestInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="construct-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {item.service?.serviceTitle || 'Servicio no especificado'}{item.service?.category?.categoryName ? ` - ${item.service.category.categoryName}` : ''}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>{item.provider.businessName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText} numberOfLines={1}>
            {item.serviceAddress}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {new Date(item.preferredDate).toLocaleDateString('es-ES')} -{' '}
            {item.preferredTime}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="cash-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText}>
            {item.finalCost
              ? `$${item.finalCost} (Final)`
              : `$${item.estimatedCost} (Estimado)`}
          </Text>
        </View>
      </View>

      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() => openDetailsModal(item)}
        >
          <Text style={styles.detailsButtonText}>Ver Detalles</Text>
        </TouchableOpacity>

        {item.status === 'completed' && !item.review && (
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => router.push(`/review/${item.requestId}`)}
          >
            <Ionicons name="star" size={20} color="#F59E0B" />
            <Text style={styles.reviewButtonText}>Calificar</Text>
          </TouchableOpacity>
        )}

        {item.status === 'completed' && item.review && (
          <View style={styles.ratedBadge}>
            <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            <Text style={styles.ratedText}>Calificado</Text>
          </View>
        )}

        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => cancelRequest(item.requestId)}
          >
            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.requestDate}>
        Creada: {new Date(item.createdAt).toLocaleDateString('es-ES')}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Cargando solicitudes...</Text>
      </View>
    );
  }

  const renderDetailsModal = () => {
    if (!selectedRequest) return null;

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetailsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#1e3a8a', '#3b82f6']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Detalles de la Solicitud</Text>
              <TouchableOpacity onPress={closeDetailsModal} style={styles.modalCloseButton}>
                <Ionicons name="close" size={28} color="#FFF" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.modalSection}>
                <View style={styles.modalTitleRow}>
                  <Text style={styles.modalRequestTitle}>{selectedRequest.requestTitle}</Text>
                  <View
                    style={[
                      styles.modalStatusBadge,
                      { backgroundColor: STATUS_COLORS[selectedRequest.status] },
                    ]}
                  >
                    <Text style={styles.modalStatusText}>
                      {STATUS_LABELS[selectedRequest.status]}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="information-circle" size={20} color="#3B82F6" />
                  <Text style={styles.modalSectionTitle}>Descripción</Text>
                </View>
                <Text style={styles.modalDescription}>{selectedRequest.requestDescription}</Text>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="construct" size={20} color="#3B82F6" />
                  <Text style={styles.modalSectionTitle}>Servicio</Text>
                </View>
                <View style={styles.modalInfoCard}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Servicio:</Text>
                    <Text style={styles.modalValue}>{selectedRequest.service?.serviceTitle || 'No especificado'}</Text>
                  </View>
                  {selectedRequest.service?.category && (
                    <View style={styles.modalInfoRow}>
                      <Text style={styles.modalLabel}>Categoría:</Text>
                      <Text style={styles.modalValue}>{selectedRequest.service.category.categoryName}</Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="business" size={20} color="#3B82F6" />
                  <Text style={styles.modalSectionTitle}>Proveedor</Text>
                </View>
                <View style={styles.modalInfoCard}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Nombre:</Text>
                    <Text style={styles.modalValue}>{selectedRequest.provider.businessName}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="location" size={20} color="#3B82F6" />
                  <Text style={styles.modalSectionTitle}>Ubicación</Text>
                </View>
                <View style={styles.modalInfoCard}>
                  <Text style={styles.modalAddressText}>{selectedRequest.serviceAddress}</Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="calendar" size={20} color="#3B82F6" />
                  <Text style={styles.modalSectionTitle}>Fecha y Hora</Text>
                </View>
                <View style={styles.modalInfoCard}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Fecha:</Text>
                    <Text style={styles.modalValue}>
                      {new Date(selectedRequest.preferredDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Hora:</Text>
                    <Text style={styles.modalValue}>{selectedRequest.preferredTime}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="cash" size={20} color="#3B82F6" />
                  <Text style={styles.modalSectionTitle}>Costos</Text>
                </View>
                <View style={styles.modalInfoCard}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Costo Estimado:</Text>
                    <Text style={styles.modalValuePrice}>${selectedRequest.estimatedCost}</Text>
                  </View>
                  {selectedRequest.finalCost && (
                    <View style={styles.modalInfoRow}>
                      <Text style={styles.modalLabel}>Costo Final:</Text>
                      <Text style={[styles.modalValuePrice, styles.modalFinalPrice]}>
                        ${selectedRequest.finalCost}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Ionicons name="time" size={20} color="#3B82F6" />
                  <Text style={styles.modalSectionTitle}>Fechas</Text>
                </View>
                <View style={styles.modalInfoCard}>
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalLabel}>Creada:</Text>
                    <Text style={styles.modalValue}>
                      {new Date(selectedRequest.createdAt).toLocaleString('es-ES')}
                    </Text>
                  </View>
                </View>
              </View>

              {selectedRequest.review && (
                <View style={styles.modalSection}>
                  <View style={styles.modalSectionHeader}>
                    <Ionicons name="star" size={20} color="#F59E0B" />
                    <Text style={styles.modalSectionTitle}>Calificación</Text>
                  </View>
                  <View style={styles.modalInfoCard}>
                    <View style={styles.ratingDisplay}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Ionicons
                          key={star}
                          name={star <= selectedRequest.review!.rating ? 'star' : 'star-outline'}
                          size={28}
                          color="#F59E0B"
                        />
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.modalButton} onPress={closeDetailsModal}>
                <Text style={styles.modalButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {renderDetailsModal()}
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Solicitudes</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {renderStatusFilter()}

      {filteredRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No hay solicitudes</Text>
          <Text style={styles.emptyText}>
            {selectedStatus
              ? `No tienes solicitudes con estado "${STATUS_LABELS[selectedStatus as keyof typeof STATUS_LABELS]}"`
              : 'Aún no has realizado ninguna solicitud de servicio'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.requestId.toString()}
          renderItem={renderRequest}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        showCancel={alert.showCancel}
        onConfirm={() => {
          if (alert.onConfirm) {
            alert.onConfirm();
          }
          setAlert({ ...alert, visible: false });
        }}
        onCancel={() => setAlert({ ...alert, visible: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  centerContainer: {
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  refreshButton: {
    padding: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  requestHeader: {
    marginBottom: 12,
  },
  requestTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  requestTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  requestInfo: {
    marginBottom: 12,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginRight: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  ratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  ratedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 12,
    gap: 4,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  requestDate: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'right',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalSection: {
    marginBottom: 24,
  },
  modalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalRequestTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
    letterSpacing: -0.3,
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  modalStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
  },
  modalSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalDescription: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  modalInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  modalValuePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#059669',
  },
  modalFinalPrice: {
    color: '#3B82F6',
  },
  modalAddressText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  ratingDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  modalFooter: {
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  modalButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
