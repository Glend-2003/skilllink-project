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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ServiceGalleryUploadProps {
  serviceId?: number;
  providerId: number;
  onUploadComplete?: (images: any[]) => void;
}

export const ServiceGalleryUpload: React.FC<ServiceGalleryUploadProps> = ({
  serviceId,
  providerId,
  onUploadComplete,
}) => {
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const API_URL = 'http://localhost:3004';

  // Solicitar permisos
  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería de fotos');
      return false;
    }
    return true;
  };

  const pickImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
      selectionLimit: 10,
    });

    if (!result.canceled) {
      setSelectedImages(result.assets);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setSelectedImages([...selectedImages, ...result.assets]);
    }
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      Alert.alert('Error', 'Selecciona al menos una imagen');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

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
      Alert.alert('Error', 'No se pudieron subir las imágenes');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadSingleImage = async (
    image: any,
    title?: string,
    description?: string,
  ) => {
    setUploading(true);

    try {
      const formData = new FormData();

      const imageUri = image.uri;
      const imageName = imageUri.split('/').pop() || 'image.jpg';
      const imageType = imageName.split('.').pop() || 'jpg';

      formData.append('image', {
        uri: imageUri,
        type: `image/${imageType}`,
        name: imageName,
      } as any);

      formData.append('providerId', providerId.toString());
      if (serviceId) {
        formData.append('serviceId', serviceId.toString());
      }
      if (title) {
        formData.append('imageTitle', title);
      }
      if (description) {
        formData.append('imageDescription', description);
      }

      const response = await fetch(`${API_URL}/gallery/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Éxito', 'Imagen subida correctamente');
        onUploadComplete?.([result]);
        return result;
      } else {
        throw new Error(result.message || 'Error al subir la imagen');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'No se pudo subir la imagen');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Galería del Servicio</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={pickImages}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>📷 Seleccionar Fotos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={takePhoto}
          disabled={uploading}
        >
          <Text style={styles.buttonText}>📸 Tomar Foto</Text>
        </TouchableOpacity>
      </View>

      {selectedImages.length > 0 && (
        <View style={styles.previewContainer}>
          <Text style={styles.subtitle}>
            {selectedImages.length} imagen(es) seleccionada(s)
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedImages.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
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
              <ActivityIndicator color="#fff" />
              <Text style={styles.uploadButtonText}>Subiendo...</Text>
            </View>
          ) : (
            <Text style={styles.uploadButtonText}>
              ⬆️ Subir {selectedImages.length} imagen(es)
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
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    marginBottom: 16,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 8,
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
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
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
    gap: 8,
  },
});

/*
import { ServiceGalleryUpload } from '@/components/ServiceGalleryUpload';

function CreateServiceScreen() {
  const [serviceId, setServiceId] = useState<number | undefined>();
  const providerId = 1;

  const handleUploadComplete = (images: any[]) => {
    console.log('Images uploaded:', images);
  };

  return (
    <View>
      <ServiceGalleryUpload
        serviceId={serviceId}
        providerId={providerId}
        onUploadComplete={handleUploadComplete}
      />
    </View>
  );
}
*/
