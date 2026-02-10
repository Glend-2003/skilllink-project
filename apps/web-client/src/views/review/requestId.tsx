import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../constants/Config';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { toast } from 'sonner';
import { Star, ArrowLeft } from 'lucide-react';

interface ServiceRequest {
  requestId: number;
  requestTitle: string;
  providerId: number;
  service: {
    serviceName: string;
  };
  provider?: {
    businessName: string;
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
        toast.error('No se pudo cargar la solicitud');
        navigate(-1);
      }
    } catch (e) {
      toast.error('Error de red al cargar la solicitud');
      navigate(-1);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating || rating === 0) {
      toast.error('Por favor selecciona una calificación');
      return;
    }
    
    if (!reviewTitle.trim()) {
      toast.error('Por favor ingresa un título para la reseña');
      return;
    }
    
    if (!reviewText.trim()) {
      toast.error('Por favor escribe una reseña');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        requestId: request?.requestId,
        rating,
        title: reviewTitle,
        comment: reviewText,
      };

      console.log('Enviando reseña:', payload);

      const response = await fetch(`${API_BASE_URL}/api/v1/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status, 'Body:', responseText);

      if (response.ok) {
        toast.success('Reseña enviada correctamente');
        setTimeout(() => navigate(-1), 1500);
      } else {
        console.error('Error al enviar reseña:', responseText);
        toast.error(`Error al enviar la reseña: ${response.status}`);
      }
    } catch (e) {
      console.error('Error de red:', e);
      toast.error('Error de red al enviar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando solicitud...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="border-red-200 bg-red-50 max-w-md">
          <CardContent className="p-6">
            <p className="text-red-900 text-center">No se encontró la solicitud</p>
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline" 
              className="w-full mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        <Button 
          onClick={() => navigate(-1)} 
          variant="ghost" 
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Button>

        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl">Califica el servicio</CardTitle>
          </CardHeader>

          <CardContent className="p-8">
            {/* Información compacta */}
            <div className="mb-8 pb-6 border-b border-slate-200">
              <p className="text-sm text-slate-600 mb-1">Servicio</p>
              <p className="font-semibold text-slate-900">{request.service?.serviceName}</p>
              {request.provider && (
                <p className="text-sm text-slate-600 mt-2">Proveedor: {request.provider.businessName}</p>
              )}
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Calificación - Estrellas simples */}
              <div>
                <Label className="text-base font-semibold text-slate-900 mb-3 block">
                  Calificación
                </Label>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`transition-all duration-200 ${
                        rating >= value
                          ? 'text-yellow-400 scale-110'
                          : 'text-slate-300 hover:text-yellow-300'
                      }`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Título */}
              <div>
                <Label htmlFor="title" className="text-sm font-semibold text-slate-900">
                  Título de la reseña
                </Label>
                <Input
                  id="title"
                  placeholder="Ej: Servicio excelente"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  className="mt-2 h-10"
                  maxLength={100}
                />
              </div>

              {/* Comentario */}
              <div>
                <Label htmlFor="review" className="text-sm font-semibold text-slate-900">
                  Tu comentario
                </Label>
                <Textarea
                  id="review"
                  placeholder="Comparte tu experiencia..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="mt-2 min-h-28 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-slate-500 mt-1">{reviewText.length}/500</p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !rating || !reviewTitle.trim() || !reviewText.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
