import React from 'react';
import { CalendarDays, FileText, LayoutDashboard } from 'lucide-react';

const items = [
  { key: 'assignments', label: 'Assignments', icon: FileText },
  { key: 'home', label: 'Home', icon: LayoutDashboard, raised: true },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
];

export default function FooterNav({ tab, onSelectTab }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/90 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex w-full max-w-4xl items-end justify-between px-4 pb-3 pt-2 md:px-6">
        {items.map((item) => {
          const Icon = item.icon;
          const active = tab === item.key;
          const isRaised = Boolean(item.raised);

          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`group flex flex-1 flex-col items-center justify-center gap-1 text-xs font-extrabold transition ${
                isRaised ? '-translate-y-3' : ''
              }`}
              aria-label={item.label}
            >
              <span
                className={`inline-flex items-center justify-center rounded-2xl shadow-sm transition duration-300 ${
                  isRaised
                    ? active
                      ? 'h-12 w-12 bg-blue-800 text-white'
                      : 'h-12 w-12 bg-white text-blue-800 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-950 dark:text-blue-200 dark:ring-gray-800 dark:hover:bg-gray-900'
                    : active
                      ? 'h-11 w-11 bg-blue-800 text-white'
                      : 'h-11 w-11 bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800'
                } ${!active ? 'group-hover:scale-105' : ''}`}
              >
                <Icon size={20} />
              </span>
              <span className={`${active ? 'text-blue-800 dark:text-blue-200' : 'text-gray-600 dark:text-gray-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

