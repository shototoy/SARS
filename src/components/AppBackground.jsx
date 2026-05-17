import React from 'react';

export default function AppBackground({ imageUrl, opacity = 0.12, blur = 0 }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
      style={{
        backgroundImage: `url(${imageUrl})`,
        opacity,
        filter: `blur(${blur}px)`,
      }}
      aria-hidden="true"
    />
  );
}
