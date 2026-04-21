import React from 'react';
import dayjs from 'dayjs';
import { Edit, Trash, CheckCircle2, Clock3, AlertCircle, Bell } from 'lucide-react';

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
  if (priority === 'High') return 'bg-red-50 text-red-700 ring-red-200';
  if (priority === 'Medium') return 'bg-yellow-50 text-yellow-800 ring-yellow-200';
  return 'bg-green-50 text-green-800 ring-green-200';
}

function statusMeta(status) {
  if (status === 'Completed') return { label: 'Completed', icon: CheckCircle2, cls: 'bg-green-600 text-white' };
  if (status === 'Ongoing') return { label: 'Ongoing', icon: Clock3, cls: 'bg-amber-500 text-white' };
  return { label: 'Pending', icon: AlertCircle, cls: 'bg-indigo-600 text-white' };
}

export default function AssignmentList({ assignments, onEdit, onDelete }) {
  if (!assignments?.length) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center">
        <p className="text-sm font-semibold text-gray-900">No assignments yet</p>
        <p className="mt-1 text-sm text-gray-600">Add one above to start tracking deadlines and reminders.</p>
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
            className={`rounded-2xl border bg-white p-4 shadow-sm ${overdue ? 'border-red-200' : 'border-gray-100'}`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-bold text-gray-900">{a.title}</h3>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ring-1 ${priorityStyles(a.priority)}`}>
                    {a.priority || 'Medium'}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${status.cls}`}>
                    <StatusIcon size={14} />
                    {status.label}
                  </span>
                  {a.reminderEnabled ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">
                      <Bell size={14} /> Reminder
                    </span>
                  ) : null}
                </div>

                <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-700 md:grid-cols-2">
                  <div>
                    <span className="font-semibold text-gray-900">Subject:</span> {a.subject || '—'}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900">Deadline:</span> {formatDeadline(a.deadline)}
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
                  onClick={() => onEdit(a)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => onDelete(a.id)}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  <Trash size={16} />
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
