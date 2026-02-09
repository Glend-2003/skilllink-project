import React, { useState } from 'react';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './become-provider.css';

export default function BecomeProvider() {
  const { user } = useAuth();
  const navigate = useNavigate();
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
    
    // Validaciones
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
        alert('Tu solicitud para convertirte en proveedor ha sido enviada. Nuestro equipo la revisará y te notificaremos pronto.');
        navigate('/profile');
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'No se pudo enviar la solicitud');
      }
    } catch (error) {
      console.error('Error submitting provider request:', error);
      alert('No se pudo enviar la solicitud. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="become-provider-container">
      <div className="become-provider-header">
        <button onClick={() => navigate('/profile')} className="back-button">
          ← Volver
        </button>
        <h1>Convertirme en Proveedor</h1>
      </div>

      <div className="become-provider-content">
        <div className="info-card">
          <h2>¿Por qué ser proveedor?</h2>
          <p>
            Como proveedor podrás ofrecer tus servicios profesionales, recibir solicitudes de clientes y 
            gestionar tu propio negocio a través de nuestra plataforma.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="provider-form">
          <h3>Información Requerida</h3>

          <div className="form-field">
            <label>
              <span className="icon">💼</span>
              Nombre del Negocio/Servicio *
            </label>
            <input
              type="text"
              name="businessName"
              placeholder="Ej: Plomería García"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>
              <span className="icon">📝</span>
              Descripción de Servicios *
            </label>
            <textarea
              name="description"
              placeholder="Describe detalladamente los servicios que ofreces. Ej: Plomería residencial y comercial, reparación de tuberías, instalación de baños, etc."
              value={formData.description}
              onChange={handleChange}
              rows={6}
              required
            />
          </div>

          <div className="form-field">
            <label>
              <span className="icon">🔧</span>
              Servicios Específicos (Opcional)
            </label>
            <input
              type="text"
              name="services"
              placeholder="Ej: Reparación de fugas, Instalación de tuberías, Mantenimiento"
              value={formData.services}
              onChange={handleChange}
            />
          </div>

          <div className="form-field">
            <label>
              <span className="icon">📍</span>
              Ubicación *
            </label>
            <input
              type="text"
              name="location"
              placeholder="Ej: Ciudad de Guatemala, Zona 10"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="note-card">
            <p>
              * Campos requeridos. Tu solicitud será revisada por nuestro equipo y te notificaremos cuando 
              sea aprobada. Una vez aprobado, podrás completar tu perfil con más detalles.
            </p>
          </div>

          <button 
            type="submit" 
            className={`submit-button ${isSubmitting ? 'disabled' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </form>
      </div>
    </div>
  );
}
