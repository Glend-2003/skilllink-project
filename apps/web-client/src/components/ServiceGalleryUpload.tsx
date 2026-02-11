import React, { useState } from 'react';
import { Config } from '../constants/Config';
import { toast } from 'sonner';
import './ServiceGalleryUpload.css';

interface ServiceGalleryUploadProps {
  serviceId?: number;
  providerId: number;
  onUploadComplete?: (images: any[]) => void;
  maxImages?: number;
}

export default function ServiceGalleryUpload({
  serviceId,
  providerId,
  onUploadComplete,
  maxImages = 10,
}: ServiceGalleryUploadProps) {
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).slice(0, maxImages - selectedImages.length);
      setSelectedImages([...selectedImages, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) {
      toast.warning('Selecciona al menos una imagen');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();

      selectedImages.forEach((file) => {
        formData.append('images', file);
      });

      formData.append('providerId', providerId.toString());
      if (serviceId) {
        formData.append('serviceId', serviceId.toString());
      }

      console.log('Uploading images:', {
        imageCount: selectedImages.length,
        providerId,
        serviceId,
      });

      const response = await fetch(`${Config.SERVICE_MANAGER_URL}/gallery/upload-multiple`, {
        method: 'POST',
        body: formData,
      });

      console.log('Upload response status:', response.status);
      const result = await response.json();
      console.log('Upload result:', result);

      if (response.ok) {
        const successMsg = `${result.success} imagen(es) subida(s) correctamente`;
        if (result.errors && result.errors.length > 0) {
          console.error('❌ ERRORES AL SUBIR IMÁGENES:');
          result.errors.forEach((err: any, index: number) => {
            console.error(`Error ${index + 1}:`, {
              archivo: err.fileName,
              error: err.error,
              detalles: err
            });
          });
          toast.warning(successMsg + `\n\nAlgunos archivos no se pudieron subir:\n${result.errors.map((e: any) => `• ${e.fileName}: ${e.error}`).join('\n')}`);
        } else {
          toast.success(successMsg);
        }
        setSelectedImages([]);
        onUploadComplete?.(result.uploaded);
      } else {
        console.error('Upload failed:', result);
        throw new Error(result.message || 'Error al subir las imágenes');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('No se pudieron subir las imágenes. Verifica tu conexión y que Cloudinary esté configurado.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="gallery-upload-container">
      <h3 className="gallery-upload-title">📸 Galería del Servicio</h3>
      <p className="gallery-upload-subtitle">
        Agrega fotos de tus trabajos realizados (máx. {maxImages})
      </p>

      <div className="gallery-upload-button-container">
        <label className="gallery-upload-button gallery-upload-button-primary">
          <span>🖼️ Imágenes</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={uploading || selectedImages.length >= maxImages}
            style={{ display: 'none' }}
          />
        </label>
      </div>

      {selectedImages.length > 0 && (
        <div className="gallery-upload-preview-container">
          <p className="gallery-upload-preview-title">
            {selectedImages.length} imagen(es) seleccionada(s)
          </p>
          <div className="gallery-upload-preview-scroll">
            {selectedImages.map((file, index) => (
              <div key={index} className="gallery-upload-image-wrapper">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                  className="gallery-upload-preview-image"
                />
                <button
                  className="gallery-upload-remove-button"
                  onClick={() => removeImage(index)}
                  disabled={uploading}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedImages.length > 0 && (
        <button
          className={`gallery-upload-submit-button ${uploading ? 'disabled' : ''}`}
          onClick={uploadImages}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <span className="spinner-small"></span>
              Subiendo...
            </>
          ) : (
            `⬆️ Subir ${selectedImages.length} imagen(es)`
          )}
        </button>
      )}
    </div>
  );
}
