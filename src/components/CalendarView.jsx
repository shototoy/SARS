import React, { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDayKey(date) {
  return dayjs(date).format('YYYY-MM-DD');
}

function assignmentsByDay(assignments) {
  const map = new Map();
  for (const a of assignments) {
    if (!a.deadline) continue;
    const d = dayjs(a.deadline);
    if (!d.isValid()) continue;
    const key = d.format('YYYY-MM-DD');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(a);
  }
  return map;
}

function dayStatus(day, dayAssignments) {
  if (!dayAssignments?.length) return { key: 'none', label: 'No tasks', cls: 'bg-white dark:bg-gray-950' };

  const now = dayjs();
  const isPast = day.isBefore(now, 'day');
  const allCompleted = dayAssignments.every((a) => a.status === 'Completed');
  if (allCompleted) return { key: 'completed', label: 'Completed', cls: 'bg-green-50 dark:bg-green-950/20' };
  if (isPast) return { key: 'overdue', label: 'Overdue', cls: 'bg-red-50 dark:bg-red-950/20' };
  if (day.isSame(now, 'day')) return { key: 'due', label: 'Due today', cls: 'bg-orange-50 dark:bg-orange-950/20' };
  return { key: 'pending', label: 'Pending', cls: 'bg-yellow-50 dark:bg-yellow-950/20' };
}

function tooltipForDay(day, dayAssignments) {
  if (!dayAssignments?.length) return `${day.format('MMM D, YYYY')}: No tasks`;
  const total = dayAssignments.length;
  const completed = dayAssignments.filter((a) => a.status === 'Completed').length;
  const pending = total - completed;
  return `${day.format('MMM D, YYYY')}: ${total} task(s) • ${completed} completed • ${pending} pending`;
}

function monthGrid(cursor) {
  const start = cursor.startOf('month').startOf('week');
  const end = cursor.endOf('month').endOf('week');
  const days = [];
  let current = start;
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    days.push(current);
    current = current.add(1, 'day');
  }
  return days;
}

