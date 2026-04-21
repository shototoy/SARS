import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { AlertTriangle, CalendarClock, CheckCircle2, ListChecks } from 'lucide-react';

function isOverdue(assignment) {
  if (!assignment?.deadline) return false;
  const deadline = dayjs(assignment.deadline);
  return deadline.isValid() && deadline.isBefore(dayjs()) && assignment.status !== 'Completed';
}

function isDueSoon(assignment, hours = 24) {
  if (!assignment?.deadline) return false;
  const deadline = dayjs(assignment.deadline);
  if (!deadline.isValid()) return false;
  const diffHours = deadline.diff(dayjs(), 'hour', true);
  return diffHours > 0 && diffHours <= hours && assignment.status !== 'Completed';
}

function getProgressCounts(assignments) {
  const now = dayjs();
  const total = assignments.length;
  let completed = 0;
  let overdue = 0;
  let due = 0;
  let pending = 0;

  for (const a of assignments) {
    const isCompleted = a.status === 'Completed';
    if (isCompleted) {
      completed += 1;
      continue;
    }

    const deadline = a.deadline ? dayjs(a.deadline) : null;
    const hasValidDeadline = Boolean(deadline && deadline.isValid());

    if (hasValidDeadline && deadline.isBefore(now)) {
      overdue += 1;
      continue;
    }

    if (hasValidDeadline && deadline.isAfter(now) && deadline.diff(now, 'hour', true) <= 24) {
      due += 1;
      continue;
    }

    pending += 1;
  }

  return { total, completed, pending, due, overdue };
}

function ProgressBar({ assignments, onGoAssignments }) {
  const counts = useMemo(() => getProgressCounts(assignments), [assignments]);

  const segments = useMemo(() => {
    if (counts.total === 0) {
      return [{ key: 'allGood', label: 'All set', count: 1, cls: 'bg-green-500', title: 'No tasks' }];
    }

    return [
      { key: 'completed', label: 'Completed', count: counts.completed, cls: 'bg-green-500' },
      { key: 'pending', label: 'Pending', count: counts.pending, cls: 'bg-yellow-400' },
      { key: 'due', label: 'Due', count: counts.due, cls: 'bg-orange-500' },
      { key: 'overdue', label: 'Overdue', count: counts.overdue, cls: 'bg-red-600' },
    ].filter((s) => s.count > 0);
  }, [counts.completed, counts.due, counts.overdue, counts.pending, counts.total]);

  const boundaries = useMemo(() => {
    if (counts.total === 0) return [];
    const result = [];
    let sum = 0;
    for (let i = 0; i < segments.length - 1; i += 1) {
      sum += segments[i].count;
      const pct = (sum / counts.total) * 100;
      if (pct > 0 && pct < 100) result.push(pct);
    }
    return result;
  }, [counts.total, segments]);

  return (
    <div className="relative">
      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex h-full w-full">
          {segments.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={onGoAssignments}
              className={`${s.cls} h-full flex-[1_1_0] outline-none transition hover:brightness-95 focus-visible:ring-2 focus-visible:ring-blue-800`}
              style={{ flexGrow: s.count }}
              title={
                s.title ||
                `${s.count} ${s.label.toLowerCase()}${s.count === 1 ? '' : ''} / ${counts.total} total`
              }
              aria-label={`${s.count} ${s.label}`}
            />
          ))}
        </div>
      </div>

      {boundaries.map((left) => (
        <div
          key={left}
          className="pointer-events-none absolute top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-white/80 dark:bg-black/40"
          style={{ left: `${left}%` }}
        />
      ))}
    </div>
  );
}

export default function Dashboard({ assignments, onGoAssignments }) {
  const stats = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter((a) => a.status === 'Completed').length;
    const pending = assignments.filter((a) => a.status !== 'Completed').length;
    const overdue = assignments.filter(isOverdue).length;
    const dueSoon = assignments.filter((a) => isDueSoon(a, 24)).length;

    const upcoming = assignments
      .filter((a) => a.deadline && dayjs(a.deadline).isValid() && dayjs(a.deadline).isAfter(dayjs()))
      .slice(0, 5);

    return { total, completed, pending, overdue, dueSoon, upcoming };
  }, [assignments]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-950">
        <p className="text-sm font-extrabold tracking-tight text-blue-800 dark:text-blue-200">Your dashboard</p>
        <div className="mt-4">
          <ProgressBar assignments={assignments} onGoAssignments={onGoAssignments} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        <div
          className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-2 py-2 shadow-lg dark:border-gray-800 dark:bg-gray-950"
          aria-label={`Total assignments: ${stats.total}`}
        >
          <span className="rounded-xl bg-blue-50 p-2 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
            <ListChecks size={16} />
          </span>
          <span className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{stats.total}</span>
        </div>

        <div
          className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-2 py-2 shadow-lg dark:border-gray-800 dark:bg-gray-950"
          aria-label={`Completed assignments: ${stats.completed}`}
        >
          <span className="rounded-xl bg-green-50 p-2 text-green-700 dark:bg-green-950/30 dark:text-green-200">
            <CheckCircle2 size={16} />
          </span>
          <span className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{stats.completed}</span>
        </div>

        <div
          className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-2 py-2 shadow-lg dark:border-gray-800 dark:bg-gray-950"
          aria-label={`Due within 24 hours: ${stats.dueSoon}`}
        >
          <span className="rounded-xl bg-orange-50 p-2 text-orange-700 dark:bg-orange-950/30 dark:text-orange-200">
            <CalendarClock size={16} />
          </span>
          <span className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{stats.dueSoon}</span>
        </div>

        <div
          className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-2 py-2 shadow-lg dark:border-gray-800 dark:bg-gray-950"
          aria-label={`Overdue assignments: ${stats.overdue}`}
        >
          <span className="rounded-xl bg-red-50 p-2 text-red-700 dark:bg-red-950/30 dark:text-red-200">
            <AlertTriangle size={16} />
          </span>
          <span className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{stats.overdue}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-950">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900">Upcoming</h2>
          <p className="text-xs font-semibold text-gray-600">Next 5</p>
        </div>
        {stats.upcoming.length ? (
          <div className="mt-3 space-y-2">
            {stats.upcoming.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-1 rounded-2xl border border-gray-100 bg-white p-3 md:flex-row md:items-center md:justify-between dark:border-gray-800 dark:bg-gray-950"
              >
                <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{a.title}</p>
                <p className="text-xs font-semibold italic text-gray-600 dark:text-gray-400">
                  {dayjs(a.deadline).format('MMM D • h:mm A')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-gray-600">No upcoming deadlines yet.</p>
        )}
      </div>
    </div>
  );
}
