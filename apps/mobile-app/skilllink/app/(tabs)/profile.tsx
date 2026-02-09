import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Config } from '../../constants/Config';
import RoleSwitcher from '@/components/RoleSwitcher';
import { ProfileImageUploader } from '@/components/ProfileImageUploader';
import CustomAlert from '../../components/CustomAlert';

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
  // const { unreadCount } = useNotification();
  const unreadCount = 0;
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userProfileData, setUserProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    showCancel?: boolean;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

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
      const response = await fetch(`${Config.API_GATEWAY_URL}/api/v1/auth/profile`, {
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
          const userProfileResponse = await fetch(`${Config.API_GATEWAY_URL}/api/v1/user-profile/me`, {
            headers: {
              'Authorization': `Bearer ${user?.token}`,
            },
          });
          
          if (userProfileResponse.ok) {
            const text = await userProfileResponse.text();
            
            // Check if response has content
            if (text && text.trim() !== '') {
              try {
                const userProfileData = JSON.parse(text);
                setUserProfileData(userProfileData);
                // Update profile with names from user_profiles
                if (userProfileData.first_name || userProfileData.last_name) {
                  setProfile(prev => prev ? {
                    ...prev,
                    first_name: userProfileData.first_name,
                    last_name: userProfileData.last_name
                  } : null);
                }
              } catch (parseError) {
                console.error('Error parsing user profile JSON:', parseError);
              }
            } else {
              console.log('Empty user profile response, no profile data yet');
            }
          } else if (userProfileResponse.status === 404) {
            console.log('User profile not found (404), user needs to complete profile');
          }
        } catch (error) {
          console.error('Error loading user profile data:', error);
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo cargar el perfil',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await fetch(`${Config.API_GATEWAY_URL}/api/v1/auth/profile`, {
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
        setAlert({
          visible: true,
          type: 'success',
          title: 'Éxito',
          message: 'Perfil actualizado correctamente',
        });
        setIsEditing(false);
        loadProfile();
      } else {
        setAlert({
          visible: true,
          type: 'error',
          title: 'Error',
          message: 'No se pudo actualizar el perfil',
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setAlert({
        visible: true,
        type: 'error',
        title: 'Error',
        message: 'No se pudo actualizar el perfil',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    setAlert({
      visible: true,
      type: 'warning',
      title: 'Cerrar sesión',
      message: '¿Estás seguro de que quieres cerrar sesión?',
      showCancel: true,
      onConfirm: () => {
        logout();
        router.replace('/login');
      },
    });
  };

  const handleBecomeProvider = () => {
    if (profile?.providerStatus === 'pending') {
      setAlert({
        visible: true,
        type: 'info',
        title: 'Solicitud pendiente',
        message: 'Tu solicitud para convertirte en proveedor está siendo revisada. Te notificaremos cuando sea aprobada.',
      });
    } else if (profile?.providerStatus === 'approved' || profile?.userType === 'provider') {
      setAlert({
        visible: true,
        type: 'info',
        title: 'Ya eres proveedor',
        message: 'Ya tienes una cuenta de proveedor activa.',
      });
    } else {
      router.push('/profile/become-provider');
    }
  };

  const getProviderStatusInfo = () => {
    if (!profile?.providerStatus) return null;

    switch (profile.providerStatus) {
      case 'pending':
        return {
          icon: 'time-outline',
          text: 'Solicitud en revisión',
          colors: ['#F59E0B', '#F97316'] as const,
        };
      case 'approved':
        return {
          icon: 'checkmark-circle',
          text: 'Proveedor aprobado',
          colors: ['#10B981', '#21c994'] as const,
        };
      case 'rejected':
        return {
          icon: 'close-circle',
          text: 'Solicitud rechazada',
          colors: ['#EF4444', '#DC2626'] as const,
        };
      default:
        return null;
    }
  };

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
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6', '#06b6d4']}
        style={styles.header}
      >
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
        <Text style={styles.headerEmail}>{profile?.email}</Text>
      </LinearGradient>

      {isProvider && (
        <View style={styles.roleSwitcherContainer}>
          <RoleSwitcher />
        </View>
      )}

      <View style={styles.content}>
        {/* User Type Badge */}
        <View style={styles.badgeContainer}>
          <LinearGradient
            colors={profile?.userType === 'provider' ? ['#10B981', '#059669'] : ['#2563EB', '#1E40AF']}
            style={styles.badge}
          >
            <Ionicons 
              name={profile?.userType === 'provider' ? 'briefcase' : 'person'} 
              size={16} 
              color="white" 
            />
            <Text style={styles.badgeText}>
              {profile?.userType === 'provider' ? 'Proveedor' : 'Cliente'}
            </Text>
          </LinearGradient>
        </View>

        {/* Provider Status */}
        {statusInfo && (
          <View style={styles.card}>
            <LinearGradient
              colors={statusInfo.colors}
              style={styles.statusContainer}
            >
              <Ionicons name={statusInfo.icon as any} size={22} color="white" />
              <Text style={styles.statusText}>{statusInfo.text}</Text>
            </LinearGradient>
          </View>
        )}

        {/* Profile Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle" size={24} color="#2563EB" />
            <Text style={styles.cardTitle}>Información Personal</Text>
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldLabel}>
              <Ionicons name="mail-outline" size={18} color="#6B7280" />
              <Text style={styles.labelText}>Correo electrónico</Text>
            </View>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={profile?.email}
              editable={false}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.fieldContainer}>
            <View style={styles.fieldLabel}>
              <Ionicons name="call-outline" size={18} color="#6B7280" />
              <Text style={styles.labelText}>Teléfono</Text>
            </View>
            <TextInput
              style={[styles.input, !isEditing && styles.disabledInput]}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="Ingresa tu número de teléfono"
              placeholderTextColor="#94A3B8"
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
                  <Ionicons name="close-outline" size={20} color="#64748B" />
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, { flex: 1 }]}
                  onPress={handleSaveProfile}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#2563EB', '#1E40AF']}
                    style={styles.gradientButton}
                  >
                    {isSaving ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-outline" size={20} color="white" />
                        <Text style={styles.primaryButtonText}>Guardar</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                style={[styles.button, { flex: 1 }]}
                onPress={() => setIsEditing(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2563EB', '#2563EB']}
                  style={styles.gradientButton}
                >
                  <Ionicons name="create-outline" size={20} color="white" />
                  <Text style={styles.primaryButtonText}>Editar Perfil</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Actions Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="flash" size={24} color="#8B5CF6" />
            <Text style={styles.cardTitle}>Acciones Rápidas</Text>
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/profile/complete-profile')}
            activeOpacity={0.7}
          >
            <View style={styles.actionButtonIcon}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.actionIconGradient}
              >
                <Ionicons name="person-add" size={20} color="white" />
              </LinearGradient>
            </View>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Completar Perfil</Text>
              <Text style={styles.actionButtonDescription}>
                Añade más información personal
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          {/* Become Provider Button */}
          {profile?.userType !== 'provider' && profile?.providerStatus !== 'approved' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleBecomeProvider}
              disabled={profile?.providerStatus === 'pending'}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonIcon}>
                <LinearGradient
                  colors={profile?.providerStatus === 'pending' ? ['#94A3B8', '#64748B'] : ['#10B981', '#059669']}
                  style={styles.actionIconGradient}
                >
                  <Ionicons 
                    name={profile?.providerStatus === 'pending' ? 'hourglass-outline' : 'briefcase'} 
                    size={20} 
                    color="white" 
                  />
                </LinearGradient>
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>
                  {profile?.providerStatus === 'pending'
                    ? 'Solicitud en Revisión'
                    : 'Convertirme en Proveedor'}
                </Text>
                <Text style={styles.actionButtonDescription}>
                  {profile?.providerStatus === 'pending'
                    ? 'Tu solicitud está siendo procesada'
                    : 'Ofrece tus servicios'}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={profile?.providerStatus === 'pending' ? '#94A3B8' : '#CBD5E1'} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Provider Options Section */}
        {isProvider && activeRole === 'provider' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="briefcase" size={24} color="#10B981" />
              <Text style={styles.cardTitle}>Panel de Proveedor</Text>
            </View>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/provider/edit-profile')}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonIcon}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.actionIconGradient}
                >
                  <Ionicons name="create" size={20} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Editar Perfil de Proveedor</Text>
                <Text style={styles.actionButtonDescription}>
                  Actualiza tu información de negocio
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/provider/provider-requests')}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonIcon}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.actionIconGradient}
                >
                  <Ionicons name="mail-open" size={20} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Solicitudes Recibidas</Text>
                <Text style={styles.actionButtonDescription}>
                  Gestiona las solicitudes de servicio
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderBottomWidth: 0 }]}
              onPress={() => router.push('/provider/services')}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonIcon}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.actionIconGradient}
                >
                  <Ionicons name="grid" size={20} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Gestionar Servicios</Text>
                <Text style={styles.actionButtonDescription}>
                  Añade o edita tus servicios
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        )}

        {/* Admin Section */}
        {profile?.userType?.toLowerCase() === 'admin' && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#8B5CF6" />
              <Text style={styles.cardTitle}>Panel de Administración</Text>
            </View>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/admin/services-approval')}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonIcon}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.actionIconGradient}
                >
                  <Ionicons name="checkmark-done" size={20} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Aprobar Servicios</Text>
                <Text style={styles.actionButtonDescription}>
                  Revisa y aprueba nuevos servicios
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/admin/provider-requests')}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonIcon}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.actionIconGradient}
                >
                  <Ionicons name="people" size={20} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Solicitudes de Proveedores</Text>
                <Text style={styles.actionButtonDescription}>
                  Gestiona solicitudes de nuevos proveedores
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderBottomWidth: 0 }]}
              onPress={() => router.push('/admin/categories-management')}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonIcon}>
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.actionIconGradient}
                >
                  <Ionicons name="apps" size={20} color="white" />
                </LinearGradient>
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Gestionar Categorías</Text>
                <Text style={styles.actionButtonDescription}>
                  Administra categorías de servicios
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <View style={{ height: 30 }} />
      </View>

      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        showCancel={alert.showCancel}
        onConfirm={() => {
          if (alert.onConfirm) {
            alert.onConfirm();
          }
          setAlert({ ...alert, visible: false });
        }}
        onCancel={() => setAlert({ ...alert, visible: false })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
  },
  headerEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 4,
  },
  roleSwitcherContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  content: {
    padding: 16,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  statusText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
    flex: 1,
  },
  fieldContainer: {
    marginBottom: 16,
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
    color: '#475569',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1E293B',
  },
  disabledInput: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  actionButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 2,
  },
  actionButtonDescription: {
    fontSize: 13,
    color: '#64748B',
  },
  logoutButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
