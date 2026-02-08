import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';

interface ServiceRequest {
  requestId: number;
  requestTitle: string;
  providerId: number;
  service: {
    serviceName: string;
  };
}

export default function ReviewRequest() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRequest();
    // eslint-disable-next-line
  }, []);

  const loadRequest = async () => {
    try {
      const token = user?.token;
      const response = await fetch(
        `${API_BASE_URL}/api/v1/requests/${requestId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setRequest(data);
      } else {
        alert('No se pudo cargar la solicitud');
        navigate(-1);
      }
    } catch (e) {
      alert('Error de red');
      navigate(-1);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          requestId: request?.requestId,
          rating,
          reviewTitle,
          reviewText,
        }),
      });
      if (response.ok) {
        alert('Reseña enviada correctamente.');
        navigate(-1);
      } else {
        alert('Error al enviar la reseña.');
      }
    } catch (e) {
      alert('Error de red.');
    }
    setSubmitting(false);
  };

  if (loading) return <div>Cargando...</div>;
  if (!request) return <div>No se encontró la solicitud.</div>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto', padding: 16 }}>
      <h2>Reseñar Solicitud</h2>
      <div><b>Servicio:</b> {request.service.serviceName}</div>
      <div><b>Título de la solicitud:</b> {request.requestTitle}</div>
      <div style={{ margin: '12px 0' }}>
        <label>Calificación: </label>
        <select value={rating} onChange={e => setRating(Number(e.target.value))} style={{ marginLeft: 8 }}>
          <option value={0}>Selecciona</option>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <input placeholder="Título de la reseña" value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <textarea placeholder="Escribe tu reseña" value={reviewText} onChange={e => setReviewText(e.target.value)} style={{ width: '100%', marginBottom: 8, padding: 8 }} />
      <button type="submit" disabled={submitting} style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', width: '100%' }}>
        {submitting ? 'Enviando...' : 'Enviar reseña'}
      </button>
    </form>
  );
}
