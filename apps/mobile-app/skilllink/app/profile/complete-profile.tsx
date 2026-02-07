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
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useRouter, Stack } from 'expo-router';
import { Config } from '../../constants/Config';
import { ChevronLeft, User, MapPin, Calendar } from 'lucide-react-native';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CompleteProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    bio: '',
    address_line1: '',
    city: '',
    state_province: '',
    country: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    loadExistingProfile();
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Permiso de ubicación denegado');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString(),
      }));

      console.log('📍 Ubicación obtenida:', location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
    } finally {
      setLoadingLocation(false);
    }
  };

  const loadExistingProfile = async () => {
    try {
      const response = await fetch(`${Config.USER_SERVICE_URL}/user-profile/me`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const profile = await response.json();
        if (profile) {
          setExistingProfile(profile);
          setFormData({
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            date_of_birth: profile.date_of_birth || '',
            gender: profile.gender || '',
            bio: profile.bio || '',
            address_line1: profile.address_line1 || '',
            city: profile.city || '',
            state_province: profile.state_province || '',
            country: profile.country || '',
            latitude: profile.latitude || '',
            longitude: profile.longitude || '',
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      handleInputChange('date_of_birth', dateString);
    }
  };

  const handleSave = async () => {
    if (!formData.first_name || !formData.last_name) {
      Alert.alert('Error', 'El nombre y apellido son obligatorios');
      return;
    }

    setLoading(true);
    try {
      console.log('💾 Guardando perfil:', JSON.stringify(formData, null, 2));
      console.log('🔍 existingProfile:', existingProfile);
      
      // Always use POST to /user-profile/me which handles both create and update
      const response = await fetch(`${Config.USER_SERVICE_URL}/user-profile/me`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log('📡 Response status:', response.status);
      const responseText = await response.text();
      console.log('📡 Response body:', responseText);

      if (response.ok) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        try {
          const errorData = JSON.parse(responseText);
          Alert.alert('Error', errorData.message || 'No se pudo actualizar el perfil');
        } catch {
          Alert.alert('Error', `Error del servidor (${response.status})`);
        }
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerInline}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft color="#1f2937" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Completar Perfil</Text>
        </View>

        <Text style={styles.subtitle}>
          Completa tu información personal para mejorar tu experiencia
        </Text>

        {/* Personal Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User color="#2563eb" size={20} />
            <Text style={styles.sectionTitle}>Información Personal</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nombre *</Text>
            <TextInput
              style={styles.input}
              value={formData.first_name}
              onChangeText={(value) => handleInputChange('first_name', value)}
              placeholder="Tu nombre"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Apellido *</Text>
            <TextInput
              style={styles.input}
              value={formData.last_name}
              onChangeText={(value) => handleInputChange('last_name', value)}
              placeholder="Tu apellido"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Fecha de Nacimiento</Text>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar color="#6b7280" size={20} />
              <Text style={styles.datePickerText}>
                {formData.date_of_birth || 'Selecciona tu fecha de nacimiento'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formData.date_of_birth ? new Date(formData.date_of_birth) : new Date(2000, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
              />
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Género</Text>
            <View style={styles.genderContainer}>
              {['Masculino', 'Femenino', 'Otro'].map((gender) => (
                <TouchableOpacity
                  key={gender}
                  style={[
                    styles.genderButton,
                    formData.gender === gender && styles.genderButtonActive,
                  ]}
                  onPress={() => handleInputChange('gender', gender)}
                >
                  <Text
                    style={[
                      styles.genderButtonText,
                      formData.gender === gender && styles.genderButtonTextActive,
                    ]}
                  >
                    {gender}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Biografía</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.bio}
              onChangeText={(value) => handleInputChange('bio', value)}
              placeholder="Cuéntanos sobre ti..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Location Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin color="#2563eb" size={20} />
            <Text style={styles.sectionTitle}>Ubicación</Text>
            {loadingLocation && <ActivityIndicator size="small" color="#2563eb" style={{ marginLeft: 8 }} />}
          </View>

          {formData.latitude && formData.longitude && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                📍 Ubicación detectada: {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
              </Text>
              <TouchableOpacity onPress={getCurrentLocation} style={styles.refreshLocationButton}>
                <Text style={styles.refreshLocationText}>Actualizar ubicación</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.label}>Dirección</Text>
            <TextInput
              style={styles.input}
              value={formData.address_line1}
              onChangeText={(value) => handleInputChange('address_line1', value)}
              placeholder="Calle y número"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Ciudad</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(value) => handleInputChange('city', value)}
              placeholder="Tu ciudad"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Provincia/Estado</Text>
            <TextInput
              style={styles.input}
              value={formData.state_province}
              onChangeText={(value) => handleInputChange('state_province', value)}
              placeholder="Tu provincia o estado"
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>País</Text>
            <TextInput
              style={styles.input}
              value={formData.country}
              onChangeText={(value) => handleInputChange('country', value)}
              placeholder="Tu país"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Información</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  headerInline: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  genderContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  genderButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  genderButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    gap: 10,
  },
  datePickerText: {
    fontSize: 14,
    color: '#1f2937',
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
  locationInfo: {
    backgroundColor: '#eff6ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  locationText: {
    fontSize: 13,
    color: '#1e40af',
    marginBottom: 8,
  },
  refreshLocationButton: {
    alignSelf: 'flex-start',
  },
  refreshLocationText: {
    fontSize: 13,
    color: '#2563eb',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
