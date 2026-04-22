import React from 'react';

export default function AppBackground({ imageUrl, opacity = 0.12 }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${imageUrl})`,
        opacity,
      }}
      aria-hidden="true"
    />
  );
}
