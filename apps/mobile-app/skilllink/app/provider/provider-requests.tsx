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
  TextInput,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Config } from '@/constants/Config';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../../components/CustomAlert';

interface ServiceRequest {
  requestId: number;
  requestTitle: string;
  requestDescription: string;
  serviceAddress: string;
  addressDetails?: string;
  contactPhone?: string;
  serviceLatitude?: number;
  serviceLongitude?: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  estimatedCost: number;
  finalCost: number | null;
  preferredDate: string;
  preferredTime: string;
  createdAt: string;
  clientUserId: number;
  service?: {
    serviceTitle?: string;
    category?: {
      categoryName?: string;
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

export default function ProviderRequestsScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [finalCost, setFinalCost] = useState('');
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
    loadProviderProfile();
  }, []);

  const loadProviderProfile = async () => {
    if (!user) return;

    try {
      const token = user.token;
      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/providers/user/${user.userId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const provider = await response.json();
        const actualProviderId = provider.id || provider.providerId;
        setProviderId(actualProviderId);
        loadRequests(actualProviderId);
      } else {
        setAlert({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'No se encontró el perfil de proveedor',
          onConfirm: () => router.back(),
        });
      }
    } catch (error) {
      console.error('Error loading provider profile:', error);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Error al cargar perfil',
      });
    }
  };

  const loadRequests = async (provId: number, showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const token = user?.token;
      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/requests/provider/${provId}`,
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
          message: 'No se pudieron cargar las solicitudes',
        });
      }
    } catch (error) {
      console.error('Error loading requests:', error);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Error al cargar solicitudes',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    if (providerId) {
      loadRequests(providerId, true);
    }
  }, [providerId]);

  const updateRequestStatus = async (
    requestId: number,
    status: string,
    cost?: number
  ) => {
    try {
      const token = user?.token;
      const body: any = { status };
      if (cost !== undefined) {
        body.finalCost = cost;
      }

      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/requests/${requestId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        setAlert({
          visible: true,
          type: 'success',
          title: 'Éxito',
          message: 'Solicitud actualizada',
        });
        if (providerId) {
          loadRequests(providerId);
        }
        return true;
      } else {
        setAlert({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'No se pudo actualizar la solicitud',
        });
        return false;
      }
    } catch (error) {
      console.error('Error updating request:', error);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Error al actualizar la solicitud',
      });
      return false;
    }
  };

  const handleAcceptRequest = () => {
    if (!selectedRequest) return;

    const cost = parseFloat(finalCost);
    if (isNaN(cost) || cost <= 0) {
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Ingresa un costo válido',
      });
      return;
    }

    setAlert({
      visible: true,
      type: 'warning',
      title: 'Aceptar Solicitud',
      message: `¿Deseas aceptar esta solicitud por $${cost}?`,
      showCancel: true,
      onConfirm: async () => {
        const success = await updateRequestStatus(
          selectedRequest.requestId,
          'accepted',
          cost
        );
        if (success) {
          setShowAcceptModal(false);
          setFinalCost('');
          setSelectedRequest(null);
        }
      },
    });
  };

  const handleRejectRequest = (requestId: number) => {
    setAlert({
      visible: true,
      type: 'warning',
      title: 'Rechazar Solicitud',
      message: '¿Estás seguro de que deseas rechazar esta solicitud?',
      showCancel: true,
      onConfirm: () => updateRequestStatus(requestId, 'cancelled'),
    });
  };

  const handleCompleteRequest = (requestId: number) => {
    setAlert({
      visible: true,
      type: 'info',
      title: 'Completar Servicio',
      message: '¿El servicio ha sido completado?',
      showCancel: true,
      onConfirm: () => updateRequestStatus(requestId, 'completed'),
    });
  };

  const handleStartProgress = (requestId: number) => {
    setAlert({
      visible: true,
      type: 'info',
      title: 'Iniciar Servicio',
      message: '¿Deseas marcar este servicio como en progreso?',
      showCancel: true,
      onConfirm: () => updateRequestStatus(requestId, 'in_progress'),
    });
  };

  const filteredRequests = selectedStatus
    ? requests.filter((r) => r.status === selectedStatus)
    : requests;

  const openInMaps = (latitude: number, longitude: number, address: string) => {
    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${address}&ll=${latitude},${longitude}`,
      android: `${scheme}${latitude},${longitude}?q=${address}`,
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
          Linking.openURL(webUrl);
        }
      });
    }
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

  const renderRequestActions = (item: ServiceRequest) => {
    switch (item.status) {
      case 'pending':
        return (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => {
                setSelectedRequest(item);
                setFinalCost(item.estimatedCost.toString());
                setShowAcceptModal(true);
              }}
            >
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.acceptButtonText}>Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => handleRejectRequest(item.requestId)}
            >
              <Ionicons name="close-circle" size={20} color="white" />
              <Text style={styles.rejectButtonText}>Rechazar</Text>
            </TouchableOpacity>
          </View>
        );
      case 'accepted':
        return (
          <TouchableOpacity
            style={styles.progressButton}
            onPress={() => handleStartProgress(item.requestId)}
          >
            <Ionicons name="play-circle" size={20} color="white" />
            <Text style={styles.progressButtonText}>Iniciar Servicio</Text>
          </TouchableOpacity>
        );
      case 'in_progress':
        return (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={() => handleCompleteRequest(item.requestId)}
          >
            <Ionicons name="checkmark-done-circle" size={20} color="white" />
            <Text style={styles.completeButtonText}>Marcar Completado</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

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
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.infoText} numberOfLines={2}>
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
              ? `$${item.finalCost} (Acordado)`
              : `$${item.estimatedCost} (Estimado)`}
          </Text>
        </View>

        {item.contactPhone && (
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={16} color="#6B7280" />
            <Text style={styles.infoText}>{item.contactPhone}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.detailsButton}
        onPress={() => {
          setSelectedRequest(item);
          setShowDetailsModal(true);
        }}
      >
        <Text style={styles.detailsButtonText}>Ver Detalles Completos</Text>
      </TouchableOpacity>

      {renderRequestActions(item)}

      <Text style={styles.requestDate}>
        Recibida: {new Date(item.createdAt).toLocaleDateString('es-ES')}
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Solicitudes Recibidas</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {renderStatusFilter()}

      {filteredRequests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-tray-outline" size={64} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>No hay solicitudes</Text>
          <Text style={styles.emptyText}>
            {selectedStatus
              ? `No tienes solicitudes con estado "${STATUS_LABELS[selectedStatus as keyof typeof STATUS_LABELS]}"`
              : 'Aún no has recibido ninguna solicitud de servicio'}
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

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detalles de la Solicitud</Text>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={true}
            >
              {selectedRequest && (
                <View style={styles.modalBody}>
                  {/* Status Badge */}
                  <View style={styles.detailStatusContainer}>
                    <View
                      style={[
                        styles.detailStatusBadge,
                        { backgroundColor: STATUS_COLORS[selectedRequest.status] },
                      ]}
                    >
                      <Text style={styles.detailStatusText}>
                        {STATUS_LABELS[selectedRequest.status]}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailSectionHeader}>
                      <Ionicons name="document-text" size={20} color="#3B82F6" />
                      <Text style={styles.modalSectionTitle}>Título</Text>
                    </View>
                    <Text style={styles.modalText}>{selectedRequest.requestTitle}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailSectionHeader}>
                      <Ionicons name="construct" size={20} color="#3B82F6" />
                      <Text style={styles.modalSectionTitle}>Servicio Solicitado</Text>
                    </View>
                    {selectedRequest.service ? (
                      <>
                        <Text style={styles.modalText}>{selectedRequest.service.serviceTitle || 'No especificado'}</Text>
                        {selectedRequest.service.category && (
                          <Text style={styles.modalSubText}>Categoría: {selectedRequest.service.category.categoryName}</Text>
                        )}
                      </>
                    ) : (
                      <Text style={styles.modalText}>No se especificó un servicio</Text>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailSectionHeader}>
                      <Ionicons name="information-circle" size={20} color="#3B82F6" />
                      <Text style={styles.modalSectionTitle}>Descripción</Text>
                    </View>
                    <Text style={styles.modalText}>{selectedRequest.requestDescription}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailSectionHeader}>
                      <Ionicons name="location" size={20} color="#3B82F6" />
                      <Text style={styles.modalSectionTitle}>Ubicación del Servicio</Text>
                    </View>
                    <Text style={styles.modalText}>{selectedRequest.serviceAddress}</Text>
                    {selectedRequest.addressDetails && (
                      <Text style={styles.modalSubText}>Detalles: {selectedRequest.addressDetails}</Text>
                    )}
                    {selectedRequest.serviceLatitude != null && selectedRequest.serviceLongitude != null && (
                      <View style={styles.locationActionsContainer}>
                        <TouchableOpacity
                          style={styles.viewMapButton}
                          onPress={() => setShowMapModal(true)}
                        >
                          <LinearGradient
                            colors={['#3B82F6', '#25d4eb']}
                            style={styles.mapButtonGradient}
                          >
                            <Ionicons name="map" size={18} color="white" />
                            <Text style={styles.mapButtonText}>Ver en Mapa</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.navigateButton}
                          onPress={() => openInMaps(
                            Number(selectedRequest.serviceLatitude),
                            Number(selectedRequest.serviceLongitude),
                            selectedRequest.serviceAddress
                          )}
                        >
                          <LinearGradient
                            colors={['#10B981', '#18b2ea']}
                            style={styles.mapButtonGradient}
                          >
                            <Ionicons name="navigate" size={18} color="white" />
                            <Text style={styles.mapButtonText}>Navegar</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    )}
                    {selectedRequest.serviceLatitude != null && selectedRequest.serviceLongitude != null && (
                      <Text style={styles.coordinatesText}>
                        📍 {Number(selectedRequest.serviceLatitude).toFixed(6)}, {Number(selectedRequest.serviceLongitude).toFixed(6)}
                      </Text>
                    )}
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailSectionHeader}>
                      <Ionicons name="calendar" size={20} color="#3B82F6" />
                      <Text style={styles.modalSectionTitle}>Fecha y Hora Preferida</Text>
                    </View>
                    <Text style={styles.modalText}>
                      {new Date(selectedRequest.preferredDate).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                    <Text style={styles.modalSubText}>{selectedRequest.preferredTime}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailSectionHeader}>
                      <Ionicons name="cash" size={20} color="#3B82F6" />
                      <Text style={styles.modalSectionTitle}>Información de Costos</Text>
                    </View>
                    {selectedRequest.estimatedCost != null && (
                      <Text style={styles.modalText}>
                        Costo Estimado: ${Number(selectedRequest.estimatedCost).toFixed(2)}
                      </Text>
                    )}
                    {selectedRequest.finalCost != null && (
                      <Text style={styles.modalHighlightText}>
                        Costo Acordado: ${Number(selectedRequest.finalCost).toFixed(2)}
                      </Text>
                    )}
                    {selectedRequest.estimatedCost == null && selectedRequest.finalCost == null && (
                      <Text style={styles.modalText}>No se especificó costo</Text>
                    )}
                  </View>

                  {selectedRequest.contactPhone && (
                    <View style={styles.detailSection}>
                      <View style={styles.detailSectionHeader}>
                        <Ionicons name="call" size={20} color="#3B82F6" />
                        <Text style={styles.modalSectionTitle}>Teléfono de Contacto</Text>
                      </View>
                      <Text style={styles.modalText}>{selectedRequest.contactPhone}</Text>
                    </View>
                  )}
                  <View style={styles.detailSection}>
                    <View style={styles.detailSectionHeader}>
                      <Ionicons name="time" size={20} color="#3B82F6" />
                      <Text style={styles.modalSectionTitle}>Solicitud Recibida</Text>
                    </View>
                    <Text style={styles.modalText}>
                      {new Date(selectedRequest.createdAt).toLocaleString('es-ES', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.closeModalButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <Text style={styles.mapModalTitle}>Ubicación del Servicio</Text>
            <TouchableOpacity onPress={() => setShowMapModal(false)} style={styles.mapCloseButton}>
              <Ionicons name="close" size={28} color="#1F2937" />
            </TouchableOpacity>
          </View>

          {selectedRequest?.serviceLatitude != null && selectedRequest?.serviceLongitude != null && (
            <>
              <MapView
                style={styles.fullMap}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: Number(selectedRequest.serviceLatitude),
                  longitude: Number(selectedRequest.serviceLongitude),
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                loadingEnabled={true}
                loadingIndicatorColor="#3B82F6"
              >
                <Marker
                  coordinate={{
                    latitude: Number(selectedRequest.serviceLatitude),
                    longitude: Number(selectedRequest.serviceLongitude),
                  }}
                  title={selectedRequest.requestTitle}
                  description={selectedRequest.serviceAddress}
                  pinColor="#EF4444"
                />
              </MapView>

              <View style={styles.mapModalFooter}>
                <View style={styles.mapAddressContainer}>
                  <Text style={styles.mapAddressTitle}>Dirección:</Text>
                  <Text style={styles.mapAddressText}>{selectedRequest.serviceAddress}</Text>
                  {selectedRequest.addressDetails && (
                    <Text style={styles.mapAddressDetails}>📝 {selectedRequest.addressDetails}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.navigateFromMapButton}
                  onPress={() => {
                    openInMaps(
                      Number(selectedRequest.serviceLatitude),
                      Number(selectedRequest.serviceLongitude),
                      selectedRequest.serviceAddress
                    );
                  }}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.navigateGradient}
                  >
                    <Ionicons name="navigate" size={24} color="white" />
                    <Text style={styles.navigateFromMapText}>Abrir en Navegación</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>

      {/* Accept Request Modal */}
      <Modal
        visible={showAcceptModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAcceptModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Aceptar Solicitud</Text>
              <TouchableOpacity onPress={() => setShowAcceptModal(false)}>
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalSectionTitle}>Costo Final del Servicio</Text>
              <Text style={styles.modalHint}>
                Ingresa el costo que acordarás con el cliente
              </Text>
              <TextInput
                style={styles.costInput}
                placeholder="Ej: 150.00"
                value={finalCost}
                onChangeText={setFinalCost}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() => setShowAcceptModal(false)}
              >
                <Text style={styles.cancelModalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleAcceptRequest}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  detailsButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  detailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  progressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    gap: 4,
    marginTop: 8,
  },
  progressButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 8,
    padding: 12,
    gap: 4,
    marginTop: 8,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  modalScrollView: {
    maxHeight: '70%',
  },
  modalBody: {
    padding: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 4,
  },
  modalText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 4,
  },
  modalSubText: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    marginTop: 4,
  },
  modalHighlightText: {
    fontSize: 15,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 6,
  },
  detailStatusContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  detailStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  detailStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailSection: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  modalHint: {
    fontSize: 13,
    color: '#9CA3AF',
    marginBottom: 12,
  },
  costInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  closeModalButton: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  closeModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  cancelModalButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  cancelModalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  locationActionsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  viewMapButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  navigateButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  mapButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  mapButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  coordinatesText: {
    fontSize: 11,
    color: '#10B981',
    marginTop: 8,
    fontWeight: '500',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  mapCloseButton: {
    padding: 4,
  },
  fullMap: {
    flex: 1,
  },
  mapModalFooter: {
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  mapAddressContainer: {
    marginBottom: 16,
  },
  mapAddressTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  mapAddressText: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
    lineHeight: 20,
  },
  mapAddressDetails: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  navigateFromMapButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  navigateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
  },
  navigateFromMapText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
