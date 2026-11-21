import React, { useState } from 'react';
import {
  CheckSquare,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  Play,
  ArrowRight,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CardDetailModal } from '../board/CardDetailModal';

export function PersonalWorkspace() {
  const { personalTasks, addTask, updateTask, orgs, userSpaces, selectOrg, setTeamTab, currentUser } = useApp();
  const availableSpaces = userSpaces?.length > 0 ? userSpaces : orgs;
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState('medium');
  const [quickOrgId, setQuickOrgId] = useState(availableSpaces[0]?.id || 'org-1');

  const filteredTasks = personalTasks.filter((task) => {
    if (filterStatus === 'all') return true;
    return task.status === filterStatus;
  });

  const completedCount = personalTasks.filter((t) => t.status === 'done').length;
  const inProgressCount = personalTasks.filter((t) => t.status === 'in_progress').length;
  const todoCount = personalTasks.filter((t) => t.status === 'todo').length;
  const velocityRate =
    personalTasks.length > 0 ? Math.round((completedCount / personalTasks.length) * 100) : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      priority: quickPriority,
      orgId: quickOrgId,
      status: 'todo',
    });

    setQuickTitle('');
  };

  const cycleStatus = (task) => {
    const nextStatus =
      task.status === 'todo'
        ? 'in_progress'
        : task.status === 'in_progress'
        ? 'done'
        : 'todo';

    updateTask(task.id, { status: nextStatus });
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">Urgent</span>;
      case 'high':
        return <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">High</span>;
      case 'medium':
        return <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">Medium</span>;
      case 'low':
      default:
        return <span className="text-[11px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">Low</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'done':
        return <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">✓ Done</span>;
      case 'in_progress':
        return <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">● In Progress</span>;
      case 'todo':
      default:
        return <span className="text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full text-xs font-bold">To Do</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header & Stats Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172b4d] dark:text-slate-100 tracking-tight">
              Personal Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Your ongoing tasks, assignments, and priorities across all organizations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg shadow-xs">
              Signed in as <span className="text-[#0052cc] dark:text-blue-400">{currentUser?.name || 'Alex Chen'}</span>
            </span>
          </div>
        </div>

        {/* Telemetry Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Tasks</p>
            <p className="text-2xl font-black text-[#172b4d] dark:text-slate-100 mt-1">{personalTasks.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{todoCount} pending</p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-xl shadow-xs">
            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-black text-[#0052cc] dark:text-blue-400 mt-1">{inProgressCount}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Active execution</p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-xl shadow-xs">
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">{completedCount}</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">{velocityRate}% completion rate</p>
          </div>

          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Connected Spaces</p>
            <p className="text-2xl font-black text-[#172b4d] dark:text-slate-100 mt-1">{availableSpaces.length}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Unlimited 100% free</p>
          </div>
        </div>
      </div>

      {/* Quick Add Task Form */}
      <form onSubmit={handleQuickAdd} className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0052cc] dark:text-blue-400 uppercase tracking-wider">
          <Plus className="w-4 h-4" />
          <span>Quick Create Task</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="What needs to be done? (e.g. Audit API authentication pipeline)..."
            className="flex-1 w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0052cc] dark:focus:border-blue-500 rounded-xl transition-all"
          />

          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#0052cc] dark:focus:border-blue-500"
          >
            <option value="urgent">Urgent Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={quickOrgId}
            onChange={(e) => setQuickOrgId(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-xl focus:outline-none focus:border-[#0052cc] dark:focus:border-blue-500"
          >
            {availableSpaces.map((o) => (
              <option key={o.id} value={o.id}>
                Space: {o.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#0052cc] hover:bg-[#0041a8] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Create</span>
          </button>
        </div>
      </form>

      {/* Filter Tabs & Task List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'todo', label: 'To Do' },
              { id: 'in_progress', label: 'In Progress' },
              { id: 'done', label: 'Completed' },
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => setFilterStatus(st.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterStatus === st.id
                    ? 'bg-[#0052cc] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            {filteredTasks.length} tasks in list
          </span>
        </div>

        {/* Task Cards Grid */}
        <div className="space-y-3">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
              const org = orgs.find((o) => o.id === task.orgId);
              return (
                <div
                  key={task.id}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  {/* Left Status & Title */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => cycleStatus(task)}
                      title="Click to cycle status"
                      className="mt-0.5 cursor-pointer text-slate-400 dark:text-slate-500 hover:text-[#0052cc] dark:hover:text-blue-400 transition-colors"
                    >
                      {task.status === 'done' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50 dark:fill-emerald-950/60" />
                      ) : task.status === 'in_progress' ? (
                        <Play className="w-5 h-5 text-[#0052cc] dark:text-blue-400 fill-blue-50 dark:fill-blue-950/60" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-[#0052cc] dark:text-blue-400">
                          {task.key}
                        </span>

                        <button
                          onClick={() => {
                            selectOrg(task.orgId);
                            setTeamTab('board');
                          }}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-[#0052cc] dark:hover:text-blue-300 transition-colors cursor-pointer"
                        >
                          {org?.name || 'Team Space'}
                        </button>

                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>

                      <h3
                        className={`text-sm font-semibold text-[#172b4d] dark:text-slate-100 ${
                          task.status === 'done' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Details & Board Jump */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      <span>{task.dueDate}</span>
                    </div>

                    <button
                      onClick={() => {
                        selectOrg(task.orgId);
                        setTeamTab('board');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0052cc] dark:text-blue-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View Board</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No tasks found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Use the input above to create a new task</p>
            </div>
          )}
        </div>
      </div>

      <CardDetailModal
        taskId={selectedTaskId}
        isOpen={Boolean(selectedTaskId)}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
}
