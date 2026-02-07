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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';
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
        `${Config.SERVICE_MANAGER_URL}/services/provider/${providerId}`
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
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      // Reverse geocoding to get address
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const fullAddress = `${address.street || ''} ${address.streetNumber || ''}, ${address.city || ''}, ${address.region || ''}`.trim();
        setServiceAddress(fullAddress);
      }

      Alert.alert('Éxito', 'Ubicación obtenida correctamente');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener la ubicación');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!selectedService) {
      Alert.alert('Error', 'Selecciona un servicio');
      return;
    }
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
        serviceId: selectedService,
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
      
      const response = await fetch(`${Config.SERVICE_MANAGER_URL}/requests`, {
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
              <Text style={styles.label}>Servicio *</Text>
              {loadingServices ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
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
              <View style={styles.addressInputContainer}>
                <TextInput
                  style={[styles.input, styles.addressInput]}
                  placeholder="Ingresa la dirección"
                  value={serviceAddress}
                  onChangeText={setServiceAddress}
                  multiline
                />
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={getCurrentLocation}
                  disabled={loadingLocation}
                >
                  {loadingLocation ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="location" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </View>
              {latitude && longitude && (
                <Text style={styles.locationHint}>
                  📍 Ubicación obtenida
                </Text>
              )}
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
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressInput: {
    flex: 1,
    marginRight: 8,
  },
  locationButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
  },
  locationHint: {
    fontSize: 12,
    color: '#10B981',
    marginTop: 4,
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
});
