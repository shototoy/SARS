import React, { useState } from 'react';
import { Megaphone, MessageSquare, ChevronRight, User, Search, X, Calendar, Clock } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { profileImgUrl, announcementImgUrl } from '../lib/db';
import dayjs from 'dayjs';

export default function Dashboard({ user, users = [], announcements = [], messages = [], courses = [], onSendMessage, onNavigateToChat }) {
  const colors = useTheme();
  const isStudent = user?.role === 'student';
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [viewingCourse, setViewingCourse] = useState(null);

  // Calculate latest messages per conversation
  const latestMessages = React.useMemo(() => {
    const map = {};
    messages.forEach(m => {
      const otherId = m.sender_id == user.id ? m.receiver_id : m.sender_id;
      if (!map[otherId] || new Date(m.timestamp) > new Date(map[otherId].timestamp)) {
        map[otherId] = {
          ...m,
          otherUser: users.find(u => u.id == otherId)
        };
      }
    });
    return Object.values(map).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [messages, user, users]);

  const getAnnImg = (ann) => ann ? announcementImgUrl(ann.title) : '';

  const courseAnnouncements = announcements.filter(a => viewingCourse && a.target_course_id === viewingCourse.id);

  return (
    <div className="flex h-full flex-col gap-6 py-1 overflow-auto scrollbar-hide relative pb-32">
      {/* Updates Section (Admin/General) */}
      <section className="shrink-0 space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Updates</p>
          <button className="text-[10px] font-bold text-gray-400 hover:text-gray-600">View All</button>
        </div>
        
        <div className={`flex gap-3 overflow-x-auto pb-1 scrollbar-hide ${!isStudent ? 'snap-x snap-mandatory -mx-1' : ''}`}>
          {announcements.filter(a => !a.target_course_id).map(ann => {
            const imageUrl = getAnnImg(ann);
            return (
              <div 
                key={ann.id} 
                className={`overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950 transition-all ${
                  isStudent ? 'min-w-[240px] max-w-[240px]' : 'min-w-full snap-center'
                }`}
              >
                {!isStudent && (
                  <>
                    <div className="relative h-36 w-full overflow-hidden bg-gray-50 announcement-image-container">
                      <img 
                        src={imageUrl} 
                        alt="" 
                        className="h-full w-full object-cover" 
                        onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
                      <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
                        <p className="text-sm font-black text-white line-clamp-1 leading-tight">{ann.title}</p>
                      </div>
                    </div>
                    <div className="px-4 py-1.5 flex items-center justify-end">
                      <button 
                        onClick={() => setSelectedAnnouncement(ann)}
                        className="text-[9px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity" 
                        style={{ color: colors.main }}
                      >
                        Read More
                      </button>
                    </div>
                  </>
                )}

                {isStudent && (
                  <div className="p-5">
                    <p className="text-xs font-black text-gray-900 dark:text-gray-100 line-clamp-1">{ann.title}</p>
                    <p className="mt-1 text-[11px] font-bold text-gray-500 line-clamp-1">{ann.content}</p>
                    <button 
                      onClick={() => setSelectedAnnouncement(ann)}
                      className="mt-3 text-[10px] font-black uppercase tracking-widest hover:opacity-70 transition-opacity" 
                      style={{ color: colors.main }}
                    >
                      Read More
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {!announcements.filter(a => !a.target_course_id).length && <div className="py-4 px-2 text-[11px] font-bold opacity-30 italic">No general updates today</div>}
        </div>
      </section>

      {/* Courses Section (Small Icon-like Cards) */}
      <section className="shrink-0 space-y-2">
        <div className="flex items-center px-1">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">My Courses</p>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          {courses.map(course => (
            <button 
              key={course.id} 
              onClick={() => setViewingCourse(course)}
              className="group flex aspect-square h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm transition-all hover:scale-110 active:scale-95 dark:bg-gray-900"
            >
              <span className="text-[10px] font-black text-brand">{course.code || '??'}</span>
            </button>
          ))}
          {!courses.length && <div className="py-2 px-2 text-[11px] font-bold opacity-30 italic">No courses</div>}
        </div>
      </section>

      {/* Messages Section */}
      <section className="flex flex-1 min-h-[400px] flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">Direct Messages</p>
          <div className="h-6 w-6 items-center justify-center rounded-lg bg-brand/10 text-brand font-black text-[10px] flex">
            {latestMessages.length}
          </div>
        </div>

        <div className="flex-1 overflow-auto rounded-[32px] border border-gray-100 bg-white p-2 shadow-sm dark:border-gray-800 dark:bg-gray-950">
          <div className="divide-y divide-gray-50 dark:divide-gray-900">
            {latestMessages.map(m => {
              const otherUser = m.otherUser;
              const isMe = m.sender_id === user.id;

              return (
                <button 
                  key={m.id} 
                  onClick={() => onNavigateToChat(otherUser?.id)}
                  className="flex w-full items-center gap-4 p-4 transition hover:bg-gray-50 dark:hover:bg-gray-900 text-left first:rounded-t-[28px] last:rounded-b-[28px]"
                >
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900">
                      <img src={profileImgUrl(otherUser?.username)} className="h-full w-full object-cover" onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />
                      <div className="text-brand font-black text-lg uppercase hidden items-center justify-center h-full w-full">{otherUser?.username?.[0] || '?'}</div>
                    </div>
                    <div className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 dark:border-gray-950" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-black text-gray-900 dark:text-gray-100">{otherUser?.full_name || otherUser?.username || 'User'}</p>
                      <span className="text-[10px] font-bold text-gray-400">{dayjs(m.timestamp).format('h:mm A')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="truncate text-xs font-bold text-gray-500">{isMe ? 'You: ' : ''}{m.content}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </button>
              );
            })}
            {!latestMessages.length && <div className="py-20 flex flex-col items-center justify-center gap-2 opacity-20 italic">
               <MessageSquare size={36} />
               <p className="text-[11px] font-bold">No messages in inbox</p>
            </div>}
          </div>
        </div>
      </section>

      {/* COURSE ANNOUNCEMENTS MODAL */}
      {viewingCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setViewingCourse(null)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-[40px] bg-white shadow-2xl dark:bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-50 p-6 dark:border-gray-900">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-brand">{viewingCourse.code}</p>
                <h2 className="text-xl font-black">{viewingCourse.name}</h2>
              </div>
              <button onClick={() => setViewingCourse(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-900"><X size={20} /></button>
            </div>
            <div className="max-h-[60vh] overflow-auto p-4 scrollbar-hide space-y-3">
              {courseAnnouncements.map(ann => (
                <div key={ann.id} className="rounded-3xl border border-gray-100 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{dayjs(ann.date).format('MMM D, YYYY')}</p>
                  <p className="text-base font-black mb-2">{ann.title}</p>
                  <p className="text-sm font-bold text-gray-500 leading-relaxed mb-4">{ann.content}</p>
                  <button 
                    onClick={() => { setSelectedAnnouncement(ann); setViewingCourse(null); }}
                    className="text-[10px] font-black uppercase tracking-widest" 
                    style={{ color: colors.main }}
                  >Read Full Post</button>
                </div>
              ))}
              {!courseAnnouncements.length && (
                <div className="py-12 text-center opacity-30 italic">
                  <Megaphone className="mx-auto mb-2" size={32} />
                  <p className="text-xs font-bold">No announcements for this course yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* READ MORE MODAL (GENERAL) */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedAnnouncement(null)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl dark:bg-gray-950">
            <div className="relative w-full bg-gray-100 ann-modal-hero" style={{ height: 224 }}>
              <img 
                src={getAnnImg(selectedAnnouncement)} 
                alt="" 
                className="h-full w-full object-cover"
                onError={(e) => { 
                  const hero = e.target.closest('.ann-modal-hero');
                  if (hero) { 
                    hero.style.height = '0'; 
                    hero.style.overflow = 'hidden'; 
                    const fallback = hero.parentElement.querySelector('.ann-modal-fallback-title');
                    if (fallback) fallback.style.display = 'block';
                  }
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <button 
                onClick={() => setSelectedAnnouncement(null)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-colors"
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-6 left-8 right-8">
                <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md mb-2 inline-block">
                  {selectedAnnouncement.type || 'Announcement'}
                </span>
                <h2 className="text-2xl font-black text-white leading-tight">{selectedAnnouncement.title}</h2>
              </div>
            </div>

            <div className="p-8">
              <div className="ann-modal-fallback-title hidden mb-4">
                <span className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white mb-2 inline-block" style={{ backgroundColor: colors.main }}>
                  {selectedAnnouncement.type || 'Announcement'}
                </span>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-black leading-tight">{selectedAnnouncement.title}</h2>
                  <button onClick={() => setSelectedAnnouncement(null)} className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 ml-4"><X size={20} /></button>
                </div>
              </div>
              <div className="mb-6 flex items-center gap-6 border-b border-gray-50 pb-6 dark:border-gray-900">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={14} />
                  <span className="text-[11px] font-bold">{dayjs(selectedAnnouncement.date).format('MMMM D, YYYY')}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={14} />
                  <span className="text-[11px] font-bold">{dayjs(selectedAnnouncement.date).format('h:mm A')}</span>
                </div>
              </div>
              <div className="max-h-[30vh] overflow-auto pr-2 scrollbar-hide">
                <p className="text-sm font-bold leading-relaxed text-gray-600 dark:text-gray-400">{selectedAnnouncement.content}</p>
              </div>
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setSelectedAnnouncement(null)}
                  className="rounded-2xl px-8 py-3 text-xs font-black uppercase tracking-widest text-white transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: colors.main }}
                >Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
