import React, { useRef, useState } from 'react';
import { BellRing, Menu, X, AlertTriangle, Clock, Megaphone, Flag, MessageCircle } from 'lucide-react';
import { useNotifications, useOnClickOutside } from '../hooks';
import { useTheme } from '../ThemeContext';

const metaForKind = (kind) => {
  switch (kind) {
    case 'overdue': return { icon: AlertTriangle, cls: 'text-red-600', label: 'Overdue' };
    case 'dueSoon': return { icon: Clock, cls: 'text-orange-500', label: 'Due soon' };
    case 'info': return { icon: Megaphone, cls: 'text-blue-500', label: 'Update' };
    case 'message': return { icon: MessageCircle, cls: 'text-brand', label: 'Message' };
    default: return { icon: Flag, cls: 'text-gray-500', label: 'Alert' };
  }
};

export default function AppHeader({ title, assignments = [], announcements = [], messages = [], onToggleSidebar, isFullWidth }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const colors = useTheme();
  useOnClickOutside(dropdownRef, () => setOpen(false));

  const { items, hasUrgent } = useNotifications(assignments, announcements, messages);
  const shouldPulse = items.length > 0;

  return (
    <header id="app-header" className="fixed top-0 left-0 right-0 z-20 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/70">
      <div className={`mx-auto flex w-full ${isFullWidth ? 'max-w-none' : 'max-w-5xl'} items-center justify-between gap-3 px-4 py-2 md:px-6 h-14`}>
        <button 
          onClick={onToggleSidebar} 
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-900 transition hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-100" 
          aria-label="Toggle menu"
        >
          <Menu size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-center text-sm font-black tracking-tight" style={{ color: colors.main }}>{title}</p>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl transition ${hasUrgent ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100'}`}
          >
            <BellRing size={18} className={shouldPulse ? 'animate-pulse' : ''} />
            {items.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-black text-white bg-orange-500">
                {items.length}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-3 w-[min(360px,85vw)] overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3 dark:border-gray-800">
                <p className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Feed & Alerts</p>
                <button onClick={() => setOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100"><X size={16} /></button>
              </div>

              <div className="max-h-[70vh] overflow-auto p-2 space-y-1.5">
                {items.length ? items.map((n) => {
                  const meta = metaForKind(n.kind);
                  const Icon = meta.icon;
                  return (
                    <div key={n.id} className="rounded-2xl border border-gray-50 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-950 hover:bg-gray-50 transition">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 rounded-lg bg-gray-50 p-2 dark:bg-gray-900 ${meta.cls}`}><Icon size={18} /></div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className="truncate text-[10px] font-black uppercase text-gray-400 tracking-tighter">{meta.label}</p>
                            <span className="text-[9px] font-bold opacity-40">{n.when.fromNow()}</span>
                          </div>
                          <p className="mt-0.5 truncate text-xs font-extrabold text-gray-900 dark:text-gray-100">{n.title}</p>
                          <p className="mt-0.5 text-[10px] font-bold text-gray-500 line-clamp-1">{n.sub}</p>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="py-12 text-center text-xs font-black uppercase opacity-20 tracking-widest">Clean Slate</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
