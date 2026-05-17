import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Flag, Bell } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const toKey = (d) => dayjs(d).format('YYYY-MM-DD');

export default function CalendarView({ assignments = [], announcements = [] }) {
  const [cursor, setCursor] = useState(dayjs().startOf('month'));
  const [selKey, setSelKey] = useState(null);
  const [sheet, setSheet] = useState({ mounted: false, visible: false });
  const colors = useTheme();

  const events = useMemo(() => {
    const map = new Map();
    // Assignments
    assignments.forEach(a => {
      if (!a.deadline) return;
      const k = toKey(a.deadline);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push({ ...a, type: 'assignment' });
    });
    // Events from announcements
    announcements.filter(a => a.type === 'Event').forEach(a => {
      const k = toKey(a.date);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push({ ...a, type: 'event' });
    });
    return map;
  }, [assignments, announcements]);

  const days = useMemo(() => {
    let curr = cursor.startOf('month').startOf('week'), end = cursor.endOf('month').endOf('week'), arr = [];
    while (curr.isBefore(end) || curr.isSame(end, 'day')) { arr.push(curr); curr = curr.add(1, 'day'); }
    return arr;
  }, [cursor]);

  const selDay = selKey ? dayjs(selKey) : dayjs();
  const selTasks = selKey ? events.get(selKey) || [] : [];

  const openDay = (d) => {
    setSelKey(toKey(d));
    setSheet({ mounted: true, visible: false });
    setTimeout(() => setSheet(s => ({ ...s, visible: true })), 10);
    if (!d.isSame(cursor, 'month')) setCursor(d.startOf('month'));
  };

  const closeSheet = () => {
    setSheet(s => ({ ...s, visible: false }));
    setTimeout(() => { setSheet({ mounted: false, visible: false }); setSelKey(null); }, 300);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="rounded-3xl border border-gray-100 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCursor(c => c.subtract(1, 'month'))} className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 transition hover:bg-gray-100"><ChevronLeft size={20} /></button>
          <div className="text-center"><p className="text-lg font-black tracking-tight" style={{ color: colors.main }}>{cursor.format('MMMM YYYY')}</p></div>
          <button onClick={() => setCursor(c => c.add(1, 'month'))} className="p-2 rounded-xl bg-gray-50 dark:bg-gray-900 transition hover:bg-gray-100"><ChevronRight size={20} /></button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {WEEKDAYS.map(w => <div key={w} className="text-center text-[10px] font-black uppercase text-gray-400 tracking-widest">{w}</div>)}
          {days.map(d => {
            const k = toKey(d), dayEvents = events.get(k), active = k === selKey;
            const hasAssignment = dayEvents?.some(e => e.type === 'assignment');
            const hasEvent = dayEvents?.some(e => e.type === 'event');
            
            return (
              <button 
                key={k} 
                onClick={() => openDay(d)} 
                className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-200 ${active ? 'ring-2' : ''} ${d.isSame(cursor, 'month') ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 shadow-sm' : 'opacity-30'}`}
                style={{ ringColor: active ? colors.main : undefined }}
              >
                <span className={`text-sm font-extrabold ${active ? 'text-brand' : ''}`}>{d.date()}</span>
                <div className="flex gap-0.5 mt-1">
                  {hasAssignment && <div className="h-1 w-1 rounded-full bg-orange-500" />}
                  {hasEvent && <div className="h-1 w-1 rounded-full bg-blue-500" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {sheet.mounted && (
        <div className="fixed inset-0 z-50 flex items-end justify-center px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeSheet} />
          <div className={`relative w-full max-w-lg rounded-t-[40px] bg-white dark:bg-gray-950 p-6 shadow-2xl transition-transform duration-300 ${sheet.visible ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="mx-auto mb-6 h-1.5 w-16 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xl font-black">{selDay.format('dddd, MMM D')}</p>
                <p className="text-sm font-bold opacity-60">{selTasks.length} Agenda Items</p>
              </div>
              <CalIcon size={24} style={{ color: colors.main }} />
            </div>
            <div className="max-h-[50vh] overflow-auto space-y-3 pb-4">
              {selTasks.map((t, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 dark:bg-gray-900/50 dark:border-gray-800">
                  <div className={`p-2 rounded-xl ${t.type === 'assignment' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                    {t.type === 'assignment' ? <Flag size={20} /> : <Bell size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-extrabold">{t.title}</p>
                    <p className="text-xs font-semibold opacity-60 italic">{t.type === 'assignment' ? (t.subject || 'Academic Task') : 'Campus Event'}</p>
                  </div>
                  {t.status === 'Completed' && <span className="text-[10px] font-black uppercase text-green-600">Done</span>}
                </div>
              ))}
              {!selTasks.length && <div className="py-12 text-center text-sm font-bold opacity-40 italic">Nothing scheduled for this day</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
