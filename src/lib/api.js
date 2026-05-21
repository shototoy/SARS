export function getApiBase() {
  return localStorage.getItem('campusconnect_api_base') || import.meta.env.VITE_API_BASE || `http://${window.location.hostname}:5001`;
}
export function setApiBase(url) {
  localStorage.setItem('campusconnect_api_base', url.replace(/\/+$/, ''));
}
export async function apiFetch(endpoint, options = {}) {
  const targetUrl = `${getApiBase()}/api${endpoint}`;
  const res = await fetch(targetUrl, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API Error');
  return data;
}
