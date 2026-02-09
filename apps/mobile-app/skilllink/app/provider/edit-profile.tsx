import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Switch,
  Modal,
  Dimensions,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { Config } from '@/constants/Config';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { ArrowLeft, Save, Briefcase, MapPin, Award, Settings } from 'lucide-react-native';
import CustomAlert from '../../components/CustomAlert';

interface ProviderProfile {
  providerId: number;
  userId: number;
  businessName?: string;
  businessDescription?: string;
  latitude?: number;
  longitude?: number;
  yearsExperience?: number;
  serviceRadiusKm?: number;
  isVerified: boolean;
  verificationDate?: string;
  trustBadge: boolean;
  availableForWork: boolean;
}

export default function EditProviderProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
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

  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    latitude: '',
    longitude: '',
    yearsExperience: '',
    serviceRadiusKm: '',
    availableForWork: true,
  });

  useEffect(() => {
    loadProviderProfile();
    // Initialize map location if coordinates exist
    if (formData.latitude && formData.longitude) {
      setSelectedLocation({
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
      });
    }
  }, []);

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setAlert({
        visible: true,
        type: 'error',
        title: 'Permiso Denegado',
        message: 'Se necesita permiso de ubicación para usar esta función',
      });
      return false;
    }
    return true;
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    try {
      const location = await Location.getCurrentPositionAsync({});
      setSelectedLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setFormData({
        ...formData,
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString(),
      });
      setAlert({
        visible: true,
        type: 'success',
        title: 'Éxito',
        message: 'Ubicación actual obtenida correctamente',
      });
    } catch (error) {
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo obtener la ubicación actual',
      });
    }
  };

  const openMapPicker = () => {
    // Initialize with current location or default (Guatemala City)
    if (!selectedLocation) {
      if (formData.latitude && formData.longitude) {
        setSelectedLocation({
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
        });
      } else {
        setSelectedLocation({
          latitude: 14.6349,
          longitude: -90.5069,
        });
      }
    }
    setShowMapModal(true);
  };

  const confirmMapSelection = () => {
    if (selectedLocation) {
      setFormData({
        ...formData,
        latitude: selectedLocation.latitude.toFixed(6),
        longitude: selectedLocation.longitude.toFixed(6),
      });
      setShowMapModal(false);
      setAlert({
        visible: true,
        type: 'success',
        title: 'Éxito',
        message: 'Ubicación seleccionada correctamente',
      });
    }
  };

  const loadProviderProfile = async () => {
    try {
      const response = await fetch(`${Config.API_GATEWAY_URL}/api/v1/provider/profile`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.status === 404) {
        console.log('No provider profile found (404)');
        setLoading(false);
        return;
      }

      if (response.ok) {
        const text = await response.text();
        
        if (!text || text.trim() === '') {
          console.log('Empty provider profile response');
          setLoading(false);
          return;
        }

        try {
          const profile: ProviderProfile = JSON.parse(text);
          setFormData({
            businessName: profile.businessName || '',
            businessDescription: profile.businessDescription || '',
            latitude: profile.latitude?.toString() || '',
            longitude: profile.longitude?.toString() || '',
            yearsExperience: profile.yearsExperience?.toString() || '',
            serviceRadiusKm: profile.serviceRadiusKm?.toString() || '',
            availableForWork: profile.availableForWork,
          });
        } catch (parseError) {
          console.error('Error parsing provider profile JSON:', parseError);
          setAlert({
            visible: true,
            type: 'error',
            title: 'Error',
            message: 'Error al procesar datos del perfil',
          });
        }
      } else {
        setAlert({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'No se pudo cargar el perfil de proveedor',
        });
      }
    } catch (error) {
      console.error('Error loading provider profile:', error);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Error de conexión',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.businessName.trim()) {
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'El nombre del negocio es requerido',
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${Config.API_GATEWAY_URL}/api/v1/provider/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          businessDescription: formData.businessDescription,
          latitude: formData.latitude ? parseFloat(formData.latitude) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude) : null,
          yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : null,
          serviceRadiusKm: formData.serviceRadiusKm ? parseInt(formData.serviceRadiusKm) : null,
          availableForWork: formData.availableForWork,
        }),
      });

      if (response.ok) {
        setAlert({
          visible: true,
          type: 'success',
          title: 'Éxito',
          message: 'Perfil actualizado correctamente',
          onConfirm: () => router.back(),
        });
      } else {
        const data = await response.json();
        setAlert({
          visible: true,
          type: 'error',
          title: 'Error',
          message: data.message || 'No se pudo actualizar el perfil',
        });
      }
    } catch (error) {
      console.error('Error updating provider profile:', error);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'Error de conexión',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil de Proveedor</Text>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={styles.headerSaveButton}
        >
          <Save size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Información del Negocio */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Briefcase color="#007AFF" size={20} />
            <Text style={styles.sectionTitle}>Información del Negocio</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nombre del Negocio *</Text>
            <TextInput
              style={styles.input}
              value={formData.businessName}
              onChangeText={(text) => setFormData({ ...formData, businessName: text })}
              placeholder="Ej: Reparaciones Juan"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Descripción del Negocio</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.businessDescription}
              onChangeText={(text) => setFormData({ ...formData, businessDescription: text })}
              placeholder="Describe tu negocio y servicios"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Ubicación */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin color="#007AFF" size={20} />
            <Text style={styles.sectionTitle}>Ubicación del Negocio</Text>
          </View>

          {formData.latitude && formData.longitude && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                Ubicación guardada: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
              </Text>
            </View>
          )}

          <View style={styles.mapButtonsRow}>
            <TouchableOpacity style={styles.mapButton} onPress={openMapPicker}>
              <Text style={styles.mapButtonText}>Seleccionar en Mapa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapButton} onPress={getCurrentLocation}>
              <Text style={styles.mapButtonText}>Ubicación Actual</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Award color="#007AFF" size={20} />
            <Text style={styles.sectionTitle}>Experiencia y Cobertura</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Años de Experiencia</Text>
            <TextInput
              style={styles.input}
              value={formData.yearsExperience}
              onChangeText={(text) => setFormData({ ...formData, yearsExperience: text })}
              placeholder="Ej: 5"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Radio de Servicio (km)</Text>
            <TextInput
              style={styles.input}
              value={formData.serviceRadiusKm}
              onChangeText={(text) => setFormData({ ...formData, serviceRadiusKm: text })}
              placeholder="Ej: 10"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Settings color="#007AFF" size={20} />
            <Text style={styles.sectionTitle}>Configuración</Text>
          </View>

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.label}>Disponible para Trabajar</Text>
              <Text style={styles.switchDescription}>Los clientes podrán solicitar tus servicios</Text>
            </View>
            <Switch
              value={formData.availableForWork}
              onValueChange={(value) => setFormData({ ...formData, availableForWork: value })}
              trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
              thumbColor={formData.availableForWork ? '#007AFF' : '#f4f3f4'}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Map Modal */}
      <Modal
        visible={showMapModal}
        animationType="slide"
        onRequestClose={() => setShowMapModal(false)}
      >
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <TouchableOpacity onPress={() => setShowMapModal(false)}>
              <Text style={styles.mapModalCancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.mapModalTitle}>Selecciona tu Ubicación</Text>
            <TouchableOpacity onPress={confirmMapSelection}>
              <Text style={styles.mapModalConfirmButton}>Confirmar</Text>
            </TouchableOpacity>
          </View>

          {selectedLocation && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
            >
              <Marker
                coordinate={selectedLocation}
                draggable
                onDragEnd={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
              />
            </MapView>
          )}

          <View style={styles.mapModalInfo}>
            <Text style={styles.mapModalInfoText}>
              Toca el mapa o arrastra el marcador para seleccionar tu ubicación
            </Text>
            {selectedLocation && (
              <Text style={styles.mapModalCoordinates}>
                Lat: {selectedLocation.latitude.toFixed(6)}, Lon: {selectedLocation.longitude.toFixed(6)}
              </Text>
            )}
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
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007AFF',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerSaveButton: {
    padding: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1f2937',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  locationInfo: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  locationText: {
    fontSize: 13,
    color: '#1e40af',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
  mapButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  mapButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  mapModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f8f8f8',
  },
  mapModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  mapModalCancelButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  mapModalConfirmButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  map: {
    flex: 1,
  },
  mapModalInfo: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  mapModalInfoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  mapModalCoordinates: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
    fontWeight: '600',
  },});
