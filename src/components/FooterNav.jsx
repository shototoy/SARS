import React from 'react';
import { CalendarDays, FileText, LayoutDashboard } from 'lucide-react';

const ITEMS = [
  { key: 'assignments', label: 'Assignments', icon: FileText, size: 40, iconSize: 26 },
  { key: 'home', label: 'Home', icon: LayoutDashboard, size: 60, iconSize: 28, raised: true },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays, size: 40, iconSize: 26 },
];

export default function FooterNav({ tab, onSelectTab }) {
  return (
    <nav id="app-footer" className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 dark:border-gray-800 dark:bg-gray-950/92">
      <div className="mx-auto w-full max-w-4xl px-4 md:px-6">
        <div className="flex items-end justify-between">
          {ITEMS.map((item) => {
            const active = tab === item.key;
            return (
              <button key={item.key} onClick={() => onSelectTab(item.key)} className={`flex-1 flex flex-col items-center justify-center pb-1 text-[10px] font-extrabold ${item.raised ? '-translate-y-3' : '-translate-y-1'}`}>
                <span className={`inline-flex items-center justify-center rounded-3xl transition ${active ? 'bg-blue-800 text-white shadow-lg' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100'}`} style={{ width: item.size, height: item.size }}>
                  <item.icon size={item.iconSize} />
                </span>
                <span className={`mt-1 ${active ? 'text-blue-800 dark:text-blue-200' : 'text-gray-600 dark:text-gray-400'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-6 h-[calc(env(safe-area-inset-bottom)+20px)]" />
    </nav>
  );
}
