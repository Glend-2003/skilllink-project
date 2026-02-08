import React from 'react';

export default function ServiceGalleryView({ images }: { images: string[] }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {images.map((src, i) => (
        <img key={i} src={src} alt={`gallery-${i}`} style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
      ))}
    </div>
  );
}
