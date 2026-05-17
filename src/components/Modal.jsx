import React from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} rounded-[40px] bg-white dark:bg-gray-950 p-6 shadow-2xl overflow-hidden`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto pr-1 scrollbar-hide">
          {children}
        </div>
      </div>
    </div>
  );
}
