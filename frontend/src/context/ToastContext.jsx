import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast = {
      id,
      type: toast.type || 'info', // 'success' | 'error' | 'warning' | 'info'
      title: toast.title,
      message: toast.message || '',
      duration: toast.duration || 4000,
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 5));

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, [removeToast]);

  const toast = useCallback(
    (options) => {
      if (typeof options === 'string') {
        return addToast({ title: options, type: 'info' });
      }
      return addToast(options);
    },
    [addToast]
  );

  toast.success = (title, message, duration) =>
    addToast({ title, message, type: 'success', duration });

  toast.error = (title, message, duration) =>
    addToast({ title, message, type: 'error', duration });

  toast.warning = (title, message, duration) =>
    addToast({ title, message, type: 'warning', duration });

  toast.info = (title, message, duration) =>
    addToast({ title, message, type: 'info', duration });

  toast.dismiss = removeToast;

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-3 sm:px-0"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';
  const isInfo = toast.type === 'info';

  const iconMap = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-[#0052cc] dark:text-blue-400 flex-shrink-0" />,
  };

  const borderStyles = {
    success: 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/90 dark:bg-emerald-950/70',
    error: 'border-rose-200 dark:border-rose-800/80 bg-rose-50/90 dark:bg-rose-950/70',
    warning: 'border-amber-200 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/70',
    info: 'border-blue-200 dark:border-blue-800/80 bg-blue-50/90 dark:bg-blue-950/70',
  };

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-200 ${
        borderStyles[toast.type] || borderStyles.info
      } text-slate-900 dark:text-slate-100`}
    >
      <div className="mt-0.5">{iconMap[toast.type] || iconMap.info}</div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold leading-snug">{toast.title}</p>
        {toast.message && (
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
            {toast.message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
