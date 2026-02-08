import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../constants/Config';

const CATEGORY_COLORS: { [key: string]: { bg: string; text: string; border: string } } = {
  'Plomería': { bg: '#EFF6FF', text: '#3B82F6', border: '#3B82F6' },
  'Electricidad': { bg: '#FEF3C7', text: '#F59E0B', border: '#F59E0B' },
  'Carpintería': { bg: '#F3E8FF', text: '#8B5CF6', border: '#8B5CF6' },
  'Limpieza': { bg: '#CFFAFE', text: '#06B6D4', border: '#06B6D4' },
  'Jardinería': { bg: '#ECFCCB', text: '#84CC16', border: '#84CC16' },
  'Pintura': { bg: '#FCE7F3', text: '#EC4899', border: '#EC4899' },
  'Mecánica': { bg: '#FEE2E2', text: '#EF4444', border: '#EF4444' },
  'Tecnología': { bg: '#D1FAE5', text: '#10B981', border: '#10B981' },
};

const getCategoryColors = (categoryName: string) => {
  return CATEGORY_COLORS[categoryName] || { bg: '#F3F4F6', text: '#6B7280', border: '#9CA3AF' };
};

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories`);
      const data = await res.json();
      setCategories(data);
    } catch {
      setCategories([]);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/services`);
      const data = await res.json();
      setServices(data);
      setFilteredServices(data);
    } catch {
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = services;
    if (searchQuery) {
      filtered = filtered.filter((s: any) =>
        s.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter((s: any) => s.category.categoryId === selectedCategory);
    }
    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, services]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Buscar Servicios</h2>
      <input
        type="text"
        placeholder="Buscar..."
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
        style={{ marginBottom: 16, padding: 8, width: 300 }}
      />
      <div style={{ marginBottom: 16 }}>
        {categories.map((cat) => {
          const colors = getCategoryColors(cat.categoryName);
          return (
            <button
              key={cat.categoryId}
              style={{
                background: selectedCategory === cat.categoryId ? colors.bg : '#fff',
                color: selectedCategory === cat.categoryId ? colors.text : '#333',
                border: `1px solid ${colors.border}`,
                borderRadius: 4,
                marginRight: 8,
                padding: '6px 12px',
                cursor: 'pointer',
              }}
              onClick={() => setSelectedCategory(selectedCategory === cat.categoryId ? null : cat.categoryId)}
            >
              {cat.categoryName}
            </button>
          );
        })}
      </div>
      {loading ? (
        <div>Cargando...</div>
      ) : filteredServices.length === 0 ? (
        <div>No hay servicios.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Título</th>
              <th>Categoría</th>
              <th>Proveedor</th>
              <th>Precio</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.map((service: any) => (
              <tr key={service.serviceId} style={{ borderBottom: '1px solid #eee' }}>
                <td>{service.serviceTitle}</td>
                <td>{service.category.categoryName}</td>
                <td>{service.provider.businessName}</td>
                <td>{service.basePrice}</td>
                <td>
                  <button onClick={() => navigate(`/provider/${service.provider.providerId}`)}>
                    Ver Proveedor
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
