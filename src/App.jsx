import React, { useEffect, useMemo, useRef, useState } from 'react';
import AssignmentList from './components/AssignmentList';
import AssignmentWizard from './components/AssignmentWizard';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import DashboardInsights from './components/DashboardInsights';
import { getAssignments, addAssignment, updateAssignment, deleteAssignment } from './lib/db';
import { syncAssignmentReminders } from './lib/reminders';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import FooterNav from './components/FooterNav';
import { PlusCircle, TestTube2, X } from 'lucide-react';
import { getCurrentUser, logout } from './lib/auth';
import AppBackground from './components/AppBackground';
import AuthGate from './components/AuthGate';
import backgroundUrl from './assets/background.png';
import logoUrl from './assets/logo.png';

const TAB_ORDER = {
  assignments: 0,
  home: 1,
  calendar: 2,
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
  const [user, setUser] = useState(null);
  const [chromePx, setChromePx] = useState({ header: 80, footer: 96 });
  const [booting, setBooting] = useState(true);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('sars.theme');
    return saved === 'dark' ? 'dark' : 'light';
  });
  const addWizardDefaults = useMemo(
    () => ({
      priority: 'Medium',
      status: 'Pending',
    }),
    []
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('sars.theme', theme);
  }, [theme]);

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
    }, 800);
  }

  async function refresh() {
    setAssignments(await getAssignments());
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const startedAt = Date.now();
      try {
        const [sessionUser, list] = await Promise.all([getCurrentUser(), getAssignments()]);
        if (!cancelled) {
          setUser(sessionUser);
          setAssignments(list);
        }
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, 3000 - elapsed);
        window.setTimeout(() => {
          if (!cancelled) setBooting(false);
        }, remaining);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    function measure() {
      const headerEl = document.getElementById('app-header');
      const footerEl = document.getElementById('app-footer');
      if (!headerEl || !footerEl) return;
      const header = Math.round(headerEl.getBoundingClientRect().height);
      const footer = Math.round(footerEl.getBoundingClientRect().height);
      setChromePx((prev) => (prev.header === header && prev.footer === footer ? prev : { header, footer }));
    }

    measure();
    window.addEventListener('resize', measure);
    window.visualViewport?.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, [user]);

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

  async function handleToggleComplete(a) {
    const nextStatus = a.status === 'Completed' ? 'Pending' : 'Completed';
    await updateAssignment(a.id, { status: nextStatus });
    await refresh();
  }

  async function handleTestNotifications() {
    const deadline = new Date(Date.now() + 60000);
    const localIso = new Date(deadline.getTime() - deadline.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    await handleAdd({
      title: 'TEST',
      subject: 'TEST',
      description: 'TEST',
      deadline: localIso,
      priority: 'Medium',
      status: 'Pending',
    });
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
    return 'SARS Dashboard';
  }, [assignmentsView, tab]);

  function renderTabContent(activeTab) {
    if (activeTab === 'home') {
      return (
        <div className="flex h-full flex-col gap-4 py-2">
          <Dashboard assignments={assignments} onGoAssignments={goAssignmentsList} />
          <div className="flex-1 min-h-[220px] rounded-2xl border border-gray-100 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-950">
            <DashboardInsights assignments={assignments} />
          </div>
        </div>
      );
    }

    if (activeTab === 'calendar') return <CalendarView assignments={assignments} />;

    if (activeTab === 'assignments') {
      return (
        <section className="flex h-full flex-col gap-3">
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestNotifications}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-extrabold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
                  >
                    <TestTube2 size={18} />
                    Test
                  </button>
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
              </div>

              <div className="min-h-0 flex-1 overflow-auto pb-2">
                <AssignmentList
                  assignments={assignments}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleComplete={handleToggleComplete}
                />
              </div>
            </>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto pb-2">
              <AssignmentWizard
                key={
                  assignmentsView === 'edit' && editingAssignment
                    ? `edit:${editingAssignment.id}`
                    : 'add'
                }
                mode={assignmentsView === 'edit' ? 'edit' : 'add'}
                initialValues={
                  assignmentsView === 'edit' && editingAssignment
                    ? editingAssignment
                    : addWizardDefaults
                }
                onCancel={() => {
                  setAssignmentsView('list');
                  setEditingAssignment(null);
                }}
                onSubmit={handleAdd}
              />
            </div>
          )}
        </section>
      );
    }

    return null;
  }

  if (!user) {
    return <AuthGate booting={booting} onAuthed={(u) => setUser(u)} logoUrl={logoUrl} backgroundUrl={backgroundUrl} />;
  }

  return (
    <div className="relative min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <AppBackground imageUrl={backgroundUrl} opacity={0.08} />
      <div className="relative z-10">
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
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        onLogout={async () => {
          await logout();
          setUser(null);
          setSidebarOpen(false);
        }}
        onSelectTab={(next) => {
          const current = tabTransition ? tabTransition.to : tab;
          if (next === current) return;
          navigateTab(next);
          if (next === 'assignments') {
            setAssignmentsView('list');
            setEditingAssignment(null);
          }
        }}
      />

        <main
        className="mx-auto h-[100dvh] w-full max-w-4xl overflow-hidden px-4 md:px-6"
        style={{ paddingTop: chromePx.header, paddingBottom: chromePx.footer }}
      >
        <div
          className="relative h-full overflow-hidden"
          onPointerDown={(e) => {
            swipeRef.current = null;
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
          onPointerCancel={() => {
            swipeRef.current = null;
          }}
        >
          {tabTransition ? (
            <>
              <div
                className={`absolute inset-0 will-change-transform transform-gpu transition-all duration-[900ms] ease-in-out ${
                  tabTransition.phase === 'animate'
                    ? tabTransition.dir === 'from-left'
                      ? 'translate-x-full'
                      : '-translate-x-full'
                    : 'translate-x-0'
                } ${tabTransition.phase === 'animate' ? 'blur-[3px] opacity-95' : 'blur-0 opacity-100'}`}
              >
                <div className="h-full">{renderTabContent(tabTransition.from)}</div>
              </div>
              <div
                className={`relative will-change-transform transform-gpu transition-all duration-[900ms] ease-in-out ${
                  tabTransition.phase === 'animate'
                    ? 'translate-x-0'
                    : tabTransition.dir === 'from-left'
                      ? '-translate-x-full'
                      : 'translate-x-full'
                } ${tabTransition.phase === 'animate' ? 'blur-0 opacity-100' : 'blur-[3px] opacity-95'}`}
              >
                <div className="h-full">{renderTabContent(tabTransition.to)}</div>
              </div>
            </>
          ) : (
            <div className="relative h-full">
              <div className="h-full">{renderTabContent(tab)}</div>
            </div>
          )}
        </div>
      </main>

      <FooterNav
        tab={tab}
        onSelectTab={(next) => {
          const current = tabTransition ? tabTransition.to : tab;
          if (next === current) return;
          navigateTab(next);
          if (next === 'assignments') {
            setAssignmentsView('list');
            setEditingAssignment(null);
          }
        }}
      />
      </div>
    </div>
  );
}

export default App;
