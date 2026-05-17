import React, { useMemo } from 'react';
import { CalendarDays, FileText, LayoutDashboard } from 'lucide-react';

const items = [
  { key: 'assignments', label: 'Assignments', icon: FileText },
  { key: 'home', label: 'Home', icon: LayoutDashboard, raised: true },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
];

export default function FooterNav({ tab, onSelectTab }) {
  const cfgByKey = useMemo(
    () => ({
      assignments: { size: 40, iconSize: 26 },
      home: { size: 60, iconSize: 28 },
      calendar: { size: 40, iconSize: 26 },
    }),
    []
  );

  return (
    <nav
      id="app-footer"
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-gray-200 bg-white/95 dark:border-gray-800 dark:bg-gray-950/92"
    >
      <div className="mx-auto w-full max-w-4xl px-4 pt-0 md:px-6">
        <div className="relative flex items-end justify-between pb-0">
          {items.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            const isRaised = Boolean(item.raised);
            const cfg = cfgByKey[item.key] || { size: 44, iconSize: 22 };
            const circleSize = cfg.size;
            const iconSize = cfg.iconSize;
            const minorLiftClass = isRaised ? '' : '-translate-y-1';

            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`relative z-10 flex flex-1 flex-col items-center justify-center gap-0.5 pb-0.5 text-[11px] leading-none font-extrabold ${
                  isRaised ? '-translate-y-3' : ''
                }`}
                aria-label={item.label}
              >
                <span
                  className={`inline-flex items-center justify-center rounded-[30px] transition-colors duration-300 ${
                    active
                      ? 'bg-blue-800 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-800 shadow-sm hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800'
                  } ${minorLiftClass}`}
                  style={{ width: circleSize, height: circleSize }}
                >
                  <Icon size={iconSize} />
                </span>
                <span
                  className={`${active ? 'text-blue-800 dark:text-blue-200' : 'text-gray-600 dark:text-gray-400'} ${minorLiftClass}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="pb-5 pb-[calc(env(safe-area-inset-bottom)+20px)]" />
    </nav>
  );
}