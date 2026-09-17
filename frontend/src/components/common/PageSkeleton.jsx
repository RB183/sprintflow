import React from 'react';

function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`skeleton-shimmer rounded ${className}`} />;
}

function TaskSkeleton() {
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs"><div className="flex items-center justify-between"><Skeleton className="h-3 w-16" /><Skeleton className="h-5 w-14 rounded-full" /></div><Skeleton className="mt-3 h-4 w-11/12" /><Skeleton className="mt-2 h-3 w-2/3" /><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><Skeleton className="h-3 w-20" /><Skeleton className="h-5 w-5 rounded-full" /></div></div>;
}

export function PageSkeleton({ variant = 'workspace' }) {
  if (variant === 'board') return <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6"><div className="mb-6"><Skeleton className="h-8 w-56" /><Skeleton className="mt-2 h-4 w-80 max-w-full" /></div><div className="grid grid-cols-1 gap-5 md:grid-cols-3">{[0, 1, 2].map((column) => <div key={column} className="min-h-[500px] rounded-2xl border border-slate-200 bg-slate-100/90 p-3"><div className="mb-3 flex items-center justify-between border-b border-slate-200 pb-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-6 w-6 rounded-full" /></div><div className="space-y-3"><TaskSkeleton /><TaskSkeleton /></div></div>)}</div></div>;
  if (variant === 'roadmap') return <div className="max-w-7xl mx-auto space-y-4 px-4 py-6 sm:px-6"><Skeleton className="h-20 w-full rounded-xl" />{[0, 1, 2].map((item) => <div key={item} className="rounded-2xl border border-slate-200 bg-white p-5"><Skeleton className="h-5 w-2/5" /><Skeleton className="mt-5 h-2 w-full rounded-full" /><div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">{[0, 1, 2].map((detail) => <Skeleton key={detail} className="h-10 w-full rounded-xl" />)}</div></div>)}</div>;
  if (variant === 'personal') return <div className="max-w-7xl mx-auto space-y-6 px-4 py-8 sm:px-6"><div><Skeleton className="h-8 w-52" /><Skeleton className="mt-2 h-4 w-96 max-w-full" /></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-28 w-full rounded-xl" />)}</div><Skeleton className="h-28 w-full rounded-2xl" /><div className="space-y-3">{[0, 1, 2].map((item) => <TaskSkeleton key={item} />)}</div></div>;
  return <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6"><Skeleton className="h-8 w-44" /><Skeleton className="mt-2 h-4 w-72 max-w-full" /><div className="mt-6 grid gap-3 sm:grid-cols-2">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-32 w-full rounded-xl" />)}</div></div>;
}
