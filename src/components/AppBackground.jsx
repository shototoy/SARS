import React from 'react';

export default function AppBackground({ imageUrl, opacity = 0.12, blur = 0 }) {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 bg-center bg-no-repeat transition-all duration-1000 ease-in-out"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundSize: '100% 100%',
        opacity,
        filter: `blur(${blur}px)`,
      }}
      aria-hidden="true"
    />
  );
}
