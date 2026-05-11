import { useState, useEffect, useRef, useMemo } from 'react';
import dayjs from 'dayjs';
import { getAssignments, addAssignment, updateAssignment, deleteAssignment } from './lib/db';
import { syncAssignmentReminders } from './lib/reminders';

// Theme Hook
export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem('sars.theme') === 'dark' ? 'dark' : 'light');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('sars.theme', theme);
  }, [theme]);
  return { theme, toggleTheme: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
}

// Assignments Hook
export function useAssignments(user) {
  const [assignments, setAssignments] = useState([]);
  const prevIdsRef = useRef(new Set());
  const refresh = async () => setAssignments(await getAssignments());
  useEffect(() => { if (user) refresh(); }, [user]);
  useEffect(() => {
    syncAssignmentReminders(assignments, prevIdsRef.current);
    prevIdsRef.current = new Set(assignments.map(a => a.id));
  }, [assignments]);
  return {
    assignments,
    refresh,
    handleAdd: async d => { await addAssignment(d); await refresh(); },
    handleUpdate: async (id, d) => { await updateAssignment(id, d); await refresh(); },
    handleDelete: async id => { await deleteAssignment(id); await refresh(); },
    handleToggleComplete: async a => {
      const status = a.status === 'Completed' ? 'Pending' : 'Completed';
      await updateAssignment(a.id, { ...a, status });
      await refresh();
    }
  };
}

// Navigation Hook
export function useNavigation() {
  const [tab, setTab] = useState('home');
  const [tabTransition, setTabTransition] = useState(null);
  const transitionKeyRef = useRef(0);
  const swipeRef = useRef(null);
  const TAB_ORDER = { assignments: 0, home: 1, calendar: 2 };
  const TAB_LIST = ['assignments', 'home', 'calendar'];

  const navigateTab = (next) => {
    const from = tabTransition ? tabTransition.to : tab;
    if (next === from) return;
    const dir = (TAB_ORDER[next] ?? 0) < (TAB_ORDER[from] ?? 0) ? 'from-left' : 'from-right';
    const key = ++transitionKeyRef.current;
    setTabTransition({ from, to: next, dir, key, phase: 'start' });
    setTab(next);
    requestAnimationFrame(() => setTabTransition(t => t?.key === key ? { ...t, phase: 'animate' } : t));
    setTimeout(() => setTabTransition(t => t?.key === key ? null : t), 800);
  };

  const swipeHandlers = {
    onPointerDown: e => { swipeRef.current = e.pointerType === 'mouse' ? null : { x: e.clientX, y: e.clientY, id: e.pointerId }; },
    onPointerMove: e => {
      const s = swipeRef.current;
      if (!s || s.id !== e.pointerId) return;
      if (Math.abs(e.clientY - s.y) > Math.abs(e.clientX - s.x) * 1.25 && Math.abs(e.clientY - s.y) > 14) swipeRef.current = null;
    },
    onPointerUp: e => {
      const s = swipeRef.current;
      swipeRef.current = null;
      if (!s || s.id !== e.pointerId || Math.abs(e.clientX - s.x) < 70) return;
      const idx = TAB_LIST.indexOf(tab);
      const next = e.clientX - s.x < 0 ? TAB_LIST[Math.min(TAB_LIST.length - 1, idx + 1)] : TAB_LIST[Math.max(0, idx - 1)];
      navigateTab(next);
    }
  };

  return { tab, tabTransition, navigateTab, swipeHandlers };
}

// Layout Hook
export function useChromeMeasurement(user) {
  const [chromePx, setChromePx] = useState({ header: 80, footer: 96 });
  useEffect(() => {
    if (!user) return;
    const measure = () => {
      const h = document.getElementById('app-header')?.getBoundingClientRect().height;
      const f = document.getElementById('app-footer')?.getBoundingClientRect().height;
      if (h && f) setChromePx(p => p.header === h && p.footer === f ? p : { header: Math.round(h), footer: Math.round(f) });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [user]);
  return chromePx;
}

// Notifications Hook
export function useNotifications(assignments) {
  const [now, setNow] = useState(() => dayjs());
  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 30000);
    return () => clearInterval(id);
  }, []);

  const items = useMemo(() => {
    return assignments.filter(a => a.deadline && a.status !== 'Completed').map(a => {
      const d = dayjs(a.deadline);
      const isOverdue = d.isBefore(now);
      const isDueSoon = d.isAfter(now) && d.diff(now, 'hour', true) <= 24;
      if (!isOverdue && !isDueSoon) return null;
      return { id: a.id, title: a.title, subject: a.subject, when: d, kind: isOverdue ? 'overdue' : 'dueSoon' };
    }).filter(Boolean).sort((a, b) => a.when.valueOf() - b.when.valueOf()).slice(0, 8);
  }, [assignments, now]);

  return { items, hasUrgent: items.some(i => i.kind === 'overdue') };
}

// Generic Hooks
export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (!ref.current || ref.current.contains(e.target)) return; handler(e); };
    window.addEventListener('pointerdown', listener);
    return () => window.removeEventListener('pointerdown', listener);
  }, [ref, handler]);
}
