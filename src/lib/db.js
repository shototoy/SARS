import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { CapacitorSQLite, SQLiteConnection } from '@capacitor-community/sqlite';
import dayjs from 'dayjs';

const PREFERENCES_KEY = 'sars.assignments.v1';

let nativeDbPromise;

function normalizeAssignmentInput(data) {
  const rawStatus = data.status || 'Pending';
  const status = rawStatus === 'Completed' ? 'Completed' : 'Pending';
  return {
    title: String(data.title || '').trim(),
    subject: String(data.subject || '').trim(),
    description: String(data.description || '').trim(),
    deadline: data.deadline ? String(data.deadline) : null,
    priority: data.priority || 'Medium',
    status,
    reminderEnabled: true,
    remindBeforeMinutes: 1440,
  };
}

function sortByDeadlineAscending(assignments) {
  return [...assignments].sort((a, b) => {
    const aValue = a.deadline ? dayjs(a.deadline).valueOf() : Number.POSITIVE_INFINITY;
    const bValue = b.deadline ? dayjs(b.deadline).valueOf() : Number.POSITIVE_INFINITY;
    return aValue - bValue;
  });
}

function generateWebId(existingAssignments) {
  const maxId = existingAssignments.reduce((max, a) => (typeof a.id === 'number' ? Math.max(max, a.id) : max), 0);
  return maxId + 1;
}

async function loadAssignmentsFromPreferences() {
  const { value } = await Preferences.get({ key: PREFERENCES_KEY });
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveAssignmentsToPreferences(assignments) {
  await Preferences.set({ key: PREFERENCES_KEY, value: JSON.stringify(assignments) });
}

async function migrateAssignmentsTable(db) {
  const maybeAddColumn = async (name, definition) => {
    try {
      await db.execute(`ALTER TABLE assignments ADD COLUMN ${name} ${definition}`);
    } catch {
    }
  };

  await maybeAddColumn('reminderEnabled', 'INTEGER DEFAULT 0');
  await maybeAddColumn('remindBeforeMinutes', 'INTEGER DEFAULT 1440');
  await maybeAddColumn('reminderId', 'INTEGER');
}

async function ensureUsersTable(db) {
  await db.execute(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT,
    pin TEXT,
    createdAt TEXT
  )`);

  try {
    await db.execute('ALTER TABLE users ADD COLUMN password TEXT');
  } catch {
  }

  try {
    await db.execute('ALTER TABLE users ADD COLUMN pin TEXT');
  } catch {
  }

  try {
    await db.execute(`UPDATE users SET password=pin WHERE (password IS NULL OR password='') AND pin IS NOT NULL`);
  } catch {
  }
}

export async function getDb() {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('SQLite is only available on native platforms. Use Preferences fallback on web.');
  }

  if (!nativeDbPromise) {
    nativeDbPromise = (async () => {
      const sqlite = new SQLiteConnection(CapacitorSQLite);
      const db = await sqlite.createConnection('sars', false, 'no-encryption', 1);
      await db.open();
      await db.execute(`CREATE TABLE IF NOT EXISTS assignments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subject TEXT,
        description TEXT,
        deadline TEXT,
        priority TEXT,
        status TEXT,
        reminderEnabled INTEGER DEFAULT 0,
        remindBeforeMinutes INTEGER DEFAULT 1440,
        reminderId INTEGER
      )`);
      await migrateAssignmentsTable(db);
      await ensureUsersTable(db);
      return db;
    })();
  }

  return nativeDbPromise;
}

export async function getAssignments() {
  if (Capacitor.isNativePlatform()) {
    try {
      const db = await getDb();
      const res = await db.query('SELECT * FROM assignments ORDER BY deadline ASC');
      return res.values || [];
    } catch {
    }
  }

  const assignments = await loadAssignmentsFromPreferences();
  return sortByDeadlineAscending(assignments);
}

export async function addAssignment(data) {
  const normalized = normalizeAssignmentInput(data);

  if (Capacitor.isNativePlatform()) {
    try {
      const db = await getDb();
      await db.run(
        `INSERT INTO assignments (title, subject, description, deadline, priority, status, reminderEnabled, remindBeforeMinutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          normalized.title,
          normalized.subject,
          normalized.description,
          normalized.deadline,
          normalized.priority,
          normalized.status,
          normalized.reminderEnabled ? 1 : 0,
          normalized.remindBeforeMinutes,
        ]
      );
      return;
    } catch {
    }
  }

  const assignments = await loadAssignmentsFromPreferences();
  const id = generateWebId(assignments);
  const created = { id, ...normalized, reminderId: null };
  const next = sortByDeadlineAscending([...assignments, created]);
  await saveAssignmentsToPreferences(next);
}

export async function updateAssignment(id, data) {
  const normalized = normalizeAssignmentInput(data);

  if (Capacitor.isNativePlatform()) {
    try {
      const db = await getDb();
      await db.run(
        `UPDATE assignments SET title=?, subject=?, description=?, deadline=?, priority=?, status=?, reminderEnabled=?, remindBeforeMinutes=? WHERE id=?`,
        [
          normalized.title,
          normalized.subject,
          normalized.description,
          normalized.deadline,
          normalized.priority,
          normalized.status,
          normalized.reminderEnabled ? 1 : 0,
          normalized.remindBeforeMinutes,
          id,
        ]
      );
      return;
    } catch {
    }
  }

  const assignments = await loadAssignmentsFromPreferences();
  const next = sortByDeadlineAscending(
    assignments.map((a) => (a.id === id ? { ...a, ...normalized } : a))
  );
  await saveAssignmentsToPreferences(next);
}

export async function deleteAssignment(id) {
  if (Capacitor.isNativePlatform()) {
    try {
      const db = await getDb();
      await db.run('DELETE FROM assignments WHERE id=?', [id]);
      return;
    } catch {
    }
  }

  const assignments = await loadAssignmentsFromPreferences();
  const next = assignments.filter((a) => a.id !== id);
  await saveAssignmentsToPreferences(next);
}