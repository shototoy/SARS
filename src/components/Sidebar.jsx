import React from 'react';
import { CalendarDays, FileText, LayoutDashboard, LogOut, FolderDown, UserCircle2, Menu, Users, CheckCircle2, BookOpen, MessageSquare } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { profileImgUrl } from '../lib/db';

export default function Sidebar({ open, onToggle, activeTab, onSelectTab, onLogout, user, onEditProfile }) {
  const colors = useTheme();

  const role = user?.role?.toLowerCase();
  const ITEMS = [
    { key: 'home', label: role === 'admin' ? 'Agenda' : 'Home', icon: role === 'admin' ? CalendarDays : LayoutDashboard },
  ];

  if (role === 'faculty') {
    ITEMS.push({ key: 'courses', label: 'My Courses', icon: BookOpen });
  }

  if (role !== 'admin') {
    ITEMS.push({ key: 'reminders', label: 'Reminders', icon: CheckCircle2 });
    ITEMS.push({ key: 'calendar', label: 'Schedule', icon: CalendarDays });
  }
  
  ITEMS.push({ key: 'documents', label: 'Documents', icon: FolderDown });

  if (role === 'admin') {
    ITEMS.push({ key: 'users', label: 'Users', icon: Users });
  }

  return (
    <aside 
      className={`fixed left-0 top-0 z-40 flex h-[100dvh] w-[64px] flex-col bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800 shadow-2xl transition-transform duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex h-16 items-center justify-center border-b border-gray-100 dark:border-gray-800">
        <button 
          onClick={onToggle} 
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition active:scale-95 text-gray-500"
        >
          <Menu size={22} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center p-2 pt-6 gap-4 overflow-hidden">
        {ITEMS.map((item) => (
          <button 
            key={item.key} 
            onClick={() => onSelectTab(item.key)} 
            className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-200 ${
              activeTab === item.key ? 'text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900'
            }`}
            style={{ backgroundColor: activeTab === item.key ? colors.main : 'transparent' }}
            title={item.label}
          >
            <item.icon size={22} />
          </button>
        ))}
      </div>

      <div className="mt-auto pb-6 flex flex-col items-center gap-4">
        <button 
          onClick={onEditProfile}
          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ backgroundColor: `${colors.main}15` }}
          title={`Profile (${user?.role})`}
        >
          {user?.username ? (
            <img src={profileImgUrl(user.username)} className="h-full w-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'block'); }} />
          ) : null}
          <UserCircle2 size={24} style={{ color: colors.main, display: user?.username ? 'none' : 'block' }} />
        </button>

        <button 
          onClick={onLogout} 
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200"
          title="Logout"
        >
          <LogOut size={22} />
        </button>
      </div>
    </aside>
  );
}
