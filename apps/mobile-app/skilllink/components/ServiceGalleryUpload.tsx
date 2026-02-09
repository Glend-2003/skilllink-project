import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { X, Camera, ImageIcon } from 'lucide-react-native';
import { Config } from '@/constants/Config';

interface ServiceGalleryUploadProps {
  serviceId?: number;
  providerId: number;
  onUploadComplete?: (images: any[]) => void;
  maxImages?: number;
}

export const ServiceGalleryUpload: React.FC<ServiceGalleryUploadProps> = ({
  serviceId,
  providerId,
  onUploadComplete,
  maxImages = 10,
}) => {
  const [selectedImages, setSelectedImages] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [uploading, setUploading] = useState(false);

  const API_URL = `${Config.API_GATEWAY_URL}/api/v1`;

  // Solicitar permisos
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería de fotos');
        return false;
      }
    }
    return true;
  };

  const pickImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: maxImages - selectedImages.length,
      });

      if (!result.canceled) {
        setSelectedImages([...selectedImages, ...result.assets]);
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'No se pudieron seleccionar las imágenes');
    }
  };

  const takePhoto = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara');
        return;
      }
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled) {
        setSelectedImages([...selectedImages, ...result.assets]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Selecciona al menos una imagen');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      selectedImages.forEach((image, index) => {
        const imageUri = image.uri;
        const imageName = imageUri.split('/').pop() || `image_${index}.jpg`;
        const imageType = imageName.split('.').pop() || 'jpg';

        formData.append('images', {
          uri: imageUri,
          type: `image/${imageType}`,
          name: imageName,
        } as any);
      });

      formData.append('providerId', providerId.toString());
      if (serviceId) {
        formData.append('serviceId', serviceId.toString());
      }

      const response = await fetch(`${API_URL}/gallery/upload-multiple`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          'Éxito',
          `${result.success} imagen(es) subida(s) correctamente`,
        );
        setSelectedImages([]);
        onUploadComplete?.(result.uploaded);
      } else {
        throw new Error(result.message || 'Error al subir las imágenes');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'No se pudieron subir las imágenes. Verifica tu conexión.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📸 Galería del Servicio</Text>
      <Text style={styles.subtitle}>
        Agrega fotos de tus trabajos realizados (máx. {maxImages})
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={pickImages}
          disabled={uploading || selectedImages.length >= maxImages}
        >
          <ImageIcon size={20} color="#fff" />
          <Text style={styles.buttonText}>Galería</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={takePhoto}
          disabled={uploading || selectedImages.length >= maxImages}
        >
          <Camera size={20} color="#fff" />
          <Text style={styles.buttonText}>Cámara</Text>
        </TouchableOpacity>
      </View>

      {selectedImages.length > 0 && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>
            {selectedImages.length} imagen(es) seleccionada(s)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedImages.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                  disabled={uploading}
                >
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {selectedImages.length > 0 && (
        <TouchableOpacity
          style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
          onPress={uploadImages}
          disabled={uploading}
        >
          {uploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.uploadButtonText}>Subiendo...</Text>
            </View>
          ) : (
            <Text style={styles.uploadButtonText}>
              ⬆Subir {selectedImages.length} imagen(es)
            </Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  previewContainer: {
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF3B30',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  uploadButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  uploadButtonDisabled: {
    backgroundColor: '#A0A0A0',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
