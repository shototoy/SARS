import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as db from './lib/db';
import * as auth from './lib/auth';

dayjs.extend(relativeTime);

export function useAssignments(user) {
  const [assignments, setAssignments] = useState([]);
  const refresh = async () => setAssignments(await db.getAssignments());
  useEffect(() => { if (user) refresh(); }, [user]);
  return {
    assignments,
    refresh,
    handleAdd: async d => { await db.addAssignment(d); await refresh(); },
    handleUpdate: async (id, d) => { await db.updateAssignment(id, d); await refresh(); },
    handleDelete: async id => { await db.deleteAssignment(id); await refresh(); },
    handleToggleComplete: async a => {
      const status = a.status === 'Completed' ? 'Pending' : 'Completed';
      await db.updateAssignment(a.id, { ...a, status });
      await refresh();
    }
  };
}

export function useAnnouncements(user) {
  const [announcements, setAnnouncements] = useState([]);
  const refresh = async () => setAnnouncements(await db.getAnnouncements(user));
  useEffect(() => { if (user) refresh(); }, [user]);
  return {
    announcements,
    refresh,
    handleAdd: async d => { await db.addAnnouncement(d); await refresh(); }
  };
}

export function useDocuments(user) {
  const [documents, setDocuments] = useState([]);
  const refresh = async () => setDocuments(await db.getDocuments(user));
  useEffect(() => { if (user) refresh(); }, [user]);
  return {
    documents,
    refresh,
    handleAdd: async d => { await db.addDocument(d); await refresh(); },
    handleDelete: async id => { await db.deleteDocument(id, user.id); await refresh(); }
  };
}

export function useMessages(user) {
  const [messages, setMessages] = useState([]);
  const refresh = async () => { if (user) setMessages(await db.getMessages(user.id)); };
  useEffect(() => {
    refresh();
    if (!user) return;
    const wsUrl = `ws://${window.location.hostname}:5001`;
    let socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: 'register', userId: user.id }));
    };
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === 'message') {
          refresh();
        }
      } catch (e) {
        console.error(e);
      }
    };
    socket.onclose = () => {
      let intervalId = setInterval(() => {
        if (socket.readyState === WebSocket.CLOSED) {
          socket = new WebSocket(wsUrl);
          socket.onopen = () => {
            clearInterval(intervalId);
            socket.send(JSON.stringify({ type: 'register', userId: user.id }));
          };
          socket.onmessage = (event) => {
            try {
              const payload = JSON.parse(event.data);
              if (payload.type === 'message') {
                refresh();
              }
            } catch (e) {
              console.error(e);
            }
          };
        }
      }, 5000);
      return () => clearInterval(intervalId);
    };
    return () => {
      socket.close();
    };
  }, [user]);
  return {
    messages,
    refresh,
    handleSend: async m => { await db.sendMessage({ ...m, senderId: user.id }); }
  };
}

export function useUsers(user) {
  const [users, setUsers] = useState([]);
  const refresh = async () => { if (user) setUsers(await auth.getAllUsers()); };
  useEffect(() => { refresh(); }, [user]);
  return {
    users,
    refresh,
    handleCreate: async d => { await auth.createUser(d); await refresh(); }
  };
}

