import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, KeyRound, LogIn, UserPlus } from 'lucide-react';
import { login, registerUser } from '../lib/auth';

const inputClassName =
  'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100';

export default function Login({ onAuthed, className = '' }) {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm({ defaultValues: { username: '', password: '' } });

  async function submit(values) {
    setError(null);
    try {
      const user =
        mode === 'login'
          ? await login({ username: values.username, password: values.password })
          : await registerUser({ username: values.username, password: values.password });
      onAuthed(user);
    } catch (e) {
      setError(e?.message || 'Something went wrong.');
    }
  }

  return (
    <div
      className={`overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950 ${className}`}
    >
      <div className="bg-gradient-to-br from-blue-800 via-blue-800 to-indigo-700 px-6 py-6 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/15 p-2">
            <KeyRound size={20} />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight">SARS</p>
            <p className="text-sm font-semibold text-white/90">Sign in to continue</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="inline-flex w-full rounded-2xl border border-gray-100 bg-gray-50 p-1 shadow-sm dark:border-gray-800 dark:bg-gray-900/30">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-extrabold transition ${
              mode === 'login'
                ? 'bg-blue-800 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 rounded-xl px-3 py-2 text-sm font-extrabold transition ${
              mode === 'register'
                ? 'bg-blue-800 text-white'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-900'
            }`}
          >
            Register
          </button>
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit(submit)} className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-gray-800 dark:text-gray-200">Username</label>
            <input
              {...register('username', { required: true })}
              className={inputClassName}
              placeholder="e.g., student1"
            />
          </div>
          <div>
            <label className="block text-sm font-extrabold text-gray-800 dark:text-gray-200">Password</label>
            <div className="relative">
              <input
                {...register('password', { required: true })}
                className={`${inputClassName} pr-12`}
                placeholder="At least 6 characters"
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-800 px-4 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-900 disabled:opacity-60"
          >
            {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            {mode === 'login' ? 'Login' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
}