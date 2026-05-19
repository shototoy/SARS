import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Save, AlertCircle } from 'lucide-react';
import { useTheme } from '../ThemeContext';

const inputCls = 'w-full rounded-2xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-sm font-semibold outline-none focus:ring-2 dark:border-gray-800 dark:bg-gray-900/50 dark:text-gray-100';

export default function AssignmentWizard({ initialValues, mode, onCancel, onSubmit }) {
  const colors = useTheme();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialValues || { priority: 'Medium', status: 'Pending' }
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black">{mode === 'edit' ? 'Edit Task' : 'New Assignment'}</h2>
          <p className="text-xs font-bold text-gray-400">Fill in the details for the academic task</p>
        </div>
        <button onClick={onCancel} className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-gray-900"><X size={20} /></button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-auto pb-6">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Task Title</label>
          <input {...register('title', { required: true })} className={inputCls} placeholder="e.g. Calculus II Problem Set" />
          {errors.title && <p className="text-[10px] font-bold text-red-500 ml-1">Title is required</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Subject</label>
            <input {...register('subject')} className={inputCls} placeholder="e.g. Mathematics" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Priority</label>
            <select {...register('priority')} className={inputCls}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Deadline</label>
          <input type="datetime-local" {...register('deadline')} className={inputCls} />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Description</label>
          <textarea {...register('description')} className={`${inputCls} min-h-[100px] resize-none`} placeholder="Additional instructions..." />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-black text-white shadow-xl transition hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: colors.main }}
          >
            <Save size={18} />
            {mode === 'edit' ? 'Update Task' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
}
