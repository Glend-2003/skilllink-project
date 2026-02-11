import React, { useState, useEffect } from 'react';
import { Config } from '../constants/Config';
import { toast } from 'sonner';
import { confirmToast } from '../utils/confirmToast';
import './ServiceGalleryView.css';

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
  maxImagesToShow?: number;
}

export default function ServiceGalleryView({
  serviceId,
  editable = false,
  onImageDeleted,
  onImagesChange,
  maxImagesToShow,
}: ServiceGalleryViewProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadImages();
    // eslint-disable-next-line
  }, [serviceId]);

  const loadImages = async () => {
    try {
      const response = await fetch(
        `${Config.API_GATEWAY_URL}/api/v1/gallery/service/${serviceId}`
      );

      if (response.ok) {
        const data = await response.json();
        setImages(data);
      } else {
        console.warn(`No images found for service ${serviceId}`);
      }
    } catch (error) {
      console.error(`Error loading images for service ${serviceId}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const deleteImage = async (galleryId: number) => {
    const confirmed = await confirmToast('¿Estás seguro de que deseas eliminar esta imagen?');
    if (!confirmed) {
      return;
    }

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
        toast.success('Imagen eliminada correctamente');
      } else {
        toast.error('No se pudo eliminar la imagen');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error de conexión');
    } finally {
      setDeleting(null);
    }
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
      <div className="gallery-loading">
        <div className="spinner"></div>
        <p>Cargando imágenes...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="gallery-empty">
        <p>📸</p>
        <h3>Sin imágenes</h3>
        <p>Este servicio no tiene imágenes aún</p>
      </div>
    );
  }

  const displayImages = maxImagesToShow ? images.slice(0, maxImagesToShow) : images;

  return (
    <>
      <div className="gallery-container">
        <div className="gallery-scroll">
          {displayImages.map((image) => (
            <div key={image.galleryId} className="gallery-image-card">
              <img
                src={image.imageUrl}
                alt={image.imageTitle || 'Imagen del servicio'}
                className="gallery-image"
                onClick={() => openImageModal(image)}
              />
              {editable && (
                <button
                  className="gallery-delete-button"
                  onClick={() => deleteImage(image.galleryId)}
                  disabled={deleting === image.galleryId}
                >
                  {deleting === image.galleryId ? '...' : '🗑️'}
                </button>
              )}
              {!image.isApproved && (
                <div className="gallery-pending-badge">
                  Pendiente
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {modalVisible && selectedImage && (
        <div className="gallery-modal" onClick={closeImageModal}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.imageTitle || 'Imagen'}
              className="gallery-modal-image"
            />
            {(selectedImage.imageTitle || selectedImage.imageDescription) && (
              <div className="gallery-modal-info">
                {selectedImage.imageTitle && (
                  <h3>{selectedImage.imageTitle}</h3>
                )}
                {selectedImage.imageDescription && (
                  <p>{selectedImage.imageDescription}</p>
                )}
              </div>
            )}
          </div>
          <button className="gallery-modal-close" onClick={closeImageModal}>
            ✕
          </button>
        </div>
      )}
    </>
  );
}
