import { useState, useEffect, useMemo } from 'react';
import { Star } from 'lucide-react';
import { API_BASE_URL } from '../constants/Config';

interface ServiceRatingFromReviewsProps {
  providerId?: number;
  className?: string;
}

export default function ServiceRatingFromReviews({ providerId, className = '' }: ServiceRatingFromReviewsProps) {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    if (!providerId) {
      setReviews([]);
      return;
    }

    const loadReviews = async () => {
      try {
        const reviewsEndpoints = [
          `${API_BASE_URL}/api/v1/reviews`,
          `${API_BASE_URL}/api/v1/reviews/provider/${providerId}`,
          `${API_BASE_URL}/api/v1/providers/${providerId}/reviews`,
        ];

        let reviewsData = null;
        for (const url of reviewsEndpoints) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              const data = await res.json();
              if (url.includes('/api/v1/reviews') && !url.includes('provider') && !url.includes('providers')) {
                // Filter all reviews by providerId
                reviewsData = Array.isArray(data)
                  ? data.filter((r: any) => r.providerId === providerId || r.provider?.providerId === providerId)
                  : [];
              } else {
                reviewsData = data;
              }
              console.log('Reviews loaded for provider', providerId, ':', reviewsData);
              break;
            }
          } catch (e) {
            // Silently continue to next endpoint
          }
        }

        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } catch (e) {
        console.error('Error loading reviews:', e);
        setReviews([]);
      }
    };

    loadReviews();
  }, [providerId]);

  const averageRating = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return 4.5; // Default if no reviews
    }

    const validReviews = reviews.filter((r: any) => r.rating !== undefined && r.rating !== null);
    if (validReviews.length === 0) {
      return 4.5;
    }

    const sum = validReviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 0), 0);
    return sum / validReviews.length;
  }, [reviews]);

  return (
    <div className={`flex items-center gap-1 text-amber-600 ${className}`}>
      <Star className="w-4 h-4 fill-current" />
      <span className="font-medium">{averageRating.toFixed(1)}</span>
      {reviews.length > 0 && (
        <span className="text-xs text-slate-500 ml-1">({reviews.length})</span>
      )}
    </div>
  );
}
