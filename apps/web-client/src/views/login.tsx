
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../constants/Config';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Por favor, ingresa email y contraseña.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
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

  return (
    <div style={{ minHeight: '100vh', background: '#f0f9ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 30 }}>
        <div style={{ width: 64, height: 64, marginBottom: 16 }}>
          <img src="/skilllink.png" alt="SkillLink Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ fontSize: 16, color: '#64748b' }}>Conecta con los mejores profesionales</div>
      </div>
        <div style={{ background: '#f7faff', borderRadius: 28, boxShadow: '0 16px 64px rgba(0,0,0,0.20)', width: 700, minWidth: 600, maxWidth: 800 }}>
        <div style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>Iniciar sesión</div>
          <div style={{ fontSize: 16, color: '#6b7280' }}>Ingresa tus credenciales para acceder a tu cuenta</div>
        </div>
          <form style={{ padding: 64 }} onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Correo electrónico</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8, padding: '0 12px' }}>
              <span className="material-icons" style={{ marginRight: 8, color: '#9ca3af' }}>tu@email.com</span>
              <input type="email" placeholder="" value={email} onChange={e => setEmail(e.target.value)} style={{ flex: 1, height: 48, fontSize: 16, border: 'none', outline: 'none', background: 'transparent' }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Contraseña</label>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8, padding: '0 12px' }}>
              <span className="material-icons" style={{ marginRight: 8, color: '#9ca3af' }}></span>
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={{ flex: 1, height: 48, fontSize: 16, border: 'none', outline: 'none', background: 'transparent' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <span className="material-icons" style={{ color: '#9ca3af' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: 14, color: '#6b7280', cursor: 'pointer' }}>
              <input type="checkbox" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} style={{ marginRight: 8 }} />
              Recordarme
            </label>
            <button type="button" style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 14, cursor: 'pointer' }} disabled>
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', background: '#2563eb', color: '#fff', fontSize: 18, fontWeight: 600, padding: 18, borderRadius: 8, border: 'none', marginBottom: 16, opacity: loading ? 0.6 : 1, letterSpacing: 0.5 }}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            <div style={{ padding: '0 16px', fontSize: 14, color: '#6b7280' }}>O continúa con</div>
            <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
          </div>
          <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
            <button type="button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d1d5db', padding: 12, borderRadius: 8, background: '#fff', color: '#374151', fontSize: 14, cursor: 'pointer' }} disabled>
              <span className="material-icons" style={{ color: '#db4437', marginRight: 8 }}>Google</span>
            </button>
            <button type="button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d1d5db', padding: 12, borderRadius: 8, background: '#fff', color: '#374151', fontSize: 14, cursor: 'pointer' }} disabled>
              <span className="material-icons" style={{ color: '#4267b2', marginRight: 8 }}>Facebook</span>
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
            <span style={{ fontSize: 14, color: '#6b7280' }}>¿No tienes una cuenta? </span>
            <Link to="/register" style={{ fontSize: 14, color: '#2563eb', fontWeight: 600, marginLeft: 4 }}>Regístrate gratis</Link>
          </div>
        </form>
      </div>
        <div style={{ marginTop: 80, fontSize: 18, color: '#b0b8c1', textAlign: 'center' }}>© 2026 SkillLink. Todos los derechos reservados.</div>
    </div>
  );
}
