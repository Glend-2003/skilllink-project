import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../constants/Config';
// import { useAuth } from '../context/AuthContext';

interface Category {
  categoryId: number;
  categoryName: string;
  categoryDescription?: string;
  iconUrl?: string;
  isActive: boolean;
  displayOrder?: number;
  serviceCount?: number;
}

interface Provider {
  id?: string;
  serviceId: number;
  providerId: number;
  serviceTitle: string;
  serviceDescription: string;
  basePrice: string;
  priceType: string;
  isActive: boolean;
  isVerified: boolean;
  category: string | { categoryId: number; categoryName: string };
  provider: {
    providerId: number;
    businessName: string;
    businessDescription: string;
    yearsExperience: number;
    isVerified: boolean;
    user?: { userId: number; profileImageUrl?: string; email: string };
  };
  rating?: number;
  location?: string;
}

const CATEGORY_ICONS: { [key: string]: { icon: string; color: string } } = {
  'Plomería': { icon: '💧', color: '#3B82F6' },
  'Electricidad': { icon: '⚡', color: '#F59E0B' },
  'Carpintería': { icon: '🔨', color: '#8B5CF6' },
  'Limpieza': { icon: '✨', color: '#06B6D4' },
  'Jardinería': { icon: '🌿', color: '#84CC16' },
  'Pintura': { icon: '🎨', color: '#EC4899' },
  'Mecánica': { icon: '🚗', color: '#EF4444' },
  'Tecnología': { icon: '💻', color: '#10B981' },
};

const getIconForCategory = (categoryName: string) => {
  return CATEGORY_ICONS[categoryName] || { icon: '🧰', color: '#6B7280' };
};

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  // const { logout, user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
        const categoriesData = await categoriesResponse.json();
        setCategories(Array.isArray(categoriesData) ? categoriesData.filter((cat: Category) => cat.isActive) : []);

        const servicesResponse = await fetch(`${API_BASE_URL}/api/v1/services`);
        const servicesData = await servicesResponse.json();
        setAllProviders(Array.isArray(servicesData) ? servicesData : []);
        setFilteredProviders(Array.isArray(servicesData) ? servicesData : []);
        if (Array.isArray(servicesData) && servicesData.length > 0) {
          const featured = [...servicesData].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
          setFeaturedServices(featured);
        }
      } catch (e) {
        // Manejo de error
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredProviders(allProviders.filter(p => {
        if (typeof p.category === 'string') return p.category === selectedCategory;
        return p.category.categoryName === selectedCategory;
      }));
    } else {
      setFilteredProviders(allProviders);
    }
  }, [selectedCategory, allProviders]);

  if (loading) return <div>Cargando...</div>;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
      <h2>Servicios destacados</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        {featuredServices.map(service => (
          <div key={service.serviceId} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, minWidth: 180 }}>
            <div style={{ fontWeight: 'bold' }}>{service.serviceTitle}</div>
            <div>{service.serviceDescription}</div>
            <div style={{ color: '#888' }}>{typeof service.category === 'string' ? service.category : service.category.categoryName}</div>
            <div>⭐ {service.rating || 'N/A'}</div>
          </div>
        ))}
      </div>
      <h2>Categorías</h2>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
        {categories.map(cat => {
          const icon = getIconForCategory(cat.categoryName);
          return (
            <button key={cat.categoryId} style={{ background: selectedCategory === cat.categoryName ? icon.color : '#f2f2f2', color: selectedCategory === cat.categoryName ? '#fff' : '#222', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }} onClick={() => setSelectedCategory(cat.categoryName)}>
              <span style={{ marginRight: 8 }}>{icon.icon}</span>{cat.categoryName}
            </button>
          );
        })}
        <button style={{ background: !selectedCategory ? '#2563eb' : '#f2f2f2', color: !selectedCategory ? '#fff' : '#222', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }} onClick={() => setSelectedCategory(null)}>
          Todas
        </button>
      </div>
      <h2>Servicios</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {filteredProviders.map(service => (
          <div key={service.serviceId} style={{ border: '1px solid #eee', borderRadius: 8, padding: 12, minWidth: 180 }}>
            <div style={{ fontWeight: 'bold' }}>{service.serviceTitle}</div>
            <div>{service.serviceDescription}</div>
            <div style={{ color: '#888' }}>{typeof service.category === 'string' ? service.category : service.category.categoryName}</div>
            <div>⭐ {service.rating || 'N/A'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
