import React, { useState } from 'react';
import {
  Search,
  Terminal,
  User,
  Kanban,
  Map,
  Edit3,
  MessageSquare,
  Cpu,
  Plus,
  X,
} from 'lucide-react';
import { useHacker } from '../../context/HackerContext';

export function CommandPaletteModal() {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    orgs,
    selectOrg,
    setViewMode,
    setTeamTab,
    addTask,
  } = useHacker();

  const [query, setQuery] = useState('');

  if (!isCommandPaletteOpen) return null;

  const handleAction = (callback) => {
    callback();
    setIsCommandPaletteOpen(false);
    setQuery('');
  };

  const handleCreateTaskCommand = (e) => {
    e.preventDefault();
    if (query.startsWith('> task add ')) {
      const title = query.replace('> task add ', '').trim();
      if (title) {
        addTask({ title, priority: 'urgent' });
        setIsCommandPaletteOpen(false);
        setQuery('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:pt-24 font-mono">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      {/* Palette Container */}
      <div className="relative w-full max-w-xl bg-[#080a0e] border border-[#00ff66] rounded-lg shadow-[0_0_30px_rgba(0,255,102,0.25)] z-10 overflow-hidden animate-in zoom-in-95 duration-100">
        
        {/* Search Bar Input */}
        <form onSubmit={handleCreateTaskCommand} className="flex items-center gap-3 p-3 border-b border-slate-800 bg-black">
          <Terminal className="w-4 h-4 text-[#00ff66]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type command or jump to workspace / team..."
            autoFocus
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-600 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-slate-500 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* Command Options */}
        <div className="p-2 max-h-80 overflow-y-auto space-y-1 text-xs">
          
          <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase">
            // CORE_NAVIGATION
          </div>

          <button
            onClick={() => handleAction(() => setViewMode('personal'))}
            className="w-full text-left px-3 py-2 rounded hover:bg-[#00ff66]/15 hover:text-[#00ff66] text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              <span>Jump to Personal Workspace</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">view:personal</span>
          </button>

          <div className="px-2 pt-2 py-1 text-[10px] font-bold text-slate-500 uppercase">
            // TEAMS_AND_ORGANIZATIONS
          </div>

          {orgs.map((org) => (
            <button
              key={org.id}
              onClick={() =>
                handleAction(() => {
                  selectOrg(org.id);
                  setTeamTab('board');
                })
              }
              className="w-full text-left px-3 py-2 rounded hover:bg-[#00ff66]/15 hover:text-[#00ff66] text-slate-300 flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#00ff66]" />
                <span>Switch to @{org.slug} ({org.name})</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">[{org.role}]</span>
            </button>
          ))}

          <div className="px-2 pt-2 py-1 text-[10px] font-bold text-slate-500 uppercase">
            // TEAM_SPACE_MODULES
          </div>

          <button
            onClick={() =>
              handleAction(() => {
                setViewMode('team');
                setTeamTab('board');
              })
            }
            className="w-full text-left px-3 py-2 rounded hover:bg-[#00ff66]/15 hover:text-[#00ff66] text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Open Kanban Board</span>
          </button>

          <button
            onClick={() =>
              handleAction(() => {
                setViewMode('team');
                setTeamTab('roadmap');
              })
            }
            className="w-full text-left px-3 py-2 rounded hover:bg-[#00ff66]/15 hover:text-[#00ff66] text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Map className="w-3.5 h-3.5" />
            <span>Open Roadmap Timeline</span>
          </button>

          <button
            onClick={() =>
              handleAction(() => {
                setViewMode('team');
                setTeamTab('canvas');
              })
            }
            className="w-full text-left px-3 py-2 rounded hover:bg-[#00ff66]/15 hover:text-[#00ff66] text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Open Live Drawing Canvas</span>
          </button>

          <button
            onClick={() =>
              handleAction(() => {
                setViewMode('team');
                setTeamTab('chat');
              })
            }
            className="w-full text-left px-3 py-2 rounded hover:bg-[#00ff66]/15 hover:text-[#00ff66] text-slate-300 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Terminal Chat</span>
          </button>
        </div>

        {/* Footer info */}
        <div className="p-2 border-t border-slate-900 bg-black flex items-center justify-between text-[10px] text-slate-500">
          <span>Tip: Type &gt; task add [title] to inject task</span>
          <span>ESC to close</span>
        </div>

      </div>
    </div>
  );
}
