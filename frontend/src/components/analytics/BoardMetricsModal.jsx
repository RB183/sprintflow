import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  CheckSquare,
  Users,
  Flame,
  PieChart,
  Clock,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function BoardMetricsModal() {
  const { isMetricsOpen, setIsMetricsOpen, currentOrg, tasks, members } = useApp();

  if (!isMetricsOpen) return null;

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const todoTasks = tasks.filter((t) => t.status === 'todo');

  const completionRate = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0;

  const urgentTasks = tasks.filter((t) => t.priority === 'urgent');
  const highTasks = tasks.filter((t) => t.priority === 'high');
  const mediumTasks = tasks.filter((t) => t.priority === 'medium');
  const lowTasks = tasks.filter((t) => t.priority === 'low');

  const bugs = tasks.filter((t) => t.type === 'bug');
  const features = tasks.filter((t) => t.type === 'feature' || t.type === 'story');
  const standardTasks = tasks.filter((t) => t.type === 'task' || !t.type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" role="presentation">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsMetricsOpen(false)}
      />

      <div className="relative w-full max-w-3xl bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-150 text-[#172b4d]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-[#0052cc] rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#172b4d]">Sprint Telemetry & Insights</h3>
              <p className="text-xs text-slate-500">Real-time execution analytics for {currentOrg.name}</p>
            </div>
          </div>

          <button
            onClick={() => setIsMetricsOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-6 space-y-6">
          
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Total Issues
              </span>
              <p className="text-2xl font-black text-[#172b4d] mt-1">{totalTasks}</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                {doneTasks.length} Completed
              </p>
            </div>

            <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
              <span className="text-[11px] font-bold text-[#0052cc] uppercase tracking-wider block">
                Sprint Burndown
              </span>
              <p className="text-2xl font-black text-[#0052cc] mt-1">{completionRate}%</p>
              <p className="text-[11px] text-blue-700 font-semibold mt-0.5">
                {inProgressTasks.length} In Progress
              </p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                Urgent & High
              </span>
              <p className="text-2xl font-black text-rose-700 mt-1">
                {urgentTasks.length + highTasks.length}
              </p>
              <p className="text-[11px] text-rose-600 font-semibold mt-0.5">
                {urgentTasks.length} Critical
              </p>
            </div>

            <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200">
              <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block">
                Active Squad
              </span>
              <p className="text-2xl font-black text-purple-900 mt-1">{members.length}</p>
              <p className="text-[11px] text-purple-700 font-semibold mt-0.5">Collaborators</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Overall Sprint Completion</span>
              <span className="text-[#0052cc]">{doneTasks.length} of {totalTasks} ({completionRate}%)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{ width: `${totalTasks > 0 ? (doneTasks.length / totalTasks) * 100 : 0}%` }}
                title={`Done: ${doneTasks.length}`}
              />
              <div
                className="bg-[#0052cc] transition-all duration-500"
                style={{ width: `${totalTasks > 0 ? (inProgressTasks.length / totalTasks) * 100 : 0}%` }}
                title={`In Progress: ${inProgressTasks.length}`}
              />
              <div
                className="bg-slate-300 transition-all duration-500"
                style={{ width: `${totalTasks > 0 ? (todoTasks.length / totalTasks) * 100 : 0}%` }}
                title={`To Do: ${todoTasks.length}`}
              />
            </div>
            <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 pt-1">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Done ({doneTasks.length})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0052cc]" /> In Progress ({inProgressTasks.length})</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> To Do ({todoTasks.length})</span>
            </div>
          </div>

          {/* Breakdown Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Priority Distribution */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Priority Distribution
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'Urgent', count: urgentTasks.length, color: 'bg-rose-500' },
                  { label: 'High', count: highTasks.length, color: 'bg-amber-500' },
                  { label: 'Medium', count: mediumTasks.length, color: 'bg-blue-500' },
                  { label: 'Low', count: lowTasks.length, color: 'bg-slate-400' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span>{label}</span>
                    </span>
                    <span className="text-slate-500 font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Type Breakdown */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Work Item Types
              </h4>
              <div className="space-y-2">
                {[
                  { label: 'Features & Stories', count: features.length, color: 'bg-indigo-500' },
                  { label: 'Standard Tasks', count: standardTasks.length, color: 'bg-blue-500' },
                  { label: 'Bugs & Issues', count: bugs.length, color: 'bg-rose-500' },
                ].map(({ label, count, color }) => (
                  <div key={label} className="flex items-center justify-between text-xs font-semibold">
                    <span className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span>{label}</span>
                    </span>
                    <span className="text-slate-500 font-mono">{count}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end pt-5 mt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsMetricsOpen(false)}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
