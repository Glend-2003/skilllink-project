import React from 'react';

export default function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb' }}>
      {children}
    </a>
  );
}
