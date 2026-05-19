import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, UserPlus, X, BookOpen, Search } from 'lucide-react';
import * as db from '../lib/db';
import { useTheme } from '../ThemeContext';

export default function CoursesView({ courses, users, onAdd, onUpdate, onDelete, onEnroll, onUnenroll }) {
  const colors = useTheme();
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [search, setSearch] = useState('');

  const students = users.filter(u => u.role === 'student');

  useEffect(() => {
    if (editingCourse) {
      db.getCourseDetails(editingCourse.id).then(setCourseDetails);
    } else {
      setCourseDetails(null);
    }
  }, [editingCourse]);

  const filteredStudents = students.filter(s =>
    s.username.toLowerCase().includes(search.toLowerCase()) &&
    !courseDetails?.students?.find(cs => cs.id === s.id)
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">My Assigned Courses</p>
        <div className="h-8 w-8 items-center justify-center rounded-lg bg-brand/10 text-brand font-black text-xs flex">{courses.length}</div>
      </div>

      <div className="grid gap-4">
        {courses.map(course => (
          <div key={course.id} className="group relative overflow-hidden rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-brand dark:bg-gray-900">
                  <BookOpen size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black">{course.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{course.code}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingCourse(course)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition hover:bg-brand/10 hover:text-brand dark:bg-gray-900"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Delete ${course.name}?`)) onDelete(course.id);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 transition hover:bg-red-50 hover:text-red-500 dark:bg-gray-900"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {!courses.length && (
          <div className="py-20 text-center opacity-20 italic">
            <BookOpen className="mx-auto mb-2" size={48} />
            <p className="font-bold text-sm">No courses found</p>
          </div>
        )}
      </div>

      {editingCourse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 lg:p-12">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setEditingCourse(null)} />
          <div className="relative flex flex-col w-full max-h-full max-w-4xl overflow-hidden rounded-[40px] bg-white shadow-2xl dark:bg-gray-950">
            <div className="flex items-center justify-between border-b border-gray-50 p-4 md:p-6 dark:border-gray-900 shrink-0">
              <h2 className="text-xl font-black">Manage Course</h2>
              <button onClick={() => setEditingCourse(null)} className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-900"><X size={20} /></button>
            </div>

            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-50 dark:divide-gray-900 h-full">
                <div className="p-6 md:p-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400">Course Name</label>
                      <input
                        defaultValue={editingCourse.name}
                        id="edit-course-name"
                        className="w-full rounded-2xl border border-gray-100 p-3 text-sm font-bold outline-none dark:border-gray-800 dark:bg-gray-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-gray-400">Course Code</label>
                      <input
                        defaultValue={editingCourse.code}
                        id="edit-course-code"
                        className="w-full rounded-2xl border border-gray-100 p-3 text-sm font-bold outline-none dark:border-gray-800 dark:bg-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-6 md:p-8 space-y-4 flex flex-col min-h-0">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Enrolled Students ({courseDetails?.students?.length || 0})</p>

                    <div className="mb-3 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        placeholder="Search students..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full rounded-xl border border-gray-100 py-2 pl-9 pr-4 text-xs font-bold outline-none dark:border-gray-800 dark:bg-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto pr-2 space-y-2 scrollbar-hide">
                    {courseDetails?.students?.map(s => (
                      <div key={s.id} className="flex items-center justify-between rounded-xl bg-gray-50 p-2 dark:bg-gray-900">
                        <span className="text-xs font-black">{s.username}</span>
                        <button
                          onClick={async () => {
                            await onUnenroll(editingCourse.id, s.id);
                            const updated = await db.getCourseDetails(editingCourse.id);
                            setCourseDetails(updated);
                          }}
                          className="text-red-500 hover:opacity-70 transition-opacity"
                        ><X size={14} /></button>
                      </div>
                    ))}

                    {filteredStudents.length > 0 && (
                      <div className="pt-2 border-t border-gray-50 dark:border-gray-900 mt-2">
                        <p className="text-[9px] font-black uppercase text-gray-300 mb-2">Available to Enroll</p>
                        {filteredStudents.map(s => (
                          <div key={s.id} className="flex items-center justify-between rounded-xl p-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                            <span className="text-xs font-bold opacity-60">{s.username}</span>
                            <button
                              onClick={async () => {
                                await onEnroll(editingCourse.id, s.id);
                                const updated = await db.getCourseDetails(editingCourse.id);
                                setCourseDetails(updated);
                              }}
                              className="text-brand hover:opacity-70 transition-opacity"
                            ><UserPlus size={14} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-50 dark:border-gray-900 shrink-0">
              <button
                onClick={() => {
                  const name = document.getElementById('edit-course-name').value;
                  const code = document.getElementById('edit-course-code').value;
                  onUpdate(editingCourse.id, { name, code });
                  setEditingCourse(null);
                }}
                className="w-full rounded-2xl py-4 font-black text-white shadow-lg shadow-brand/20 transition hover:opacity-90 active:scale-[0.99]"
                style={{ backgroundColor: colors.main }}
              >Update Course</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
