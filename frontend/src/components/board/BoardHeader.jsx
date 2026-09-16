import React from 'react';
import {
  Search,
  Filter,
  X,
  CheckCircle2,
  Sparkles,
  Flame,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import { useBoard } from '../../context/BoardContext';
import { useAuth } from '../../context/AuthContext';

export function BoardHeader() {
  const { currentBoard, filters, setFilters, lists, allCards } = useBoard();
  const { currentUser, users } = useAuth();

  const boardCards = allCards.filter((c) => c.boardId === currentBoard?.id);
  const doneCards = boardCards.filter((c) => {
    const list = lists.find((l) => l.id === c.listId);
    return list?.title.toLowerCase().includes('done');
  });

  const completionRate =
    boardCards.length > 0 ? Math.round((doneCards.length / boardCards.length) * 100) : 0;

  const totalStoryPoints = boardCards.reduce(
    (acc, c) => acc + (c.metadata?.storyPoints || (c.type === 'task' ? 2 : 1)),
    0
  );

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    (filters.type !== 'all' ? 1 : 0) +
    (filters.priority !== 'all' ? 1 : 0) +
    (filters.assigneeId !== 'all' ? 1 : 0);

  const resetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      priority: 'all',
      assigneeId: 'all',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Board Title & Sprint Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              {currentBoard?.title}
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 font-mono text-xs font-semibold text-slate-300">
              {currentBoard?.key}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            {currentBoard?.description}
          </p>
        </div>

        {/* Sprint Summary Pill */}
        <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm flex-shrink-0">
          <div>
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
              <span>Sprint Progress</span>
              <span className="text-indigo-400 font-bold">{completionRate}%</span>
            </div>
            <div className="w-36 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-left">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Velocity</p>
            <p className="text-sm font-bold text-slate-200">{totalStoryPoints} pts</p>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            placeholder="Search tasks, bug keys, descriptions..."
            className="w-full pl-9 pr-8 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/80 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter by Type */}
          <select
            value={filters.type}
            onChange={(e) => setFilters((prev) => ({ ...prev, type: e.target.value }))}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="task">Tasks</option>
            <option value="feature">Features</option>
            <option value="bug">Bugs</option>
          </select>

          {/* Filter by Priority */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters((prev) => ({ ...prev, priority: e.target.value }))}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Filter by Assignee */}
          <select
            value={filters.assigneeId}
            onChange={(e) => setFilters((prev) => ({ ...prev, assigneeId: e.target.value }))}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Assignees</option>
            <option value={currentUser.id}>Assigned to Me</option>
            <option value="unassigned">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>

          {/* Quick "Only My Issues" shortcut button */}
          <button
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                assigneeId: prev.assigneeId === currentUser.id ? 'all' : currentUser.id,
              }))
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              filters.assigneeId === currentUser.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Only My Issues</span>
          </button>

          {/* Clear Filters indicator */}
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
