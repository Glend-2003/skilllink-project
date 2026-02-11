import { useState, useEffect } from 'react';
import { Config } from '../constants/Config';

interface ServiceImageBgProps {
  serviceId: number;
  className?: string;
  fallbackBg?: string;
}

export default function ServiceImageBg({ 
  serviceId, 
  className = "w-full h-full object-cover",
  fallbackBg = "w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center"
}: ServiceImageBgProps) {
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
    return <img src={imageUrl} alt="Servicio" className={className} />;
  }

  return (
    <div className={fallbackBg}>
      <span className="text-6xl">👤</span>
    </div>
  );
}
