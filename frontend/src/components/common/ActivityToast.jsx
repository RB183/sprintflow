import React from 'react';
import { ArrowRight, Sparkles, PlusCircle, CheckCircle } from 'lucide-react';
import { useBoard } from '../../context/BoardContext';

export function ActivityToastContainer() {
  const { activityToasts } = useBoard();

  if (!activityToasts || activityToasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {activityToasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 bg-slate-900/95 border border-indigo-500/30 rounded-xl shadow-xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200"
        >
          {toast.user?.avatar ? (
            <img
              src={toast.user.avatar}
              alt={toast.user.name}
              className="w-8 h-8 rounded-full border border-slate-700 object-cover flex-shrink-0 mt-0.5"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500 flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-300">
              {toast.user?.name?.charAt(0) || 'U'}
            </div>
          )}

          <div className="flex-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-semibold text-slate-200">{toast.user?.name || 'Teammate'}</span>
              <span className="text-[10px] text-slate-500">{toast.timestamp}</span>
            </div>

            {toast.type === 'move' && (
              <p className="text-slate-300 mt-0.5">
                Moved <span className="font-medium text-indigo-300">[{toast.card?.key}]</span> from{' '}
                <span className="text-slate-400">{toast.sourceList}</span> to{' '}
                <span className="text-indigo-400 font-medium">{toast.targetList}</span>
              </p>
            )}

            {toast.type === 'create' && (
              <p className="text-slate-300 mt-0.5">
                Created new {toast.card?.type}{' '}
                <span className="font-medium text-indigo-300">[{toast.card?.key}]</span>: {toast.card?.title?.substring(0, 30)}...
              </p>
            )}

            {toast.type === 'update' && (
              <p className="text-slate-300 mt-0.5">
                Updated <span className="font-medium text-indigo-300">[{toast.card?.key}]</span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
