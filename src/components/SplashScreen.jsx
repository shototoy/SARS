import React from 'react';
import { Loader2 } from 'lucide-react';
import AppBackground from './AppBackground';

export default function SplashScreen({ logoUrl, backgroundUrl }) {
  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <AppBackground imageUrl={backgroundUrl} opacity={0.14} />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <img src={logoUrl} alt="SARS" className="h-20 w-20 rounded-3xl shadow-lg" />
        <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2 text-sm font-extrabold text-blue-800 shadow-sm ring-1 ring-gray-200 backdrop-blur dark:bg-gray-950/70 dark:text-blue-200 dark:ring-gray-800">
          <Loader2 size={18} className="animate-spin" />
          Loading
        </div>
      </div>
    </div>
  );
}