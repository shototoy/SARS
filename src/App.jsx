import React, { useEffect, useMemo, useRef, useState } from 'react';
import AssignmentList from './components/AssignmentList';
import AssignmentWizard from './components/AssignmentWizard';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import Insights from './components/Insights';
import { getAssignments, addAssignment, updateAssignment, deleteAssignment } from './lib/db';
import { syncAssignmentReminders } from './lib/reminders';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import FooterNav from './components/FooterNav';
import { PlusCircle } from 'lucide-react';

const TAB_ORDER = {
  assignments: 0,
  home: 1,
  calendar: 2,
  insights: 3,
};

function App() {
  const [assignments, setAssignments] = useState([]);
  const [tab, setTab] = useState('home');
  const [tabTransition, setTabTransition] = useState(null); // { from, to, dir, key, phase }
  const previousAssignmentIdsRef = useRef(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignmentsView, setAssignmentsView] = useState('list'); // list | add | edit
  const [editingAssignment, setEditingAssignment] = useState(null);
  const transitionKeyRef = useRef(0);
  const swipeRef = useRef(null);

  function goAssignmentsList() {
    navigateTab('assignments');
    setAssignmentsView('list');
    setEditingAssignment(null);
  }

  function navigateTab(nextTab) {
    const fromTab = tabTransition ? tabTransition.to : tab;
    if (nextTab === fromTab) return;

    const fromIndex = TAB_ORDER[fromTab] ?? 0;
    const nextIndex = TAB_ORDER[nextTab] ?? 0;
    // Destination-based: navigating left => new page enters from left, right => from right.
    const dir = nextIndex < fromIndex ? 'from-left' : 'from-right';

    transitionKeyRef.current += 1;
    const key = transitionKeyRef.current;
    setTabTransition({ from: fromTab, to: nextTab, dir, key, phase: 'start' });
    setTab(nextTab);

    window.requestAnimationFrame(() => {
      setTabTransition((t) => (t && t.key === key ? { ...t, phase: 'animate' } : t));
    });

    window.setTimeout(() => {
      setTabTransition((t) => (t && t.key === key ? null : t));
    }, 1000);
  }

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
    if (assignmentsView === 'edit' && editingAssignment) {
      await updateAssignment(editingAssignment.id, data);
      setEditingAssignment(null);
      setAssignmentsView('list');
      await refresh();
      return;
    }

    await addAssignment(data);
    setAssignmentsView('list');
    await refresh();
  }

  async function handleDelete(id) {
    await deleteAssignment(id);
    await refresh();
  }

  function handleEdit(a) {
    setEditingAssignment(a);
    setAssignmentsView('edit');
    navigateTab('assignments');
  }

  const title = useMemo(() => {
    if (tab === 'assignments') {
      if (assignmentsView === 'add') return 'Add assignment';
      if (assignmentsView === 'edit') return 'Edit assignment';
      return 'Assignments';
    }
    if (tab === 'calendar') return 'Calendar';
    if (tab === 'insights') return 'Insights';
    return 'SARS Dashboard';
  }, [assignmentsView, tab]);

  function renderTabContent(activeTab) {
    if (activeTab === 'home') {
      return (
        <div className="space-y-6">
          <Dashboard assignments={assignments} onGoAssignments={goAssignmentsList} />
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-gray-900 dark:text-gray-100">Insights</h2>
              <button
                onClick={() => navigateTab('insights')}
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
      );
    }

    if (activeTab === 'calendar') return <CalendarView assignments={assignments} />;
    if (activeTab === 'insights') {
      return (
        <div className="h-[calc(100vh-192px)] overflow-hidden">
          <Insights assignments={assignments} fullHeight />
        </div>
      );
    }

    if (activeTab === 'assignments') {
      return (
        <section className="space-y-5">
          {assignmentsView === 'list' ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-extrabold tracking-tight text-blue-800 dark:text-blue-200">
                    Assignments
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Tap a card to edit. Long lists stay fast.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAssignmentsView('add');
                    setEditingAssignment(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-800 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-900"
                >
                  <PlusCircle size={18} />
                  Add
                </button>
              </div>

              <AssignmentList assignments={assignments} onEdit={handleEdit} onDelete={handleDelete} />
            </>
          ) : (
            <AssignmentWizard
              mode={assignmentsView === 'edit' ? 'edit' : 'add'}
              initialValues={
                assignmentsView === 'edit' && editingAssignment
                  ? editingAssignment
                  : { priority: 'Medium', status: 'Pending', reminderEnabled: false, remindBeforeMinutes: 1440 }
              }
              onCancel={() => {
                setAssignmentsView('list');
                setEditingAssignment(null);
              }}
              onSubmit={handleAdd}
            />
          )}
        </section>
      );
    }

    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <AppHeader
        title={title}
        assignments={assignments}
        onOpenSidebar={() => setSidebarOpen(true)}
        onGoAssignments={goAssignmentsList}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={tab}
        onSelectTab={(next) => {
          navigateTab(next);
          if (next === 'assignments') {
            setAssignmentsView('list');
            setEditingAssignment(null);
          }
        }}
      />

      <main className="mx-auto w-full max-w-4xl px-4 pb-28 pt-20 md:px-6">
        <div
          className="relative overflow-hidden"
          onPointerDown={(e) => {
            if (assignmentsView !== 'list' && tab === 'assignments') return;
            if (e.pointerType === 'mouse') return;
            swipeRef.current = { x: e.clientX, y: e.clientY, t: Date.now(), id: e.pointerId };
          }}
          onPointerMove={(e) => {
            const s = swipeRef.current;
            if (!s || s.id !== e.pointerId) return;
            // Cancel if vertical intention is strong.
            const dx = e.clientX - s.x;
            const dy = e.clientY - s.y;
            if (Math.abs(dy) > Math.abs(dx) * 1.25 && Math.abs(dy) > 14) swipeRef.current = null;
          }}
          onPointerUp={(e) => {
            const s = swipeRef.current;
            swipeRef.current = null;
            if (!s || s.id !== e.pointerId) return;
            if (assignmentsView !== 'list' && tab === 'assignments') return;

            const dx = e.clientX - s.x;
            const dy = e.clientY - s.y;
            if (Math.abs(dx) < 70) return;
            if (Math.abs(dx) < Math.abs(dy) * 1.25) return;

            // Only swipe across main tabs.
            const order = ['assignments', 'home', 'calendar'];
            const idx = order.indexOf(tab);
            if (idx === -1) return;

            if (dx < 0) {
              // Swipe left => go right.
              const next = order[Math.min(order.length - 1, idx + 1)];
              navigateTab(next);
            } else {
              // Swipe right => go left.
              const next = order[Math.max(0, idx - 1)];
              navigateTab(next);
            }
          }}
        >
          {tabTransition ? (
            <>
              <div
                className={`absolute inset-0 will-change-transform transition-transform duration-[1000ms] ease-in-out ${
                  tabTransition.phase === 'animate'
                    ? tabTransition.dir === 'from-left'
                      ? 'translate-x-full'
                      : '-translate-x-full'
                    : 'translate-x-0'
                }`}
              >
                {renderTabContent(tabTransition.from)}
              </div>
              <div
                className={`relative will-change-transform transition-transform duration-[1000ms] ease-in-out ${
                  tabTransition.phase === 'animate'
                    ? 'translate-x-0'
                    : tabTransition.dir === 'from-left'
                      ? '-translate-x-full'
                      : 'translate-x-full'
                }`}
              >
                {renderTabContent(tabTransition.to)}
              </div>
            </>
          ) : (
            <div className="relative">{renderTabContent(tab)}</div>
          )}
        </div>
      </main>

      <FooterNav
        tab={tab}
        onSelectTab={(next) => {
          navigateTab(next);
          if (next === 'assignments') {
            setAssignmentsView('list');
            setEditingAssignment(null);
          }
        }}
      />
    </div>
  );
}

export default App;
