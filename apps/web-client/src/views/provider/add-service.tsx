import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';

interface ServiceCategory {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
}

export default function AddService() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [formData, setFormData] = useState({
    categoryId: 0,
    serviceTitle: '',
    serviceDescription: '',
    basePrice: '',
    priceType: 'fixed' as 'fixed' | 'hourly' | 'negotiable',
    estimatedDurationMinutes: '',
    isActive: true,
  });

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`);
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (e) {}
      setLoading(false);
    };
    loadCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Servicio creado correctamente.');
        setFormData({ categoryId: 0, serviceTitle: '', serviceDescription: '', basePrice: '', priceType: 'fixed', estimatedDurationMinutes: '', isActive: true });
      } else {
        alert('Error al crear el servicio.');
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
      <h2>Agregar Servicio</h2>
      <select name="categoryId" value={formData.categoryId} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }}>
        <option value={0}>Selecciona una categoría</option>
        {categories.map(cat => (
          <option key={cat.categoryId} value={cat.categoryId}>{cat.categoryName}</option>
        ))}
      </select>
      <input name="serviceTitle" placeholder="Título del servicio" value={formData.serviceTitle} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <textarea name="serviceDescription" placeholder="Descripción" value={formData.serviceDescription} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <input name="basePrice" placeholder="Precio base" value={formData.basePrice} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <select name="priceType" value={formData.priceType} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }}>
        <option value="fixed">Fijo</option>
        <option value="hourly">Por hora</option>
        <option value="negotiable">Negociable</option>
      </select>
      <input name="estimatedDurationMinutes" placeholder="Duración estimada (minutos)" value={formData.estimatedDurationMinutes} onChange={handleChange} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <button type="submit" disabled={saving} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', width: '100%' }}>
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
    </form>
  );
}
