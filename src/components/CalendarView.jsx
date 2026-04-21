import React, { useMemo } from 'react';
import dayjs from 'dayjs';

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
          <div key={dayKey} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-gray-900">{label}</h2>
              <p className="text-xs font-semibold text-gray-600">{items.length} item(s)</p>
            </div>
            <div className="mt-3 space-y-2">
              {items.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-col gap-1 rounded-xl border border-gray-100 p-3 md:flex-row md:items-center md:justify-between"
                >
                  <p className="text-sm font-semibold text-gray-900">{a.title}</p>
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

