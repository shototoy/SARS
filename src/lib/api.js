const API_BASE = import.meta.env.VITE_API_BASE || '';
const API_URL = `${API_BASE}/api`;

export async function apiFetch(endpoint, options = {}) {
  const targetUrl = `${API_URL}${endpoint}`;
  const res = await fetch(targetUrl, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data;
}
