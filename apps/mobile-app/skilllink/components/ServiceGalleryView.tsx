import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';
import { Trash2, X } from 'lucide-react-native';
import { Config } from '@/constants/Config';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface GalleryImage {
  galleryId: number;
  imageUrl: string;
  imageTitle?: string;
  imageDescription?: string;
  displayOrder: number;
  isApproved: boolean;
  uploadedAt: string;
}

interface ServiceGalleryViewProps {
  serviceId: number;
  editable?: boolean;
  onImageDeleted?: () => void;
  onImagesChange?: () => void;
  showUploadButton?: boolean;
  maxImagesToShow?: number;
}

export const ServiceGalleryView: React.FC<ServiceGalleryViewProps> = ({
  serviceId,
  editable = false,
  onImageDeleted,
  onImagesChange,
  showUploadButton = false,
  maxImagesToShow,
}) => {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadImages();
  }, [serviceId]);

  const loadImages = async () => {
    try {
      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/gallery/service/${serviceId}`
      );

      if (response.ok) {
        const data = await response.json();
        setImages(data);
      }
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (galleryId: number) => {
    Alert.alert(
      'Eliminar imagen',
      '¿Estás seguro de que deseas eliminar esta imagen?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setDeleting(galleryId);
            try {
              const response = await fetch(
                `${Config.API_GATEWAY_URL}/api/v1/gallery/${galleryId}`,
                { method: 'DELETE' }
              );

              if (response.ok) {
                setImages(images.filter((img) => img.galleryId !== galleryId));
                onImageDeleted?.();
                onImagesChange?.();
                Alert.alert('Éxito', 'Imagen eliminada correctamente');
              } else {
                Alert.alert('Error', 'No se pudo eliminar la imagen');
              }
            } catch (error) {
              console.error('Error deleting image:', error);
              Alert.alert('Error', 'Error de conexión');
            } finally {
              setDeleting(null);
            }
          },
        },
      ]
    );
  };

  const openImageModal = (image: GalleryImage) => {
    setSelectedImage(image);
    setModalVisible(true);
  };

  const closeImageModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  }

  if (images.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Sin imágenes</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {(maxImagesToShow ? images.slice(0, maxImagesToShow) : images).map((image) => (
          <View key={image.galleryId} style={styles.imageCard}>
            <TouchableOpacity onPress={() => openImageModal(image)} activeOpacity={0.8}>
              <Image source={{ uri: image.imageUrl }} style={styles.image} />
            </TouchableOpacity>
            {editable && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteImage(image.galleryId)}
                disabled={deleting === image.galleryId}
              >
                {deleting === image.galleryId ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Trash2 size={16} color="#fff" />
                )}
              </TouchableOpacity>
            )}
            {!image.isApproved && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Pendiente</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalBackground} 
            activeOpacity={1} 
            onPress={closeImageModal}
          >
            <View style={styles.modalContent}>
              {selectedImage && (
                <Image
                  source={{ uri: selectedImage.imageUrl }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.closeButton} onPress={closeImageModal}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 8,
  },
  imageCard: {
    marginRight: 12,
    position: 'relative',
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  imageTitle: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    maxWidth: 150,
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF3B30',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  pendingBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: '#FF9500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pendingText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    margin: 16,
  },
  emptyText: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.8,
  },
  imageInfoContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
    borderRadius: 12,
  },
  modalImageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  modalImageDescription: {
    fontSize: 14,
    color: '#e0e0e0',
    lineHeight: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
});
