import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';

export default function CompleteProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    bio: '',
    address_line1: '',
    city: '',
    state_province: '',
    country: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Perfil actualizado correctamente.');
      } else {
        alert('Error al actualizar el perfil.');
      }
    } catch (e) {
      alert('Error de red.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto', padding: 16 }}>
      <h2>Completar Perfil</h2>
      <input name="first_name" placeholder="Nombre" value={formData.first_name} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="last_name" placeholder="Apellido" value={formData.last_name} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="date_of_birth" type="date" placeholder="Fecha de nacimiento" value={formData.date_of_birth} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="gender" placeholder="Género" value={formData.gender} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <textarea name="bio" placeholder="Biografía" value={formData.bio} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="address_line1" placeholder="Dirección" value={formData.address_line1} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="city" placeholder="Ciudad" value={formData.city} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="state_province" placeholder="Provincia/Estado" value={formData.state_province} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="country" placeholder="País" value={formData.country} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="latitude" placeholder="Latitud" value={formData.latitude} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="longitude" placeholder="Longitud" value={formData.longitude} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <button type="submit" disabled={loading} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', width: '100%' }}>
        {loading ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
