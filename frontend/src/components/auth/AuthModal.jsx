import React, { useState } from 'react';
import { X, Sparkles, User, Mail, Lock, ArrowRight } from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { firebaseAuth } from '../../config/firebase';
import { api } from '../../services/api';

const firebaseErrorMessage = (error) => {
  const messages = {
    'auth/email-already-in-use': 'An account already exists for this email.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups for this site.',
    'auth/unauthorized-domain': 'This domain is not authorized in Firebase Console.',
    'auth/operation-not-allowed': 'Google Sign-in is not enabled in Firebase Console.',
    'auth/network-request-failed': 'Network connection failed. Please check your internet connection.',
    'auth/weak-password': 'Password must be at least 6 characters.',
  };
  return messages[error.code] || error.message || 'Authentication failed';
};

export function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      if (!firebaseAuth) {
        throw new Error('Google Sign-in is not initialized. Please sign in with email and password.');
      }
      const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider());
      let sessionUser = {
        id: result.user.uid,
        name: result.user.displayName || result.user.email?.split('@')[0] || 'User',
        email: result.user.email,
        avatar: result.user.photoURL,
      };

      try {
        const idToken = await result.user.getIdToken();
        const session = await api.firebaseLogin(idToken);
        if (session?.user) {
          sessionUser = session.user;
          if (session.token) api.setToken(session.token);
        }
      } catch (backendError) {
        console.warn('Backend server session sync note:', backendError.message);
      }

      onLoginSuccess(sessionUser);
      onClose();
    } catch (requestError) {
      setError(firebaseErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // First attempt native API authentication with database
      if (mode === 'signup') {
        try {
          const res = await api.register({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          });

          if (res?.user) {
            if (res.token) api.setToken(res.token);
            onLoginSuccess(res.user, res.token);
            onClose();
            return;
          }
        } catch (apiErr) {
          // If native register reported error (e.g. duplicate email), surface it
          if (apiErr.message && !apiErr.message.includes('fetch')) {
            throw apiErr;
          }
        }

        // Optional Firebase fallback if native API is offline
        if (firebaseAuth) {
          const cred = await createUserWithEmailAndPassword(firebaseAuth, email, password);
          await updateProfile(cred.user, { displayName: name.trim() });
          const user = {
            id: cred.user.uid,
            name: name.trim() || cred.user.email.split('@')[0],
            email: cred.user.email,
          };
          onLoginSuccess(user);
          onClose();
          return;
        }
      } else {
        // Sign-in
        try {
          const res = await api.login({
            email: email.trim().toLowerCase(),
            password,
          });

          if (res?.user) {
            if (res.token) api.setToken(res.token);
            onLoginSuccess(res.user, res.token);
            onClose();
            return;
          }
        } catch (apiErr) {
          if (apiErr.message && !apiErr.message.includes('fetch')) {
            throw apiErr;
          }
        }

        // Optional Firebase fallback if native API is offline
        if (firebaseAuth) {
          const cred = await signInWithEmailAndPassword(firebaseAuth, email, password);
          const user = {
            id: cred.user.uid,
            name: cred.user.displayName || cred.user.email.split('@')[0],
            email: cred.user.email,
          };
          onLoginSuccess(user);
          onClose();
          return;
        }
      }
    } catch (err) {
      setError(firebaseErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 my-8 animate-in zoom-in-95 duration-150 text-[#172b4d] dark:text-slate-100">
        
        {/* Header with Close */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#0052cc] dark:text-blue-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SprintFlow Enterprise</span>
            </div>
            <h3 className="text-2xl font-extrabold text-[#172b4d] dark:text-slate-100">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {mode === 'signin'
                ? 'Sign in to access your boards and workspaces'
                : 'Get started with collaborative sprint planning.'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SSO Buttons (Google) */}
        <div className="mt-5 space-y-2">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs text-slate-700 dark:text-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
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
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          <span className="flex-shrink mx-3 text-xs text-slate-400 dark:text-slate-500 font-medium">
            or with email
          </span>
          <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
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
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
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
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc]"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            <span>
              {isSubmitting ? 'Verifying...' : mode === 'signin' ? 'Sign In to Workspace' : 'Create Account'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Toggle Mode Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); }}
                className="font-bold text-[#0052cc] dark:text-blue-400 hover:underline cursor-pointer"
              >
                Sign up free
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); }}
                className="font-bold text-[#0052cc] dark:text-blue-400 hover:underline cursor-pointer"
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
