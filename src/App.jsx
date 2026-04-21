import React, { useEffect, useMemo, useRef, useState } from 'react';
import AssignmentForm from './components/AssignmentForm';
import AssignmentList from './components/AssignmentList';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import Insights from './components/Insights';
import { getAssignments, addAssignment, updateAssignment, deleteAssignment } from './lib/db';
import { syncAssignmentReminders } from './lib/reminders';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import FooterNav from './components/FooterNav';

function App() {
  const [assignments, setAssignments] = useState([]);
  const [edit, setEdit] = useState(null);
  const [tab, setTab] = useState('home');
  const previousAssignmentIdsRef = useRef(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const title = useMemo(() => {
    if (tab === 'assignments') return 'Assignments';
    if (tab === 'calendar') return 'Calendar';
    if (tab === 'insights') return 'Insights';
    return 'SARS Dashboard';
  }, [tab]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <AppHeader
        title={title}
        assignments={assignments}
        onOpenSidebar={() => setSidebarOpen(true)}
        onGoAssignments={() => setTab('assignments')}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={tab}
        onSelectTab={(next) => setTab(next)}
      />

      <main className="mx-auto w-full max-w-4xl px-4 pb-28 pt-20 md:px-6">
        {tab === 'home' ? (
          <div className="space-y-6">
            <Dashboard assignments={assignments} onGoAssignments={() => setTab('assignments')} />
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">Insights</h2>
                <button
                  onClick={() => setTab('insights')}
                  className="text-xs font-extrabold text-blue-800 hover:text-blue-900 dark:text-blue-200 dark:hover:text-blue-100"
                >
                  View more
                </button>
              </div>
              <div className="mt-4">
                <Insights assignments={assignments} />
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'calendar' ? <CalendarView assignments={assignments} /> : null}

        {tab === 'insights' ? <Insights assignments={assignments} /> : null}

        {tab === 'assignments' ? (
          <section className="space-y-6">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-950">
              <h2 className="text-base font-extrabold tracking-tight text-blue-800 dark:text-blue-200">
                Assignment manager
              </h2>
              <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Add, edit, prioritize, and track statuses.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-950">
              <AssignmentForm
                onSubmit={handleAdd}
                isEditing={Boolean(edit)}
                onCancel={() => setEdit(null)}
                defaultValues={
                  edit || { priority: 'Medium', status: 'Pending', reminderEnabled: false, remindBeforeMinutes: 1440 }
                }
              />
            </div>

            <AssignmentList assignments={assignments} onEdit={handleEdit} onDelete={handleDelete} />
          </section>
        ) : null}
      </main>

      <FooterNav tab={tab} onSelectTab={setTab} />
    </div>
  );
}

export default App;
