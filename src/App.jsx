import React, { useEffect, useMemo, useState } from 'react';
import AssignmentList from './components/AssignmentList';
import AssignmentWizard from './components/AssignmentWizard';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import DashboardInsights from './components/DashboardInsights';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import FooterNav from './components/FooterNav';
import { PlusCircle, TestTube2 } from 'lucide-react';
import { getCurrentUser, logout } from './lib/auth';
import AppBackground from './components/AppBackground';
import AuthGate from './components/AuthGate';
import backgroundUrl from './assets/background.png';
import logoUrl from './assets/logo.png';

// Hooks
import { useTheme, useAssignments, useNavigation, useChromeMeasurement } from './hooks';

function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [assignmentsView, setAssignmentsView] = useState('list'); // list | add | edit
  const [editingAssignment, setEditingAssignment] = useState(null);

  const { theme, toggleTheme } = useTheme();
  const { assignments, handleAdd, handleUpdate, handleDelete, handleToggleComplete } = useAssignments(user);
  const { tab, tabTransition, navigateTab, swipeHandlers } = useNavigation();
  const chromePx = useChromeMeasurement(user);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const startedAt = Date.now();
      try {
        const sessionUser = await getCurrentUser();
        if (!cancelled) setUser(sessionUser);
      } finally {
        const elapsed = Date.now() - startedAt;
        const remaining = Math.max(0, 2000 - elapsed);
        setTimeout(() => { if (!cancelled) setBooting(false); }, remaining);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const goAssignmentsList = () => {
    navigateTab('assignments');
    setAssignmentsView('list');
    setEditingAssignment(null);
  };

  const handleEdit = (a) => {
    setEditingAssignment(a);
    setAssignmentsView('edit');
    navigateTab('assignments');
  };

  const handleWizardSubmit = async (data) => {
    if (assignmentsView === 'edit' && editingAssignment) {
      await handleUpdate(editingAssignment.id, data);
    } else {
      await handleAdd(data);
    }
    setAssignmentsView('list');
    setEditingAssignment(null);
  };

  const handleTestNotifications = async () => {
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
  };

  const title = useMemo(() => {
    if (tab === 'assignments') {
      if (assignmentsView === 'add') return 'Add assignment';
      if (assignmentsView === 'edit') return 'Edit assignment';
      return 'Assignments';
    }
    return tab === 'calendar' ? 'Calendar' : 'SARS Dashboard';
  }, [assignmentsView, tab]);

  const renderTabContent = (activeTab) => {
    if (activeTab === 'home') return (
      <div className="flex h-full flex-col gap-4 py-2">
        <Dashboard assignments={assignments} onGoAssignments={goAssignmentsList} />
        <div className="flex-1 min-h-[220px] rounded-2xl border border-gray-100 bg-white p-3 shadow-lg dark:border-gray-800 dark:bg-gray-950">
          <DashboardInsights assignments={assignments} />
        </div>
      </div>
    );
    if (activeTab === 'calendar') return <CalendarView assignments={assignments} />;
    if (activeTab === 'assignments') return (
      <section className="flex h-full flex-col gap-3">
        {assignmentsView === 'list' ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-extrabold tracking-tight text-blue-800 dark:text-blue-200">Assignments</p>
                <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-300">Tap a card to edit. Long lists stay fast.</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleTestNotifications} className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-extrabold text-gray-800 shadow-sm transition hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900">
                  <TestTube2 size={18} /> Test
                </button>
                <button onClick={() => { setAssignmentsView('add'); setEditingAssignment(null); }} className="inline-flex items-center gap-2 rounded-2xl bg-blue-800 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-900">
                  <PlusCircle size={18} /> Add
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-auto pb-2">
              <AssignmentList assignments={assignments} onEdit={handleEdit} onDelete={handleDelete} onToggleComplete={handleToggleComplete} />
            </div>
          </>
        ) : (
          <div className="min-h-0 flex-1 overflow-auto pb-2">
            <AssignmentWizard
              key={assignmentsView === 'edit' && editingAssignment ? `edit:${editingAssignment.id}` : 'add'}
              mode={assignmentsView === 'edit' ? 'edit' : 'add'}
              initialValues={assignmentsView === 'edit' && editingAssignment ? editingAssignment : { priority: 'Medium', status: 'Pending' }}
              onCancel={() => { setAssignmentsView('list'); setEditingAssignment(null); }}
              onSubmit={handleWizardSubmit}
            />
          </div>
        )}
      </section>
    );
    return null;
  };

  if (!user) return <AuthGate booting={booting} onAuthed={setUser} logoUrl={logoUrl} backgroundUrl={backgroundUrl} />;

  const transitionClass = (isNext) => {
    if (!tabTransition || tabTransition.phase !== 'animate') {
      if (isNext) return tabTransition?.dir === 'from-left' ? '-translate-x-full blur-[3px] opacity-95' : 'translate-x-full blur-[3px] opacity-95';
      return 'translate-x-0 blur-0 opacity-100';
    }
    if (isNext) return 'translate-x-0 blur-0 opacity-100';
    return tabTransition.dir === 'from-left' ? 'translate-x-full blur-[3px] opacity-95' : '-translate-x-full blur-[3px] opacity-95';
  };

  return (
    <div className="relative min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <AppBackground imageUrl={backgroundUrl} opacity={0.08} />
      <div className="relative z-10">
        <AppHeader title={title} assignments={assignments} onOpenSidebar={() => setSidebarOpen(true)} onGoAssignments={goAssignmentsList} />
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={tab}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={async () => { await logout(); setUser(null); setSidebarOpen(false); }}
          onSelectTab={(next) => {
            navigateTab(next);
            if (next === 'assignments') { setAssignmentsView('list'); setEditingAssignment(null); }
            setSidebarOpen(false);
          }}
        />
        <main
          className="mx-auto h-[100dvh] w-full max-w-4xl overflow-hidden px-4 md:px-6"
          style={{ paddingTop: chromePx.header, paddingBottom: chromePx.footer }}
        >
          <div
            className="relative h-full overflow-hidden"
            onPointerDown={swipeHandlers.onPointerDown}
            onPointerMove={swipeHandlers.onPointerMove}
            onPointerUp={swipeHandlers.onPointerUp}
            onPointerCancel={swipeHandlers.onPointerCancel}
          >
            {tabTransition ? (
              <>
                <div className={`absolute inset-0 will-change-transform transform-gpu transition-all duration-[900ms] ease-in-out ${transitionClass(false)}`}>
                  <div className="h-full">{renderTabContent(tabTransition.from)}</div>
                </div>
                <div className={`relative will-change-transform transform-gpu transition-all duration-[900ms] ease-in-out ${transitionClass(true)}`}>
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
            navigateTab(next);
            if (next === 'assignments') { setAssignmentsView('list'); setEditingAssignment(null); }
          }}
        />
      </div>
    </div>
  );
}

export default App;
