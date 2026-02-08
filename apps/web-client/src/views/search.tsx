import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { API_BASE_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import './search.css';

const CATEGORY_COLORS: { [key: string]: { bg: string; text: string; border: string } } = {
  'Plomería': { bg: '#EFF6FF', text: '#3B82F6', border: '#3B82F6' },
  'Electricista': { bg: '#FEF3C7', text: '#F59E0B', border: '#F59E0B' },
  'Electricidad': { bg: '#FEF3C7', text: '#F59E0B', border: '#F59E0B' },
  'Técnico': { bg: '#F3E8FF', text: '#8B5CF6', border: '#8B5CF6' },
  'Carpintería': { bg: '#F3E8FF', text: '#8B5CF6', border: '#8B5CF6' },
  'Barbería': { bg: '#CFFAFE', text: '#06B6D4', border: '#06B6D4' },
  'Limpieza': { bg: '#CFFAFE', text: '#06B6D4', border: '#06B6D4' },
  'Jardinería': { bg: '#ECFCCB', text: '#84CC16', border: '#84CC16' },
  'Pintura': { bg: '#FCE7F3', text: '#EC4899', border: '#EC4899' },
  'Diseño': { bg: '#FCE7F3', text: '#EC4899', border: '#EC4899' },
  'Mecánica': { bg: '#FEE2E2', text: '#EF4444', border: '#EF4444' },
  'Tecnología': { bg: '#D1FAE5', text: '#10B981', border: '#10B981' },
};

const getCategoryColors = (categoryName: string) => {
  return CATEGORY_COLORS[categoryName] || { bg: '#F3F4F6', text: '#6B7280', border: '#9CA3AF' };
};

export default function Search() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [categories, setCategories] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [filteredServices, setFilteredServices] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, []);

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/categories`);
      if (!res.ok) {
        throw new Error(`Error categorías: ${res.status}`);
      }
      const data = await res.json();
      console.log('Categorías cargadas en búsqueda:', data);
      setCategories(Array.isArray(data) ? data.filter((cat: any) => cat.isActive) : []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setCategories([]);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/services`);
      const data = await res.json();
      console.log('Services fetched - first service:', data[0]);
      console.log('First service provider:', data[0]?.provider);
      console.log('First service provider.user:', data[0]?.provider?.user);
      console.log('First service provider.user.userId:', data[0]?.provider?.user?.userId);
      setServices(data);
      setFilteredServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
      setServices([]);
      setFilteredServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = services;
    
    if (searchQuery.trim()) {
      filtered = filtered.filter((s: any) =>
        s.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.serviceDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.provider?.businessName || '').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter((s: any) => {
        const categoryId = typeof s.category === 'object' ? s.category.categoryId : null;
        return categoryId === selectedCategory;
      });
    }
    
    setFilteredServices(filtered);
  }, [searchQuery, selectedCategory, services]);

  const handleClearSearch = () => {
    setSearchQuery('');
    navigate('/search');
  };

  const handleClearFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    navigate('/search');
  };

  const handleViewProvider = (service: any) => {
    console.log('handleViewProvider - service data:', service);
    console.log('provider object:', service.provider);
    console.log('provider.user.userId:', service.provider?.user?.userId);
    
    // Use userId (not providerId) because backend expects user_id
    const userId = service.provider?.user?.userId;
    
    console.log('Final userId to navigate:', userId);
    
    if (userId) {
      navigate(`/provider/${userId}`);
    } else {
      console.error('No user ID found in service.provider.user:', service);
      alert('No se pudo encontrar el ID del proveedor');
    }
  };

  const handleContactProvider = async (e: React.MouseEvent, service: any) => {
    e.stopPropagation();
    
    const providerId = service.provider?.user?.userId;
    
    if (!providerId) {
      console.error('No provider ID found');
      return;
    }

    if (!user) {
      alert('Debes iniciar sesión para contactar al proveedor');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/chat/conversations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            participant1_user_id: user.userId,
            participant2_user_id: providerId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Error al crear conversación');
      }

      const conversation = await response.json();
      navigate(`/chat/${conversation.conversation_id}`);
    } catch (error) {
      console.error('Error contacting provider:', error);
      alert('No se pudo iniciar la conversación');
    }
  };

  return (
    <div className="search-container">
      {/* Header with Search */}
      <div className="search-header">
        <div className="search-header-content">
          <nav style={{ marginBottom: '24px' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '14px' }}>
              ← Volver al inicio
            </Link>
          </nav>
          <h1 className="search-title">Buscar Servicios</h1>
          <p className="search-subtitle">Encuentra el profesional perfecto para tu proyecto</p>
          
          <div className="search-bar-container">
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input-field"
                placeholder="Buscar por servicio, categoría o proveedor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear-button" onClick={handleClearSearch}>
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="search-content">
        {/* Filters */}
        {categories.length > 0 && (
          <div className="filters-section">
            <div className="filters-header">
              <h2 className="filters-title">Filtrar por categoría</h2>
              {(selectedCategory || searchQuery) && (
                <button className="clear-filters-button" onClick={handleClearFilters}>
                  Limpiar filtros
                </button>
              )}
            </div>
            <div className="categories-filter">
              {categories.map((cat) => {
                const colors = getCategoryColors(cat.categoryName);
                const isSelected = selectedCategory === cat.categoryId;
                return (
                  <button
                    key={cat.categoryId}
                    className={`category-chip ${isSelected ? 'selected' : ''}`}
                    style={{
                      background: isSelected ? colors.bg : 'white',
                      color: isSelected ? colors.text : '#333',
                      borderColor: colors.border,
                    }}
                    onClick={() => setSelectedCategory(isSelected ? null : cat.categoryId)}
                  >
                    {cat.categoryName}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="results-section">
          <div className="results-header">
            <h2 className="results-title">
              {selectedCategory 
                ? categories.find(c => c.categoryId === selectedCategory)?.categoryName || 'Resultados'
                : searchQuery 
                ? `Resultados para "${searchQuery}"`
                : 'Todos los servicios'}
            </h2>
            <div className="results-count">
              {filteredServices.length} servicio{filteredServices.length !== 1 ? 's' : ''} encontrado{filteredServices.length !== 1 ? 's' : ''}
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h2 className="empty-title">No se encontraron servicios</h2>
              <p className="empty-text">
                {searchQuery 
                  ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
                  : 'No hay servicios disponibles en esta categoría'}
              </p>
            </div>
          ) : (
            <div className="services-grid">
              {filteredServices.map((service: any) => {
                const categoryName = typeof service.category === 'string' 
                  ? service.category 
                  : service.category?.categoryName || 'Sin categoría';
                const colors = getCategoryColors(categoryName);
                
                return (
                  <div
                    key={service.serviceId}
                    className="service-card"
                    onClick={() => handleViewProvider(service)}
                  >
                    <div className="service-image-wrapper">
                      {service.provider?.user?.profileImageUrl ? (
                        <img 
                          src={service.provider.user.profileImageUrl} 
                          alt={service.serviceTitle}
                          className="service-image"
                        />
                      ) : (
                        <div className="service-image-placeholder">
                          👤
                        </div>
                      )}
                      
                      {service.isVerified && (
                        <div className="service-verified-badge">
                          <span>✓</span> Verificado
                        </div>
                      )}
                      
                      <div 
                        className="service-category-badge"
                        style={{ 
                          backgroundColor: colors.bg,
                          color: colors.text,
                        }}
                      >
                        {categoryName}
                      </div>
                    </div>

                    <div className="service-content">
                      <div className="service-header">
                        <h3 className="service-title">{service.serviceTitle}</h3>
                        
                        <div className="service-provider">
                          <span>👔</span>
                          <span>{service.provider?.businessName || 'Proveedor'}</span>
                        </div>

                        <div className="service-rating-row">
                          <div className="service-rating">
                            <span>⭐</span>
                            <span>{(service.rating || 4.5).toFixed(1)}</span>
                          </div>
                          <span style={{ color: '#d1d5db' }}>•</span>
                          <div className="service-location">
                            <span>📍</span>
                            <span>{service.location || '1.5 km'}</span>
                          </div>
                        </div>
                      </div>

                      <p className="service-description">
                        {service.serviceDescription}
                      </p>

                      <div className="service-footer">
                        <div className="service-price">
                          ${service.basePrice}
                          <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal', marginLeft: '4px' }}>
                            /{service.priceType || 'hora'}
                          </span>
                        </div>
                        <button 
                          className="service-view-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProvider(service);
                          }}
                        >
                          Ver perfil →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
