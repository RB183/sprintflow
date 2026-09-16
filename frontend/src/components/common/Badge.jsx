import React from 'react';
import { Bug, Sparkles, CheckSquare, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export function TypeBadge({ type }) {
  switch (type) {
    case 'bug':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
          <Bug className="w-3 h-3 text-rose-400" />
          Bug
        </span>
      );
    case 'feature':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
          <Sparkles className="w-3 h-3 text-purple-400" />
          Feature
        </span>
      );
    case 'task':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-sky-500/15 text-sky-300 border border-sky-500/30">
          <CheckSquare className="w-3 h-3 text-sky-400" />
          Task
        </span>
      );
  }
}

export function PriorityBadge({ priority }) {
  switch (priority) {
    case 'urgent':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-rose-500/20 text-rose-300 border border-rose-500/40">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
          Urgent
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          High
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-sky-500/15 text-sky-300 border border-sky-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
          Medium
        </span>
      );
    case 'low':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-500/15 text-slate-300 border border-slate-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
          Low
        </span>
      );
  }
}

export function SeverityBadge({ severity }) {
  const styles = {
    blocker: 'bg-rose-950/80 text-rose-200 border-rose-600',
    critical: 'bg-red-900/60 text-red-200 border-red-500',
    major: 'bg-amber-900/40 text-amber-200 border-amber-500',
    minor: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase border ${
        styles[severity] || styles.minor
      }`}
    >
      <AlertCircle className="w-3 h-3" />
      {severity}
    </span>
  );
}
