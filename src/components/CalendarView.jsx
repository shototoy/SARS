import React, { useMemo } from 'react';
import dayjs from 'dayjs';

function dotClass(priority) {
  if (priority === 'High') return 'bg-red-600';
  if (priority === 'Medium') return 'bg-orange-500';
  return 'bg-green-500';
}

function groupByDay(assignments) {
  const groups = new Map();
  for (const assignment of assignments) {
    const key = assignment.deadline && dayjs(assignment.deadline).isValid()
      ? dayjs(assignment.deadline).format('YYYY-MM-DD')
      : 'No deadline';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(assignment);
  }
  return [...groups.entries()].sort(([a], [b]) => (a === 'No deadline' ? 1 : b === 'No deadline' ? -1 : a.localeCompare(b)));
}

export default function CalendarView({ assignments }) {
  const grouped = useMemo(() => groupByDay(assignments), [assignments]);

  return (
    <div className="space-y-4">
      {grouped.map(([dayKey, items]) => {
        const label =
          dayKey === 'No deadline' ? 'No deadline' : dayjs(dayKey).format('dddd, MMM D, YYYY');

        return (
          <div
            key={dayKey}
            className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-950"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">{label}</h2>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">{items.length} item(s)</p>
            </div>
            <div className="mt-3 space-y-2">
              {items.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-3 md:flex-row md:items-center md:justify-between dark:border-gray-800 dark:bg-gray-950"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotClass(a.priority)}`} />
                    <p className="truncate text-sm font-extrabold text-gray-900 dark:text-gray-100">{a.title}</p>
                  </div>
                  <p className="text-xs font-semibold text-gray-600">
                    {a.deadline && dayjs(a.deadline).isValid()
                      ? dayjs(a.deadline).format('h:mm A')
                      : '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
