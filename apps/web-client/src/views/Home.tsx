import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import { useRole } from '../context/RoleContext';
import RoleSwitcher from '../components/RoleSwitcher';
import './Home.css';

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
  'Plomería': { icon: '🔧', color: '#3B82F6' },
  'Electricista': { icon: '⚡', color: '#F59E0B' },
  'Electricidad': { icon: '⚡', color: '#F59E0B' },
  'Técnico': { icon: '🔌', color: '#8B5CF6' },
  'Carpintería': { icon: '🔨', color: '#8B5CF6' },
  'Barbería': { icon: '✂️', color: '#06B6D4' },
  'Limpieza': { icon: '✨', color: '#06B6D4' },
  'Mecánica': { icon: '🚗', color: '#EF4444' },
  'Jardinería': { icon: '🌿', color: '#84CC16' },
  'Pintura': { icon: '🎨', color: '#EC4899' },
  'Diseño': { icon: '🎨', color: '#EC4899' },
  'Tecnología': { icon: '💻', color: '#10B981' },
};

const getIconForCategory = (categoryName: string) => {
  return CATEGORY_ICONS[categoryName] || { icon: '🧰', color: '#6B7280' };
};

export default function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeRole, isProvider } = useRole();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [allProviders, setAllProviders] = useState<Provider[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // Intentar múltiples endpoints para categorías
        let categoriesData = [];
        try {
          console.log('Intentando cargar categorías desde:', `${API_BASE_URL}/categories`);
          const categoriesResponse = await fetch(`${API_BASE_URL}/categories`);
          if (categoriesResponse.ok) {
            categoriesData = await categoriesResponse.json();
            console.log('Categorías cargadas exitosamente:', categoriesData);
          } else {
            console.warn('Error en /categories:', categoriesResponse.status);
            // Intentar endpoint alternativo
            const altResponse = await fetch(`${API_BASE_URL}/api/v1/categories`);
            if (altResponse.ok) {
              categoriesData = await altResponse.json();
              console.log('Categorías cargadas desde endpoint alternativo:', categoriesData);
            }
          }
        } catch (err) {
          console.error('Error al cargar categorías:', err);
        }
        
        setCategories(Array.isArray(categoriesData) ? categoriesData.filter((cat: Category) => cat.isActive) : []);

        const servicesResponse = await fetch(`${API_BASE_URL}/api/v1/services`);
        const servicesData = await servicesResponse.json();
        setAllProviders(Array.isArray(servicesData) ? servicesData : []);
        setFilteredProviders(Array.isArray(servicesData) ? servicesData : []);
        if (Array.isArray(servicesData) && servicesData.length > 0) {
          const featured = [...servicesData]
            .filter(s => s.isVerified)
            .sort((a, b) => (b.rating || 0) - (a.rating || 0))
            .slice(0, 4);
          setFeaturedServices(featured);
        }
      } catch (e) {
        console.error('Error loading data:', e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = allProviders;

    if (selectedCategory) {
      filtered = filtered.filter(p => {
        if (typeof p.category === 'string') return p.category === selectedCategory;
        return p.category.categoryName === selectedCategory;
      });
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.serviceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.serviceDescription.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProviders(filtered);
  }, [selectedCategory, allProviders, searchQuery]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  const handleViewProvider = (service: Provider) => {
    console.log('Home - handleViewProvider - service data:', service);
    console.log('Home - provider.user.userId:', service.provider?.user?.userId);
    
    // Use userId (not providerId) because backend expects user_id
    const userId = service.provider?.user?.userId;
    
    console.log('Home - Final userId to navigate:', userId);
    
    if (userId) {
      navigate(`/provider/${userId}`);
    } else {
      console.error('Home - No user ID found in service.provider.user:', service);
    }
  };

  const handleContactProvider = async (e: React.MouseEvent, service: Provider) => {
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <header className="hero-header">
            <nav className="hero-nav">
              <Link to="/" className="logo">
                <span>🔗</span> SkillLink
              </Link>
              <div className="nav-links">
                <Link to="/" className="nav-link active">
                  <span>🏠</span> Inicio
                </Link>
                <Link to="/search" className="nav-link">
                  <span>🔍</span> Buscar
                </Link>
                <Link to="/chat" className="nav-link">
                  <span>💬</span> Mensajes
                </Link>
                <Link to="/my-requests" className="nav-link">
                  <span>📋</span> Historial
                </Link>
              </div>
            </nav>
            <div className="hero-right">
              <RoleSwitcher />
              <div className="user-avatar" onClick={() => navigate('/profile')}>
                {user ? (
                  <span style={{ fontSize: '18px' }}>👤</span>
                ) : (
                  <span>👤</span>
                )}
              </div>
            </div>
          </header>

          <div className="hero-main">
            <h1 className="hero-title">
              {activeRole === 'provider' ? (
                <>Gestiona tus servicios<br />y solicitudes</>
              ) : (
                <>Encuentra el profesional<br />que necesitas</>
              )}
            </h1>
            <p className="hero-subtitle">
              {activeRole === 'provider' 
                ? 'Panel de control para proveedores de servicios'
                : 'Conecta con expertos locales verificados cerca de ti'
              }
            </p>
            
            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="¿Qué servicio necesitas?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-button" onClick={handleSearch}>
                <span>🔍</span> Buscar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="content-section">
        {activeRole === 'provider' ? (
          /* Provider View */
          <div className="provider-dashboard">
            <h2 className="section-title">Panel de Proveedor</h2>
            <div className="dashboard-grid">
              <div className="dashboard-card" onClick={() => navigate('/provider/services')}>
                <div className="dashboard-card-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>📋</div>
                <h3>Mis Servicios</h3>
                <p>Gestiona los servicios que ofreces</p>
              </div>
              <div className="dashboard-card" onClick={() => navigate('/my-requests')}>
                <div className="dashboard-card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>📬</div>
                <h3>Solicitudes</h3>
                <p>Revisa solicitudes de clientes</p>
              </div>
              <div className="dashboard-card" onClick={() => navigate('/provider/edit-profile')}>
                <div className="dashboard-card-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' }}>✏️</div>
                <h3>Editar Perfil</h3>
                <p>Actualiza tu información</p>
              </div>
              <div className="dashboard-card" onClick={() => navigate('/chat')}>
                <div className="dashboard-card-icon" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)' }}>💬</div>
                <h3>Mensajes</h3>
                <p>Chat con tus clientes</p>
              </div>
            </div>
          </div>
        ) : (
          /* Client View */
          <>
        {/* Categories */}
        <div className="categories-section">
          <h2 className="section-title">Categorías populares</h2>
          <div className="categories-grid">
            {categories.slice(0, 6).map(category => {
              const iconConfig = getIconForCategory(category.categoryName);
              return (
                <div
                  key={category.categoryId}
                  className={`category-card ${selectedCategory === category.categoryName ? 'selected' : ''}`}
                  onClick={() => handleCategoryClick(category.categoryName)}
                >
                  <div className="category-icon" style={{ backgroundColor: iconConfig.color + '20' }}>
                    <span style={{ color: iconConfig.color }}>{iconConfig.icon}</span>
                  </div>
                  <p className="category-name">{category.categoryName}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Featured Providers */}
        {!selectedCategory && featuredServices.length > 0 && (
          <div className="providers-section">
            <div className="section-header">
              <h2 className="section-title">Proveedores destacados</h2>
              <Link to="/search" className="view-all-link">
                Ver todos →
              </Link>
            </div>
            <div className="providers-grid">
              {featuredServices.map(service => {
                const categoryName = typeof service.category === 'string' 
                  ? service.category 
                  : service.category?.categoryName || 'Sin categoría';
                
                return (
                  <div
                    key={service.serviceId}
                    className="provider-card"
                    onClick={() => handleViewProvider(service)}
                  >
                    <div className="provider-image">
                      {service.provider?.user?.profileImageUrl ? (
                        <img src={service.provider.user.profileImageUrl} alt={service.serviceTitle} />
                      ) : (
                        <div style={{ 
                          width: '100%', 
                          height: '100%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          fontSize: '48px'
                        }}>
                          👤
                        </div>
                      )}
                      {service.isVerified && (
                        <div className="verified-badge">
                          <span>✓</span> Verificado
                        </div>
                      )}
                    </div>
                    <div className="provider-content">
                      <div className="provider-header">
                        <div className="provider-info">
                          <h3>{service.serviceTitle}</h3>
                          <p className="provider-category">{categoryName}</p>
                          <div className="provider-rating">
                            <span className="rating-star">⭐</span>
                            <strong>{(service.rating || 4.5).toFixed(1)}</strong>
                            <span className="provider-distance">
                              <span>📍</span>
                              {service.location || '1.5 km'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="provider-description">{service.serviceDescription}</p>
                      <div className="provider-footer">
                        <div className="provider-price">${service.basePrice}</div>
                        <button 
                          className="contact-button"
                          onClick={(e) => handleContactProvider(e, service)}
                        >
                          💬 Contactar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Services */}
        {selectedCategory && (
          <div className="providers-section">
            <div className="section-header">
              <h2 className="section-title">{selectedCategory}</h2>
              <button 
                className="view-all-link" 
                onClick={() => setSelectedCategory(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Ver todas las categorías
              </button>
            </div>
            {filteredProviders.length > 0 ? (
              <div className="providers-grid">
                {filteredProviders.map(service => {
                  const categoryName = typeof service.category === 'string' 
                    ? service.category 
                    : service.category?.categoryName || 'Sin categoría';
                  
                  return (
                    <div
                      key={service.serviceId}
                      className="provider-card"
                      onClick={() => handleViewProvider(service)}
                    >
                      <div className="provider-image">
                        {service.provider?.user?.profileImageUrl ? (
                          <img src={service.provider.user.profileImageUrl} alt={service.serviceTitle} />
                        ) : (
                          <div style={{ 
                            width: '100%', 
                            height: '100%', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            fontSize: '48px'
                          }}>
                            👤
                          </div>
                        )}
                        {service.isVerified && (
                          <div className="verified-badge">
                            <span>✓</span> Verificado
                          </div>
                        )}
                      </div>
                      <div className="provider-content">
                        <div className="provider-header">
                          <div className="provider-info">
                            <h3>{service.serviceTitle}</h3>
                            <p className="provider-category">{categoryName}</p>
                            <div className="provider-rating">
                              <span className="rating-star">⭐</span>
                              <strong>{(service.rating || 4.5).toFixed(1)}</strong>
                              <span className="provider-distance">
                                <span>📍</span>
                                {service.location || '1.5 km'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="provider-description">{service.serviceDescription}</p>
                        <div className="provider-footer">
                          <div className="provider-price">${service.basePrice}</div>
                          <button 
                            className="contact-button"
                            onClick={(e) => handleContactProvider(e, service)}
                          >
                            💬 Contactar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3 className="empty-state-title">No se encontraron servicios</h3>
                <p className="empty-state-text">Intenta con otra categoría</p>
              </div>
            )}
          </div>
        )}
          </>
        )}
      </section>
    </div>
  );
}
