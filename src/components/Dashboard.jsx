import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { AlertTriangle, CalendarClock, CheckCircle2, ListChecks, Sparkles } from 'lucide-react';

const isOverdue = (a) => a.deadline && a.status !== 'Completed' && dayjs(a.deadline).isBefore(dayjs());
const isDueSoon = (a) => a.deadline && a.status !== 'Completed' && dayjs(a.deadline).diff(dayjs(), 'hour', true) <= 24 && dayjs(a.deadline).isAfter(dayjs());

const StatCard = ({ icon: Icon, count, label, colorCls }) => (
  <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-gray-100 bg-white px-3 py-2 shadow-lg dark:border-gray-800 dark:bg-gray-950" aria-label={`${label}: ${count}`}>
    <span className={`rounded-xl p-2 ${colorCls}`}><Icon size={22} /></span>
    <span className="text-lg font-extrabold text-gray-900 dark:text-gray-100">{count}</span>
  </div>
);

function ProgressBar({ stats, onGoAssignments }) {
  const segments = useMemo(() => {
    if (stats.total === 0) return [{ key: 'none', count: 1, cls: 'bg-green-500', label: 'All set' }];
    return [
      { key: 'completed', count: stats.completed, cls: 'bg-green-500', label: 'Completed' },
      { key: 'pending', count: stats.pending - stats.dueSoon - stats.overdue, cls: 'bg-yellow-400', label: 'Pending' },
      { key: 'due', count: stats.dueSoon, cls: 'bg-orange-500', label: 'Due' },
      { key: 'overdue', count: stats.overdue, cls: 'bg-red-600', label: 'Overdue' },
    ].filter(s => s.count > 0);
  }, [stats]);

  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200 dark:bg-gray-900 dark:ring-gray-800">
      <div className="flex h-full w-full">
        {segments.map(s => (
          <button
            key={s.key}
            onClick={onGoAssignments}
            className={`${s.cls} h-full outline-none transition hover:brightness-95`}
            style={{ flexGrow: s.count }}
            title={`${s.count} ${s.label}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Dashboard({ assignments, onGoAssignments }) {
  const stats = useMemo(() => {
    const total = assignments.length;
    const completed = assignments.filter(a => a.status === 'Completed').length;
    const overdue = assignments.filter(isOverdue).length;
    const dueSoon = assignments.filter(isDueSoon).length;
    return { total, completed, pending: total - completed, overdue, dueSoon };
  }, [assignments]);

  const pill = useMemo(() => {
    if (stats.total === 0 || (stats.overdue === 0 && stats.dueSoon === 0)) return { text: "You're on track", cls: 'bg-green-50 text-green-700 ring-green-200' };
    if (stats.overdue > 0) return { text: 'Overdue tasks', cls: 'bg-red-50 text-red-700 ring-red-200' };
    return { text: 'Due soon', cls: 'bg-orange-50 text-orange-700 ring-orange-200' };
  }, [stats]);

  return (
    <div className="space-y-3.5">
      <div className="grid grid-cols-2 gap-2">
        <StatCard icon={ListChecks} count={stats.total} label="Total" colorCls="bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200" />
        <StatCard icon={CheckCircle2} count={stats.completed} label="Completed" colorCls="bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-200" />
        <StatCard icon={CalendarClock} count={stats.dueSoon} label="Due soon" colorCls="bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-200" />
        <StatCard icon={AlertTriangle} count={stats.overdue} label="Overdue" colorCls="bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-200" />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-950">
        <p className="text-sm font-extrabold tracking-tight text-blue-800 dark:text-blue-200">Your progress</p>
        <div className="mt-2"><ProgressBar stats={stats} onGoAssignments={onGoAssignments} /></div>
        <div className="mt-2">
          <span className={`inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-sm font-extrabold ring-1 ${pill.cls}`}><Sparkles size={18} />{pill.text}</span>
        </div>
      </div>
    </div>
  );
}
