import React, { useMemo } from 'react';
import { MapPin } from 'lucide-react';
import { useUserLocation, calculateDistance } from '../hooks/useUserLocation';

interface ServiceDistanceProps {
  service: any;
  className?: string;
}

export default function ServiceDistance({ service, className = '' }: ServiceDistanceProps) {
  const { userLocation } = useUserLocation();

  const distance = useMemo(() => {
    // Check if provider has location coordinates
    if (
      userLocation &&
      service.provider?.latitude !== undefined &&
      service.provider?.longitude !== undefined
    ) {
      try {
        const dist = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          service.provider.latitude,
          service.provider.longitude
        );
        return `${dist.toFixed(1)} km`;
      } catch (error) {
        console.error('Error calculating distance:', error);
        return service.location || '1.5 km';
      }
    }

    // Fallback to pre-calculated distance or default
    return service.location || '1.5 km';
  }, [userLocation, service]);

  return (
    <div className={`flex items-center gap-1 text-slate-600 ${className}`}>
      <MapPin className="w-4 h-4" />
      <span>{distance}</span>
    </div>
  );
}
