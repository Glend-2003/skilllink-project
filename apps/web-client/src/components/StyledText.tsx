import React from 'react';

export default function StyledText({ children, bold = false, color }: { children: React.ReactNode; bold?: boolean; color?: string }) {
  return (
    <span style={{ fontWeight: bold ? 'bold' : 'normal', color }}>{children}</span>
  );
}
