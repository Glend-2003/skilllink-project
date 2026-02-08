import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';

export default function EditProviderProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    businessDescription: '',
    latitude: '',
    longitude: '',
    yearsExperience: '',
    serviceRadiusKm: '',
    availableForWork: true,
  });

  useEffect(() => {
    const loadProviderProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/v1/provider/profile`, {
          headers: { 'Authorization': `Bearer ${user?.token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setFormData({
            businessName: data.businessName || '',
            businessDescription: data.businessDescription || '',
            latitude: data.latitude ? String(data.latitude) : '',
            longitude: data.longitude ? String(data.longitude) : '',
            yearsExperience: data.yearsExperience ? String(data.yearsExperience) : '',
            serviceRadiusKm: data.serviceRadiusKm ? String(data.serviceRadiusKm) : '',
            availableForWork: data.availableForWork ?? true,
          });
        }
      } catch (e) {}
      setLoading(false);
    };
    loadProviderProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/provider/profile`, {
        method: 'PUT',
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
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto', padding: 16 }}>
      <h2>Editar Perfil de Proveedor</h2>
      <input name="businessName" placeholder="Nombre del negocio" value={formData.businessName} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <textarea name="businessDescription" placeholder="Descripción" value={formData.businessDescription} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="latitude" placeholder="Latitud" value={formData.latitude} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="longitude" placeholder="Longitud" value={formData.longitude} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="yearsExperience" placeholder="Años de experiencia" value={formData.yearsExperience} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="serviceRadiusKm" placeholder="Radio de servicio (km)" value={formData.serviceRadiusKm} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <label style={{ display: 'block', marginBottom: 8 }}>
        <input type="checkbox" name="availableForWork" checked={formData.availableForWork} onChange={handleChange} /> Disponible para trabajar
      </label>
      <button type="submit" disabled={saving} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', width: '100%' }}>
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
