import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_BASE_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import './request-service.css';

interface Service {
  serviceId: number;
  serviceTitle: string;
  basePrice: number;
  categoryId: number;
}

export default function RequestService() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  const providerId = searchParams.get('providerId');
  const providerName = searchParams.get('providerName') || 'Proveedor';

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState<number | null>(null);

  // Form state
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [addressDetails, setAddressDetails] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [preferredTime, setPreferredTime] = useState('09:00');

  // Location state
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) {
      alert('Proveedor no especificado');
      navigate(-1);
      return;
    }
    loadProviderServices();
  }, [providerId]);

  const loadProviderServices = async () => {
    setLoadingServices(true);
    setError(null);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/services/provider/${providerId}`
      );

      if (response.ok) {
        const data = await response.json();
        setServices(data);
        if (data.length > 0) {
          setSelectedService(data[0].serviceId);
        }
      } else {
        setError('No se pudieron cargar los servicios del proveedor');
      }
    } catch (error) {
      console.error('Error loading services:', error);
      setError('Error al cargar servicios');
    } finally {
      setLoadingServices(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        setLatitude(lat);
        setLongitude(lon);

        // Try to get address from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.display_name) {
              setServiceAddress(data.display_name);
            }
          }
        } catch (error) {
          console.error('Error getting address:', error);
          setServiceAddress(`Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`);
        }

        setLoadingLocation(false);
        alert('Ubicación obtenida correctamente');
      },
      (error) => {
        setLoadingLocation(false);
        console.error('Error getting location:', error);
        alert('No se pudo obtener la ubicación. Por favor, ingresa la dirección manualmente.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedService) {
      alert('Selecciona un servicio');
      return;
    }
    if (!requestTitle.trim()) {
      alert('Ingresa un título para la solicitud');
      return;
    }
    if (!requestDescription.trim()) {
      alert('Describe lo que necesitas');
      return;
    }
    if (!serviceAddress.trim()) {
      alert('Ingresa la dirección del servicio');
      return;
    }
    if (!latitude || !longitude) {
      alert('Obtén tu ubicación antes de enviar');
      return;
    }
    if (!preferredDate) {
      alert('Selecciona una fecha preferida');
      return;
    }
    if (!preferredTime) {
      alert('Selecciona una hora preferida');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData = {
        serviceId: selectedService,
        requestTitle: requestTitle.trim(),
        requestDescription: requestDescription.trim(),
        serviceAddress: serviceAddress.trim(),
        addressDetails: addressDetails.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        serviceLatitude: latitude,
        serviceLongitude: longitude,
        preferredDate: preferredDate,
        preferredTime: preferredTime,
      };

      const response = await fetch(`${API_BASE_URL}/api/v1/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        alert(`Solicitud enviada a ${providerName} correctamente`);
        navigate('/my-requests');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'No se pudo enviar la solicitud');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setError('Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const selectedServiceData = services.find((s) => s.serviceId === selectedService);

  return (
    <div className="request-service-container">
      <div className="request-service-content">
        <div className="request-service-header">
          <h1 className="request-service-title">Solicitar Servicio</h1>
          <button onClick={() => navigate(-1)} className="back-button">
            ← Volver
          </button>
        </div>

        <div className="request-form-card">
          <div className="provider-info">
            <p className="provider-label">Solicitud para:</p>
            <h2 className="provider-name">{providerName}</h2>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Service Selection */}
            <div className="form-group">
              <label className="form-label form-label-required">Servicio</label>
              {loadingServices ? (
                <div className="loading-services">
                  <div className="loading-spinner"></div>
                  <p>Cargando servicios...</p>
                </div>
              ) : services.length === 0 ? (
                <p style={{ color: '#6b7280' }}>
                  No hay servicios disponibles para este proveedor
                </p>
              ) : (
                <div className="services-grid">
                  {services.map((service) => (
                    <div
                      key={service.serviceId}
                      className={`service-option ${
                        selectedService === service.serviceId ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedService(service.serviceId)}
                    >
                      <h3 className="service-option-name">{service.serviceTitle}</h3>
                      <p className="service-option-price">
                        ₡{service.basePrice.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Request Title */}
            <div className="form-group">
              <label className="form-label form-label-required">
                Título de la solicitud
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Reparación de fuga de agua"
                value={requestTitle}
                onChange={(e) => setRequestTitle(e.target.value)}
                maxLength={200}
                required
              />
            </div>

            {/* Request Description */}
            <div className="form-group">
              <label className="form-label form-label-required">Descripción</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Describe el trabajo que necesitas..."
                value={requestDescription}
                onChange={(e) => setRequestDescription(e.target.value)}
                required
              />
            </div>

            {/* Service Address */}
            <div className="form-group">
              <label className="form-label form-label-required">
                Dirección del servicio
              </label>
              <div className="address-input-group">
                <textarea
                  className="form-input"
                  placeholder="Ingresa la dirección"
                  value={serviceAddress}
                  onChange={(e) => setServiceAddress(e.target.value)}
                  rows={2}
                  required
                />
                <button
                  type="button"
                  className="location-button"
                  onClick={getCurrentLocation}
                  disabled={loadingLocation}
                >
                  {loadingLocation ? (
                    <>
                      <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                      Obteniendo...
                    </>
                  ) : (
                    <>
                      📍 Obtener ubicación
                    </>
                  )}
                </button>
              </div>
              {latitude && longitude && (
                <p className="location-hint">
                  ✓ Ubicación obtenida correctamente
                </p>
              )}
            </div>

            {/* Address Details */}
            <div className="form-group">
              <label className="form-label">Detalles adicionales (opcional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Ej: Casa azul, segundo piso"
                value={addressDetails}
                onChange={(e) => setAddressDetails(e.target.value)}
              />
            </div>

            {/* Contact Phone */}
            <div className="form-group">
              <label className="form-label">Teléfono de contacto (opcional)</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Ej: +506 1234 5678"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                maxLength={20}
              />
            </div>

            {/* Date and Time */}
            <div className="date-time-grid">
              <div className="form-group">
                <label className="form-label form-label-required">Fecha preferida</label>
                <input
                  type="date"
                  className="form-input"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label form-label-required">Hora preferida</label>
                <input
                  type="time"
                  className="form-input"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Cost Display */}
            {selectedServiceData && (
              <div className="cost-display">
                <h3 className="cost-label">Precio base estimado:</h3>
                <p className="cost-value">
                  ₡{selectedServiceData.basePrice.toLocaleString()}
                </p>
              </div>
            )}

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => navigate(-1)}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={loading || loadingServices}
              >
                {loading ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
