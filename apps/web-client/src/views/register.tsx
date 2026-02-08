
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../constants/Config';

export default function Register() {
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState('client');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    description: '',
    location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleNextStep = () => {
    if (!userType) {
      alert('Selecciona el tipo de cuenta');
      return;
    }
    setStep(2);
  };

  const handleRegister = async (e) => {
      return ( 
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          alert('Completa todos los campos obligatorios.');
          return;
        }
      alert('Las contraseñas no coinciden.');
      return;
    }
    if (formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (!acceptTerms) {
      alert('Debes aceptar los términos y condiciones.');
      return;
    }
    if (userType === 'provider' && (!formData.businessName || !formData.description || !formData.location)) {
      alert('Completa todos los campos de proveedor.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          phoneNumber: formData.phone || null,
          userType: userType === 'provider' ? 'Provider' : 'Client',
        })
      });
      const data = await response.json();
      if (response.ok) {
        alert('Registro exitoso. Inicia sesión.');
        navigate('/login');
      } else {
        alert(data.message || 'Error en el registro.');
      }
    } catch (error) {
      alert('No se pudo conectar al servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f9ff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 30 }}>
        <div style={{ width: 64, height: 64, marginBottom: 16 }}>
          <img src="/skilllink.png" alt="SkillLink Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>
        <div style={{ fontSize: 16, color: '#64748b' }}>Crea tu cuenta y comienza hoy</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 30 }}>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: step >= 1 ? '#fff' : '#93c5fd', border: step >= 1 ? '2px solid #2563eb' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step >= 1 ? '#2563eb' : '#fff', fontWeight: 'bold', fontSize: 18 }}>{step > 1 ? '✓' : '1'}</div>
        <div style={{ width: 64, height: 2, background: step >= 2 ? '#2563eb' : '#93c5fd' }} />
        <div style={{ width: 32, height: 32, borderRadius: 16, background: step >= 2 ? '#fff' : '#93c5fd', border: step >= 2 ? '2px solid #2563eb' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step >= 2 ? '#2563eb' : '#fff', fontWeight: 'bold', fontSize: 18 }}>2</div>
                  <label style={{ fontSize: 20, fontWeight: 500, color: '#374151', marginBottom: 14, display: 'block' }}>Correo electrónico</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #d1d5db', borderRadius: 14, padding: '0 24px' }}>
                    <span className="material-icons" style={{ marginRight: 14, color: '#9ca3af', fontSize: 28 }}>mail</span>
                    <input type="email" placeholder="tu@email.com" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} style={{ flex: 1, height: 64, fontSize: 22, border: 'none', outline: 'none', background: 'transparent' }} />
                  </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>Tipo de cuenta</div>
              <div style={{ fontSize: 16, color: '#6b7280' }}>Selecciona cómo deseas usar SkillLink</div>
                  <label style={{ fontSize: 20, fontWeight: 500, color: '#374151', marginBottom: 14, display: 'block' }}>Contraseña</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #d1d5db', borderRadius: 14, padding: '0 24px' }}>
                    <span className="material-icons" style={{ marginRight: 14, color: '#9ca3af', fontSize: 28 }}>lock</span>
                    <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} style={{ flex: 1, height: 64, fontSize: 22, border: 'none', outline: 'none', background: 'transparent' }} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                      <span className="material-icons" style={{ color: '#9ca3af', fontSize: 28 }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  </div>
                </div>
                <div style={{ marginLeft: 36, color: '#6b7280', fontSize: 14 }}>
                  • Busca proveedores verificados<br />• Compara precios y reseñas<br />• Chat directo con profesionales
                </div>
              </button>
              <button type="button" onClick={() => setUserType('provider')} style={{ width: '100%', border: userType === 'provider' ? '2px solid #2563eb' : '2px solid #e5e7eb', background: userType === 'provider' ? '#eff6ff' : '#fff', borderRadius: 12, padding: 16, textAlign: 'left', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                  <span className="material-icons" style={{ marginRight: 12, color: '#16a34a' }}>construction</span>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: '#1f2937' }}>Proveedor</div>
                    <div style={{ fontSize: 14, color: '#6b7280' }}>Ofrezco mis servicios profesionales</div>
                  </div>
                </div>
                <div style={{ marginLeft: 36, color: '#6b7280', fontSize: 14 }}>
                  • Consigue nuevos clientes<br />• Gestiona tu agenda y servicios<br />• Construye tu reputación online
                </div>
              </button>
            </div>
            <button type="button" onClick={handleNextStep} style={{ width: '100%', background: '#2563eb', color: '#fff', fontSize: 16, fontWeight: 600, padding: 16, borderRadius: 8, border: 'none', marginTop: 24 }}>Continuar</button>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
              <span style={{ fontSize: 14, color: '#6b7280' }}>¿Ya tienes una cuenta? </span>
              <Link to="/login" style={{ fontSize: 14, color: '#2563eb', fontWeight: 600, marginLeft: 4 }}>Inicia sesión</Link>
            </div>
          </div>
        ) : (
          <form style={{ padding: 24 }} onSubmit={handleRegister}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1f2937', marginBottom: 8 }}>Completa tu registro</div>
              <div style={{ fontSize: 16, color: '#6b7280' }}>{userType === 'client' ? 'Crea tu cuenta como Cliente' : 'Crea tu cuenta y solicitud de proveedor'}</div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Nombre completo *</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8, padding: '0 12px' }}>
                <span className="material-icons" style={{ marginRight: 8, color: '#9ca3af' }}>person</span>
                <input type="text" placeholder="Juan Pérez" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} style={{ flex: 1, height: 48, fontSize: 16, border: 'none', outline: 'none', background: 'transparent' }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Teléfono</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8, padding: '0 12px' }}>
                <span className="material-icons" style={{ marginRight: 8, color: '#9ca3af' }}>call</span>
                <input type="text" placeholder="+52 55 1234 5678" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} style={{ flex: 1, height: 48, fontSize: 16, border: 'none', outline: 'none', background: 'transparent' }} />
              </div>
            </div>
            {userType === 'provider' && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Nombre del Negocio/Servicio *</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8, padding: '0 12px' }}>
                    <span className="material-icons" style={{ marginRight: 8, color: '#9ca3af' }}>business</span>
                    <input type="text" placeholder="Ej: Plomería García" value={formData.businessName} onChange={e => handleInputChange('businessName', e.target.value)} style={{ flex: 1, height: 48, fontSize: 16, border: 'none', outline: 'none', background: 'transparent' }} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Descripción de Servicios *</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8, padding: '0 12px' }}>
                    <span className="material-icons" style={{ marginRight: 8, color: '#9ca3af' }}>description</span>
                    <textarea placeholder="Describe detalladamente los servicios que ofreces" value={formData.description} onChange={e => handleInputChange('description', e.target.value)} style={{ flex: 1, minHeight: 80, fontSize: 16, border: 'none', outline: 'none', background: 'transparent', paddingTop: 12, resize: 'vertical' }} />
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Ubicación *</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8, padding: '0 12px' }}>
                    <span className="material-icons" style={{ marginRight: 8, color: '#9ca3af' }}>location_on</span>
                    <input type="text" placeholder="Ej: Ciudad de Guatemala, Zona 10" value={formData.location} onChange={e => handleInputChange('location', e.target.value)} style={{ flex: 1, height: 48, fontSize: 16, border: 'none', outline: 'none', background: 'transparent' }} />
                  </div>
                </div>
              </>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Correo electrónico *</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8, padding: '0 12px' }}>
                <span className="material-icons" style={{ marginRight: 8, color: '#9ca3af' }}>mail</span>
                <input type="email" placeholder="tu@email.com" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} style={{ flex: 1, height: 48, fontSize: 16, border: 'none', outline: 'none', background: 'transparent' }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Contraseña *</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8, padding: '0 12px' }}>
                <span className="material-icons" style={{ marginRight: 8, color: '#9ca3af' }}>lock</span>
                <input type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} style={{ flex: 1, height: 48, fontSize: 16, border: 'none', outline: 'none', background: 'transparent' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <span className="material-icons" style={{ color: '#9ca3af' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 8, display: 'block' }}>Confirmar contraseña *</label>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: 8, padding: '0 12px' }}>
                <span className="material-icons" style={{ marginRight: 8, color: '#9ca3af' }}>lock</span>
                <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Repite tu contraseña" value={formData.confirmPassword} onChange={e => handleInputChange('confirmPassword', e.target.value)} style={{ flex: 1, height: 48, fontSize: 16, border: 'none', outline: 'none', background: 'transparent' }} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <span className="material-icons" style={{ color: '#9ca3af' }}>{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 24 }}>
              <button type="button" onClick={() => setAcceptTerms(!acceptTerms)} style={{ width: 20, height: 20, border: '2px solid #d1d5db', borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginRight: 12, marginTop: 2, background: acceptTerms ? '#2563eb' : '#fff', display: 'flex', cursor: 'pointer' }}>
                {acceptTerms && <span className="material-icons" style={{ color: '#fff', fontSize: 16 }}>check</span>}
              </button>
              <span style={{ fontSize: 14, color: '#6b7280', lineHeight: '20px' }}>
                Acepto los <span style={{ color: '#2563eb', cursor: 'pointer' }}>términos y condiciones</span> y la <span style={{ color: '#2563eb', cursor: 'pointer' }}>política de privacidad</span>
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'row', gap: 12 }}>
              <button type="button" onClick={() => setStep(1)} style={{ flex: 1, border: '1px solid #d1d5db', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24, background: '#fff', color: '#374151', fontSize: 16, fontWeight: 600, cursor: 'pointer' }}>Atrás</button>
              <button type="submit" disabled={loading} style={{ flex: 1, background: '#2563eb', color: '#fff', fontSize: 16, fontWeight: 600, padding: 16, borderRadius: 8, border: 'none', marginTop: 24, opacity: loading ? 0.6 : 1, cursor: 'pointer' }}>{loading ? 'Creando...' : 'Crear cuenta'}</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              <div style={{ padding: '0 16px', fontSize: 14, color: '#6b7280' }}>O regístrate con</div>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
              <button type="button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d1d5db', padding: 12, borderRadius: 8, background: '#fff', color: '#374151', fontSize: 14, cursor: 'pointer' }} disabled>
                <span className="material-icons" style={{ color: '#db4437', marginRight: 8 }}>google</span>Google
              </button>
              <button type="button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #d1d5db', padding: 12, borderRadius: 8, background: '#fff', color: '#374151', fontSize: 14, cursor: 'pointer' }} disabled>
                <span className="material-icons" style={{ color: '#4267b2', marginRight: 8 }}>facebook</span>Facebook
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: 24 }}>
              <span style={{ fontSize: 14, color: '#6b7280' }}>¿Ya tienes una cuenta? </span>
              <Link to="/login" style={{ fontSize: 14, color: '#2563eb', fontWeight: 600, marginLeft: 4 }}>Inicia sesión</Link>
            </div>
          </form>
        )}
      </div>
      <div style={{ marginTop: 32, fontSize: 12, color: '#64748b', textAlign: 'center' }}>© 2026 SkillLink. Todos los derechos reservados.</div>
    </div>
  );
}
