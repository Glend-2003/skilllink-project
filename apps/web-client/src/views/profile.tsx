import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants/Config';
import RoleSwitcher from '../components/RoleSwitcher';
import ProfileImageUploader from '../components/ProfileImageUploader';

export default function Profile() {
  const { user, logout } = useAuth();
  const { activeRole, isProvider, reloadProviderStatus } = useRole();
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

  if (isLoading) return <div>Cargando perfil...</div>;
  if (!profile) return <div>No se pudo cargar el perfil.</div>;

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: '0 auto' }}>
      <h2>Mi Perfil</h2>
      <ProfileImageUploader onChange={() => {}} />
      <div style={{ margin: '16px 0' }}>
        <strong>Email:</strong> {profile.email}
      </div>
      <div style={{ margin: '16px 0' }}>
        <strong>Teléfono:</strong> {phoneNumber}
      </div>
      <div style={{ margin: '16px 0' }}>
        <RoleSwitcher
          roles={['user', 'provider', 'admin']}
          value={activeRole || 'user'}
          onChange={() => {}}
        />
      </div>
      <div style={{ margin: '16px 0' }}>
        <button onClick={logout}>Cerrar sesión</button>
      </div>
      {isProvider && (
        <div style={{ margin: '16px 0' }}>
          <button onClick={() => navigate('/provider/services')}>Mis Servicios</button>
        </div>
      )}
    </div>
  );
}
