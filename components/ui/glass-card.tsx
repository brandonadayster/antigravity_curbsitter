import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverGlowOnly?: boolean;
  imageBacked?: boolean;
}

export const GlassCard = ({ children, className = "", hoverGlowOnly = false, imageBacked = false }: GlassCardProps) => {
  const cardClass = imageBacked 
    ? 'glass-card-image-backed' 
    : (hoverGlowOnly ? 'glass-card-hover-glow' : 'glass-card');

  return (
    <div className={`${cardClass} rounded-2xl premium-hover-card ${className}`}>
      {children}
    </div>
  );
};
