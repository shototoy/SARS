import React from 'react';
import dayjs from 'dayjs';
import { AlertTriangle, CalendarClock, CheckCircle2, Circle, CircleDashed, Clock, Edit3, FileText, Trash2 } from 'lucide-react';

const formatDeadline = (d) => d ? dayjs(d).isValid() ? dayjs(d).format('MMM D, YYYY • h:mm A') : String(d) : '—';

const formatTimeDiff = (deadline) => {
  if (!deadline) return null;
  const due = dayjs(deadline);
  if (!due.isValid()) return null;
  const mins = due.diff(dayjs(), 'minute');
  const isPast = mins < 0;
  const absMins = Math.abs(mins);
  const d = Math.floor(absMins / 1440), h = Math.floor((absMins % 1440) / 60), m = absMins % 60;
  const parts = [d && `${d}d`, h && `${h}h`, !d && !h && `${m}m`].filter(Boolean);
  return `${isPast ? 'Overdue by' : 'Due in'} ${parts.join(' ')}`;
};

const PRIORITY = {
  High: { cls: 'bg-red-50 text-red-700 ring-red-200', icon: AlertTriangle },
  Medium: { cls: 'bg-orange-50 text-orange-700 ring-orange-200', icon: Clock },
  Low: { cls: 'bg-green-50 text-green-700 ring-green-200', icon: Circle }
};

export default function AssignmentList({ assignments, onEdit, onDelete, onToggleComplete }) {
  if (!assignments?.length) return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-950">
      <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">No assignments yet</p>
      <p className="mt-1 text-sm font-semibold text-gray-600 dark:text-gray-400">Add one above to start tracking deadlines and reminders.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {assignments.map((a) => {
        const deadline = a.deadline ? dayjs(a.deadline) : null;
        const overdue = deadline?.isValid() && deadline.isBefore(dayjs()) && a.status !== 'Completed';
        const isDone = a.status === 'Completed';
        const p = PRIORITY[a.priority] || PRIORITY.Medium;
        const timeDiff = formatTimeDiff(a.deadline);

        return (
          <div key={a.id} className={`rounded-2xl border bg-white p-4 shadow-lg dark:bg-gray-950 ${overdue ? 'border-red-200 dark:border-red-900/40' : 'border-gray-100 dark:border-gray-800'}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center justify-center rounded-xl bg-blue-50 p-2 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200"><FileText size={18} /></span>
                  <h3 className="truncate text-base font-extrabold text-gray-900 dark:text-gray-100">{a.title}</h3>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-extrabold ring-1 ${p.cls}`}><p.icon size={14} />{a.priority || 'Medium'}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${isDone ? 'bg-green-600 text-white' : 'bg-blue-800 text-white'}`}>
                    {isDone ? <CheckCircle2 size={14} /> : <CircleDashed size={14} />} {a.status}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-700 md:grid-cols-2">
                  <div className="font-semibold dark:text-gray-300"><span className="font-extrabold text-gray-900 dark:text-gray-100">Subject:</span> {a.subject || '—'}</div>
                  <div className="font-semibold dark:text-gray-300"><span className="inline-flex items-center gap-1 font-extrabold text-gray-900 dark:text-gray-100"><CalendarClock size={16} /> Deadline:</span> <span className="italic">{formatDeadline(a.deadline)}</span></div>
                </div>
                {a.description && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{a.description}</p>}
                {timeDiff && <p className={`mt-2 text-xs font-semibold ${overdue ? 'text-red-700' : 'text-gray-700 dark:text-gray-400'}`}>{timeDiff}</p>}
              </div>
              <div className="flex shrink-0 items-center gap-2 self-start">
                <button onClick={() => onToggleComplete?.(a)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold shadow-sm transition hover:scale-[1.02] ${isDone ? 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100' : 'bg-green-600 text-white'}`}><CheckCircle2 size={16} />{isDone ? 'Undo' : 'Done'}</button>
                <button onClick={() => onEdit(a)} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-extrabold text-gray-800 transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"><Edit3 size={16} />Edit</button>
                <button onClick={() => onDelete(a.id)} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-extrabold text-white transition hover:bg-red-700"><Trash2 size={16} /></button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
