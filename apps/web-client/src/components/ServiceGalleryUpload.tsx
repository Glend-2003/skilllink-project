import React from 'react';

export default function ServiceGalleryUpload({ onUpload }: { onUpload: (files: FileList) => void }) {
  return (
    <input type="file" multiple accept="image/*" onChange={e => e.target.files && onUpload(e.target.files)} />
  );
}
