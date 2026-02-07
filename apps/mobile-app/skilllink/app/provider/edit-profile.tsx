import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
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
      Alert.alert('Permiso Denegado', 'Se necesita permiso de ubicación para usar esta función');
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
      Alert.alert('Éxito', 'Ubicación actual obtenida correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la ubicación actual');
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
      Alert.alert('Éxito', 'Ubicación seleccionada correctamente');
    }
  };

  const loadProviderProfile = async () => {
    try {
      const response = await fetch(`${Config.API_GATEWAY_URL}/api/v1/provider/profile`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const profile: ProviderProfile = await response.json();
        setFormData({
          businessName: profile.businessName || '',
          businessDescription: profile.businessDescription || '',
          latitude: profile.latitude?.toString() || '',
          longitude: profile.longitude?.toString() || '',
          yearsExperience: profile.yearsExperience?.toString() || '',
          serviceRadiusKm: profile.serviceRadiusKm?.toString() || '',
          availableForWork: profile.availableForWork,
        });
      } else {
        Alert.alert('Error', 'No se pudo cargar el perfil de proveedor');
      }
    } catch (error) {
      console.error('Error loading provider profile:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.businessName.trim()) {
      Alert.alert('Error', 'El nombre del negocio es requerido');
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
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        router.back();
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating provider profile:', error);
      Alert.alert('Error', 'Error de conexión');
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
    <>
      <Stack.Screen
        options={{
          title: 'Editar Perfil de Proveedor',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.label}>Nombre del Negocio *</Text>
          <TextInput
            style={styles.input}
            value={formData.businessName}
            onChangeText={(text) => setFormData({ ...formData, businessName: text })}
            placeholder="Ej: Reparaciones Juan"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Descripción del Negocio</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.businessDescription}
            onChangeText={(text) => setFormData({ ...formData, businessDescription: text })}
            placeholder="Describe tu negocio y servicios"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ubicación (Latitud)</Text>
          <TextInput
            style={styles.input}
            value={formData.latitude}
            onChangeText={(text) => setFormData({ ...formData, latitude: text })}
            placeholder="Ej: 14.6349"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Ubicación (Longitud)</Text>
          <TextInput
            style={styles.input}
            value={formData.longitude}
            onChangeText={(text) => setFormData({ ...formData, longitude: text })}
            placeholder="Ej: -90.5069"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.mapButtonsRow}>
            <TouchableOpacity style={styles.mapButton} onPress={openMapPicker}>
              <Text style={styles.mapButtonText}>📍 Seleccionar en Mapa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapButton} onPress={getCurrentLocation}>
              <Text style={styles.mapButtonText}>🎯 Ubicación Actual</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Años de Experiencia</Text>
          <TextInput
            style={styles.input}
            value={formData.yearsExperience}
            onChangeText={(text) => setFormData({ ...formData, yearsExperience: text })}
            placeholder="Ej: 5"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Radio de Servicio (km)</Text>
          <TextInput
            style={styles.input}
            value={formData.serviceRadiusKm}
            onChangeText={(text) => setFormData({ ...formData, serviceRadiusKm: text })}
            placeholder="Ej: 10"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Disponible para Trabajar</Text>
            <Switch
              value={formData.availableForWork}
              onValueChange={(value) => setFormData({ ...formData, availableForWork: value })}
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
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 1,
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },  mapButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  mapButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapButtonText: {
    color: '#fff',
    fontSize: 14,
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