export default function CalendarView({ assignments }) {
  const [cursor, setCursor] = useState(dayjs().startOf('month'));
  const [selectedKey, setSelectedKey] = useState(null);
  const [sheetMounted, setSheetMounted] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  const byDay = useMemo(() => assignmentsByDay(assignments), [assignments]);
  const days = useMemo(() => monthGrid(cursor), [cursor]);
  const selectedDay = useMemo(() => (selectedKey ? dayjs(selectedKey) : dayjs()), [selectedKey]);
  const selectedAssignments = useMemo(() => (selectedKey ? byDay.get(selectedKey) || [] : []), [byDay, selectedKey]);

  function selectDay(nextDay) {
    const nextKey = toDayKey(nextDay);
    const firstOpen = !sheetMounted;
    setSelectedKey(nextKey);
    if (firstOpen) {
      setSheetMounted(true);
      setSheetVisible(false);
      window.requestAnimationFrame(() => setSheetVisible(true));
    } else {
      setSheetVisible(true);
    }
    if (!nextDay.isSame(cursor, 'month')) setCursor(nextDay.startOf('month'));
  }

  function closeSheet() {
    setSheetVisible(false);
    window.setTimeout(() => {
      setSheetMounted(false);
      setSelectedKey(null);
    }, 260);
  }

  return (
    <div className="min-h-[calc(100vh-192px)] space-y-4">
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCursor((c) => c.subtract(1, 'month'))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="text-center">
            <p className="text-base font-extrabold tracking-tight text-blue-800 dark:text-blue-200">
              {cursor.format('MMMM YYYY')}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Tap a day for details</p>
          </div>

          <button
            type="button"
            onClick={() => setCursor((c) => c.add(1, 'month'))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map((w) => (
            <div key={w} className="text-center text-xs font-extrabold text-gray-500 dark:text-gray-400">
              {w}
            </div>
          ))}
          {days.map((day) => {
            const key = toDayKey(day);
            const dayAssignments = byDay.get(key) || [];
            const meta = dayStatus(day, dayAssignments);
            const inMonth = day.isSame(cursor, 'month');
            const selected = key === selectedKey;
            const today = day.isSame(dayjs(), 'day');

            const accentRing =
              meta.key === 'completed'
                ? 'ring-green-200 dark:ring-green-900/40'
                : meta.key === 'overdue'
                  ? 'ring-red-200 dark:ring-red-900/40'
                  : meta.key === 'due'
                    ? 'ring-orange-200 dark:ring-orange-900/40'
                    : meta.key === 'pending'
                      ? 'ring-yellow-200 dark:ring-yellow-900/40'
                      : 'ring-gray-200 dark:ring-gray-800';

            return (
              <button
                key={key}
                type="button"
                onClick={() => selectDay(day)}
                title={tooltipForDay(day, dayAssignments)}
                className={`relative flex aspect-square w-full items-center justify-center rounded-2xl border border-gray-100 p-1.5 shadow-sm transition hover:scale-[1.02] hover:shadow-md dark:border-gray-800 ${
                  meta.cls
                } ${selected ? `ring-2 ring-blue-800 ${accentRing}` : `ring-1 ${accentRing}`} ${
                  inMonth ? '' : 'opacity-45'
                }`}
              >
                <span
                  className={`text-sm font-extrabold leading-none ${
                    selected ? 'text-blue-800 dark:text-blue-200' : 'text-gray-900 dark:text-gray-100'
                  }`}
                >
                  {day.date()}
                </span>
                {today ? (
                  <span
                    className="pointer-events-none absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-800"
                    aria-label="Today"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {sheetMounted ? (
        <div className="fixed inset-0 z-40">
          <button
            className="absolute inset-0 bg-black/40"
            onClick={closeSheet}
            aria-label="Close day details"
            type="button"
          />
          <div
            className={`absolute inset-x-0 bottom-0 h-[55vh] max-h-[55vh] rounded-t-3xl border border-gray-100 bg-white shadow-2xl ${
              'transition-transform duration-300 ease-out'
            } dark:border-gray-800 dark:bg-gray-950 ${
              sheetVisible ? 'translate-y-0' : 'translate-y-full'
            }`}
          >
            <div className="mx-auto mt-2 h-1.5 w-12 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              <button
                type="button"
                onClick={() => selectDay(selectedDay.subtract(1, 'day'))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                aria-label="Previous day"
              >
                <ChevronLeft size={18} />
              </button>

              <div className="min-w-0 flex-1 text-center">
                <p className="truncate text-sm font-extrabold text-gray-900 dark:text-gray-100">
                  {selectedDay.format('dddd, MMM D, YYYY')}
                </p>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  {selectedAssignments.length ? `${selectedAssignments.length} task(s)` : 'No tasks'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => selectDay(selectedDay.add(1, 'day'))}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                aria-label="Next day"
              >
                <ChevronRight size={18} />
              </button>

              <button
                type="button"
                onClick={closeSheet}
                className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="h-[calc(55vh-64px-10px)] overflow-auto px-4 pb-[calc(env(safe-area-inset-bottom)+16px)]">
              {selectedKey && selectedAssignments.length ? (
                <div className="space-y-2 pb-4">
                  {selectedAssignments.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-950"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="min-w-0 truncate text-sm font-extrabold text-gray-900 dark:text-gray-100">
                          {a.title}
                        </p>
                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold ${
                            a.status === 'Completed' ? 'bg-green-600 text-white' : 'bg-blue-800 text-white'
                          }`}
                        >
                          {a.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs font-semibold italic text-gray-600 dark:text-gray-400">
                        {a.deadline ? dayjs(a.deadline).format('h:mm A') : '—'}
                        {a.subject ? ` • ${a.subject}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              ) : selectedKey ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                  No assignments due on this day.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
