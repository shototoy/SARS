import React, { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import AssignmentForm from './components/AssignmentForm';
import AssignmentList from './components/AssignmentList';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import Insights from './components/Insights';
import { getAssignments, addAssignment, updateAssignment, deleteAssignment } from './lib/db';
import { BarChart3, CalendarDays, Home, ListTodo, BellRing } from 'lucide-react';
import { syncAssignmentReminders } from './lib/reminders';

function App() {
  const [assignments, setAssignments] = useState([]);
  const [edit, setEdit] = useState(null);
  const [tab, setTab] = useState('home');
  const previousAssignmentIdsRef = useRef(new Set());

  async function refresh() {
    setAssignments(await getAssignments());
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const list = await getAssignments();
      if (!cancelled) setAssignments(list);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const previousIds = previousAssignmentIdsRef.current;
    syncAssignmentReminders(assignments, previousIds);
    previousAssignmentIdsRef.current = new Set(assignments.map((a) => a.id));
  }, [assignments]);

  async function handleAdd(data) {
    if (edit) {
      await updateAssignment(edit.id, data);
      setEdit(null);
    } else {
      await addAssignment(data);
    }
    await refresh();
  }

  async function handleDelete(id) {
    await deleteAssignment(id);
    await refresh();
  }

  function handleEdit(a) {
    setEdit(a);
    setTab('assignments');
  }

  const alerts = useMemo(() => {
    const now = dayjs();
    const overdue = assignments.filter((a) => a.deadline && dayjs(a.deadline).isValid() && dayjs(a.deadline).isBefore(now) && a.status !== 'Completed');
    const dueSoon = assignments.filter((a) => a.deadline && dayjs(a.deadline).isValid() && dayjs(a.deadline).isAfter(now) && dayjs(a.deadline).diff(now, 'hour', true) <= 24 && a.status !== 'Completed');
    return { overdueCount: overdue.length, dueSoonCount: dueSoon.length };
  }, [assignments]);

  const navItems = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'assignments', label: 'Assignments', icon: ListTodo },
    { key: 'calendar', label: 'Calendar', icon: CalendarDays },
    { key: 'insights', label: 'Insights', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-100 text-gray-900 flex flex-col">
      <header className="bg-white/80 backdrop-blur shadow-md px-8 py-4 flex flex-col md:flex-row items-center justify-between sticky top-0 z-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-indigo-700 drop-shadow-sm">
            SARS
          </h1>
          <p className="text-sm font-semibold text-gray-600">Smart Assignment Reminding System</p>
        </div>
        <nav className="mt-3 flex flex-wrap gap-2 md:mt-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  active ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white text-indigo-700 hover:bg-indigo-50'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-8 max-w-4xl w-full mx-auto">
        {alerts.overdueCount || alerts.dueSoonCount ? (
          <div className="mb-6 rounded-2xl border border-indigo-100 bg-white/80 p-4 shadow-sm">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700">
                  <BellRing size={20} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-gray-900">Alerts</p>
                  <p className="text-sm text-gray-700">
                    {alerts.overdueCount ? `${alerts.overdueCount} overdue` : null}
                    {alerts.overdueCount && alerts.dueSoonCount ? ' • ' : null}
                    {alerts.dueSoonCount ? `${alerts.dueSoonCount} due within 24h` : null}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTab('assignments')}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Review assignments
              </button>
            </div>
          </div>
        ) : null}

        {tab === 'home' ? <Dashboard assignments={assignments} /> : null}

        {tab === 'calendar' ? <CalendarView assignments={assignments} /> : null}

        {tab === 'insights' ? <Insights assignments={assignments} /> : null}

        {tab === 'assignments' ? (
          <section className="space-y-6">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-extrabold text-indigo-800">Assignments</h2>
              <p className="text-sm text-gray-600">Add, edit, prioritize, and track statuses.</p>
            </div>

            <div className="bg-white/90 rounded-2xl shadow-lg p-6">
              <AssignmentForm
                onSubmit={handleAdd}
                isEditing={Boolean(edit)}
                onCancel={() => setEdit(null)}
                defaultValues={
                  edit || { priority: 'Medium', status: 'Pending', reminderEnabled: false, remindBeforeMinutes: 1440 }
                }
              />
            </div>

            <div className="bg-white/90 rounded-2xl shadow-lg p-6">
              <AssignmentList assignments={assignments} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
          </section>
        ) : null}
      </main>
      <footer className="text-center text-gray-400 py-6 text-sm bg-white/70 mt-8 border-t">&copy; {new Date().getFullYear()} SARS</footer>
    </div>
  );
}

export default App;
