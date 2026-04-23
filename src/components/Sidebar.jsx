import React, { useMemo } from 'react';
import {
  CalendarDays,
  FileText,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
  UserCircle2,
  X,
} from 'lucide-react';

export default function Sidebar({ open, onClose, activeTab, onSelectTab, onLogout, theme, onToggleTheme }) {
  const items = useMemo(
    () => [
      { key: 'home', label: 'Home', icon: LayoutDashboard },
      { key: 'assignments', label: 'Assignments', icon: FileText },
      { key: 'calendar', label: 'Calendar', icon: CalendarDays },
    ],
    []
  );

  return (
    <div className={`fixed inset-0 z-30 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <button
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-label="Close sidebar"
        type="button"
      />

      <aside
        className={`absolute left-0 top-0 flex h-[100dvh] w-full flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-gray-950 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 pt-6 pb-3 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-800 p-2 text-white shadow-sm">
              <UserCircle2 size={22} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Student Profile</p>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Profile</p>
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

        <div className="flex min-h-0 flex-1 flex-col px-3 pt-6 pb-[calc(env(safe-area-inset-bottom)+24px)]">
          <p className="px-2 text-[11px] font-extrabold uppercase tracking-wide text-gray-500 dark:text-gray-400">
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

          <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/30">
            <p className="text-xs font-extrabold text-gray-900 dark:text-gray-100">Tip</p>
            <p className="mt-0.5 truncate text-xs font-semibold text-gray-600 dark:text-gray-400">
              Enable reminders for near deadlines.
            </p>
          </div>



          <div className="mt-auto pt-4">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-800 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-900"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
