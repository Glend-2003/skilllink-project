import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, TouchableOpacity, Image} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Config } from '@/constants/Config';
import { useAuth } from './context/AuthContext';
import CustomAlert from '../components/CustomAlert';

export default function RegisterScreen() {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<'client' | 'provider'>('client');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Provider-specific fields
    businessName: '',
    description: '',
    location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!userType) {
        setAlert({
          visible: true,
          type: 'warning',
          title: 'Selección Requerida',
          message: 'Por favor, selecciona el tipo de cuenta que deseas crear.',
        });
        return;
      }
      setStep(2);
    }
  };

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Campos Requeridos',
        message: 'Por favor completa todos los campos obligatorios: nombre, email y contraseña.',
      });
      return;
    }

    if (userType === 'provider') {
      if (!formData.businessName || !formData.description || !formData.location) {
        setAlert({
          visible: true,
          type: 'warning',
          title: 'Campos de Proveedor Requeridos',
          message: 'Por favor completa todos los campos: nombre del negocio, descripción y ubicación.',
        });
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      setAlert({
        visible: true,
        type: 'error',
        title: 'Contraseñas No Coinciden',
        message: 'Las contraseñas ingresadas no coinciden. Por favor, verifica e inténtalo de nuevo.',
      });
      return;
    }

    if (formData.password.length < 6) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Contraseña Muy Corta',
        message: 'La contraseña debe tener al menos 6 caracteres para mayor seguridad.',
      });
      return;
    }

    if (!acceptTerms) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Términos y Condiciones',
        message: 'Debes aceptar los términos y condiciones para continuar.',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${Config.API_GATEWAY_URL}/api/v1/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phone || null,
          userType: userType,
          fullName: formData.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user data to auth context
        const userData = {
          userId: data.userId,
          email: data.email,
          userType: 'client',
          token: data.token,
        };
        login(userData);

        // If user registered as provider, create provider request
        if (userType === 'provider') {
          try {
            const providerResponse = await fetch(`${Config.API_GATEWAY_URL}/api/v1/provider-request`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${data.token}`,
              },
              body: JSON.stringify({
                businessName: formData.businessName,
                description: formData.description,
                services: formData.description, // Using description as services
                location: formData.location,
              }),
            });

            if (providerResponse.ok) {
              setAlert({
                visible: true,
                type: 'success',
                title: 'Registro Exitoso',
                message: 'Tu cuenta ha sido creada y tu solicitud de proveedor está en revisión. Mientras tanto, puedes usar la app como cliente.',
                onConfirm: () => router.replace("/(tabs)"),
              });
            } else {
              const errorData = await providerResponse.json();
              console.error('Provider request error:', errorData);
              setAlert({
                visible: true,
                type: 'warning',
                title: 'Cuenta Creada',
                message: 'Tu cuenta fue creada pero hubo un error al enviar la solicitud de proveedor. Puedes enviarla desde tu perfil.',
                onConfirm: () => router.replace("/(tabs)"),
              });
            }
          } catch (error) {
            console.error('Provider request exception:', error);
            setAlert({
              visible: true,
              type: 'warning',
              title: 'Cuenta Creada',
              message: 'Tu cuenta fue creada pero hubo un error al enviar la solicitud de proveedor. Puedes enviarla desde tu perfil.',
              onConfirm: () => router.replace("/(tabs)"),
            });
          }
        } else {
          setAlert({
            visible: true,
            type: 'success',
            title: '¡Bienvenido!',
            message: 'Tu cuenta ha sido creada exitosamente. Ahora puedes comenzar a usar SkillLink.',
            onConfirm: () => router.replace("/(tabs)"),
          });
        }
      } else {
        setAlert({
          visible: true,
          type: 'error',
          title: 'Error de Registro',
          message: data.message || 'No se pudo completar el registro. Intenta nuevamente.',
        });
      }
    } catch (error) {
      setAlert({
        visible: true,
        type: 'error',
        title: 'Sin Conexión',
        message: 'No se pudo conectar al servidor. Verifica tu conexión a internet.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    setAlert({
      visible: true,
      type: 'info',
      title: 'Próximamente',
      message: `El registro con ${provider} estará disponible pronto.`,
    });
  };

  return (
    <LinearGradient
      colors={['#2563eb', '#1e40af', '#10b981']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.subtitle}>Crea tu cuenta y comienza hoy</Text>
        </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]}>
          <Text style={[styles.progressText, step >= 1 && styles.progressTextActive]}>
            {step > 1 ? '✓' : '1'}
          </Text>
        </View>
        <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
        <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]}>
          <Text style={[styles.progressText, step >= 2 && styles.progressTextActive]}>2</Text>
        </View>
      </View>

      {/* Register Card */}
      <View style={styles.card}>
        {step === 1 ? (
          <>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Tipo de cuenta</Text>
              <Text style={styles.cardDescription}>Selecciona cómo deseas usar SkillLink</Text>
            </View>
            <View style={styles.cardContent}>
              <TouchableOpacity
                style={[styles.userTypeCard, userType === 'client' && styles.userTypeCardActive]}
                onPress={() => setUserType('client')}
              >
                <View style={styles.userTypeHeader}>
                  <View style={styles.userTypeIcon}>
                    <Ionicons name="person" size={24} color="#2563eb" />
                  </View>
                  <View>
                    <Text style={styles.userTypeTitle}>Cliente</Text>
                    <Text style={styles.userTypeSubtitle}>Busco contratar servicios</Text>
                  </View>
                </View>
                <View style={styles.userTypeFeatures}>
                  <Text style={styles.featureText}>• Busca proveedores verificados</Text>
                  <Text style={styles.featureText}>• Compara precios y reseñas</Text>
                  <Text style={styles.featureText}>• Chat directo con profesionales</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.userTypeCard, userType === 'provider' && styles.userTypeCardActive]}
                onPress={() => setUserType('provider')}
              >
                <View style={styles.userTypeHeader}>
                  <View style={styles.userTypeIcon}>
                    <Ionicons name="construct" size={24} color="#16a34a" />
                  </View>
                  <View>
                    <Text style={styles.userTypeTitle}>Proveedor</Text>
                    <Text style={styles.userTypeSubtitle}>Ofrezco mis servicios profesionales</Text>
                  </View>
                </View>
                <View style={styles.userTypeFeatures}>
                  <Text style={styles.featureText}>• Consigue nuevos clientes</Text>
                  <Text style={styles.featureText}>• Gestiona tu agenda y servicios</Text>
                  <Text style={styles.featureText}>• Construye tu reputación online</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonWrapper}
                onPress={handleNextStep}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#2563eb', '#10b981']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonPrimary}
                >
                  <Text style={styles.buttonPrimaryText}>Continuar</Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.loginLink}>
                <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
                <Pressable onPress={() => router.push("/login")}>
                  <Text style={styles.loginLinkText}>Inicia sesión</Text>
                </Pressable>
              </View>
            </View>
          </>
        ) : (
          <>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Completa tu registro</Text>
              <Text style={styles.cardDescription}>
                {userType === 'client' 
                  ? 'Crea tu cuenta como Cliente'
                  : 'Crea tu cuenta y solicitud de proveedor'}
              </Text>
            </View>
            <View style={styles.cardContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre completo *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="person" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Juan Pérez"
                    value={formData.name}
                    onChangeText={(value) => handleInputChange('name', value)}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Teléfono</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="+52 55 1234 5678"
                    value={formData.phone}
                    onChangeText={(value) => handleInputChange('phone', value)}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {userType === 'provider' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nombre del Negocio/Servicio *</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="briefcase" size={20} color="#9ca3af" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Ej: Plomería García"
                        value={formData.businessName}
                        onChangeText={(value) => handleInputChange('businessName', value)}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Descripción de Servicios *</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="document-text" size={20} color="#9ca3af" style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Describe detalladamente los servicios que ofreces"
                        value={formData.description}
                        onChangeText={(value) => handleInputChange('description', value)}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Ubicación *</Text>
                    <View style={styles.inputContainer}>
                      <Ionicons name="location" size={20} color="#9ca3af" style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder="Ej: Ciudad de Guatemala, Zona 10"
                        value={formData.location}
                        onChangeText={(value) => handleInputChange('location', value)}
                      />
                    </View>
                  </View>
                </>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo electrónico *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="mail" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar contraseña *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="lock-closed" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChangeText={(value) => handleInputChange('confirmPassword', value)}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.termsContainer}>
                <TouchableOpacity onPress={() => setAcceptTerms(!acceptTerms)} style={styles.checkbox}>
                  {acceptTerms && <Ionicons name="checkmark" size={16} color="#2563eb" />}
                </TouchableOpacity>
                <Text style={styles.termsText}>
                  Acepto los{' '}
                  <Text style={styles.linkText}>términos y condiciones</Text>{' '}
                  y la{' '}
                  <Text style={styles.linkText}>política de privacidad</Text>
                </Text>
              </View>

              <View style={styles.buttonRow}>
                <Pressable style={styles.buttonSecondary} onPress={() => setStep(1)}>
                  <Text style={styles.buttonSecondaryText}>Atrás</Text>
                </Pressable>
                <TouchableOpacity
                  style={[styles.buttonWrapper, styles.buttonWrapperFlex, loading && styles.buttonDisabled]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#2563eb', '#10b981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonPrimary}
                  >
                    <Text style={styles.buttonPrimaryText}>{loading ? "Creando..." : "Crear cuenta"}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.separator}>
                <View style={styles.separatorLine} />
                <Text style={styles.separatorText}>O regístrate con</Text>
                <View style={styles.separatorLine} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialRegister('Google')}>
                  <Ionicons name="logo-google" size={20} color="#db4437" />
                  <Text style={styles.socialButtonText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} onPress={() => handleSocialRegister('Facebook')}>
                  <Ionicons name="logo-facebook" size={20} color="#4267b2" />
                  <Text style={styles.socialButtonText}>Facebook</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.loginLink}>
                <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
                <Pressable onPress={() => router.push("/login")}>
                  <Text style={styles.loginLinkText}>Inicia sesión</Text>
                </Pressable>
              </View>
            </View>
          </>
        )}
      </View>

        <Text style={styles.footer}>© 2026 SkillLink. Todos los derechos reservados.</Text>
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={() => {
          if (alert.onConfirm) {
            alert.onConfirm();
          }
          setAlert({ ...alert, visible: false });
        }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e0f2fe',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  progressStep: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#93c5fd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressStepActive: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  progressText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  progressTextActive: {
    color: '#2563eb',
  },
  progressLine: {
    width: 64,
    height: 2,
    backgroundColor: '#93c5fd',
  },
  progressLineActive: {
    backgroundColor: '#2563eb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
    maxWidth: 400,
  },
  cardHeader: {
    padding: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  cardContent: {
    padding: 24,
  },
  userTypeCard: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  userTypeCardActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  userTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userTypeIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userTypeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  userTypeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  userTypeFeatures: {
    marginLeft: 52,
  },
  featureText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  buttonWrapper: {
    marginTop: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonWrapperFlex: {
    flex: 1,
  },
  buttonPrimary: {
    padding: 16,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#6b7280',
  },
  loginLinkText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  eyeIcon: {
    padding: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  linkText: {
    color: '#2563eb',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonSecondary: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#d1d5db',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    backgroundColor: '#fff',
  },
  buttonSecondaryText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  separatorText: {
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#6b7280',
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 12,
    borderRadius: 8,
  },
  socialButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
  footer: {
    marginTop: 32,
    fontSize: 12,
    color: '#e0f2fe',
    textAlign: 'center',
  },
});