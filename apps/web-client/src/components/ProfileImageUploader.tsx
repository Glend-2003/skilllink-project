import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../constants/Config';
import { Camera, Loader } from 'lucide-react';
import './ProfileImageUploader.css';

interface ProfileImageUploaderProps {
  onChange?: () => void;
}

export default function ProfileImageUploader({ onChange }: ProfileImageUploaderProps) {
  const { user } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Load current profile image
    loadProfileImage();
  }, []);

  const loadProfileImage = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.profileImageUrl) {
          setImageUrl(data.profileImageUrl);
        }
      }
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file is an image
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor de 5MB');
      return;
    }

    await uploadImage(file);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('userId', user?.userId?.toString() || '');

      // Upload image
      const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/profile/upload-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResponse.ok) {
        const newImageUrl = uploadResult.imageUrl;

        // Update user profile with new image URL
        const updateResponse = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileImageUrl: newImageUrl,
          }),
        });

        if (updateResponse.ok) {
          setImageUrl(newImageUrl);
          alert('Foto de perfil actualizada correctamente');
          
          // Notificar a otros componentes que se actualizó la foto (Navigation)
          // Usar localStorage para disparar un evento de storage
          localStorage.setItem('profileImageUpdated', new Date().toISOString());
          window.dispatchEvent(new Event('profileImageUpdated'));
          
          onChange?.();
        } else {
          throw new Error('Error al actualizar el perfil');
        }
      } else {
        throw new Error(uploadResult.message || 'Error al subir la imagen');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('No se pudo subir la imagen. Verifica tu conexión.');
    } finally {
      setUploading(false);
      // Reset input
      if (fileInput.current) {
        fileInput.current.value = '';
      }
    }
  };

  const getInitials = () => {
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="profile-image-uploader">
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInput}
        onChange={handleFileSelect}
        disabled={uploading}
      />
      
      <div
        className="profile-avatar-container"
        onClick={() => !uploading && fileInput.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !uploading) {
            fileInput.current?.click();
          }
        }}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt="Profile"
            className="profile-avatar-image"
          />
        ) : (
          <div className="profile-avatar-placeholder">
            {getInitials()}
          </div>
        )}

        {uploading && (
          <div className="profile-uploading-overlay">
            <Loader className="spinner" size={32} />
          </div>
        )}

        <div className="profile-edit-badge">
          <Camera size={16} />
        </div>
      </div>

      <p className="profile-help-text">
        {uploading ? 'Subiendo imagen...' : 'Haz clic para cambiar foto'}
      </p>
    </div>
  );
}
