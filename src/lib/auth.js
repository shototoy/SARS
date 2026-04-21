import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { getDb } from './db';

const USERS_KEY = 'sars.users.v1';
const SESSION_KEY = 'sars.session.v1';

function normalizeUsername(username) {
  return String(username || '').trim().toLowerCase();
}

function normalizePassword(password) {
  return String(password || '').trim();
}

async function getSession() {
  const { value } = await Preferences.get({ key: SESSION_KEY });
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

async function setSession(session) {
  if (!session) {
    await Preferences.remove({ key: SESSION_KEY });
    return;
  }
  await Preferences.set({ key: SESSION_KEY, value: JSON.stringify(session) });
}

async function loadUsersWeb() {
  const { value } = await Preferences.get({ key: USERS_KEY });
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveUsersWeb(users) {
  await Preferences.set({ key: USERS_KEY, value: JSON.stringify(users) });
}

export async function logout() {
  await setSession(null);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;

  if (Capacitor.isNativePlatform()) {
    try {
      const db = await getDb();
      const res = await db.query('SELECT id, username FROM users WHERE id=?', [session.userId]);
      return res.values?.[0] || null;
    } catch {
      // fall back to web store
    }
  }

  const users = await loadUsersWeb();
  return users.find((u) => u.id === session.userId) || null;
}

export async function registerUser({ username, password, pin }) {
  const u = normalizeUsername(username);
  const p = normalizePassword(password ?? pin);
  if (!u) throw new Error('Username is required.');
  if (p.length < 6) throw new Error('Password must be at least 6 characters.');

  const createdAt = new Date().toISOString();

  if (Capacitor.isNativePlatform()) {
    try {
      const db = await getDb();
      const exists = await db.query('SELECT id FROM users WHERE username=?', [u]);
      if (exists.values?.length) throw new Error('Username already exists.');
      let run;
      try {
        run = await db.run('INSERT INTO users (username, password, createdAt) VALUES (?, ?, ?)', [u, p, createdAt]);
      } catch {
        run = await db.run('INSERT INTO users (username, pin, createdAt) VALUES (?, ?, ?)', [u, p, createdAt]);
      }
      const userId = run.changes?.lastId;
      if (!userId) throw new Error('Failed to create user.');
      const user = { id: userId, username: u };
      await setSession({ userId });
      return user;
    } catch (e) {
      if (String(e?.message || '').includes('exists')) throw e;
      // fall back to web store
    }
  }

  const users = await loadUsersWeb();
  if (users.some((x) => x.username === u)) throw new Error('Username already exists.');
  const nextId = users.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) + 1;
  const user = { id: nextId, username: u, password: p, createdAt };
  const next = [...users, user];
  await saveUsersWeb(next);
  await setSession({ userId: user.id });
  return { id: user.id, username: user.username };
}

export async function login({ username, password, pin }) {
  const u = normalizeUsername(username);
  const p = normalizePassword(password ?? pin);
  if (!u) throw new Error('Username is required.');
  if (!p) throw new Error('Password is required.');

  if (Capacitor.isNativePlatform()) {
    try {
      const db = await getDb();
      const res = await db.query('SELECT id, username, pin, password FROM users WHERE username=?', [u]);
      const row = res.values?.[0];
      const stored = row?.password ?? row?.pin;
      if (!row || stored !== p) throw new Error('Invalid username or password.');
      await setSession({ userId: row.id });
      return { id: row.id, username: row.username };
    } catch (e) {
      if (String(e?.message || '').includes('Invalid')) throw e;
      // fall back to web store
    }
  }

  const users = await loadUsersWeb();
  const user = users.find((x) => x.username === u);
  const stored = user?.password ?? user?.pin;
  if (!user || stored !== p) throw new Error('Invalid username or password.');
  await setSession({ userId: user.id });
  return { id: user.id, username: user.username };
}
