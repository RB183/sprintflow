import React, { useEffect, useState } from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Destructive Action',
  description = 'Are you sure you want to proceed with this action? This operation cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
}) {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsLoading(false);
      return undefined;
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await Promise.resolve(onConfirm());
    } catch (err) {
      console.error('Confirmation action failed:', err);
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 z-10 my-auto animate-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-2xl flex-shrink-0 ${
              isDanger
                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                : isWarning
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                : 'bg-blue-50 dark:bg-blue-950/60 text-[#0052cc] dark:text-blue-400 border border-blue-200 dark:border-blue-900'
            }`}
          >
            {isDanger ? (
              <Trash2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 id="confirm-dialog-title" className="text-base font-extrabold text-[#172b4d] dark:text-slate-100">
              {title}
            </h3>
            <p id="confirm-dialog-description" className="mt-1.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
                : isWarning
                ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                : 'bg-[#0052cc] hover:bg-[#0041a8] active:bg-[#003180]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
