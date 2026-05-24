import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, KeyRound, LogIn, Settings } from 'lucide-react';
import { login } from '../lib/auth';
import { useTheme } from '../ThemeContext';
import { getApiBase, setApiBase } from '../lib/api';
const inputCls = 'w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 outline-none focus:ring-2 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100';
export default function Login({ onAuthed, className = '' }) {
  const [mode, setMode] = useState('login');
  const [error, setError] = useState(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [serverUrl, setServerUrl] = useState(getApiBase());
  const colors = useTheme();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();
  const onSubmit = async (v) => {
    setError(null);
    try {
      const u = await login(v);
      onAuthed(u);
    } catch (e) { setError(`${e?.message || 'Something went wrong.'} (Tried: ${getApiBase()}/api/login)`); }
  };
  const handleSaveSettings = () => {
    setApiBase(serverUrl);
    setShowSettings(false);
    window.location.reload();
  };
  return (
    <div className={`overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950 ${className}`}>
      <div className="px-6 py-6 text-white flex items-center justify-between gap-3" style={{ backgroundColor: colors.bg }}>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white/15 p-2"><KeyRound size={20} /></div>
          <div><p className="text-lg font-extrabold tracking-tight">CampusConnect</p><p className="text-sm font-semibold opacity-90">SKSU Academic Portal</p></div>
        </div>
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="rounded-2xl bg-white/15 p-2 text-white hover:bg-white/25 transition cursor-pointer"
        >
          <Settings size={20} />
        </button>
      </div>
      <div className="p-5">
        {showSettings ? (
          <div className="space-y-4">
            <div className="flex rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/30">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Server Settings</p>
            </div>
            <div className="space-y-2">
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                className={inputCls}
                placeholder="http://192.168.1.100:5001"
              />
              <button
                type="button"
                onClick={handleSaveSettings}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-extrabold text-white transition opacity-90 hover:opacity-100 shadow-lg"
                style={{ backgroundColor: colors.main }}
              >
                Save & Connect
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex rounded-2xl bg-gray-50 p-3 dark:bg-gray-900/30">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">Account Access</p>
            </div>
            {error && <div className="mt-4 p-3 text-xs font-bold bg-red-50 text-red-700 rounded-2xl border border-red-100">{error}</div>}
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
              <input {...register('username', { required: true })} className={inputCls} placeholder="Username" style={{ focusRingColor: colors.main }} />
              <div className="relative">
                <input {...register('password', { required: true })} className={`${inputCls} pr-12`} placeholder="Password" type={showPwd ? 'text' : 'password'} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-gray-100 dark:bg-gray-900">{showPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl py-3 text-sm font-extrabold text-white transition opacity-90 hover:opacity-100 disabled:opacity-50 shadow-lg shadow-brand/20"
                style={{ backgroundColor: colors.main }}
              >
                <LogIn size={18} /> Sign In
              </button>
            </form>
            <div className="mt-4 text-center">
              <p className="text-[10px] font-bold text-gray-400">Connected to: {getApiBase()}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
