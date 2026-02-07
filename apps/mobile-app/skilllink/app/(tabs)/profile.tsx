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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { User, LogOut, Mail, Phone, Shield, CheckCircle, Clock, Settings, Briefcase, List, Bell } from 'lucide-react-native';
import { Config } from '../../constants/Config';
import RoleSwitcher from '@/components/RoleSwitcher';
import { ProfileImageUploader } from '@/components/ProfileImageUploader';

interface UserProfile {
  userId: number;
  email: string;
  phoneNumber?: string;
  userType: string;
  isActive: boolean;
  providerStatus?: 'pending' | 'approved' | 'rejected' | null;
  profileImageUrl?: string;
  first_name?: string;
  last_name?: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { activeRole, isProvider, reloadProviderStatus } = useRole();
  // const { unreadCount } = useNotification(); // Temporal: esperando build con Firebase
  const unreadCount = 0;
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${Config.AUTH_SERVICE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setPhoneNumber(data.phoneNumber || '');
        await AsyncStorage.setItem('userProfile', JSON.stringify(data));
        await reloadProviderStatus();
        
        // Load user_profiles data
        try {
          const userProfileResponse = await fetch(`${Config.USER_SERVICE_URL}/user-profile/me`, {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
            },
          });
          if (userProfileResponse.ok) {
            const userProfileData = await userProfileResponse.json();
            setUserProfileData(userProfileData);
            // Update profile with names from user_profiles
            if (userProfileData.first_name || userProfileData.last_name) {
              setProfile(prev => prev ? {
                ...prev,
                first_name: userProfileData.first_name,
                last_name: userProfileData.last_name
              } : null);
            }
          }
        } catch (error) {
          console.error('Error loading user profile data:', error);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`${Config.AUTH_SERVICE_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          phoneNumber,
        }),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
        setIsEditing(false);
        loadProfile();
      } else {
        Alert.alert('Error', 'No se pudo actualizar el perfil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const handleBecomeProvider = () => {
    if (profile?.providerStatus === 'pending') {
      Alert.alert(
        'Solicitud pendiente',
        'Tu solicitud para convertirte en proveedor está siendo revisada. Te notificaremos cuando sea aprobada.'
      );
    } else if (profile?.providerStatus === 'approved' || profile?.userType === 'provider') {
      Alert.alert('Ya eres proveedor', 'Ya tienes una cuenta de proveedor activa.');
    } else {
      router.push('/profile/become-provider');
    }
  };

  const getProviderStatusInfo = () => {
    if (!profile?.providerStatus) return null;

    switch (profile.providerStatus) {
      case 'pending':
        return {
          icon: <Clock color="#f59e0b" size={20} />,
          text: 'Solicitud en revisión',
          color: '#f59e0b',
        };
      case 'approved':
        return {
          icon: <CheckCircle color="#10b981" size={20} />,
          text: 'Proveedor aprobado',
          color: '#10b981',
        };
      case 'rejected':
        return {
          icon: <Shield color="#ef4444" size={20} />,
          text: 'Solicitud rechazada',
          color: '#ef4444',
        };
      default:
        return null;
    }
  };
          {profile?.first_name && profile?.last_name 
            ? `${profile.first_name} ${profile.last_name}` 
            : 'Mi Perfil'}
        

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  const statusInfo = getProviderStatusInfo();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <ProfileImageUploader
          userId={profile?.userId || 0}
          currentImageUrl={profile?.profileImageUrl}
          onUploadComplete={(imageUrl) => {
            setProfile(prev => prev ? { ...prev, profileImageUrl: imageUrl } : null);
          }}
          token={user?.token || ''}
        />
        <Text style={styles.headerTitle}>
          {userProfileData?.first_name && userProfileData?.last_name 
            ? `${userProfileData.first_name} ${userProfileData.last_name}` 
            : 'Mi Perfil'}
        </Text>
      </View>

      {isProvider && <RoleSwitcher />}

      <View style={styles.content}>
        {/* User Type Badge */}
        <View style={styles.badgeContainer}>
          <View style={[styles.badge, profile?.userType === 'provider' ? styles.providerBadge : styles.clientBadge]}>
            <Text style={styles.badgeText}>
              {profile?.userType === 'provider' ? 'Proveedor' : 'Cliente'}
            </Text>
          </View>
        </View>

        {/* Provider Status */}
        {statusInfo && (
          <View style={[styles.statusContainer, { backgroundColor: `${statusInfo.color}15` }]}>
            {statusInfo.icon}
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        )}

        {/* Email */}
        <View style={styles.fieldContainer}>
          <Text style={styles.labelText}>Correo electrónico</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={profile?.email}
            editable={false}
          />
        </View>

        {/* Phone Number */}
        <View style={styles.fieldContainer}>
          <Text style={styles.labelText}>Teléfono</Text>
          <TextInput
            style={[styles.input, !isEditing && styles.disabledInput]}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Ingresa tu número de teléfono"
            keyboardType="phone-pad"
            editable={isEditing}
          />
        </View>

        {/* Edit/Save Buttons */}
        <View style={styles.buttonGroup}>
          {isEditing ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => {
                  setIsEditing(false);
                  setPhoneNumber(profile?.phoneNumber || '');
                }}
              >
                <Text style={styles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.primaryButtonText}>Guardar</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, styles.fullWidthButton]}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.primaryButtonText}>Editar Perfil</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Complete Profile Button */}
        <TouchableOpacity
          style={[styles.button, styles.completeProfileButton]}
          onPress={() => router.push('/profile/complete-profile')}
        >
          <Text style={styles.completeProfileButtonText}>Completar Información Personal</Text>
        </TouchableOpacity>

        {/* Become Provider Button */}
        {profile?.userType !== 'provider' && profile?.providerStatus !== 'approved' && (
          <TouchableOpacity
            style={[styles.button, styles.providerButton]}
            onPress={handleBecomeProvider}
            disabled={profile?.providerStatus === 'pending'}
          >
            <Text style={styles.primaryButtonText}>
              {profile?.providerStatus === 'pending'
                ? 'Solicitud en Revisión'
                : 'Convertirme en Proveedor'}
            </Text>
          </TouchableOpacity>
        )}
        

        {isProvider && activeRole === 'provider' && (
          <View style={styles.providerSection}>
            <TouchableOpacity
              style={[styles.button, styles.providerOptionButton]}
              onPress={() => router.push('/provider/edit-profile')}
            >
              <Text style={styles.providerOptionText}>Editar Perfil de Proveedor</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.providerOptionButton]}
              onPress={() => router.push('/provider/provider-requests')}
            >
              <Text style={styles.providerOptionText}>Solicitudes Recibidas</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.providerOptionButton]}
              onPress={() => router.push('/provider/services')}
            >
              <Text style={styles.providerOptionText}>Gestionar Servicios</Text>
            </TouchableOpacity>
          </View>
        )}

        {profile?.userType?.toLowerCase() === 'admin' && (
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>Panel de Administración</Text>
            
            <TouchableOpacity
              style={[styles.button, styles.adminButton]}
              onPress={() => router.push('/admin/services-approval')}
            >
              <Text style={styles.primaryButtonText}>Aprobar Servicios</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.adminButton]}
              onPress={() => router.push('/admin/provider-requests')}
            >
              <Text style={styles.primaryButtonText}>Solicitudes de Proveedores</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.adminButton]}
              onPress={() => router.push('/admin/categories-management')}
            >
              <Text style={styles.primaryButtonText}>Gestionar Categorías</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    padding: 20,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  clientBadge: {
    backgroundColor: '#2563eb',
  },
  providerBadge: {
    backgroundColor: '#10b981',
  },
  badgeText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  statusText: {
    fontWeight: '600',
    fontSize: 14,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
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
    fontSize: 16,
    color: '#1e293b',
  },
  disabledInput: {
    backgroundColor: '#f1f5f9',
    color: '#64748b',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  fullWidthButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  providerButton: {
    backgroundColor: '#10b981',
    marginBottom: 16,
  },
  completeProfileButton: {
    backgroundColor: '#8b5cf6',
    marginBottom: 16,
  },
  completeProfileButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  providerSection: {
    marginBottom: 16,
    gap: 12,
  },
  providerOptionButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  providerOptionText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  adminSection: {
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  adminButton: {
    backgroundColor: '#8b5cf6',
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    right: -10,
    top: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
});
