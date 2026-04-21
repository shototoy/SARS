import React, { useMemo } from 'react';
import {
  BarChart3,
  CalendarDays,
  FileText,
  LayoutDashboard,
  UserCircle2,
  X,
} from 'lucide-react';

export default function Sidebar({ open, onClose, activeTab, onSelectTab }) {
  const items = useMemo(
    () => [
      { key: 'home', label: 'Home', icon: LayoutDashboard },
      { key: 'assignments', label: 'Assignments', icon: FileText },
      { key: 'calendar', label: 'Calendar', icon: CalendarDays },
      { key: 'insights', label: 'Insights', icon: BarChart3 },
    ],
    []
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30">
      <button
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close sidebar"
      />

      <aside className="absolute left-0 top-0 h-full w-[min(340px,85vw)] overflow-auto bg-white shadow-2xl dark:bg-gray-950">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-800 p-2 text-white shadow-sm">
              <UserCircle2 size={22} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Student Profile</p>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Tap to customize later</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3 py-4">
          <p className="px-2 text-xs font-extrabold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Navigation
          </p>
          <div className="mt-2 space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => {
                    onSelectTab(item.key);
                    onClose();
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-extrabold transition ${
                    active
                      ? 'bg-blue-800 text-white shadow-sm'
                      : 'bg-transparent text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/30">
            <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Quick tip</p>
            <p className="mt-1 text-xs font-semibold text-gray-600 dark:text-gray-400">
              Use reminders for assignments with near deadlines.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
