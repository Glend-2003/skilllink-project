import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Config } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Phone, Briefcase, FileText, MapPin } from 'lucide-react';
import './auth.css';

export default function RegisterScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
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

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!userType) {
        alert('Selecciona el tipo de cuenta');
        return;
      }
      setStep(2);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (userType === 'provider') {
      if (!formData.businessName || !formData.description || !formData.location) {
        alert('Por favor completa todos los campos de proveedor');
        return;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!acceptTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${Config.AUTH_SERVICE_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phone || null,
          userType: userType,
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
            const providerResponse = await fetch(`${Config.AUTH_SERVICE_URL}/provider-request`, {
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
              alert(
                'Registro Exitoso\n\nTu cuenta ha sido creada y tu solicitud de proveedor está en revisión. Mientras tanto, puedes usar la app como cliente. Te notificaremos cuando sea aprobada.'
              );
              navigate('/');
            } else {
              const errorData = await providerResponse.json();
              console.error('Provider request error:', errorData);
              alert(
                'Cuenta Creada\n\nTu cuenta fue creada pero hubo un error al enviar la solicitud de proveedor. Puedes enviarla desde tu perfil. Por ahora, usa la app como cliente.'
              );
              navigate('/');
            }
          } catch (error) {
            console.error('Provider request exception:', error);
            alert(
              'Cuenta Creada\n\nTu cuenta fue creada pero hubo un error al enviar la solicitud de proveedor. Puedes enviarla desde tu perfil. Por ahora, usa la app como cliente.'
            );
            navigate('/');
          }
        } else {
          alert('Éxito: Tu cuenta ha sido creada exitosamente');
          navigate('/');
        }
      } else {
        alert(data.message || 'Error al registrar.');
      }
    } catch (error) {
      alert('No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (provider: string) => {
    alert(`Registrándose con ${provider}... (Funcionalidad próximamente)`);
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        {/* Logo Section */}
        <div className="auth-logo-container">
          <div className="auth-logo">
            <img 
              src="/skilllink.png" 
              alt="SkillLink Logo" 
              className="auth-logo-image"
            />
          </div>
          <h1 className="auth-logo-title">SkillLink</h1>
          <p className="auth-subtitle">Únete a nuestra comunidad de profesionales y clientes</p>
        </div>

        {/* Progress Indicator */}
        <div className="auth-stepper">
          <div className={`auth-step ${step === 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="auth-step-number">1</div>
            <span className="auth-step-label">Tipo de usuario</span>
          </div>
          <div className="auth-step-line"></div>
          <div className={`auth-step ${step === 2 ? 'active' : ''}`}>
            <div className="auth-step-number">2</div>
            <span className="auth-step-label">Información</span>
          </div>
        </div>

        {/* Register Card */}
        <div className="auth-card">
        {step === 1 ? (
          <>
            <div className="auth-card-header">
              <h2 className="auth-card-title">Tipo de cuenta</h2>
              <p className="auth-card-description">Selecciona cómo deseas usar SkillLink</p>
            </div>
            <div className="auth-card-content">
              <button
                type="button"
                className={`auth-user-type-card ${userType === 'client' ? 'active' : ''}`}
                onClick={() => setUserType('client')}
              >
                <div className="auth-user-type-header">
                  <div className="auth-user-type-icon client">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="auth-user-type-title">Cliente</h3>
                    <p className="auth-user-type-subtitle">Busco contratar servicios</p>
                  </div>
                </div>
                <div className="auth-user-type-features">
                  <p className="auth-feature-text">• Busca proveedores verificados</p>
                  <p className="auth-feature-text">• Compara precios y reseñas</p>
                  <p className="auth-feature-text">• Chat directo con profesionales</p>
                </div>
              </button>

              <button
                type="button"
                className={`auth-user-type-card ${userType === 'provider' ? 'active' : ''}`}
                onClick={() => setUserType('provider')}
              >
                <div className="auth-user-type-header">
                  <div className="auth-user-type-icon provider">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h3 className="auth-user-type-title">Proveedor</h3>
                    <p className="auth-user-type-subtitle">Ofrezco mis servicios profesionales</p>
                  </div>
                </div>
                <div className="auth-user-type-features">
                  <p className="auth-feature-text">• Consigue nuevos clientes</p>
                  <p className="auth-feature-text">• Gestiona tu agenda y servicios</p>
                  <p className="auth-feature-text">• Construye tu reputación online</p>
                </div>
              </button>

              <button
                type="button"
                className="auth-button-primary"
                onClick={handleNextStep}
              >
                Continuar
              </button>

              <div className="auth-register-link">
                <span className="auth-register-text">¿Ya tienes una cuenta? </span>
                <Link to="/login" className="auth-register-link-text">
                  Inicia sesión
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="auth-card-header">
              <h2 className="auth-card-title">Completa tu registro</h2>
              <p className="auth-card-description">
                {userType === 'client' 
                  ? 'Crea tu cuenta como Cliente'
                  : 'Crea tu cuenta y solicitud de proveedor'}
              </p>
            </div>
            <form className="auth-card-content" onSubmit={handleRegister}>
              <div className="auth-input-row">
                <div className="auth-input-group">
                  <label className="auth-label">Nombre completo *</label>
                  <div className="auth-input-container">
                    <User className="auth-input-icon" size={20} />
                    <input
                      className="auth-input"
                      type="text"
                      placeholder="Juan Pérez"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Teléfono</label>
                  <div className="auth-input-container">
                    <Phone className="auth-input-icon" size={20} />
                    <input
                      className="auth-input"
                      type="tel"
                      placeholder="+52 55 1234 5678"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {userType === 'provider' && (
                <>
                  <div className="auth-input-group">
                    <label className="auth-label">Nombre del Negocio/Servicio *</label>
                    <div className="auth-input-container">
                      <Briefcase className="auth-input-icon" size={20} />
                      <input
                        className="auth-input"
                        type="text"
                        placeholder="Ej: Plomería García"
                        value={formData.businessName}
                        onChange={(e) => handleInputChange('businessName', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label">Descripción de Servicios *</label>
                    <div className="auth-input-container">
                      <FileText className="auth-input-icon" size={20} style={{ alignSelf: 'flex-start', marginTop: '12px' }} />
                      <textarea
                        className="auth-input auth-textarea"
                        placeholder="Describe detalladamente los servicios que ofreces"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label className="auth-label">Ubicación *</label>
                    <div className="auth-input-container">
                      <MapPin className="auth-input-icon" size={20} />
                      <input
                        className="auth-input"
                        type="text"
                        placeholder="Ej: Ciudad de Guatemala, Zona 10"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="auth-input-group">
                <label className="auth-label">Correo electrónico *</label>
                <div className="auth-input-container">
                  <Mail className="auth-input-icon" size={20} />
                  <input
                    className="auth-input"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-input-row">
                <div className="auth-input-group">
                  <label className="auth-label">Contraseña *</label>
                  <div className="auth-input-container">
                    <Lock className="auth-input-icon" size={20} />
                    <input
                      className="auth-input"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="auth-eye-icon"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Confirmar contraseña *</label>
                  <div className="auth-input-container">
                    <Lock className="auth-input-icon" size={20} />
                    <input
                      className="auth-input"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="auth-eye-icon"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>

              <label className="auth-terms-container">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={() => setAcceptTerms(!acceptTerms)}
                  className="auth-checkbox-input"
                />
                <span className="auth-checkbox-custom"></span>
                <span className="auth-terms-text">
                  Acepto los{' '}
                  <a href="#" className="auth-link">términos y condiciones</a>{' '}
                  y la{' '}
                  <a href="#" className="auth-link">política de privacidad</a>
                </span>
              </label>

              <div className="auth-button-row">
                <button
                  type="button"
                  className="auth-button-secondary"
                  onClick={() => setStep(1)}
                >
                  Atrás
                </button>
                <button
                  type="submit"
                  className={`auth-button-primary ${loading ? 'auth-button-disabled' : ''}`}
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear cuenta'}
                </button>
              </div>

              <div className="auth-separator">
                <div className="auth-separator-line" />
                <span className="auth-separator-text">O regístrate con</span>
                <div className="auth-separator-line" />
              </div>

              <div className="auth-social-buttons">
                <button
                  type="button"
                  className="auth-social-button"
                  onClick={() => handleSocialRegister('Google')}
                >
                  <svg className="auth-social-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#DB4437" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#4285F4" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#34A853" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  type="button"
                  className="auth-social-button"
                  onClick={() => handleSocialRegister('Facebook')}
                >
                  <svg className="auth-social-icon" viewBox="0 0 24 24" width="20" height="20">
                    <path fill="#4267B2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>

              <div className="auth-register-link">
                <span className="auth-register-text">¿Ya tienes una cuenta? </span>
                <Link to="/login" className="auth-register-link-text">
                  Inicia sesión
                </Link>
              </div>
            </form>
          </>
        )}
        </div>

        {/* Footer */}
        <p className="auth-footer">© 2026 SkillLink. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
