import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import './ProviderDetail.css';

interface Provider {
  id?: string;
  providerId?: number;
  name?: string;
  businessName?: string;
  description?: string;
  businessDescription?: string;
  yearsExperience?: number;
  verified?: boolean;
  isVerified?: boolean;
  email?: string;
  profileImageUrl?: string;
  rating?: number;
  reviewCount?: number;
  serviceRadius?: number;
  user?: {
    userId: number;
    profileImageUrl?: string;
    email: string;
  };
  category?: {
    categoryId: number;
    categoryName: string;
  };
}

interface Service {
  serviceId: number;
  serviceTitle: string;
  serviceDescription: string;
  basePrice: number;
  priceUnit: string;
  isActive: boolean;
  category?: {
    categoryName: string;
  };
}

interface Review {
  reviewId: number;
  rating: number;
  comment: string;
  createdAt: string;
  client?: {
    email: string;
  };
}

export default function ProviderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  console.log('ProviderDetail component mounted with ID:', id);
  
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'services' | 'reviews'>('services');

  useEffect(() => {
    if (id) {
      console.log('Loading provider with ID:', id);
      loadProviderDetails();
    }
  }, [id]);

  const loadProviderDetails = async () => {
    setLoading(true);
    console.log('Fetching provider details for ID:', id);
    
    try {
      // Load provider data
      const providerUrl = `${API_BASE_URL}/api/v1/providers/${id}`;
      console.log('Provider URL:', providerUrl);
      
      const providerRes = await fetch(providerUrl);
      console.log('Provider response status:', providerRes.status);
      
      if (providerRes.ok) {
        const providerData = await providerRes.json();
        console.log('Provider data received:', providerData);
        setProvider(providerData);
        
        // Load services only if provider loaded successfully
        try {
          const servicesUrl = `${API_BASE_URL}/api/v1/providers/${id}/services`;
          console.log('Services URL:', servicesUrl);
          
          const servicesRes = await fetch(servicesUrl);
          console.log('Services response status:', servicesRes.status);
          
          if (servicesRes.ok) {
            const servicesData = await servicesRes.json();
            console.log('Services data received:', servicesData);
            setServices(Array.isArray(servicesData) ? servicesData.filter((s: Service) => s.isActive) : []);
          }
        } catch (servicesError) {
          console.error('Error loading services:', servicesError);
          setServices([]);
        }

        // Load reviews
        try {
          const reviewsUrl = `${API_BASE_URL}/api/v1/providers/${id}/reviews`;
          console.log('Reviews URL:', reviewsUrl);
          
          const reviewsRes = await fetch(reviewsUrl);
          console.log('Reviews response status:', reviewsRes.status);
          
          if (reviewsRes.ok) {
            const reviewsData = await reviewsRes.json();
            console.log('Reviews data received:', reviewsData);
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
          }
        } catch (reviewsError) {
          console.error('Error loading reviews:', reviewsError);
          setReviews([]);
        }
      } else {
        const errorText = await providerRes.text();
        console.error('Error loading provider:', providerRes.status, errorText);
        setProvider(null);
      }
    } catch (error) {
      console.error('Error loading provider details:', error);
      setProvider(null);
    } finally {
      setLoading(false);
    }
  };

  const handleContactProvider = async () => {
    if (!user) {
      alert('Debes iniciar sesión para contactar al proveedor');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/chat/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participant1_user_id: user.userId,
          participant2_user_id: provider?.user?.userId || id, // Use id from URL params if user object not present
        }),
      });

      if (response.ok) {
        const conversation = await response.json();
        navigate(`/chat/${conversation.conversation_id}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      alert('Error al crear la conversación');
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className={star <= rating ? 'star filled' : 'star'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="provider-detail-container">
        <div className="provider-loading">Cargando perfil del proveedor...</div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="provider-detail-container">
        <div className="provider-error">
          <h2>Proveedor no encontrado</h2>
          <button onClick={() => navigate('/search')} className="back-button">
            Volver a búsqueda
          </button>
        </div>
      </div>
    );
  }

  const averageRating = calculateAverageRating();

  return (
    <div className="provider-detail-container">
      <nav className="breadcrumb">
        <Link to="/">Inicio</Link>
        <span>→</span>
        <Link to="/search">Búsqueda</Link>
        <span>→</span>
        <span>{provider.name || provider.businessName || 'Proveedor'}</span>
      </nav>

      {/* Provider Header */}
      <div className="provider-header">
        <div className="provider-avatar">
          {(provider.profileImageUrl || provider.user?.profileImageUrl) ? (
            <img src={provider.profileImageUrl || provider.user?.profileImageUrl} alt={provider.name || provider.businessName || 'Proveedor'} />
          ) : (
            <div className="avatar-placeholder">
              {((provider.name || provider.businessName || 'P').charAt(0).toUpperCase())}
            </div>
          )}
        </div>
        
        <div className="provider-info">
          <div className="provider-title">
            <h1 className="provider-name">
              {provider.name || provider.businessName || 'Proveedor'}
              {(provider.verified || provider.isVerified) && (
                <span className="verified-badge" title="Proveedor verificado">
                  ✓
                </span>
              )}
            </h1>
          </div>
          
          {provider.category && (
            <div className="provider-category">{provider.category.categoryName}</div>
          )}
          
          <div className="provider-stats">
            <div className="stat">
              {renderStars(Number(averageRating))}
              <span className="stat-value">{averageRating}</span>
              <span className="stat-label">({reviews.length} reseñas)</span>
            </div>
            {provider.yearsExperience && (
              <>
                <div className="stat-separator">•</div>
                <div className="stat">
                  <span className="stat-value">{provider.yearsExperience}</span>
                  <span className="stat-label">años de experiencia</span>
                </div>
              </>
            )}
          </div>
          
          <p className="provider-description">
            {provider.description || provider.businessDescription || 'Sin descripción disponible'}
          </p>
          
          <button className="contact-button" onClick={handleContactProvider}>
            💬 Contactar proveedor
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          Servicios ({services.length})
        </button>
        <button
          className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reseñas ({reviews.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'services' && (
          <div className="services-grid">
            {services.length === 0 ? (
              <div className="empty-state">
                <p>No hay servicios disponibles</p>
              </div>
            ) : (
              services.map((service) => (
                <div key={service.serviceId} className="service-card">
                  <h3 className="service-title">{service.serviceTitle}</h3>
                  <p className="service-description">{service.serviceDescription}</p>
                  <div className="service-footer">
                    <div className="service-price">
                      ₡{service.basePrice.toLocaleString()}
                      <span className="price-unit"> / {service.priceUnit}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-list">
            {reviews.length === 0 ? (
              <div className="empty-state">
                <p>No hay reseñas aún</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.reviewId} className="review-card">
                  <div className="review-header">
                    <div className="review-avatar">
                      {review.client?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="review-info">
                      <div className="review-author">{review.client?.email || 'Usuario'}</div>
                      <div className="review-date">{formatDate(review.createdAt)}</div>
                    </div>
                    {renderStars(review.rating)}
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
