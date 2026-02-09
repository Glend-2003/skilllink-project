import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants/Config';
import ProfileImageUploader from '../components/ProfileImageUploader';
import './profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const { activeRole, isProvider, isAdmin, reloadProviderStatus } = useRole();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setPhoneNumber(data.phoneNumber || '');
        await reloadProviderStatus();
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="profile-loading">
        <div>⏳ Cargando perfil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-error">
        <div>❌ No se pudo cargar el perfil</div>
        <button 
          onClick={logout}
          className="logout-button"
        >
          🚪 Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-content">
        
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <ProfileImageUploader onChange={loadProfile} />
          </div>
          
          <div className="profile-info-section">
            <h1 className="profile-name">
              {profile.name || profile.email?.split('@')[0] || 'Usuario'}
            </h1>
            
            <p className="profile-email">
              <span>📧</span>
              {profile.email}
            </p>
            
            {phoneNumber && (
              <p className="profile-phone">
                <span>📱</span>
                {phoneNumber}
              </p>
            )}
            
            <div className="profile-badge">
              {isAdmin && '👑 Administrador'}
              {isProvider && !isAdmin && '⭐ Proveedor de Servicios'}
              {!isProvider && !isAdmin && '👤 Usuario'}
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="profile-cards-grid">
          
          {/* Become Provider Card */}
          {!isProvider && (
            <div className="profile-card become-provider-card">
              <div className="card-header">
                <h2 className="card-title">
                  <span className="card-icon">🚀</span>
                  ¿Quieres ofrecer tus servicios?
                </h2>
              </div>
              
              <p className="card-description">
                Únete a nuestra red de proveedores profesionales y comienza a recibir solicitudes 
                de clientes que necesitan tus servicios. Gestiona tu negocio desde una sola plataforma.
              </p>
              
              <button 
                onClick={() => navigate('/profile/become-provider')}
                className="action-button become-provider-button"
              >
                <span className="action-button-icon">✨</span>
                Convertirme en Proveedor
              </button>
            </div>
          )}

          {/* Provider Options Card */}
          {isProvider && (
            <div className="profile-card provider-card">
              <div className="card-header">
                <h2 className="card-title">
                  <span className="card-icon">⭐</span>
                  Panel de Proveedor
                </h2>
              </div>
              
              <p className="card-description">
                Administra tus servicios, revisa tus solicitudes y mantén tu perfil profesional actualizado.
              </p>
              
              <div className="action-buttons">
                <button 
                  onClick={() => navigate('/provider/services')}
                  className="action-button provider-button"
                >
                  <span className="action-button-icon">📋</span>
                  Mis Servicios
                </button>
                
                <button 
                  onClick={() => navigate('/provider/edit-profile')}
                  className="action-button provider-button"
                >
                  <span className="action-button-icon">✏️</span>
                  Editar Perfil de Proveedor
                </button>
                
                <button 
                  onClick={() => navigate('/my-requests')}
                  className="action-button provider-button"
                >
                  <span className="action-button-icon">📬</span>
                  Mis Solicitudes
                </button>
              </div>
            </div>
          )}

          {/* Admin Options Card */}
          {isAdmin && (
            <div className="profile-card admin-card">
              <div className="card-header">
                <h2 className="card-title">
                  <span className="card-icon">👑</span>
                  Panel de Administrador
                </h2>
              </div>
              
              <p className="card-description">
                Gestiona la plataforma, aprueba solicitudes de proveedores, servicios y administra las categorías del sistema.
              </p>
              
              <div className="action-buttons">
                <button 
                  onClick={() => navigate('/admin/provider-requests')}
                  className="action-button admin-button"
                >
                  <span className="action-button-icon">📝</span>
                  Solicitudes de Proveedor
                </button>
                
                <button 
                  onClick={() => navigate('/admin/services-approval')}
                  className="action-button admin-button"
                >
                  <span className="action-button-icon">✅</span>
                  Aprobar Servicios
                </button>
                
                <button 
                  onClick={() => navigate('/admin/categories-management')}
                  className="action-button admin-button"
                >
                  <span className="action-button-icon">📂</span>
                  Gestionar Categorías
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Section */}
        <div className="logout-section">
          <div className="logout-info">
            <h3 className="logout-title">Cerrar sesión</h3>
            <p className="logout-description">
              Sal de tu cuenta de forma segura
            </p>
          </div>
          
          <button 
            onClick={logout}
            className="logout-button"
          >
            <span>🚪</span>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
