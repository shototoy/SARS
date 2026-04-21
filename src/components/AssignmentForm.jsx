import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Plus, Save, X } from 'lucide-react';

const inputClassName =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500';

export default function AssignmentForm({ onSubmit, defaultValues, isEditing, onCancel }) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const reminderEnabled = useWatch({ control, name: 'reminderEnabled' });

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        await onSubmit(data);
        reset({ priority: 'Medium', status: 'Pending', reminderEnabled: false, remindBeforeMinutes: 1440 });
      })}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-800">Title</label>
          <input
            {...register('title', { required: true })}
            className={inputClassName}
            placeholder="e.g., Math Homework #3"
          />
          {errors.title ? <p className="mt-1 text-xs text-red-600">Title is required.</p> : null}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">Subject</label>
          <input {...register('subject')} className={inputClassName} placeholder="e.g., Algebra" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">Deadline</label>
          <input
            type="datetime-local"
            {...register('deadline', { required: true })}
            className={inputClassName}
          />
          {errors.deadline ? <p className="mt-1 text-xs text-red-600">Deadline is required.</p> : null}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">Priority</label>
          <select {...register('priority', { required: true })} className={inputClassName}>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800">Status</label>
          <select {...register('status', { required: true })} className={inputClassName}>
            <option value="Pending">Pending</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-800">Description</label>
          <textarea
            {...register('description')}
            className={`${inputClassName} min-h-[80px]`}
            placeholder="Optional details..."
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-indigo-50/40 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Reminder</p>
            <p className="text-xs text-gray-600">Schedule a local reminder before the deadline (native builds).</p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-800">
            <input type="checkbox" {...register('reminderEnabled')} className="h-4 w-4 accent-indigo-600" />
            Enabled
          </label>
        </div>
        <div className="mt-3">
          <label className="block text-xs font-semibold text-gray-700">Remind me</label>
          <select
            {...register('remindBeforeMinutes', { valueAsNumber: true })}
            className={`${inputClassName} ${reminderEnabled ? '' : 'opacity-60'}`}
            disabled={!reminderEnabled}
          >
            <option value={60}>1 hour before</option>
            <option value={180}>3 hours before</option>
            <option value={720}>12 hours before</option>
            <option value={1440}>1 day before</option>
            <option value={2880}>2 days before</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          {isEditing ? <Save size={18} /> : <Plus size={18} />}
          {isEditing ? 'Save Changes' : 'Add Assignment'}
        </button>
        {isEditing ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
          >
            <X size={18} /> Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
