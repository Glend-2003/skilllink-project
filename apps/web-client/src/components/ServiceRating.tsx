import React from 'react';
import { Star } from 'lucide-react';

interface ServiceRatingProps {
  rating?: number;
  className?: string;
}

export default function ServiceRating({ rating = 4.5, className = '' }: ServiceRatingProps) {
  return (
    <div className={`flex items-center gap-1 text-amber-600 ${className}`}>
      <Star className="w-4 h-4 fill-current" />
      <span className="font-medium">{(rating || 4.5).toFixed(1)}</span>
    </div>
  );
}
