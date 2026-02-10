import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import './ServiceRequestModal.css';

interface Service {
  serviceId: number;
  serviceTitle: string;
  basePrice: number;
  categoryId: number;
}

interface ServiceRequestModalProps {
  visible: boolean;
  onClose: () => void;
  providerId: number;
  providerName: string;
  onSuccess?: () => void;
}

export default function ServiceRequestModal({
  visible,
  onClose,
  providerId,
  providerName,
  onSuccess,
}: ServiceRequestModalProps) {
  const { user } = useAuth();

  // Services state
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
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

  useEffect(() => {
    if (visible && providerId) {
      loadProviderServices();
    }
  }, [visible, providerId]);

  const loadProviderServices = async () => {
    setLoadingServices(true);

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
        alert('No se pudieron cargar los servicios del proveedor');
      }
    } catch (error) {
      console.error('Error loading services:', error);
      alert('Error al cargar servicios');
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
        alert('No se pudo obtener la ubicación');
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

    setLoading(true);

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
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        alert(`Solicitud enviada a ${providerName}`);
        resetForm();
        onClose();
        onSuccess?.();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'No se pudo enviar la solicitud');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Error al enviar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRequestTitle('');
    setRequestDescription('');
    setServiceAddress('');
    setAddressDetails('');
    setContactPhone('');
    setPreferredDate(new Date().toISOString().split('T')[0]);
    setPreferredTime('09:00');
    setLatitude(null);
    setLongitude(null);
    setSelectedService(services.length > 0 ? services[0].serviceId : null);
  };

  const selectedServiceData = services.find((s) => s.serviceId === selectedService);

  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Solicitar Servicio</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <p className="provider-text">
            Solicitud para: <span className="provider-name">{providerName}</span>
          </p>

          <form onSubmit={handleSubmit}>
            {/* Service Selection */}
            <div className="form-group">
              <label className="form-label">Servicio *</label>
              {loadingServices ? (
                <div className="loading-services">
                  <div className="loading-spinner"></div>
                  <p>Cargando servicios...</p>
                </div>
              ) : (
                <div className="services-grid">
                  {services.map((service) => (
                    <div
                      key={service.serviceId}
                      className={`service-card ${
                        selectedService === service.serviceId ? 'selected' : ''
                      }`}
                      onClick={() => setSelectedService(service.serviceId)}
                    >
                      <span className="service-name">{service.serviceTitle}</span>
                      <span className="service-price">
                        ₡{service.basePrice.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Request Title */}
            <div className="form-group">
              <label className="form-label">Título de la solicitud *</label>
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
              <label className="form-label">Descripción *</label>
              <textarea
                className="form-input form-textarea"
                placeholder="Describe el trabajo que necesitas..."
                value={requestDescription}
                onChange={(e) => setRequestDescription(e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Service Address */}
            <div className="form-group">
              <label className="form-label">Dirección del servicio *</label>
              <div className="address-input-group">
                <textarea
                  className="form-input address-input"
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
                    <div className="loading-spinner-small"></div>
                  ) : (
                    '📍'
                  )}
                </button>
              </div>
              {latitude && longitude && (
                <p className="location-hint">✓ Ubicación obtenida</p>
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
                <label className="form-label">Fecha preferida *</label>
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
                <label className="form-label">Hora preferida *</label>
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
                <span className="cost-label">Precio base estimado:</span>
                <span className="cost-value">
                  ₡{selectedServiceData.basePrice.toLocaleString()}
                </span>
              </div>
            )}

            {/* Form Actions */}
            <div className="modal-footer">
              <button
                type="button"
                className="modal-button secondary"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="modal-button primary"
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
