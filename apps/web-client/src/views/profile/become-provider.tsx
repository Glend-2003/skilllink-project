import React, { useState } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';

export default function BecomeProvider() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    description: '',
    services: '',
    location: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.businessName.trim()) {
      alert('Por favor ingresa el nombre de tu negocio o servicio');
      return;
    }
    if (!formData.description.trim()) {
      alert('Por favor describe tus servicios');
      return;
    }
    if (!formData.location.trim()) {
      alert('Por favor indica tu ubicación');
      return;
    }
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE_URL}/api/v1/provider-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          description: formData.description,
          services: formData.services || formData.description,
          location: formData.location,
        }),
      });
      if (response.ok) {
        alert('Solicitud enviada correctamente.');
        setFormData({ businessName: '', description: '', services: '', location: '' });
      } else {
        alert('Error al enviar la solicitud.');
      }
    } catch (e) {
      alert('Error de red.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto', padding: 16 }}>
      <h2>Convertirse en Proveedor</h2>
      <input name="businessName" placeholder="Nombre del negocio" value={formData.businessName} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <textarea name="description" placeholder="Descripción" value={formData.description} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="services" placeholder="Servicios ofrecidos" value={formData.services} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="location" placeholder="Ubicación" value={formData.location} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <button type="submit" disabled={isSubmitting} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', width: '100%' }}>
        {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
      </button>
    </form>
  );
}
