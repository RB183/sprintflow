import React, { useState } from 'react';
import {
  Kanban,
  Plus,
  BarChart3,
  Users,
  ChevronDown,
  Shield,
  Layers,
  Sparkles,
  Zap,
  Globe,
  Home,
} from 'lucide-react';
import { useBoard } from '../../context/BoardContext';
import { useAuth } from '../../context/AuthContext';

export function Navbar({ onGoToLanding }) {
  const {
    boards,
    currentBoard,
    setCurrentBoardId,
    setIsCreateModalOpen,
    setIsMetricsOpen,
    activeMembers,
  } = useBoard();

  const { currentUser, users, switchUser } = useAuth();
  const [isBoardMenuOpen, setIsBoardMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Board Selector */}
        <div className="flex items-center gap-6">
          <div
            onClick={onGoToLanding}
            className="flex items-center gap-2.5 cursor-pointer group"
            title="Return to Product Overview Landing Page"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Kanban className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-slate-100 tracking-tight group-hover:text-indigo-400 transition-colors">
                  SprintFlow
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise MERN Board</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          {/* Board Selector */}
          <div className="relative">
            <button
              onClick={() => setIsBoardMenuOpen(!isBoardMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[180px]">{currentBoard?.title}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isBoardMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 glass-dropdown rounded-xl p-1.5 z-40 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Available Workspaces
                </div>
                {boards.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => {
                      setCurrentBoardId(b.id);
                      setIsBoardMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                      b.id === currentBoard?.id
                        ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="font-semibold truncate">{b.title}</span>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{b.key}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions, Metrics, Team Presence, Persona Switcher */}
        <div className="flex items-center gap-3">
          {/* Back to Landing Page Button */}
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
              title="View Marketing & Feature Overview"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Overview</span>
            </button>
          )}

          {/* Metrics / Analytics Button */}
          <button
            onClick={() => setIsMetricsOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-indigo-300 hover:border-indigo-500/40 transition-colors cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
            <span>Sprint Insights</span>
          </button>

          {/* Create Issue Action */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Issue</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          {/* Active Team Presence Stack */}
          <div className="hidden lg:flex items-center -space-x-2 overflow-hidden px-1">
            {activeMembers.map((member) => (
              <img
                key={member.id}
                src={member.avatar}
                alt={member.name}
                title={`${member.name} (${member.title}) - Live`}
                className="inline-block h-7 w-7 rounded-full ring-2 ring-slate-950 object-cover hover:scale-110 transition-transform cursor-pointer"
              />
            ))}
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 ring-2 ring-slate-950 text-[10px] font-bold text-slate-300">
              +2
            </div>
          </div>

          {/* User Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
            >
              <img
                src={currentUser?.avatar}
                alt={currentUser?.name}
                className="w-6 h-6 rounded-full object-cover border border-indigo-500/50"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-tight">
                  {currentUser?.name}
                </p>
                <p className="text-[10px] text-indigo-400 capitalize">{currentUser?.role}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 glass-dropdown rounded-xl p-2 z-40 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-800/80 mb-1">
                  <p className="text-xs font-bold text-slate-200">Switch Team Member Persona</p>
                  <p className="text-[11px] text-slate-400">
                    Test role-based permissions and card assignment
                  </p>
                </div>
                <div className="space-y-1">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        switchUser(user.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        user.id === currentUser?.id
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-200 truncate">{user.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{user.title}</p>
                      </div>
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                        {user.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
