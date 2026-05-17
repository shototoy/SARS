import React from 'react';
import { Calendar, CheckCircle2, Clock, Trash2, Edit3, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';

export default function AssignmentList({ assignments, onEdit, onDelete, onToggleComplete }) {
  if (!assignments.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
        <div className="p-5 rounded-full bg-gray-50 dark:bg-gray-900 mb-4">
          <CheckCircle2 size={48} />
        </div>
        <p className="text-lg font-black italic">No active tasks</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {assignments.map(a => {
        const isOverdue = a.deadline && dayjs(a.deadline).isBefore(dayjs()) && a.status !== 'Completed';
        const isCompleted = a.status === 'Completed';

        return (
          <div key={a.id} className="group relative flex flex-col gap-3 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                    a.priority === 'High' ? 'bg-red-50 text-red-600' : 
                    a.priority === 'Medium' ? 'bg-orange-50 text-orange-600' : 
                    'bg-blue-50 text-blue-600'
                  }`}>
                    {a.priority} Priority
                  </span>
                  {isOverdue && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-100 text-red-700 text-[9px] font-black uppercase animate-pulse">
                      <AlertCircle size={10} /> Overdue
                    </span>
                  )}
                </div>
                <h3 className={`truncate text-base font-black ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                  {a.title}
                </h3>
                <p className="mt-1 text-xs font-semibold text-gray-500 line-clamp-2">{a.description}</p>
              </div>
              <button 
                onClick={() => onToggleComplete(a)}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200 ${
                  isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 dark:bg-gray-900'
                }`}
              >
                <CheckCircle2 size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50 dark:border-gray-900">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                  <Calendar size={14} />
                  <span>{a.deadline ? dayjs(a.deadline).format('MMM D, YYYY') : 'No deadline'}</span>
                </div>
                {a.subject && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400">
                    <Clock size={14} />
                    <span>{a.subject}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1">
                {onEdit && (
                  <button onClick={() => onEdit(a)} className="p-2 text-gray-400 hover:text-brand transition-colors"><Edit3 size={16} /></button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(a.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
