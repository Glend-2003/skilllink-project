import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Config } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import './auth.css';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('Por favor, ingresa email y contraseña.');
      return;
    }

    setLoading(true);
    const loginUrl = `${Config.AUTH_SERVICE_URL}/login`;
    
    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData = {
          userId: data.userId,
          email: data.email,
          userType: data.userType,
          token: data.token
        };

        login(userData);
        navigate('/');
      } else {
        alert(data.message || 'Credenciales incorrectas.');
      }
    } catch (error) {
      alert('No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    alert(`Iniciando sesión con ${provider}... (Funcionalidad próximamente)`);
  };

  const handleForgotPassword = () => {
    alert('Funcionalidad de recuperación próximamente');
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
          <p className="auth-subtitle">Conecta con los mejores profesionales de tu área</p>
        </div>

        {/* Login Card */}
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Iniciar sesión</h2>
            <p className="auth-card-description">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>

          <form className="auth-card-content" onSubmit={handleLogin}>
          <div className="auth-input-group">
            <label className="auth-label">Correo electrónico</label>
            <div className="auth-input-container">
              <Mail className="auth-input-icon" size={20} />
              <input
                className="auth-input"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label className="auth-label">Contraseña</label>
            <div className="auth-input-container">
              <Lock className="auth-input-icon" size={20} />
              <input
                className="auth-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
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

          <div className="auth-options-container">
            <label className="auth-checkbox-container">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="auth-checkbox-input"
              />
              <span className="auth-checkbox-custom"></span>
              <span className="auth-checkbox-text">Recordarme</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="auth-forgot-password"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button
            type="submit"
            className={`auth-button-primary ${loading ? 'auth-button-disabled' : ''}`}
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          <div className="auth-separator">
            <div className="auth-separator-line" />
            <span className="auth-separator-text">O continúa con</span>
            <div className="auth-separator-line" />
          </div>

          <div className="auth-social-buttons">
            <button
              type="button"
              className="auth-social-button"
              onClick={() => handleSocialLogin('Google')}
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
              onClick={() => handleSocialLogin('Facebook')}
            >
              <svg className="auth-social-icon" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4267B2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </button>
          </div>

          <div className="auth-register-link">
            <span className="auth-register-text">¿No tienes una cuenta? </span>
            <Link to="/register" className="auth-register-link-text">
              Regístrate gratis
            </Link>
          </div>
        </form>
        </div>

        {/* Footer */}
        <p className="auth-footer">© 2026 SkillLink. Todos los derechos reservados.</p>
      </div>
    </div>
  );
}
