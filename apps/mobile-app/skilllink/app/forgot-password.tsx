import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Config } from '@/constants/Config';
import CustomAlert from '../components/CustomAlert';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: code and new password
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    visible: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    visible: false,
    type: 'info',
    title: '',
    message: '',
  });

  const handleRequestCode = async () => {
    if (!email) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Campo Requerido',
        message: 'Por favor, ingresa tu correo electrónico.',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Email Inválido',
        message: 'Por favor, ingresa un correo electrónico válido.',
      });
      return;
    }

    setLoading(true);
    const forgotPasswordUrl = `${Config.API_GATEWAY_URL}/api/v1/auth/forgot-password`;
    
    try {
      const response = await fetch(forgotPasswordUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({
          visible: true,
          type: 'success',
          title: 'Código Enviado',
          message: 'Hemos enviado un código de verificación a tu correo electrónico.',
        });
        setStep(2);
      } else {
        setAlert({
          visible: true,
          type: 'error',
          title: 'Error',
          message: data.message || 'No se pudo enviar el código. Verifica tu correo electrónico.',
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

  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Campos Requeridos',
        message: 'Por favor, completa todos los campos.',
      });
      return;
    }

    if (newPassword.length < 6) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Contraseña Débil',
        message: 'La contraseña debe tener al menos 6 caracteres.',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setAlert({
        visible: true,
        type: 'warning',
        title: 'Contraseñas No Coinciden',
        message: 'Las contraseñas ingresadas no coinciden.',
      });
      return;
    }

    setLoading(true);
    const resetPasswordUrl = `${Config.API_GATEWAY_URL}/api/v1/auth/reset-password`;
    
    try {
      const response = await fetch(resetPasswordUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({
          visible: true,
          type: 'success',
          title: 'Contraseña Actualizada',
          message: 'Tu contraseña ha sido restablecida exitosamente.',
        });
        setTimeout(() => {
          router.replace("/login");
        }, 2000);
      } else {
        setAlert({
          visible: true,
          type: 'error',
          title: 'Error',
          message: data.message || 'Código inválido o expirado. Por favor, intenta nuevamente.',
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
          <View style={styles.logoCircle}>
            <Image
              source={require("../assets/images/skilllink.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>Recupera el acceso a tu cuenta</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color="#1f2937" />
            </TouchableOpacity>
            <Text style={styles.cardTitle}>
              {step === 1 ? 'Recuperar Contraseña' : 'Nueva Contraseña'}
            </Text>
            <Text style={styles.cardDescription}>
              {step === 1 
                ? 'Ingresa tu correo electrónico y te enviaremos un código de verificación'
                : 'Ingresa el código que recibiste y tu nueva contraseña'
              }
            </Text>
          </View>

          <View style={styles.cardContent}>
            {step === 1 ? (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Correo electrónico</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="mail" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="tu@email.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loading}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.buttonWrapper, loading && styles.buttonDisabled]}
                  onPress={handleRequestCode}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#2563eb', '#10b981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonPrimary}
                  >
                    <Text style={styles.buttonPrimaryText}>
                      {loading ? "Enviando código..." : "Enviar código"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Código de verificación</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="key" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="123456"
                      value={code}
                      onChangeText={setCode}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={!loading}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nueva contraseña</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showNewPassword}
                      editable={!loading}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowNewPassword(!showNewPassword)} 
                      style={styles.eyeIcon}
                    >
                      <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmar contraseña</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="lock-closed" size={20} color="#9ca3af" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      editable={!loading}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                      style={styles.eyeIcon}
                    >
                      <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.buttonWrapper, loading && styles.buttonDisabled]}
                  onPress={handleResetPassword}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#2563eb', '#10b981']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonPrimary}
                  >
                    <Text style={styles.buttonPrimaryText}>
                      {loading ? "Actualizando..." : "Restablecer contraseña"}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={() => {
                    setStep(1);
                    setCode("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  disabled={loading}
                >
                  <Text style={styles.resendButtonText}>¿No recibiste el código?</Text>
                </TouchableOpacity>
              </>
            )}

            <View style={styles.loginLink}>
              <Text style={styles.loginText}>¿Recordaste tu contraseña? </Text>
              <TouchableOpacity onPress={() => router.replace("/login")}>
                <Text style={styles.loginLinkText}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>© 2026 SkillLink. Todos los derechos reservados.</Text>
      </ScrollView>

      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onConfirm={() => setAlert({ ...alert, visible: false })}
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
  logoImage: {
    width: '100%',
    height: '100%',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0f2fe',
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
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 24,
    top: 24,
    padding: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  cardContent: {
    padding: 24,
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
  eyeIcon: {
    padding: 4,
  },
  buttonWrapper: {
    marginTop: 8,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
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
  resendButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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
  footer: {
    marginTop: 32,
    fontSize: 12,
    color: '#e0f2fe',
    textAlign: 'center',
  },
});
