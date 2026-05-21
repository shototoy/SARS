import { apiFetch, getApiBase } from './api';
export function profileImgUrl(username) {
  if (!username) return '';
  return `${getApiBase()}/uploads/profiles/${encodeURIComponent(username)}.png`;
}
export function announcementImgUrl(title) {
  if (!title) return '';
  return `${getApiBase()}/uploads/announcements/${encodeURIComponent(title)}.png`;
}
export async function uploadAnnouncementPhoto(file, title) {
  const formData = new FormData();
  formData.append('announcement', file);
  const targetUrl = `${getApiBase()}/api/upload/announcement?title=${encodeURIComponent(title)}`;
  const res = await fetch(targetUrl, {
    method: 'POST',
    body: formData,
  });
  return await res.json();
}
export async function uploadDocumentFile(file, name) {
  const formData = new FormData();
  formData.append('document', file);
  const url = name ? `${getApiBase()}/api/upload/document?name=${encodeURIComponent(name)}` : `${getApiBase()}/api/upload/document`;
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  return await res.json();
}

export const getAssignments = () => apiFetch('/assignments');
export const addAssignment = (d) => apiFetch('/assignments', { method: 'POST', body: JSON.stringify(d) });
export const updateAssignment = (id, d) => apiFetch(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteAssignment = (id) => apiFetch(`/assignments/${id}`, { method: 'DELETE' });

export const getAnnouncements = (u) => apiFetch(`/announcements?id=${u?.id}&role=${u?.role}`);
export const addAnnouncement = (d) => apiFetch('/announcements', { method: 'POST', body: JSON.stringify(d) });

export const getDocuments = (u) => apiFetch(`/documents?id=${u?.id}&role=${u?.role}&username=${u?.username}`);
export const addDocument = (d) => apiFetch('/documents', { method: 'POST', body: JSON.stringify(d) });
export const deleteDocument = (id, authorId) => apiFetch(`/documents/${id}?authorId=${authorId}`, { method: 'DELETE' });

export const getMessages = (id) => apiFetch(`/messages/${id}`);
export const sendMessage = (m) => apiFetch('/messages', { method: 'POST', body: JSON.stringify(m) });

export const getCourses = (u) => !u ? apiFetch('/courses') : apiFetch(`/courses?id=${u.id}&role=${u.role}`);
export const getCourseDetails = (id) => apiFetch(`/courses/${id}`);
export const addCourse = (d) => apiFetch('/courses', { method: 'POST', body: JSON.stringify(d) });
export const updateCourse = (id, d) => apiFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(d) });
export const deleteCourse = (id) => apiFetch(`/courses/${id}`, { method: 'DELETE' });
export const enrollStudent = (courseId, studentId) => apiFetch('/courses/enroll', { method: 'POST', body: JSON.stringify({ courseId, studentId }) });
export const unenrollStudent = (courseId, studentId) => apiFetch(`/courses/enroll/${courseId}/${studentId}`, { method: 'DELETE' });
