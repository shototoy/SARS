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

export default function Dashboard({ assignments }) {
  const stats = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter((a) => a.status === 'Completed').length;
    const pending = assignments.filter((a) => a.status === 'Pending').length;
    const ongoing = assignments.filter((a) => a.status === 'Ongoing').length;
    const overdue = assignments.filter(isOverdue).length;
    const dueSoon = assignments.filter((a) => isDueSoon(a, 24)).length;
    const completionPct = total ? Math.round((completed / total) * 100) : 0;

    const upcoming = assignments
      .filter((a) => a.deadline && dayjs(a.deadline).isValid() && dayjs(a.deadline).isAfter(dayjs()))
      .slice(0, 5);

    return { total, completed, pending, ongoing, overdue, dueSoon, completionPct, upcoming };
  }, [assignments]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700">
              <ListChecks size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Total</p>
              <p className="text-2xl font-extrabold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-green-50 p-2 text-green-700">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Completed</p>
              <p className="text-2xl font-extrabold text-gray-900">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-50 p-2 text-amber-700">
              <CalendarClock size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Due in 24h</p>
              <p className="text-2xl font-extrabold text-gray-900">{stats.dueSoon}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-50 p-2 text-red-700">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-600">Overdue</p>
              <p className="text-2xl font-extrabold text-gray-900">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-gray-900">Progress</h2>
            <p className="text-sm text-gray-600">
              {stats.completed} completed • {stats.pending} pending • {stats.ongoing} ongoing
            </p>
          </div>
          <p className="text-sm font-semibold text-gray-900">{stats.completionPct}%</p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-indigo-600" style={{ width: `${stats.completionPct}%` }} />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-900">Upcoming</h2>
          <p className="text-xs font-semibold text-gray-600">Next 5</p>
        </div>
        {stats.upcoming.length ? (
          <div className="mt-3 space-y-2">
            {stats.upcoming.map((a) => (
              <div key={a.id} className="flex flex-col gap-1 rounded-xl border border-gray-100 p-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm font-semibold text-gray-900">{a.title}</p>
                <p className="text-xs font-semibold text-gray-600">{dayjs(a.deadline).format('MMM D • h:mm A')}</p>
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

