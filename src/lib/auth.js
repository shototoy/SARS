import { apiFetch } from './api';

export async function getCurrentUser() {
  const session = localStorage.getItem('campus_session');
  return session ? JSON.parse(session) : null;
}

export async function login({ username, password }) {
  const user = await apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem('campus_session', JSON.stringify(user));
  return user;
}

export async function logout() {
  localStorage.removeItem('campus_session');
}

export async function createUser(userData) {
  return await apiFetch('/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export async function getAllUsers() {
  return await apiFetch('/users');
}

export async function updateProfile(id, data) {
  const user = await apiFetch(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  localStorage.setItem('campus_session', JSON.stringify(user));
  return user;
}

export async function uploadProfilePhoto(file, username) {
  const formData = new FormData();
  formData.append('profile', file);
  const res = await fetch(`/api/upload/profile?username=${encodeURIComponent(username)}`, {
    method: 'POST',
    body: formData,
  });
  return await res.json();
}