export function useNavigation(user) {
  const [tab, setTab] = useState('home');
  const [tabTransition, setTabTransition] = useState(null);
  const transitionKeyRef = useRef(0);
  const swipeRef = useRef(null);

  const TAB_LIST = useMemo(() => {
    if (user?.role === 'admin') {
      return ['home', 'documents', 'users'];
    }
    if (user?.role === 'faculty') {
      return ['home', 'courses', 'messages', 'reminders', 'calendar', 'documents'];
    }
    return ['home', 'messages', 'reminders', 'calendar', 'documents'];
  }, [user]);

  const TAB_ORDER = useMemo(() => {
    return TAB_LIST.reduce((acc, t, i) => { acc[t] = i; return acc; }, {});
  }, [TAB_LIST]);

  const navigateTab = (next) => {
    const from = tabTransition ? tabTransition.to : tab;
    if (next === from) return;
    const key = ++transitionKeyRef.current;
    setTabTransition({ from, to: next, key, phase: 'start' });
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

  return { tab, tabTransition, navigateTab, swipeHandlers, tabs: TAB_LIST };
}

export function useChromeMeasurement(user) {
  const [chromePx, setChromePx] = useState({ header: 56, footer: 0 });
  useEffect(() => {
    if (!user) return;
    const measure = () => {
      const h = document.getElementById('app-header')?.getBoundingClientRect().height;
      if (h) setChromePx(p => p.header === h ? p : { header: Math.round(h), footer: 0 });
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [user]);
  return chromePx;
}

export function useNotifications(assignments = [], announcements = [], messages = [], user = null) {
  const [now, setNow] = useState(() => dayjs());
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sars.read_notif_ids') || '[]');
    } catch {
      return [];
    }
  });
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setReadIds(JSON.parse(localStorage.getItem('sars.read_notif_ids') || '[]'));
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener('storage_read_notifs', handleStorageChange);
    return () => window.removeEventListener('storage_read_notifs', handleStorageChange);
  }, []);
  useEffect(() => {
    const id = setInterval(() => setNow(dayjs()), 30000);
    return () => clearInterval(id);
  }, []);
  const items = useMemo(() => {
    const list = [];
    assignments.filter(a => a.deadline && a.status !== 'Completed').forEach(a => {
      const d = dayjs(a.deadline);
      const diff = d.diff(now, 'hour', true);
      if (d.isBefore(now)) {
        list.push({ id: `a-${a.id}`, title: a.title, sub: a.subject, when: d, kind: 'overdue' });
      } else if (diff <= 24) {
        list.push({ id: `a-${a.id}`, title: a.title, sub: a.subject, when: d, kind: 'dueSoon' });
      }
    });
    announcements.forEach(a => {
      list.push({ id: `ann-${a.id}`, title: a.title, sub: a.type === 'Event' ? 'Event' : 'Announcement', when: dayjs(a.date), kind: 'info' });
    });
    const unreadMessages = messages.filter(m => !m.is_read && user && Number(m.receiver_id) === Number(user?.id));
    unreadMessages.forEach(m => {
      list.push({ id: `msg-${m.id}`, title: 'New Message', sub: m.content, when: dayjs(m.timestamp), kind: 'message', senderId: m.sender_id });
    });
    return list.map(item => ({
      ...item,
      isRead: readIds.includes(item.id)
    })).sort((a, b) => b.when.valueOf() - a.when.valueOf()).slice(0, 10);
  }, [assignments, announcements, messages, now, readIds, user]);
  const [newItems, setNewItems] = useState([]);
  useEffect(() => {
    try {
      const toasted = JSON.parse(localStorage.getItem('sars.toasted_notif_ids') || '[]');
      const toToast = items.filter(i => !i.isRead && !toasted.includes(i.id));
      if (toToast.length > 0) {
        setNewItems(toToast);
        const nextToasted = [...new Set([...toasted, ...toToast.map(i => i.id)])];
        localStorage.setItem('sars.toasted_notif_ids', JSON.stringify(nextToasted));
      } else {
        setNewItems([]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [items]);
  const markAsRead = useCallback((id) => {
    try {
      const reads = JSON.parse(localStorage.getItem('sars.read_notif_ids') || '[]');
      if (!reads.includes(id)) {
        reads.push(id);
        localStorage.setItem('sars.read_notif_ids', JSON.stringify(reads));
        window.dispatchEvent(new Event('storage_read_notifs'));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);
  return {
    items,
    hasUrgent: items.some(i => !i.isRead && (i.kind === 'overdue' || i.kind === 'dueSoon')),
    newItems,
    markAsRead
  };
}

export function usePolling(refreshers = [], interval = 30000) {
  useEffect(() => {
    const id = setInterval(() => {
      refreshers.forEach(r => r());
    }, interval);
    return () => clearInterval(id);
  }, [refreshers, interval]);
}

export function useCourses(user) {
  const [courses, setCourses] = useState([]);
  const refresh = async () => setCourses(await db.getCourses(user));
  useEffect(() => { if (user) refresh(); }, [user]);
  return {
    courses,
    refresh,
    handleAdd: async d => { await db.addCourse(d); await refresh(); },
    handleUpdate: async (id, d) => { await db.updateCourse(id, d); await refresh(); },
    handleDelete: async id => { await db.deleteCourse(id); await refresh(); },
    handleEnroll: async (cId, sId) => { await db.enrollStudent(cId, sId); await refresh(); },
    handleUnenroll: async (cId, sId) => { await db.unenrollStudent(cId, sId); await refresh(); }
  };
}

export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => { if (!ref.current || ref.current.contains(e.target)) return; handler(e); };
    window.addEventListener('pointerdown', listener);
    return () => window.removeEventListener('pointerdown', listener);
  }, [ref, handler]);
}
