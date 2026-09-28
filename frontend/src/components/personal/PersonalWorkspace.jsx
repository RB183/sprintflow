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

export function PersonalWorkspace() {
  const { personalTasks, addTask, updateTask, orgs, userSpaces, selectOrg, setTeamTab, currentUser } = useApp();
  const availableSpaces = userSpaces?.length > 0 ? userSpaces : orgs;
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172b4d] tracking-tight">
              Personal Workspace
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your ongoing tasks, assignments, and priorities across all organizations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
              Signed in as <span className="text-[#0052cc]">{currentUser?.name || 'Alex Chen'}</span>
            </span>
          </div>
        </div>

        {/* Telemetry Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Tasks</p>
            <p className="text-2xl font-black text-[#172b4d] mt-1">{personalTasks.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">{todoCount} pending</p>
          </div>

          <div className="p-4 bg-white border border-blue-200 rounded-xl shadow-xs">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-black text-[#0052cc] mt-1">{inProgressCount}</p>
            <p className="text-xs text-blue-600 mt-0.5">Active execution</p>
          </div>

          <div className="p-4 bg-white border border-emerald-200 rounded-xl shadow-xs">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{completedCount}</p>
            <p className="text-xs text-emerald-600 mt-0.5 font-semibold">{velocityRate}% completion rate</p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Connected Spaces</p>
            <p className="text-2xl font-black text-[#172b4d] mt-1">{availableSpaces.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Unlimited 100% free</p>
          </div>
        </div>
      </div>

      {/* Quick Add Task Form */}
      <form onSubmit={handleQuickAdd} className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[#0052cc] uppercase tracking-wider">
          <Plus className="w-4 h-4" />
          <span>Quick Create Task</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            placeholder="What needs to be done? (e.g. Audit API authentication pipeline)..."
            className="flex-1 w-full px-4 py-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0052cc] focus:bg-white rounded-xl transition-all"
          />

          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl focus:outline-none focus:border-[#0052cc]"
          >
            <option value="urgent">Urgent Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={quickOrgId}
            onChange={(e) => setQuickOrgId(e.target.value)}
            className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl focus:outline-none focus:border-[#0052cc]"
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
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
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
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-medium">
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
                  className="p-4 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  {/* Left Status & Title */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => cycleStatus(task)}
                      title="Click to cycle status"
                      className="mt-0.5 cursor-pointer text-slate-400 hover:text-[#0052cc] transition-colors"
                    >
                      {task.status === 'done' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
                      ) : task.status === 'in_progress' ? (
                        <Play className="w-5 h-5 text-[#0052cc] fill-blue-50" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-xs font-bold text-[#0052cc]">
                          {task.key}
                        </span>

                        <button
                          onClick={() => {
                            selectOrg(task.orgId);
                            setTeamTab('board');
                          }}
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 text-[11px] font-semibold text-slate-700 hover:text-[#0052cc] transition-colors cursor-pointer"
                        >
                          {org?.name || 'Team Space'}
                        </button>

                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                      </div>

                      <h3
                        className={`text-sm font-semibold text-[#172b4d] ${
                          task.status === 'done' ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Details & Board Jump */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-shrink-0">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.dueDate}</span>
                    </div>

                    <button
                      onClick={() => {
                        selectOrg(task.orgId);
                        setTeamTab('board');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0052cc] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View Board</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
              <p className="text-sm font-bold text-slate-700">No tasks found</p>
              <p className="text-xs text-slate-400 mt-1">Use the input above to create a new task</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
