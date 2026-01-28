import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { ArrowLeft, Briefcase, FileText, MapPin } from 'lucide-react-native';
import { Config } from '../../constants/Config';

export default function BecomeProviderScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    services: '',
    location: '',
  });

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.businessName.trim()) {
      Alert.alert('Error', 'Por favor ingresa el nombre de tu negocio o servicio');
      return;
    }

    if (!formData.description.trim()) {
      Alert.alert('Error', 'Por favor describe tus servicios');
      return;
    }

    if (!formData.location.trim()) {
      Alert.alert('Error', 'Por favor indica tu ubicación');
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${Config.AUTH_SERVICE_URL}/provider-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          description: formData.description,
          services: formData.services || formData.description,
          location: formData.location,
        }),
      });

      if (response.ok) {
        Alert.alert(
          'Solicitud Enviada',
          'Tu solicitud para convertirte en proveedor ha sido enviada. Nuestro equipo la revisará y te notificaremos pronto.',
          [
            {
              text: 'Entendido',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'No se pudo enviar la solicitud');
      }
    } catch (error) {
      console.error('Error submitting provider request:', error);
      Alert.alert('Error', 'No se pudo enviar la solicitud. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color="white" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Convertirme en Proveedor</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>¿Por qué ser proveedor?</Text>
          <Text style={styles.infoText}>
            Como proveedor podrás ofrecer tus servicios profesionales, recibir solicitudes de clientes y 
            gestionar tu propio negocio a través de nuestra plataforma.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Información Requerida</Text>

        {/* Business Name */}
        <View style={styles.fieldContainer}>
          <View style={styles.fieldLabel}>
            <Briefcase color="#64748b" size={18} />
            <Text style={styles.labelText}>Nombre del Negocio/Servicio *</Text>
          </View>
          <TextInput
            style={styles.input}
            value={formData.businessName}
            onChangeText={(text) => setFormData({ ...formData, businessName: text })}
            placeholder="Ej: Plomería García"
          />
        </View>

        {/* Description */}
        <View style={styles.fieldContainer}>
          <View style={styles.fieldLabel}>
            <FileText color="#64748b" size={18} />
            <Text style={styles.labelText}>Descripción de Servicios *</Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Describe detalladamente los servicios que ofreces. Ej: Plomería residencial y comercial, reparación de tuberías, instalación de baños, etc."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        {/* Location */}
        <View style={styles.fieldContainer}>
          <View style={styles.fieldLabel}>
            <MapPin color="#64748b" size={18} />
            <Text style={styles.labelText}>Ubicación *</Text>
          </View>
          <TextInput
            style={styles.input}
            value={formData.location}
            onChangeText={(text) => setFormData({ ...formData, location: text })}
            placeholder="Ej: Ciudad de Guatemala, Zona 10"
          />
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteText}>
            * Campos requeridos. Tu solicitud será revisada por nuestro equipo y te notificaremos cuando 
            sea aprobada. Una vez aprobado, podrás completar tu perfil con más detalles.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Enviar Solicitud</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#1e293b',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  noteCard: {
    backgroundColor: '#fff7ed',
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noteText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  submitButton: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
