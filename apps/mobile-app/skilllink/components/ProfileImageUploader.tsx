import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, ImageIcon, User } from 'lucide-react-native';
import { Config } from '@/constants/Config';

interface ProfileImageUploaderProps {
  userId: number;
  currentImageUrl?: string;
  onUploadComplete: (imageUrl: string) => void;
  token: string;
}

export const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({
  userId,
  currentImageUrl,
  onUploadComplete,
  token,
}) => {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(currentImageUrl);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería de fotos');
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Necesitamos acceso a tu cámara');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  const uploadImage = async (image: ImagePicker.ImagePickerAsset) => {
    setUploading(true);

    try {
      const formData = new FormData();
      const imageUri = image.uri;
      const imageName = imageUri.split('/').pop() || 'profile.jpg';
      const imageType = imageName.split('.').pop() || 'jpg';

      formData.append('image', {
        uri: imageUri,
        type: `image/${imageType}`,
        name: imageName,
      } as any);

      formData.append('userId', userId.toString());

      // Upload to service-manager via API Gateway
      const uploadResponse = await fetch(`${Config.API_GATEWAY_URL}/api/v1/profile/upload-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResponse.ok) {
        const newImageUrl = uploadResult.imageUrl;
        
        // Update user profile in auth-service via API Gateway
        const updateResponse = await fetch(`${Config.API_GATEWAY_URL}/api/v1/auth/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            profileImageUrl: newImageUrl,
          }),
        });

        let updateResult;
        try {
          const responseText = await updateResponse.text();
          updateResult = responseText ? JSON.parse(responseText) : {};
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          updateResult = {};
        }
        
        if (updateResponse.ok) {
          setImageUrl(newImageUrl);
          onUploadComplete(newImageUrl);
          Alert.alert('Éxito', 'Foto de perfil actualizada');
        } else {
          console.error('Error actualizando perfil:', updateResult);
          throw new Error(updateResult.message || updateResult.Message || 'Error actualizando perfil');
        }
      } else {
        throw new Error(uploadResult.message || 'Error al subir la imagen');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'No se pudo subir la imagen. Verifica tu conexión.');
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Foto de perfil',
      'Elige una opción',
      [
        {
          text: 'Tomar foto',
          onPress: takePhoto,
        },
        {
          text: 'Elegir de galería',
          onPress: pickImage,
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.avatarContainer} 
        onPress={showImageOptions}
        disabled={uploading}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <User size={40} color="#fff" />
          </View>
        )}
        
        {uploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        <View style={styles.editBadge}>
          <Camera size={16} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 48,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
