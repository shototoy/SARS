import React, { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { BellRing, Menu, X, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const onPointerDown = (e) => {
      if (!ref.current) return;
      if (ref.current.contains(e.target)) return;
      handler(e);
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [handler, ref]);
}

function makeNotificationItems(assignments) {
  const now = dayjs();
  const items = [];

  for (const a of assignments) {
    if (!a.deadline) continue;
    const d = dayjs(a.deadline);
    if (!d.isValid()) continue;

    const isCompleted = a.status === 'Completed';
    const isOverdue = d.isBefore(now) && !isCompleted;
    const isDueSoon = d.isAfter(now) && d.diff(now, 'hour', true) <= 24 && !isCompleted;

    if (!isOverdue && !isDueSoon) continue;

    items.push({
      id: a.id,
      title: a.title,
      subject: a.subject || null,
      when: d,
      kind: isOverdue ? 'overdue' : 'dueSoon',
    });
  }

  items.sort((a, b) => a.when.valueOf() - b.when.valueOf());
  return items.slice(0, 8);
}

function notifMeta(kind) {
  if (kind === 'overdue') return { icon: AlertTriangle, cls: 'text-red-600', label: 'Overdue' };
  return { icon: Clock, cls: 'text-orange-500', label: 'Due soon' };
}

export default function AppHeader({ title, assignments, onOpenSidebar, onGoAssignments }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  useOnClickOutside(dropdownRef, () => setOpen(false));

  const items = useMemo(() => makeNotificationItems(assignments), [assignments]);
  const hasUrgent = items.some((i) => i.kind === 'overdue');
  const shouldPulse = items.length > 0;

  return (
    <header
      id="app-header"
      className="fixed top-0 left-0 right-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-gray-950/70"
    >
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-4 pb-3 pt-5 md:px-6">
        <button
          onClick={onOpenSidebar}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-900 shadow-sm transition hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-center text-base font-extrabold tracking-tight text-blue-800 dark:text-blue-200">
            {title}
          </p>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl shadow-sm transition ${
              hasUrgent
                ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-200'
                : 'bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800'
            }`}
            aria-label="Notifications"
          >
            <BellRing size={20} className={shouldPulse ? 'animate-pulse' : ''} />
            {items.length ? (
              <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-extrabold text-white">
                {items.length}
              </span>
            ) : null}
          </button>

          {open ? (
            <div className="absolute right-0 mt-3 w-[min(360px,70vw)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800">
                <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">Notifications</p>
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-auto p-2">
                {items.length ? (
                  <div className="space-y-2">
                    {items.map((n) => {
                      const meta = notifMeta(n.kind);
                      const Icon = meta.icon;
                      return (
                        <div
                          key={n.id}
                          className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-950"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 rounded-xl bg-gray-100 p-2 dark:bg-gray-900 ${meta.cls}`}>
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-extrabold text-gray-900 dark:text-gray-100">
                                {n.title}
                              </p>
                              <p className="mt-0.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                                {meta.label}
                                {' • '}
                                {n.when.format('MMM D, h:mm A')}
                                {n.subject ? ` • ${n.subject}` : ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={() => {
                        setOpen(false);
                        onGoAssignments();
                      }}
                      className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-800 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-900"
                    >
                      <CheckCircle2 size={18} />
                      Review assignments
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center text-sm font-semibold text-gray-700 dark:border-gray-800 dark:bg-gray-900/30 dark:text-gray-300">
                    All clear. No upcoming deadlines in the next 24 hours.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
