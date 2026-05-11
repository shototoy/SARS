import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const toKey = (d) => dayjs(d).format('YYYY-MM-DD');

export default function CalendarView({ assignments }) {
  const [cursor, setCursor] = useState(dayjs().startOf('month'));
  const [selKey, setSelKey] = useState(null);
  const [sheet, setSheet] = useState({ mounted: false, visible: false });

  const byDay = useMemo(() => {
    const map = new Map();
    assignments.forEach(a => {
      if (!a.deadline) return;
      const k = toKey(a.deadline);
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(a);
    });
    return map;
  }, [assignments]);

  const days = useMemo(() => {
    let curr = cursor.startOf('month').startOf('week'), end = cursor.endOf('month').endOf('week'), arr = [];
    while (curr.isBefore(end) || curr.isSame(end, 'day')) { arr.push(curr); curr = curr.add(1, 'day'); }
    return arr;
  }, [cursor]);

  const selDay = selKey ? dayjs(selKey) : dayjs();
  const selTasks = selKey ? byDay.get(selKey) || [] : [];

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

  const getStatus = (day, tasks) => {
    if (!tasks?.length) return { cls: 'bg-white dark:bg-gray-950', ring: 'ring-gray-200 dark:ring-gray-800' };
    if (tasks.every(t => t.status === 'Completed')) return { cls: 'bg-green-50 dark:bg-green-950/20', ring: 'ring-green-200 dark:ring-green-900/40' };
    if (day.isBefore(dayjs(), 'day')) return { cls: 'bg-red-50 dark:bg-red-950/20', ring: 'ring-red-200 dark:ring-red-900/40' };
    if (day.isSame(dayjs(), 'day')) return { cls: 'bg-orange-50 dark:bg-orange-950/20', ring: 'ring-orange-200 dark:ring-orange-900/40' };
    return { cls: 'bg-yellow-50 dark:bg-yellow-950/20', ring: 'ring-yellow-200 dark:ring-yellow-900/40' };
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <button onClick={() => setCursor(c => c.subtract(1, 'month'))} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-900"><ChevronLeft size={18} /></button>
          <div className="text-center"><p className="text-base font-extrabold text-blue-800 dark:text-blue-200">{cursor.format('MMMM YYYY')}</p></div>
          <button onClick={() => setCursor(c => c.add(1, 'month'))} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-900"><ChevronRight size={18} /></button>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map(w => <div key={w} className="text-center text-xs font-extrabold text-gray-500">{w}</div>)}
          {days.map(d => {
            const k = toKey(d), tasks = byDay.get(k), s = getStatus(d, tasks), active = k === selKey;
            return (
              <button key={k} onClick={() => openDay(d)} className={`relative aspect-square flex items-center justify-center rounded-2xl border border-gray-100 transition hover:scale-105 ${s.cls} ${active ? 'ring-2 ring-blue-800' : `ring-1 ${s.ring}`} ${d.isSame(cursor, 'month') ? '' : 'opacity-40'}`}>
                <span className={`text-sm font-extrabold ${active ? 'text-blue-800 dark:text-blue-200' : ''}`}>{d.date()}</span>
                {d.isSame(dayjs(), 'day') && <div className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-800" />}
              </button>
            );
          })}
        </div>
      </div>

      {sheet.mounted && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={closeSheet} />
          <div className={`absolute inset-x-0 bottom-0 h-[55vh] rounded-t-3xl bg-white dark:bg-gray-950 shadow-2xl transition-transform duration-300 ${sheet.visible ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={() => openDay(selDay.subtract(1, 'day'))} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-900"><ChevronLeft size={18} /></button>
              <div className="text-center"><p className="text-sm font-extrabold">{selDay.format('dddd, MMM D')}</p><p className="text-xs opacity-60">{selTasks.length} task(s)</p></div>
              <button onClick={() => openDay(selDay.add(1, 'day'))} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-900"><ChevronRight size={18} /></button>
            </div>
            <div className="overflow-auto px-4 pb-8 space-y-2">
              {selTasks.length ? selTasks.map(t => (
                <div key={t.id} className="p-3 rounded-2xl border border-gray-100 bg-white dark:bg-gray-950 dark:border-gray-800 flex justify-between items-center">
                  <div><p className="text-sm font-extrabold">{t.title}</p><p className="text-xs opacity-60 italic">{dayjs(t.deadline).format('h:mm A')} • {t.subject || 'No subject'}</p></div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-extrabold ${t.status === 'Completed' ? 'bg-green-600 text-white' : 'bg-blue-800 text-white'}`}>{t.status}</span>
                </div>
              )) : <div className="p-8 text-center text-sm opacity-60 italic">No tasks for today</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
