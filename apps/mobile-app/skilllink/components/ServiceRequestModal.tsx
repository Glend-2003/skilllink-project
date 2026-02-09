import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Config } from '@/constants/Config';
import { useAuth } from '@/app/context/AuthContext';

interface ServiceRequestModalProps {
  visible: boolean;
  onClose: () => void;
  providerId: number;
  providerName: string;
  onSuccess?: () => void;
}

interface Service {
  serviceId: number;
  serviceName: string;
  basePrice: number;
  categoryId: number;
}

export default function ServiceRequestModal({
  visible,
  onClose,
  providerId,
  providerName,
  onSuccess,
}: ServiceRequestModalProps) {
  const { user } = useAuth();
  
  // Form state
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState(new Date());
  const [preferredTime, setPreferredTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // Location state
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [tempLocation, setTempLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Load provider services
  useEffect(() => {
    if (visible && providerId) {
      loadProviderServices();
    }
  }, [visible, providerId]);

  const loadProviderServices = async () => {
    setLoadingServices(true);
    try {
      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/services/provider/${providerId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        // Map backend data to component format
        const mappedServices = data.map((service: any) => ({
          serviceId: service.serviceId,
          serviceName: service.serviceTitle, // Backend uses serviceTitle
          basePrice: service.basePrice,
          categoryId: service.categoryId,
        }));
        setServices(mappedServices);
        if (mappedServices.length > 0) {
          setSelectedService(mappedServices[0].serviceId);
        }
      } else {
        Alert.alert('Error', 'No se pudieron cargar los servicios del proveedor');
      }
    } catch (error) {
      console.error('Error loading services:', error);
      Alert.alert('Error', 'Error al cargar servicios');
    } finally {
      setLoadingServices(false);
    }
  };

  const getCurrentLocation = async () => {
    setLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a tu ubicación para la solicitud de servicio'
        );
        setLoadingLocation(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      await updateLocationAndAddress(location.coords.latitude, location.coords.longitude);
      Alert.alert('Éxito', 'Ubicación actual obtenida correctamente');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    } finally {
      setLoadingLocation(false);
    }
  };

  const updateLocationAndAddress = async (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);

    try {
      // Reverse geocoding to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (address) {
        const addressParts = [];
        if (address.street) addressParts.push(address.street);
        if (address.streetNumber) addressParts.push(address.streetNumber);
        if (address.district) addressParts.push(address.district);
        if (address.city) addressParts.push(address.city);
        if (address.region) addressParts.push(address.region);
        if (address.country) addressParts.push(address.country);
        
        const fullAddress = addressParts.join(', ');
        setServiceAddress(fullAddress || `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
      } else {
        setServiceAddress(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.error('Error in reverse geocoding:', error);
      setServiceAddress(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
    }
  };

  const openMapForSelection = async () => {
    // Open map immediately with existing or default location
    if (latitude && longitude) {
      setTempLocation({ latitude, longitude });
    } else {
      // Use default location (Mexico City) while loading actual location
      setTempLocation({
        latitude: 19.4326,
        longitude: -99.1332,
      });
    }
    setShowMapModal(true);

    // Then try to get actual location in background if we don't have it
    if (!latitude || !longitude) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({});
          setTempLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error('Error getting location in background:', error);
      }
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setTempLocation({ latitude, longitude });
  };

  const confirmMapLocation = async () => {
    if (tempLocation) {
      setLoadingLocation(true);
      await updateLocationAndAddress(tempLocation.latitude, tempLocation.longitude);
      setLoadingLocation(false);
      setShowMapModal(false);
      Alert.alert('Éxito', 'Ubicación seleccionada correctamente');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!requestTitle.trim()) {
      Alert.alert('Error', 'Ingresa un título para la solicitud');
      return;
    }
    if (!requestDescription.trim()) {
      Alert.alert('Error', 'Describe lo que necesitas');
      return;
    }
    if (!serviceAddress.trim()) {
      Alert.alert('Error', 'Ingresa la dirección del servicio');
      return;
    }
    if (!latitude || !longitude) {
      Alert.alert('Error', 'Obtén tu ubicación antes de enviar');
      return;
    }

    setLoading(true);
    try {
      // Format date and time
      const formattedDate = preferredDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const hours = preferredTime.getHours().toString().padStart(2, '0');
      const minutes = preferredTime.getMinutes().toString().padStart(2, '0');
      const formattedTime = `${hours}:${minutes}`; // HH:MM

      const requestData = {
        serviceId: selectedService || undefined,
        requestTitle: requestTitle.trim(),
        requestDescription: requestDescription.trim(),
        serviceAddress: serviceAddress.trim(),
        addressDetails: addressDetails.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        serviceLatitude: latitude,
        serviceLongitude: longitude,
        preferredDate: formattedDate,
        preferredTime: formattedTime,
      };

      const token = user?.token;
      
      const response = await fetch(`${Config.API_GATEWAY_URL}/api/v1/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        Alert.alert(
          'Éxito',
          `Solicitud enviada a ${providerName}`,
          [
            {
              text: 'OK',
              onPress: () => {
                resetForm();
                onClose();
                onSuccess?.();
              },
            },
          ]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'No se pudo enviar la solicitud');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      Alert.alert('Error', 'Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRequestTitle('');
    setRequestDescription('');
    setServiceAddress('');
    setAddressDetails('');
    setContactPhone('');
    setPreferredDate(new Date());
    setPreferredTime(new Date());
    setLatitude(null);
    setLongitude(null);
    setSelectedService(services.length > 0 ? services[0].serviceId : null);
  };

  const selectedServiceData = services.find(s => s.serviceId === selectedService);

  return (
    <>
      {/* Map Selection Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Selecciona la ubicación del servicio</Text>
            <TouchableOpacity onPress={() => setShowMapModal(false)} style={styles.mapCloseButton}>
              <Ionicons name="close" size={28} color="#1F2937" />
            </TouchableOpacity>
          </View>
          
          {tempLocation && (
            <MapView
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              initialRegion={{
                latitude: tempLocation.latitude,
                longitude: tempLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={true}
              loadingEnabled={true}
              loadingIndicatorColor="#3B82F6"
              loadingBackgroundColor="#F9FAFB"
            >
              <Marker
                coordinate={tempLocation}
                draggable
                onDragEnd={handleMapPress}
                title="Ubicación del servicio"
                description="Arrastra para ajustar"
                pinColor="#EF4444"
              />
            </MapView>
          )}
          
          <View style={styles.mapFooter}>
            <View style={styles.mapCoordinatesInfo}>
              {tempLocation && (
                <Text style={styles.mapCoordinatesText}>
                  📍 Lat: {tempLocation.latitude.toFixed(6)}, Lng: {tempLocation.longitude.toFixed(6)}
                </Text>
              )}
            </View>
            <Text style={styles.mapHint}>Toca el mapa o arrastra el marcador para ajustar la ubicación</Text>
            <TouchableOpacity
              style={styles.confirmLocationButton}
              onPress={confirmMapLocation}
              disabled={loadingLocation}
            >
              <LinearGradient
                colors={['#3B82F6', '#2563EB']}
                style={styles.confirmLocationGradient}
              >
                {loadingLocation ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                    <Text style={styles.confirmLocationText}>Confirmar Ubicación</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Main Request Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Solicitar Servicio</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
            <Text style={styles.providerText}>
              Solicitud para: <Text style={styles.providerName}>{providerName}</Text>
            </Text>

            {/* Service Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Servicio (Opcional)</Text>
              {loadingServices ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : services.length > 0 ? (
                <View style={styles.servicesContainer}>
                  {services.map((service) => (
                    <TouchableOpacity
                      key={service.serviceId}
                      style={[
                        styles.serviceCard,
                        selectedService === service.serviceId && styles.serviceCardSelected,
                      ]}
                      onPress={() => setSelectedService(service.serviceId)}
                    >
                      <Text style={[
                        styles.serviceName,
                        selectedService === service.serviceId && styles.serviceNameSelected,
                      ]}>
                        {service.serviceName}
                      </Text>
                      <Text style={[
                        styles.servicePrice,
                        selectedService === service.serviceId && styles.servicePriceSelected,
                      ]}>
                        ${service.basePrice}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
            ) : (
              <Text style={styles.noServicesText}>No hay servicios disponibles. Puedes continuar sin seleccionar uno.</Text>
            )}
            </View>

            {/* Request Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título de la solicitud *</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Reparación de fuga de agua"
                value={requestTitle}
                onChangeText={setRequestTitle}
                maxLength={200}
              />
            </View>

            {/* Request Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe el trabajo que necesitas..."
                value={requestDescription}
                onChangeText={setRequestDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Service Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dirección del servicio *</Text>
              <TextInput
                style={[styles.input, styles.addressInputReadOnly]}
                placeholder="Selecciona tu ubicación"
                value={serviceAddress}
                editable={false}
                multiline
              />
              {latitude && longitude && (
                <View style={styles.locationInfoContainer}>
                  <Ionicons name="location" size={16} color="#10B981" />
                  <Text style={styles.locationHint}>
                    Ubicación exacta: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                  </Text>
                </View>
              )}
              <View style={styles.locationButtonsContainer}>
                <TouchableOpacity
                  style={styles.locationOptionButton}
                  onPress={getCurrentLocation}
                  disabled={loadingLocation}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    style={styles.locationButtonGradient}
                  >
                    {loadingLocation ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <>
                        <Ionicons name="navigate" size={20} color="white" />
                        <Text style={styles.locationButtonText}>Ubicación Actual</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.locationOptionButton}
                  onPress={openMapForSelection}
                  disabled={loadingLocation}
                >
                  <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    style={styles.locationButtonGradient}
                  >
                    <Ionicons name="map" size={20} color="white" />
                    <Text style={styles.locationButtonText}>Seleccionar en Mapa</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Address Details */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Detalles adicionales (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Casa azul, segundo piso"
                value={addressDetails}
                onChangeText={setAddressDetails}
              />
            </View>

            {/* Contact Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono de contacto (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: +1234567890"
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
                maxLength={20}
              />
            </View>

            {/* Preferred Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha preferida *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={styles.dateButtonText}>
                  {preferredDate.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={preferredDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (date) setPreferredDate(date);
                  }}
                  minimumDate={new Date()}
                />
              )}
            </View>

            {/* Preferred Time */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Hora preferida *</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <Text style={styles.dateButtonText}>
                  {preferredTime.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={preferredTime}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, time) => {
                    setShowTimePicker(Platform.OS === 'ios');
                    if (time) setPreferredTime(time);
                  }}
                />
              )}
            </View>

            {/* Estimated Cost */}
            {selectedServiceData && (
              <View style={styles.costContainer}>
                <Text style={styles.costLabel}>Precio base estimado:</Text>
                <Text style={styles.costValue}>${selectedServiceData.basePrice}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 20,
  },
  providerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  providerName: {
    fontWeight: '600',
    color: '#3B82F6',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 100,
  },
  addressInputReadOnly: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
    minHeight: 60,
  },
  locationInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  locationHint: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  locationButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  locationOptionButton: {
    flex: 1,
  },
  locationButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 14,
  },
  locationButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  mapHeader: {
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
    zIndex: 1,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
  },
  mapCloseButton: {
    padding: 4,
  },
  map: {
    flex: 1,
    width: '100%',
  },
  mapCoordinatesInfo: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  mapCoordinatesText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
    textAlign: 'center',
  },
  mapFooter: {
    backgroundColor: 'white',
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  mapHint: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  confirmLocationButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmLocationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  confirmLocationText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 8,
  },
  servicesContainer: {
    gap: 10,
  },
  serviceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  serviceCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  serviceNameSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  servicePriceSelected: {
    color: '#3B82F6',
  },
  costContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
  },
  costLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  costValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3B82F6',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  noServicesText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
});

const { width, height } = Dimensions.get('window');
