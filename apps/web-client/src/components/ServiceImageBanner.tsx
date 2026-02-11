import { useState, useEffect } from 'react';
import { Config } from '../constants/Config';

interface ServiceImageBannerProps {
  serviceId: number;
  serviceName: string;
  className?: string;
}

export default function ServiceImageBanner({
  serviceId,
  serviceName,
  className = "w-full h-48 bg-gradient-to-r from-slate-200 to-slate-300"
}: ServiceImageBannerProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadFirstImage = async () => {
      try {
        const response = await fetch(
          `${Config.API_GATEWAY_URL}/api/v1/gallery/service/${serviceId}`
        );

        if (response.ok) {
          const images = await response.json();
          if (Array.isArray(images) && images.length > 0) {
            setImageUrl(images[0].imageUrl);
          }
        }
      } catch (error) {
        console.error('Error loading service image:', error);
      }
    };

    loadFirstImage();
  }, [serviceId]);

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={serviceName}
        className={`${className} object-cover`}
      />
    );
  }

  // Placeholder if no image found
  return (
    <div className={`${className} flex items-center justify-center bg-gradient-to-r from-slate-200 to-slate-300`}>
      <div className="text-center">
        <div className="text-4xl mb-2">📸</div>
        <p className="text-sm text-slate-500">Sin imagen disponible</p>
      </div>
    </div>
  );
}
