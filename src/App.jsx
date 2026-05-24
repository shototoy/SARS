import React, { useEffect, useMemo, useState, useRef } from 'react';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import DocumentsView from './components/DocumentsView';
import AppHeader from './components/AppHeader';
import Sidebar from './components/Sidebar';
import { PlusCircle, Megaphone, UserPlus, Camera, X } from 'lucide-react';
import { logout } from './lib/auth';
import * as auth from './lib/auth';
import * as db from './lib/db';
import AppBackground from './components/AppBackground';
import AuthGate from './components/AuthGate';
import backgroundUrl from './assets/background.png';
import logoUrl from './assets/logo.png';
import { useTheme } from './ThemeContext';
import { useToasts } from './ToastContext';
import { useNavigation, useChromeMeasurement, useAnnouncements, useDocuments, useMessages, useUsers, useCourses, useAssignments, useNotifications, usePolling } from './hooks';
import AssignmentList from './components/AssignmentList';
import AssignmentWizard from './components/AssignmentWizard';
import CoursesView from './components/CoursesView';
import MessagesView from './components/MessagesView';
import Modal from './components/Modal';

function App() {
  const [user, setUser] = useState(null);
  const isStudent = user?.role === 'student';
  const [booting, setBooting] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChatUserId, setSelectedChatUserId] = useState(null);

  const colors = useTheme();

  const { assignments, handleAdd: addAssign, handleUpdate: updateAssign, handleDelete: deleteAssign, handleToggleComplete, refresh: refreshAssign } = useAssignments(user);
  const { announcements, handleAdd: addAnn, refresh: refreshAnn } = useAnnouncements(user);
  const { messages, handleSend, refresh: refreshMsg } = useMessages(user);
  const { documents, handleAdd: addDoc, handleDelete: deleteDoc } = useDocuments(user);
  const { users, handleCreate: createUser, refresh: refreshUsers } = useUsers(user);
  const { tab, tabTransition, navigateTab, swipeHandlers } = useNavigation(user);
  const { courses, handleAdd: addCourse, handleUpdate: updateCourse, handleDelete: deleteCourse, handleEnroll, handleUnenroll, refresh: refreshCourses } = useCourses(user);
  const chromePx = useChromeMeasurement(user);

  const { items: notifItems, newItems } = useNotifications(assignments, announcements, messages, user);
  const { addToast, requestPushPermission } = useToasts();
  const hasRequestedPush = useRef(false);

  usePolling([refreshAssign, refreshAnn, refreshUsers, refreshCourses], 10000);

  useEffect(() => {
    if (user && !hasRequestedPush.current) {
      requestPushPermission();
      hasRequestedPush.current = true;
    }
  }, [user, requestPushPermission]);

  useEffect(() => {
    if (!user) return;
    newItems.forEach(item => {
      addToast({
        id: item.id,
        title: item.title,
        message: item.sub,
        type: item.kind === 'overdue' ? 'urgent' : item.kind === 'dueSoon' ? 'warning' : 'info',
        push: true
      });
    });
  }, [newItems, addToast, user]);

  const [modal, setModal] = useState({ type: null, mode: 'create', data: null });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const startedAt = Date.now();
      try {
        const sessionUser = await auth.getCurrentUser();
        if (!cancelled) setUser(sessionUser);
      } finally {
        const remaining = Math.max(0, 1500 - (Date.now() - startedAt));
        setTimeout(() => { if (!cancelled) setBooting(false); }, remaining);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const title = useMemo(() => {
    if (tab === 'calendar') return 'Campus Agenda';
    if (tab === 'reminders') return 'Academic Reminders';
    if (tab === 'documents') return 'Shared Repository';
    if (tab === 'users') return 'Account Management';
    if (tab === 'courses') return 'My Courses';
    return `Welcome, ${user?.username || 'Student'}`;
  }, [tab, user]);

  const renderTabContent = (activeTab) => {
    const content = (() => {
      if (activeTab === 'home') {
        if (user?.role === 'admin') return <CalendarView assignments={assignments} announcements={announcements} />;
        return (
          <Dashboard
            user={user}
            users={users}
            announcements={announcements}
            messages={messages}
            onSendMessage={handleSend}
            courses={courses}
            onNavigateToChat={(id) => {
              setSelectedChatUserId(id);
              navigateTab('messages');
            }}
          />
        );
      }
      if (activeTab === 'messages') return (
        <div className="flex flex-col h-full min-h-0">
          <MessagesView
            user={user}
            users={users}
            messages={messages}
            onSendMessage={handleSend}
            initialSelectedUserId={selectedChatUserId}
            onBack={() => {
              setSelectedChatUserId(null);
              navigateTab('home');
            }}
          />
        </div>
      );
      if (activeTab === 'reminders') return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">My Reminders</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand font-black text-xs">{assignments.length}</div>
          </div>
          <AssignmentList
            assignments={assignments}
            onEdit={(a) => setModal({ type: 'assignment', mode: 'edit', data: a })}
            onDelete={deleteAssign}
            onToggleComplete={handleToggleComplete}
          />
        </div>
      );
      if (activeTab === 'calendar') return <CalendarView assignments={assignments} announcements={announcements} />;
      if (activeTab === 'documents') return <DocumentsView user={user} documents={documents} onAdd={(d) => addDoc({ ...d, authorId: user.id })} onDelete={deleteDoc} courses={courses} />;
      if (activeTab === 'courses') return (
        <CoursesView
          courses={courses.filter(c => c.faculty_id === user.id)}
          users={users}
          onUpdate={updateCourse}
          onDelete={deleteCourse}
          onEnroll={handleEnroll}
          onUnenroll={handleUnenroll}
        />
      );
      if (activeTab === 'users' && user?.role === 'admin') return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Campus Directory</p>
            <button onClick={() => setModal({ type: 'account', mode: 'create' })} className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-black text-white shadow-lg shadow-brand/20" style={{ backgroundColor: colors.main }}><UserPlus size={16} /> New Account</button>
          </div>
          <div className="grid gap-4">
            {users.map(u => (
              <div key={u.id} className="group relative overflow-hidden rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-brand text-lg dark:bg-gray-900">{u.username[0].toUpperCase()}</div>
                    <div>
                      <p className="text-base font-black">{u.username}</p>
                      <p className="text-[10px] font-bold uppercase opacity-40">{u.role}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : u.role === 'faculty' ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'}`}>{u.role}</span>
                </div>

                {u.role === 'faculty' && (
                  <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-900">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-black uppercase text-gray-400">Assigned Courses</p>
                        <button
                        onClick={() => {
                          const name = prompt('Course Name:');
                          const code = prompt('Course Code:');
                          if (name && code) addCourse({ name, code, facultyId: u.id });
                        }}
                        className="text-[10px] font-black text-brand underline"
                      >+ Add Course</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {courses.filter(c => c.faculty_id === u.id).map(c => (
                        <span key={c.id} className="px-2 py-1 bg-gray-50 rounded-lg text-[10px] font-bold dark:bg-gray-900">{c.name}</span>
                      ))}
                      {!courses.find(c => c.faculty_id === u.id) && <p className="text-[10px] font-bold opacity-30 italic">No courses assigned</p>}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
      return null;
    })();

    const isDashboard = activeTab === 'home';
    const isMessages = activeTab === 'messages';
    return (
      <div className={`h-full ${isDashboard ? 'overflow-y-auto' : 'overflow-hidden flex flex-col'}`}>
        <div className={`flex-1 min-h-0 ${isDashboard || isMessages ? '' : 'overflow-y-auto scrollbar-hide pb-24'} ${isMessages ? 'flex flex-col h-full' : ''}`}>
          {content}
        </div>
      </div>
    );
  };

  if (!user) return <AuthGate booting={booting} onAuthed={setUser} logoUrl={logoUrl} backgroundUrl={backgroundUrl} />;

  const transitionClass = (isNext) => {
    if (!tabTransition || tabTransition.phase !== 'animate') {
      if (isNext) return 'translate-y-full blur-xl opacity-0 scale-95';
      return 'translate-y-0 blur-0 opacity-100 scale-100';
    }
    if (isNext) return 'translate-y-0 blur-0 opacity-100 scale-100';
    return '-translate-y-full blur-xl opacity-0 scale-110';
  };

  return (
    <div className="relative min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 font-outfit">
      <AppBackground imageUrl={backgroundUrl} opacity={0.05} />
      <div className="relative z-10">
        <AppHeader
          title={title}
          user={user}
          assignments={assignments}
          announcements={announcements}
          messages={messages}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isFullWidth={tab === 'messages'}
          onNavigateToChat={(id) => {
            setSelectedChatUserId(id);
            navigateTab('messages');
          }}
        />

        <Sidebar
          open={sidebarOpen}
          onToggle={() => setSidebarOpen(false)}
          activeTab={tab}
          user={user}
          onLogout={async () => { await auth.logout(); setUser(null); setSidebarOpen(false); }}
          onEditProfile={() => setModal({ type: 'profile' })}
          onSelectTab={(next) => {
            navigateTab(next);
            if (window.innerWidth < 1024) setSidebarOpen(false);
          }}
        />

        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-[64px]' : 'ml-0'}`}>
          <main className={`mx-auto h-[100dvh] w-full ${tab === 'messages' ? 'max-w-none px-0' : 'max-w-5xl px-4 md:px-6'} overflow-hidden`} style={{ paddingTop: chromePx.header }}>
            <div className="relative h-full overflow-hidden" onPointerDown={swipeHandlers.onPointerDown} onPointerMove={swipeHandlers.onPointerMove} onPointerUp={swipeHandlers.onPointerUp} onPointerCancel={swipeHandlers.onPointerCancel}>
              {tabTransition ? (
                <>
                  <div className={`absolute inset-0 will-change-transform transform-gpu transition-all duration-[800ms] ease-out ${transitionClass(false)}`}>
                    <div className={`h-full ${tab === 'messages' ? 'p-0' : 'py-2'}`}>{renderTabContent(tabTransition.from)}</div>
                  </div>
                  <div className={`absolute inset-0 will-change-transform transform-gpu transition-all duration-[800ms] ease-out ${transitionClass(true)}`}>
                    <div className={`h-full ${tab === 'messages' ? 'p-0' : 'py-2'}`}>{renderTabContent(tabTransition.to)}</div>
                  </div>
                </>
              ) : (
                <div className={`relative h-full ${tab === 'messages' ? 'p-0' : 'py-2'}`}>
                  <div className="h-full">{renderTabContent(tab)}</div>
                </div>
              )}
            </div>
          </main>
        </div>

        {(!isStudent && (tab === 'home' || tab === 'calendar' || tab === 'reminders' || tab === 'courses' || tab === 'documents')) && (
          <button
            onClick={() => {
              if (tab === 'documents') {
                setModal({ type: 'document', mode: 'create' });
              } else if (tab === 'courses') {
                setModal({ type: 'course', mode: 'create' });
              } else {
                setModal({ type: tab === 'reminders' ? 'assignment' : 'announcement', mode: 'create' });
              }
            }}
            className="fixed bottom-10 right-8 z-30 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition hover:scale-110 active:scale-95"
            style={{ backgroundColor: colors.main }}
          >
            {tab === 'documents' || tab === 'courses' ? <PlusCircle size={28} /> : tab === 'reminders' ? <PlusCircle size={28} /> : <Megaphone size={24} />}
          </button>
        )}

        <Modal
          isOpen={!!modal.type}
          onClose={() => setModal({ type: null })}
          title={
            modal.type === 'announcement' ? 'Broadcast Update' :
            modal.type === 'profile' ? 'Edit Profile' :
            modal.type === 'assignment' ? (modal.mode === 'edit' ? 'Edit Reminder' : 'New Reminder') :
            modal.type === 'course' ? 'New Course' :
            modal.type === 'account' ? 'Create Account' :
            modal.type === 'document' ? 'Upload to Repository' : ''
          }
        >
          {modal.type === 'announcement' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase text-gray-400">Broadcast Type</p>
                {user.role === 'admin' && (
                  <select id="ann-type" className="text-[10px] font-black uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-lg dark:bg-gray-900">
                    <option value="Announcement">Announcement</option>
                    <option value="Event">Event</option>
                  </select>
                )}
              </div>

              {user.role === 'faculty' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Target Audience</label>
                  <select id="ann-course" className="w-full rounded-2xl border border-gray-100 p-3 text-sm font-bold outline-none dark:border-gray-800 dark:bg-gray-900">
                    <option value="">All Students (General)</option>
                    {courses.filter(c => c.faculty_id === user.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              )}

              <input id="ann-title" className="w-full rounded-2xl border border-gray-100 p-3 outline-none dark:border-gray-800 dark:bg-gray-900 font-bold" placeholder="Headline" />

              <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-3xl group transition-colors hover:border-brand/20">
                <div className="h-24 w-full overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900 flex items-center justify-center relative">
                  <img id="ann-image-preview" className="absolute inset-0 h-full w-full object-cover hidden" />
                  <div id="ann-image-placeholder" className="flex flex-col items-center text-gray-400 gap-1">
                    <Camera size={24} />
                    <span className="text-[10px] font-black uppercase">Cover Photo</span>
                  </div>
                </div>
                <input
                  type="file"
                  id="ann-image-file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const img = document.getElementById('ann-image-preview');
                        img.src = ev.target.result;
                        img.classList.remove('hidden');
                        document.getElementById('ann-image-placeholder').classList.add('hidden');
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <button
                  onClick={() => document.getElementById('ann-image-file').click()}
                  className="text-[10px] font-black text-brand underline uppercase"
                >Choose File</button>
              </div>

              <textarea id="ann-content" className="w-full rounded-2xl border border-gray-100 p-3 outline-none dark:border-gray-800 dark:bg-gray-900 h-32 text-sm" placeholder="Message content..." />

              <button onClick={async () => {
                const title = document.getElementById('ann-title').value;
                const content = document.getElementById('ann-content').value;
                const type = document.getElementById('ann-type')?.value || 'Announcement';
                const targetCourseId = document.getElementById('ann-course')?.value || null;
                const imageFile = document.getElementById('ann-image-file').files[0];

                if (title && content) {
                  try {
                    await addAnn({ title, content, type, authorId: user.id, targetCourseId });
                    if (imageFile) {
                      await db.uploadAnnouncementPhoto(imageFile, title);
                    }
                    setModal({ type: null });
                    addToast({ title: 'Success', message: 'Broadcast sent successfully', type: 'success', push: false });
                  } catch (e) {
                    addToast({ title: 'Error', message: 'Failed to send broadcast', type: 'warning', push: false });
                  }
                }
              }} className="w-full rounded-2xl py-3 font-black text-white shadow-lg" style={{ backgroundColor: colors.main }}>Send Broadcast</button>
            </div>
          )}

          {modal.type === 'profile' && (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                  <div className="h-28 w-28 overflow-hidden rounded-[40px] border-4 border-gray-50 bg-gray-50 dark:border-gray-900 dark:bg-gray-900 shadow-inner">
                    <img src={db.profileImgUrl(user?.username)} className="h-full w-full object-cover" onError={e => e.target.style.display = 'none'} />
                  </div>
                  <label className="absolute -bottom-2 -right-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-2xl bg-white shadow-xl hover:bg-gray-50 dark:bg-gray-800 transition-all hover:scale-110 border border-gray-100 dark:border-gray-700">
                    <Camera size={18} className="text-brand" />
                    <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        await auth.uploadProfilePhoto(file, user.username);
                        setUser({ ...user });
                      }
                    }} />
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400">Username</label>
                    <input id="edit-profile-username" defaultValue={user?.username} className="w-full rounded-2xl border border-gray-100 p-3 text-sm font-bold outline-none dark:border-gray-800 dark:bg-gray-900" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400">Full Name</label>
                    <input id="edit-profile-fullname" defaultValue={user?.full_name} className="w-full rounded-2xl border border-gray-100 p-3 text-sm font-bold outline-none dark:border-gray-800 dark:bg-gray-900" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">New Password</label>
                  <input id="edit-profile-password" type="password" placeholder="••••••••" className="w-full rounded-2xl border border-gray-100 p-3 text-sm font-bold outline-none dark:border-gray-800 dark:bg-gray-900" />
                </div>
                <button onClick={async () => {
                  const username = document.getElementById('edit-profile-username').value;
                  const full_name = document.getElementById('edit-profile-fullname').value;
                  const password = document.getElementById('edit-profile-password').value;
                  try {
                    const updated = await auth.updateProfile(user.id, { ...user, username, full_name, password });
                    setUser(updated);
                    setModal({ type: null });
                    addToast({ title: 'Success', message: 'Profile updated successfully', type: 'success', push: false });
                  } catch (e) {
                    addToast({ title: 'Error', message: 'Failed to update profile', type: 'warning', push: false });
                  }
                }} className="w-full rounded-2xl py-4 font-black text-white shadow-lg" style={{ backgroundColor: colors.main }}>Save Profile</button>
              </div>
            </div>
          )}

          {modal.type === 'assignment' && (
            <AssignmentWizard
              initialValues={modal.data} mode={modal.mode} onCancel={() => setModal({ type: null })}
              onSubmit={async (d) => {
                try {
                  if (modal.mode === 'edit') await updateAssign(modal.data.id, d);
                  else await addAssign({ ...d, user_id: user.id });
                  setModal({ type: null });
                  addToast({ title: 'Success', message: 'Reminder saved successfully', type: 'success', push: false });
                } catch (e) {
                  addToast({ title: 'Error', message: 'Failed to save reminder', type: 'warning', push: false });
                }
              }}
            />
          )}

          {modal.type === 'course' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Course Name</label>
                <input id="new-course-name" className="w-full rounded-2xl border border-gray-100 p-3 outline-none dark:border-gray-800 dark:bg-gray-900 font-bold" placeholder="e.g. Data Structures" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Course Code</label>
                <input id="new-course-code" className="w-full rounded-2xl border border-gray-100 p-3 outline-none dark:border-gray-800 dark:bg-gray-900 font-bold" placeholder="CS201" />
              </div>
              <button onClick={async () => {
                const name = document.getElementById('new-course-name').value;
                const code = document.getElementById('new-course-code').value;
                if (name && code) {
                  try {
                    await addCourse({ name, code, facultyId: user.id });
                    setModal({ type: null });
                    addToast({ title: 'Success', message: 'Course created successfully', type: 'success', push: false });
                  } catch (e) {
                    addToast({ title: 'Error', message: 'Failed to create course', type: 'warning', push: false });
                  }
                }
              }} className="w-full rounded-2xl py-3 font-black text-white shadow-lg" style={{ backgroundColor: colors.main }}>Create Course</button>
            </div>
          )}

          {modal.type === 'account' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Username</label>
                <input id="new-acc-username" className="w-full rounded-2xl border border-gray-100 p-3 text-sm font-bold dark:border-gray-800 dark:bg-gray-900" placeholder="user_name" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Full Name</label>
                <input id="new-acc-fullname" className="w-full rounded-2xl border border-gray-100 p-3 text-sm font-bold dark:border-gray-800 dark:bg-gray-900" placeholder="John Doe" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Password</label>
                <input id="new-acc-password" type="password" className="w-full rounded-2xl border border-gray-100 p-3 text-sm font-bold dark:border-gray-800 dark:bg-gray-900" placeholder="••••••••" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Role</label>
                <select id="new-acc-role" className="w-full rounded-2xl border border-gray-100 p-3 text-sm font-bold dark:border-gray-800 dark:bg-gray-900">
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button onClick={async () => {
                const username = document.getElementById('new-acc-username').value;
                const full_name = document.getElementById('new-acc-fullname').value;
                const password = document.getElementById('new-acc-password').value;
                const role = document.getElementById('new-acc-role').value;
                if (username && password) {
                  try {
                    await createUser({ username, full_name, password, role });
                    setModal({ type: null });
                    addToast({ title: 'Success', message: 'Account created successfully', type: 'success', push: false });
                  } catch (e) {
                    addToast({ title: 'Error', message: e.message || 'Failed to create account', type: 'warning', push: false });
                  }
                }
              }} className="w-full rounded-2xl py-3 font-black text-white shadow-lg" style={{ backgroundColor: colors.main }}>Create Account</button>
            </div>
          )}

          {modal.type === 'document' && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">File Name</label>
                <input id="doc-name" className="w-full rounded-2xl border border-gray-100 p-3 text-sm font-bold dark:border-gray-800 dark:bg-gray-900" placeholder="e.g. Lab_Report.pdf" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Folder</label>
                <select id="doc-folder" className="w-full rounded-2xl border border-gray-100 p-3 text-sm font-bold dark:border-gray-800 dark:bg-gray-900">
                  {user.role === 'admin' && (
                    <>
                      <option value="Announcements">Announcements</option>
                      <option value="Events">Events</option>
                    </>
                  )}
                  {user.role === 'faculty' && courses.filter(c => c.faculty_id === user.id).map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  <option value="Personal Folder">Personal Folder</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Select File</label>
                <input id="doc-file" type="file" className="w-full rounded-2xl border border-gray-100 p-2 text-sm font-bold dark:border-gray-800 dark:bg-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-gray-100 file:text-brand file:font-black hover:file:bg-gray-200 cursor-pointer" />
              </div>
              <button onClick={async () => {
                const name = document.getElementById('doc-name').value;
                const folderName = document.getElementById('doc-folder').value;
                const file = document.getElementById('doc-file').files[0];

                if (name && folderName && file) {
                  try {
                    const uploadResult = await db.uploadDocumentFile(file, name);
                    const sizeInMB = (uploadResult.size / (1024 * 1024)).toFixed(2);

                    await addDoc({
                      name: uploadResult.filename,
                      folderName,
                      size: `${sizeInMB} MB`,
                      type: uploadResult.mimetype,
                      authorId: user.id
                    });

                    setModal({ type: null });
                    addToast({ title: 'Success', message: 'Document uploaded successfully', type: 'success', push: false });
                  } catch (e) {
                    addToast({ title: 'Error', message: 'Failed to upload document', type: 'warning', push: false });
                  }
                } else if (!file) {
                  addToast({ title: 'Error', message: 'Please select a file', type: 'warning', push: false });
                }
              }} className="w-full rounded-2xl py-3 font-black text-white shadow-lg" style={{ backgroundColor: colors.main }}>Add to Repository</button>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default App;
