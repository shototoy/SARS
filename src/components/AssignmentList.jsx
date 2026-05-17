import React from 'react';
import dayjs from 'dayjs';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Circle,
  CircleDashed,
  Clock,
  Edit3,
  FileText,
  Trash2,
} from 'lucide-react';

function formatDeadline(deadline) {
  if (!deadline) return '—';
  const date = dayjs(deadline);
  if (!date.isValid()) return String(deadline);
  return date.format('MMM D, YYYY • h:mm A');
}

function formatTimeDiff(deadline) {
  if (!deadline) return null;
  const due = dayjs(deadline);
  if (!due.isValid()) return null;

  const minutes = due.diff(dayjs(), 'minute');
  const absMinutes = Math.abs(minutes);
  const isPast = minutes < 0;

  const days = Math.floor(absMinutes / (60 * 24));
  const hours = Math.floor((absMinutes - days * 60 * 24) / 60);
  const mins = absMinutes - days * 60 * 24 - hours * 60;

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (!days && !hours) parts.push(`${mins}m`);

  return `${isPast ? 'Overdue by' : 'Due in'} ${parts.join(' ')}`;
}

function priorityStyles(priority) {
  if (priority === 'High') return { cls: 'bg-red-50 text-red-700 ring-red-200', icon: AlertTriangle };
  if (priority === 'Medium') return { cls: 'bg-orange-50 text-orange-700 ring-orange-200', icon: Clock };
  return { cls: 'bg-green-50 text-green-700 ring-green-200', icon: Circle };
}

function statusMeta(status) {
  if (status === 'Completed') return { label: 'Completed', icon: CheckCircle2, cls: 'bg-green-600 text-white' };
  return { label: 'Pending', icon: CircleDashed, cls: 'bg-blue-800 text-white' };
}

export default function AssignmentList({ assignments, onEdit, onDelete, onToggleComplete }) {
  if (!assignments?.length) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-950">
        <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">No assignments yet</p>
        <p className="mt-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
          Add one above to start tracking deadlines and reminders.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assignments.map((a) => {
        const deadline = a.deadline ? dayjs(a.deadline) : null;
        const overdue = deadline?.isValid() && deadline.isBefore(dayjs()) && a.status !== 'Completed';
        const status = statusMeta(a.status);
        const StatusIcon = status.icon;
        const priority = priorityStyles(a.priority);
        const PriorityIcon = priority.icon;
        const timeDiff = formatTimeDiff(a.deadline);
        const startSoon =
          deadline?.isValid() &&
          a.status === 'Pending' &&
          !overdue &&
          deadline.diff(dayjs(), 'hour') <= 48 &&
          deadline.diff(dayjs(), 'minute') > 0;

        return (
          <div
            key={a.id}
            className={`rounded-2xl border bg-white p-4 shadow-lg dark:bg-gray-950 ${
              overdue ? 'border-red-200 dark:border-red-900/40' : 'border-gray-100 dark:border-gray-800'
            }`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center justify-center rounded-xl bg-blue-50 p-2 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
                    <FileText size={18} />
                  </span>
                  <h3 className="truncate text-base font-extrabold text-gray-900 dark:text-gray-100">{a.title}</h3>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-extrabold ring-1 ${priority.cls}`}
                  >
                    <PriorityIcon size={14} />
                    {a.priority || 'Medium'}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${status.cls}`}>
                    <StatusIcon size={14} />
                    {status.label}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-700 md:grid-cols-2">
                  <div>
                    <span className="font-extrabold text-gray-900 dark:text-gray-100">Subject:</span>{' '}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{a.subject || '—'}</span>
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1 font-extrabold text-gray-900 dark:text-gray-100">
                      <CalendarClock size={16} />
                      Deadline:
                    </span>{' '}
                    <span className="font-semibold italic text-gray-700 dark:text-gray-300">
                      {formatDeadline(a.deadline)}
                    </span>
                  </div>
                </div>

                {a.description ? <p className="mt-2 text-sm text-gray-600">{a.description}</p> : null}

                {timeDiff ? (
                  <p className={`mt-2 text-xs font-semibold ${overdue ? 'text-red-700' : 'text-gray-700'}`}>
                    {timeDiff}
                    {startSoon ? ' • Suggestion: start now to avoid rushing.' : null}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-2 self-start">
                <button
                  onClick={() => onToggleComplete?.(a)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-extrabold shadow-sm transition hover:scale-[1.02] ${
                    a.status === 'Completed'
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  aria-label={a.status === 'Completed' ? 'Mark as pending' : 'Mark as complete'}
                >
                  <CheckCircle2 size={16} />
                  {a.status === 'Completed' ? 'Undo' : 'Complete'}
                </button>
                <button
                  onClick={() => onEdit(a)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-extrabold text-gray-800 transition hover:bg-gray-50 hover:scale-[1.02] dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
                >
                  <Edit3 size={16} />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(a.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-extrabold text-white transition hover:bg-red-700 hover:scale-[1.02]"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}