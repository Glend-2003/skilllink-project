import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Star } from 'lucide-react';
import { API_BASE_URL } from '../constants/Config';

interface ReviewItemProps {
  review: any;
  index: number;
  formatDate: (date: string) => string;
  renderStars: (rating: number) => React.ReactNode;
}

export default function ReviewItem({ review, index, formatDate, renderStars }: ReviewItemProps) {
  const [reviewerData, setReviewerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewerData = async () => {
      try {
        if (review.reviewerId) {
          console.log('🔄 Fetching reviewer data for ID:', review.reviewerId);
          const response = await fetch(`${API_BASE_URL}/api/v1/users/${review.reviewerId}`);
          
          if (response.ok) {
            const userData = await response.json();
            console.log('✅ Reviewer data fetched:', userData);
            setReviewerData(userData);
          } else {
            console.log('⚠️ Could not fetch reviewer, status:', response.status);
          }
        }
      } catch (e) {
        console.error('❌ Error fetching reviewer:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewerData();
  }, [review.reviewerId]);

  // Get email and image from reviewer data or review object
  const email = reviewerData?.email || (review as any).email || 'Usuario';
  const imageUrl = reviewerData?.profile_image_url || (review as any).profile_image_url || null;
  const initial = email.includes('@') ? email.split('@')[0].charAt(0).toUpperCase() : email.charAt(0).toUpperCase();

  return (
    <div>
      {index > 0 && <Separator className="my-6" />}
      <div className="flex gap-4">
        <Avatar>
          {imageUrl && <AvatarImage src={imageUrl} alt={email} />}
          <AvatarFallback>{initial}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900">{email}</h4>
            <span className="text-sm text-slate-600">{formatDate(review.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {renderStars(review.rating)}
          </div>
          {review.title && (
            <p className="font-medium text-slate-800 mb-1">{review.title}</p>
          )}
          <p className="text-slate-700">{review.comment}</p>
        </div>
      </div>
    </div>
  );
}
