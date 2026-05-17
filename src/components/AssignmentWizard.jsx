import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  Save,
  Sparkles,
  X,
} from 'lucide-react';

const inputClassName =
  'w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100';

function StepProgress({ step, steps, onGoTo }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <button
          key={i}
            type="button"
            onClick={() => onGoTo(i)}
            disabled={i > step}
            title={`${s.short} (Step ${i + 1})`}
            className={`h-2 flex-1 rounded-full transition ${
              i <= step ? 'bg-white/90' : 'bg-white/25'
            } disabled:cursor-not-allowed`}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between text-[11px] font-extrabold text-white/90">
        <span>{steps[step].short}</span>
        <span>
          Step {step + 1} / {steps.length}
        </span>
      </div>
    </div>
  );
}

export default function AssignmentWizard({ initialValues, mode, onCancel, onSubmit }) {
  const [step, setStep] = useState(0);

  const normalizedDeadline = useMemo(() => {
    if (!initialValues?.deadline) return '';
    const d = dayjs(initialValues.deadline);
    if (!d.isValid()) return '';
    return d.format('YYYY-MM-DDTHH:mm');
  }, [initialValues?.deadline]);

  const defaultValues = useMemo(
    () => ({
      title: '',
      subject: '',
      deadline: '',
      priority: 'Medium',
      description: '',
      reminderEnabled: false,
      remindBeforeMinutes: 1440,
      status: 'Pending',
      ...initialValues,
      deadline: normalizedDeadline,
    }),
    [initialValues, normalizedDeadline]
  );

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  const steps = useMemo(
    () => [
      { short: 'Details', title: 'Assignment details', icon: FileText, hint: 'Give it a clear title and subject.' },
      { short: 'Finish', title: 'Deadline & priority', icon: Sparkles, hint: 'Pick a due date and priority.' },
    ],
    []
  );

  async function next() {
    const fieldsByStep = [
      ['title'],
      ['deadline', 'priority'],
    ];

    if (step === 0) {
      const title = String(getValues('title') || '').trim();
      if (!title) {
        await trigger(['title'], { shouldFocus: true });
        return;
      }
      setStep(1);
      return;
    }

    const ok = await trigger(fieldsByStep[step] || [], { shouldFocus: true });
    if (!ok) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const submit = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  return (
    <div className="h-full space-y-3">
      <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950">
        <div className="bg-gradient-to-br from-blue-800 via-blue-800 to-indigo-700 px-5 py-4 text-white">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-extrabold tracking-tight">
                {mode === 'edit' ? 'Edit assignment' : 'Add assignment'}
              </p>
              <p className="mt-1 text-sm font-semibold text-white/90">{steps[step].title}</p>
            </div>
            <button
              onClick={onCancel}
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white transition hover:bg-white/20"
              aria-label="Close"
              type="button"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4">
            <StepProgress
              step={step}
              steps={steps}
              onGoTo={(i) => {
                if (i <= step) setStep(i);
              }}
            />
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
          }}
          onKeyDown={async (e) => {
            if (e.key !== 'Enter') return;
            if (e.shiftKey) return;
            if (e.target?.tagName === 'TEXTAREA') return;
            e.preventDefault();
            if (step >= steps.length - 1) {
              await submit();
              return;
            }
            await next();
          }}
          className="p-5"
        >
          <div className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/30">
            <div className="rounded-2xl bg-blue-50 p-2 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
              {React.createElement(steps[step].icon, { size: 18 })}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-gray-900 dark:text-gray-100">{steps[step].short}</p>
              <p className="mt-0.5 text-xs font-semibold text-gray-600 dark:text-gray-400">{steps[step].hint}</p>
            </div>
          </div>

          <div className="mt-5">
        {step === 0 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-extrabold text-gray-800 dark:text-gray-200">Title</label>
              <input
                {...register('title', { required: true })}
                className={`${inputClassName} ${errors.title ? 'ring-2 ring-red-600 border-red-200' : ''}`}
                placeholder="e.g., Math Homework #3"
                autoFocus
              />
              {errors.title ? <p className="mt-1 text-xs font-semibold text-red-600">Title is required.</p> : null}
            </div>
            <div>
              <label className="block text-sm font-extrabold text-gray-800 dark:text-gray-200">Subject</label>
              <input {...register('subject')} className={inputClassName} placeholder="e.g., Algebra" />
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-extrabold text-gray-800 dark:text-gray-200">Deadline</label>
              <input
                type="datetime-local"
                {...register('deadline', { required: true })}
                className={`${inputClassName} ${errors.deadline ? 'ring-2 ring-red-600 border-red-200' : ''}`}
                autoFocus
              />
              {errors.deadline ? (
                <p className="mt-1 text-xs font-semibold text-red-600">Deadline is required.</p>
              ) : null}
            </div>
            <div>
              <label className="block text-sm font-extrabold text-gray-800 dark:text-gray-200">Priority</label>
              <select {...register('priority', { required: true })} className={inputClassName}>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-extrabold text-gray-800 dark:text-gray-200">Description</label>
              <textarea
                {...register('description')}
                className={`${inputClassName} min-h-[100px]`}
                placeholder="Optional details..."
              />
            </div>
          </div>
        ) : null}

          </div>

          <div className="mt-6 -mx-5 -mb-5 border-t border-gray-100 bg-white/95 p-4 backdrop-blur dark:border-gray-800 dark:bg-gray-950/80">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={prev}
                disabled={step === 0}
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-extrabold text-gray-800 shadow-sm transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-900"
              >
                <ArrowLeft size={18} />
                Back
              </button>

              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-800 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-900"
                >
                  Continue
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-800 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-900 disabled:opacity-60"
                >
                  <Save size={18} />
                  Save assignment
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}