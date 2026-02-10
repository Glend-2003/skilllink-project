import React from 'react';

export default function Themed({ children }: { children: React.ReactNode }) {
  // Puedes expandir esto para soportar dark/light mode
  return <div>{children}</div>;
}
