import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { ArrowLeft, ArrowRight, FileText, Save, Sparkles, X } from 'lucide-react';

const inputCls = 'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100';

const STEPS = [
  { short: 'Details', title: 'Assignment details', icon: FileText, hint: 'Give it a title and subject.' },
  { short: 'Finish', title: 'Deadline & priority', icon: Sparkles, hint: 'Pick a due date and priority.' }
];

export default function AssignmentWizard({ initialValues, mode, onCancel, onSubmit }) {
  const [step, setStep] = useState(0);

  const defaultValues = useMemo(() => ({
    title: '', subject: '', deadline: '', priority: 'Medium', description: '',
    status: 'Pending', ...initialValues,
    deadline: initialValues?.deadline ? dayjs(initialValues.deadline).format('YYYY-MM-DDTHH:mm') : ''
  }), [initialValues]);

  const { register, handleSubmit, getValues, trigger, formState: { errors, isSubmitting } } = useForm({ defaultValues });

  const goNext = async () => {
    if (step === 0) {
      if (!String(getValues('title') || '').trim()) return trigger('title');
      return setStep(1);
    }
    if (await trigger(['deadline', 'priority'])) setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  return (
    <div className="h-full space-y-3">
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
        <div className="bg-gradient-to-br from-blue-800 to-indigo-700 px-5 py-4 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg font-extrabold">{mode === 'edit' ? 'Edit' : 'Add'} assignment</p>
              <p className="mt-1 text-sm font-semibold text-white/90">{STEPS[step].title}</p>
            </div>
            <button onClick={onCancel} className="p-2 rounded-2xl bg-white/15 hover:bg-white/20 transition"><X size={18} /></button>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex gap-2">{STEPS.map((_, i) => <div key={i} className={`h-2 flex-1 rounded-full ${i <= step ? 'bg-white/90' : 'bg-white/25'}`} />)}</div>
            <div className="flex justify-between text-[11px] font-extrabold uppercase opacity-90"><span>{STEPS[step].short}</span><span>Step {step + 1} / 2</span></div>
          </div>
        </div>

        <form onSubmit={e => e.preventDefault()} className="p-5">
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/30">
            <div className="p-2 rounded-2xl bg-blue-50 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">{React.createElement(STEPS[step].icon, { size: 18 })}</div>
            <div><p className="text-sm font-extrabold">{STEPS[step].short}</p><p className="text-xs font-semibold opacity-60">{STEPS[step].hint}</p></div>
          </div>

          <div className="mt-5 space-y-4">
            {step === 0 ? <>
              <div><label className="block text-sm font-extrabold mb-1">Title</label><input {...register('title', { required: true })} className={`${inputCls} ${errors.title ? 'ring-2 ring-red-600' : ''}`} placeholder="e.g., Math Homework" autoFocus /></div>
              <div><label className="block text-sm font-extrabold mb-1">Subject</label><input {...register('subject')} className={inputCls} placeholder="e.g., Algebra" /></div>
            </> : <>
              <div><label className="block text-sm font-extrabold mb-1">Deadline</label><input type="datetime-local" {...register('deadline', { required: true })} className={`${inputCls} ${errors.deadline ? 'ring-2 ring-red-600' : ''}`} autoFocus /></div>
              <div><label className="block text-sm font-extrabold mb-1">Priority</label><select {...register('priority')} className={inputCls}><option>High</option><option>Medium</option><option>Low</option></select></div>
              <div><label className="block text-sm font-extrabold mb-1">Description</label><textarea {...register('description')} className={`${inputCls} min-h-[80px]`} placeholder="Optional details..." /></div>
            </>}
          </div>

          <div className="mt-6 -mx-5 -mb-5 border-t border-gray-100 bg-white/95 p-4 flex justify-between gap-3 dark:border-gray-800 dark:bg-gray-950/80">
            <button type="button" onClick={() => setStep(0)} disabled={step === 0} className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-extrabold disabled:opacity-30 dark:border-gray-800 dark:bg-gray-950"><ArrowLeft size={18} />Back</button>
            {step === 0 ? (
              <button type="button" onClick={goNext} className="inline-flex items-center gap-2 rounded-2xl bg-blue-800 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-blue-900 transition">Continue<ArrowRight size={18} /></button>
            ) : (
              <button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="inline-flex items-center gap-2 rounded-2xl bg-blue-800 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-blue-900 transition disabled:opacity-50"><Save size={18} />Save</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
