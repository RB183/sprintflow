import React, { useState } from 'react';
import { X, Sparkles, User, Mail, Lock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { MOCK_USERS } from '../../data/mockData';

export function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleDemoLogin = (user) => {
    onLoginSuccess(user || MOCK_USERS[0]);
    onClose();
  };

  const handleGoogleLogin = () => {
    onLoginSuccess({
      id: 'usr-google',
      name: 'Google User',
      email: 'user@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      title: 'Senior Engineer',
    });
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    onLoginSuccess({
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0],
      email: email,
      avatar: MOCK_USERS[0].avatar,
      role: 'admin',
      title: 'Team Lead',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 my-8 animate-in zoom-in-95 duration-150 text-[#172b4d]">
        
        {/* Header with Close */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0052cc] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SprintFlow 100% Free Access</span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#172b4d]">
              {mode === 'signin' ? 'Welcome back' : 'Create free account'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'signin'
                ? 'Sign in to access your boards and workspaces'
                : 'No credit card needed. Instant setup.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Instant Demo Login Banner */}
        <div className="mt-5 p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0052cc] flex items-center gap-1.5">
              <Zap className="w-4 h-4 fill-[#0052cc]" />
              <span>1-Click Instant Demo Access</span>
            </span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 bg-[#0052cc] text-white rounded">
              FASTEST
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            Jump directly into the live workspace without passwords:
          </p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoLogin(MOCK_USERS[0])}
              className="px-2.5 py-2 rounded-lg bg-white border border-blue-300 hover:border-[#0052cc] text-xs font-semibold text-[#172b4d] hover:bg-blue-50/50 shadow-sm transition-all flex items-center gap-2 cursor-pointer text-left"
            >
              <img
                src={MOCK_USERS[0].avatar}
                alt={MOCK_USERS[0].name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <div className="truncate">
                <p className="truncate text-[11px] font-bold">Alex (Lead)</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin(MOCK_USERS[1])}
              className="px-2.5 py-2 rounded-lg bg-white border border-blue-300 hover:border-[#0052cc] text-xs font-semibold text-[#172b4d] hover:bg-blue-50/50 shadow-sm transition-all flex items-center gap-2 cursor-pointer text-left"
            >
              <img
                src={MOCK_USERS[1].avatar}
                alt={MOCK_USERS[1].name}
                className="w-5 h-5 rounded-full object-cover"
              />
              <div className="truncate">
                <p className="truncate text-[11px] font-bold">Maya (Dev)</p>
              </div>
            </button>
          </div>
        </div>

        {/* SSO Buttons (Google / Microsoft) */}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 font-semibold text-xs text-slate-700 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-3 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-400 font-medium">
            or with email
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
          >
            <span>{mode === 'signin' ? 'Sign In to Workspace' : 'Create Free Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="font-bold text-[#0052cc] hover:underline cursor-pointer"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="font-bold text-[#0052cc] hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
