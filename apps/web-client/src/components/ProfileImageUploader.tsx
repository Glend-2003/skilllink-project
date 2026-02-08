import React, { useRef } from 'react';

export default function ProfileImageUploader({ onChange }: { onChange: (file: File) => void }) {
  const fileInput = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInput}
        onChange={e => {
          if (e.target.files && e.target.files[0]) {
            onChange(e.target.files[0]);
          }
        }}
      />
      <button type="button" onClick={() => fileInput.current?.click()}>
        Subir Imagen
      </button>
    </div>
  );
}
