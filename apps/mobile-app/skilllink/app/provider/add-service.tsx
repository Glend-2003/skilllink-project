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
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../context/AuthContext';
import { Config } from '@/constants/Config';
import { ServiceGalleryUpload } from '@/components/ServiceGalleryUpload';

interface ServiceCategory {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
}

export default function AddServiceScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [createdServiceId, setCreatedServiceId] = useState<number | null>(null);
  const [providerId, setProviderId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    categoryId: 0,
    serviceTitle: '',
    serviceDescription: '',
    basePrice: '',
    priceType: 'fixed' as 'fixed' | 'hourly' | 'negotiable',
    estimatedDurationMinutes: '',
    isActive: true,
  });

  useEffect(() => {
    loadCategories();
    loadProviderInfo();
  }, []);

  const loadProviderInfo = async () => {
    try {
      const response = await fetch(`${Config.AUTH_SERVICE_URL.replace('/api/auth', '')}/api/provider/profile`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProviderId(data.providerId);
      }
    } catch (error) {
      console.error('Error loading provider info:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${Config.AUTH_SERVICE_URL.replace('/api/auth', '')}/api/provider/categories`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        Alert.alert('Error', 'No se pudieron cargar las categorías');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.serviceTitle.trim()) {
      Alert.alert('Error', 'El título del servicio es requerido');
      return;
    }

    if (!formData.serviceDescription.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
      return;
    }

    if (formData.categoryId === 0) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`${Config.AUTH_SERVICE_URL.replace('/api/auth', '')}/api/provider/services`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categoryId: formData.categoryId,
          serviceTitle: formData.serviceTitle,
          serviceDescription: formData.serviceDescription,
          basePrice: formData.basePrice ? parseFloat(formData.basePrice) : null,
          priceType: formData.priceType,
          estimatedDurationMinutes: formData.estimatedDurationMinutes
            ? parseInt(formData.estimatedDurationMinutes)
            : null,
          isActive: formData.isActive,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedServiceId(data.serviceId);
        Alert.alert(
          'Éxito', 
          'Servicio creado correctamente. Ahora puedes agregar fotos.',
          [
            {
              text: 'Agregar fotos después',
              onPress: () => router.back(),
              style: 'cancel',
            },
            {
              text: 'Agregar fotos ahora',
              onPress: () => {
              },
            },
          ]
        );
      } else {
        const data = await response.json();
        Alert.alert('Error', data.message || 'No se pudo crear el servicio');
      }
    } catch (error) {
      console.error('Error creating service:', error);
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
          title: 'Agregar Servicio',
          headerStyle: { backgroundColor: '#007AFF' },
          headerTintColor: '#fff',
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.label}>Categoría *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.categoryId}
              onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
            >
              <Picker.Item label="Selecciona una categoría" value={0} />
              {categories.map((cat) => (
                <Picker.Item
                  key={cat.categoryId}
                  label={cat.categoryName}
                  value={cat.categoryId}
                />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Título del Servicio *</Text>
          <TextInput
            style={styles.input}
            value={formData.serviceTitle}
            onChangeText={(text) => setFormData({ ...formData, serviceTitle: text })}
            placeholder="Ej: Reparación de plomería"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Descripción *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.serviceDescription}
            onChangeText={(text) => setFormData({ ...formData, serviceDescription: text })}
            placeholder="Describe en detalle tu servicio"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tipo de Precio</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.priceType}
              onValueChange={(value) =>
                setFormData({ ...formData, priceType: value as 'fixed' | 'hourly' | 'negotiable' })
              }
            >
              <Picker.Item label="Precio Fijo" value="fixed" />
              <Picker.Item label="Por Hora" value="hourly" />
              <Picker.Item label="Negociable" value="negotiable" />
            </Picker>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Precio Base ($)</Text>
          <TextInput
            style={styles.input}
            value={formData.basePrice}
            onChangeText={(text) => setFormData({ ...formData, basePrice: text })}
            placeholder="Ej: 50.00"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Duración Estimada (minutos)</Text>
          <TextInput
            style={styles.input}
            value={formData.estimatedDurationMinutes}
            onChangeText={(text) => setFormData({ ...formData, estimatedDurationMinutes: text })}
            placeholder="Ej: 60"
            keyboardType="numeric"
          />
        </View>

        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Servicio Activo</Text>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => setFormData({ ...formData, isActive: value })}
            />
          </View>
        </View>

        {createdServiceId && providerId && (
          <View style={styles.section}>
            <ServiceGalleryUpload
              serviceId={createdServiceId}
              providerId={providerId}
              onUploadComplete={(images) => {
                console.log('Images uploaded:', images);
                Alert.alert(
                  'Fotos subidas',
                  'Las fotos se han agregado al servicio exitosamente',
                  [
                    {
                      text: 'Finalizar',
                      onPress: () => router.back(),
                    },
                  ]
                );
              }}
            />
          </View>
        )}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving || createdServiceId !== null}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {createdServiceId ? 'Servicio Creado ✓' : 'Crear Servicio'}
            </Text>
          )}
        </TouchableOpacity>

        {createdServiceId && (
          <TouchableOpacity
            style={styles.finishButton}
            onPress={() => router.back()}
          >
            <Text style={styles.finishButtonText}>Finalizar sin fotos</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
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
  },
  finishButton: {
    backgroundColor: '#6c757d',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
