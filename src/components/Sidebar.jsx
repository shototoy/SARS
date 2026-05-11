import React from 'react';
import { CalendarDays, FileText, LayoutDashboard, LogOut, Moon, Sun, UserCircle2, X } from 'lucide-react';

const ITEMS = [
  { key: 'home', label: 'Home', icon: LayoutDashboard },
  { key: 'assignments', label: 'Assignments', icon: FileText },
  { key: 'calendar', label: 'Calendar', icon: CalendarDays },
];

export default function Sidebar({ open, onClose, activeTab, onSelectTab, onLogout, theme, onToggleTheme }) {
  return (
    <div className={`fixed inset-0 z-30 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside className={`absolute left-0 top-0 flex h-[100dvh] w-full flex-col bg-white shadow-2xl transition-transform duration-300 dark:bg-gray-950 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-gray-100 px-4 pt-6 pb-3 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-blue-800 p-2 text-white"><UserCircle2 size={22} /></div>
            <div><p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Student Profile</p><p className="text-xs font-semibold opacity-60">Profile</p></div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-900"><X size={18} /></button>
        </div>
        <div className="flex-1 flex flex-col p-4">
          <p className="px-2 text-[10px] font-extrabold uppercase opacity-60">Navigation</p>
          <div className="mt-2 space-y-1">
            {ITEMS.map((item) => (
              <button key={item.key} onClick={() => { onSelectTab(item.key); onClose(); }} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-extrabold transition ${activeTab === item.key ? 'bg-blue-800 text-white shadow-sm' : 'hover:bg-gray-100 dark:hover:bg-gray-900'}`}>
                <item.icon size={18} />{item.label}
              </button>
            ))}
          </div>
          <div className="mt-4 p-4 rounded-2xl border border-gray-100 bg-gray-50 dark:bg-gray-900/30 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-extrabold">Theme</p><p className="text-xs opacity-60">{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p></div>
              <button onClick={onToggleTheme} className="p-2 rounded-xl bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 shadow-sm transition active:scale-95">{theme === 'dark' ? <Moon size={18} className="text-blue-400" /> : <Sun size={18} className="text-orange-500" />}</button>
            </div>
          </div>
          <div className="mt-auto">
            <button onClick={onLogout} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-800 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-900"><LogOut size={18} />Logout</button>
          </div>
        </div>
      </aside>
    </div>
  );
}
