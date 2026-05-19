import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Flag, Bell, X } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { announcementImgUrl } from '../lib/db';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const toKey = (d) => dayjs(d).format('YYYY-MM-DD');

export default function CalendarView({ assignments = [], announcements = [] }) {
  const [cursor, setCursor] = useState(dayjs().startOf('month'));
  const [selKey, setSelKey] = useState(null);
  const [sheet, setSheet] = useState({ mounted: false, visible: false });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const colors = useTheme();

  const events = useMemo(() => {
    const map = new Map();
    assignments.forEach(a => {
      if (!a.deadline) return;
      const k = toKey(a.deadline);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push({ ...a, type: 'assignment' });
    });
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
            <div className="max-h-[40vh] overflow-y-auto space-y-3 pb-8 scrollbar-hide">
              {selTasks.map((t, i) => (
                <div
                  key={i}
                  onClick={() => {
                    if (t.type === 'event') {
                      setSelectedEvent(t);
                    }
                  }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 dark:bg-gray-900/50 dark:border-gray-800 ${t.type === 'event' ? 'cursor-pointer hover:bg-gray-100/50 transition-colors' : ''}`}
                >
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

      {selectedEvent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedEvent(null)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl dark:bg-gray-950">
            <div className="relative w-full bg-gray-100 ann-modal-hero" style={{ height: 224 }}>
              <img
                src={announcementImgUrl(selectedEvent.title)}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  const hero = e.target.closest('.ann-modal-hero');
                  if (hero) {
                    hero.style.height = '0';
                    hero.style.overflow = 'hidden';
                    const fallback = hero.parentElement.querySelector('.ann-modal-fallback-title');
                    if (fallback) fallback.style.display = 'block';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-6 left-8 right-8">
                <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md mb-2 inline-block">
                  Event
                </span>
                <h2 className="text-2xl font-black text-white leading-tight">{selectedEvent.title}</h2>
              </div>
            </div>
            <div className="p-8">
              <div className="ann-modal-fallback-title hidden mb-4">
                <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white mb-2 inline-block" style={{ backgroundColor: colors.main }}>
                  Event
                </span>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black leading-tight">{selectedEvent.title}</h2>
                  <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 ml-4"><X size={20} /></button>
                </div>
              </div>
              <div className="mb-6 flex items-center gap-6 border-b border-gray-50 pb-6 dark:border-gray-900">
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-[11px] font-bold">{dayjs(selectedEvent.date).format('MMMM D, YYYY')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span className="text-[11px] font-bold">{dayjs(selectedEvent.date).format('h:mm A')}</span>
                </div>
              </div>
              <div className="max-h-[30vh] overflow-auto pr-2 scrollbar-hide">
                <p className="text-sm font-bold leading-relaxed text-gray-600 dark:text-gray-400">{selectedEvent.content}</p>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="rounded-2xl px-8 py-3 text-xs font-black uppercase tracking-widest text-white transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: colors.main }}
                >Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
