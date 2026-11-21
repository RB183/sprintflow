import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, CheckCircle2, User, X } from 'lucide-react';
import { socketService } from '../../services/socketService';

export function ActivityToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleNewToast = (toast) => {
      setToasts((prev) => [toast, ...prev].slice(0, 4));
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 4500);
    };

    socketService.on('activity_toast', handleNewToast);
    return () => socketService.off('activity_toast', handleNewToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-40 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 text-[#172b4d] dark:text-slate-100"
        >
          {toast.user?.avatar ? (
            <img
              src={toast.user.avatar}
              alt={toast.user.name}
              className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-0.5 ring-1 ring-slate-200 dark:ring-slate-700"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#0052cc] dark:text-blue-400">
              {toast.user?.name?.charAt(0) || 'U'}
            </div>
          )}

          <div className="flex-1 text-xs min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-[#172b4d] dark:text-slate-100 truncate">{toast.user?.name || 'Teammate'}</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{toast.timestamp}</span>
            </div>

            {toast.type === 'move' && (
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                Moved <strong className="text-[#0052cc] dark:text-blue-400">[{toast.card?.key}]</strong> to{' '}
                <strong className="text-emerald-600 dark:text-emerald-400 capitalize">{toast.targetList?.replace('_', ' ')}</strong>
              </p>
            )}

            {toast.type === 'create' && (
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-snug truncate">
                Created issue <strong className="text-[#0052cc] dark:text-blue-400">[{toast.card?.key}]</strong>: {toast.card?.title}
              </p>
            )}

            {toast.type === 'update' && (
              <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-snug">
                Updated work item <strong className="text-[#0052cc] dark:text-blue-400">[{toast.card?.key}]</strong>
              </p>
            )}
          </div>

          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
