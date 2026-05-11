import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, KeyRound, LogIn, UserPlus } from 'lucide-react';
import { login, registerUser } from '../lib/auth';

const inputCls = 'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-blue-800 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100';

export default function Login({ onAuthed, className = '' }) {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const onSubmit = async (v) => {
    setError(null);
    try {
      const u = mode === 'login' ? await login(v) : await registerUser(v);
      onAuthed(u);
    } catch (e) { setError(e?.message || 'Something went wrong.'); }
  };

  return (
    <div className={`overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950 ${className}`}>
      <div className="bg-gradient-to-br from-blue-800 to-indigo-700 px-6 py-6 text-white flex items-center gap-3">
        <div className="rounded-2xl bg-white/15 p-2"><KeyRound size={20} /></div>
        <div><p className="text-lg font-extrabold">SARS</p><p className="text-sm font-semibold opacity-90">Sign in to continue</p></div>
      </div>
      <div className="p-5">
        <div className="flex rounded-2xl bg-gray-50 p-1 dark:bg-gray-900/30">
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 rounded-xl py-2 text-sm font-extrabold capitalize ${mode === m ? 'bg-blue-800 text-white shadow-sm' : 'opacity-60'}`}>{m}</button>
          ))}
        </div>
        {error && <div className="mt-4 p-3 text-xs font-bold bg-red-50 text-red-700 rounded-2xl border border-red-100">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
          <input {...register('username', { required: true })} className={inputCls} placeholder="Username" />
          <div className="relative">
            <input {...register('password', { required: true })} className={`${inputCls} pr-12`} placeholder="Password" type={showPwd ? 'text' : 'password'} />
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gray-100 dark:bg-gray-900">{showPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-800 py-3 text-sm font-extrabold text-white transition hover:bg-blue-900 disabled:opacity-50">
            {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}{mode === 'login' ? 'Login' : 'Join'}
          </button>
        </form>
      </div>
    </div>
  );
}
