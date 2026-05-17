import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, Info, AlertTriangle, CheckCircle, Bell } from 'lucide-react';

const ToastContext = createContext(null);

export function useToasts() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 5000, push = false }) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    if (push && Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const requestPushPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, requestPushPermission }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id} 
            className="pointer-events-auto flex w-80 translate-x-0 animate-in slide-in-from-right overflow-hidden rounded-3xl border border-gray-100 bg-white/80 p-4 shadow-2xl backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/80"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-900 mr-4">
              {toast.type === 'info' && <Bell className="text-blue-500" size={20} />}
              {toast.type === 'warning' && <AlertTriangle className="text-amber-500" size={20} />}
              {toast.type === 'success' && <CheckCircle className="text-emerald-500" size={20} />}
              {toast.type === 'urgent' && <Bell className="text-red-500" size={20} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-gray-900 dark:text-gray-100 truncate">{toast.title}</p>
              <p className="text-xs font-bold text-gray-400 line-clamp-2">{toast.message}</p>
            </div>
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
