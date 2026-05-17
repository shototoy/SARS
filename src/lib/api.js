const API_URL = '/api';

export async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data;
}
