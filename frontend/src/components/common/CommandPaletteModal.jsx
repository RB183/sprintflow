import React, { useState, useEffect } from 'react';
import {
  Search,
  Terminal,
  User,
  Kanban,
  Map,
  Edit3,
  MessageSquare,
  Plus,
  X,
  Layers,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';

export function CommandPaletteModal() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    orgs,
    selectOrg,
    setViewMode,
    setTeamTab,
    navigateTo,
    allTasks,
    addTask,
  } = useApp();
  const { theme, toggleTheme } = useTheme();

  const [query, setQuery] = useState('');

  if (!isCommandPaletteOpen) return null;

  const handleAction = (callback) => {
    callback();
    setIsCommandPaletteOpen(false);
    setQuery('');
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    const title = query.startsWith('> task add ') ? query.replace('> task add ', '').trim() : query.trim();
    if (title) {
      addTask({ title, priority: 'medium' });
      setIsCommandPaletteOpen(false);
      setQuery('');
    }
  };

  const filteredTasks = (allTasks || []).filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.key?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 5);

  const filteredSpaces = (orgs || []).filter(
    (o) =>
      o.name.toLowerCase().includes(query.toLowerCase()) ||
      o.slug?.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-20 font-sans" role="presentation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-white border border-slate-200 rounded-2xl shadow-2xl z-10 overflow-hidden animate-in zoom-in-95 duration-100 text-[#172b4d]">
        
        {/* Search Bar Input */}
        <form onSubmit={handleCreateTask} className="flex items-center gap-3 p-4 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-4 h-4 text-[#0052cc]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search tasks, or type to create..."
            autoFocus
            className="flex-1 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* Command Options */}
        <div className="p-3 max-h-96 overflow-y-auto space-y-3 text-xs">
          
          {/* Matching Tasks if any */}
          {query.trim() && filteredTasks.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
                Matching Issues & Tasks
              </span>
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() =>
                    handleAction(() => {
                      selectOrg(task.orgId);
                      setTeamTab('board');
                    })
                  }
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-[#0052cc] flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-xs font-bold text-[#0052cc]">{task.key}</span>
                    <span className="truncate font-semibold">{task.title}</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">{task.status}</span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Create Prompt */}
          {query.trim() && (
            <button
              onClick={handleCreateTask}
              className="w-full text-left px-3 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#0052cc] font-bold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create issue: "{query}"</span>
            </button>
          )}

          {/* Spaces */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
              Jump to Space
            </span>
            {filteredSpaces.map((space) => (
              <button
                key={space.id}
                onClick={() =>
                  handleAction(() => {
                    selectOrg(space.id);
                    setTeamTab('board');
                  })
                }
                className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  <span className="font-semibold">{space.name}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>

          {/* Core Navigation */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
              Navigation & Views
            </span>

            <button
              onClick={() => handleAction(() => { setViewMode('personal'); navigateTo('personal'); })}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-[#0052cc]" />
              <span className="font-semibold">Personal Workspace</span>
            </button>

            <button
              onClick={() => handleAction(() => { setViewMode('team'); setTeamTab('board'); })}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Kanban className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Kanban Board</span>
            </button>

            <button
              onClick={() => handleAction(() => { setViewMode('team'); setTeamTab('roadmap'); })}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Map className="w-4 h-4 text-blue-600" />
              <span className="font-semibold">Roadmap & Milestones</span>
            </button>

            <button
              onClick={() => handleAction(() => { setViewMode('team'); setTeamTab('canvas'); })}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-amber-600" />
              <span className="font-semibold">Drawing Whiteboard</span>
            </button>

            <button
              onClick={() => handleAction(() => { setViewMode('team'); setTeamTab('chat'); })}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <span className="font-semibold">Team Chat</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="space-y-1 pt-1 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2">
              Preferences
            </span>
            <button
              onClick={() => handleAction(toggleTheme)}
              className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-slate-600" />}
                <span className="font-semibold">Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-bold">{theme}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Tip: Press <strong>ESC</strong> to close</span>
          <span>SprintFlow Quick Actions</span>
        </div>

      </div>
    </div>
  );
}
