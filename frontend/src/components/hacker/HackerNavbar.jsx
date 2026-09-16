import React, { useState } from 'react';
import {
  Terminal,
  Layers,
  ChevronDown,
  User,
  Search,
  Activity,
  Shield,
  Plus,
  Cpu,
  Command,
} from 'lucide-react';
import { useHacker } from '../../context/HackerContext';

export function HackerNavbar() {
  const {
    currentUser,
    orgs,
    currentOrg,
    selectOrg,
    viewMode,
    setViewMode,
    setIsCommandPaletteOpen,
  } = useHacker();

  const [isOrgDropdownOpen, setIsOrgDropdownOpen] = useState(false);

  return (
    <header className="w-full bg-[#05070a] border-b border-[#00ff66]/20 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4 font-mono">
        
        {/* Left: Brand / System Node Logo & Navigation Switcher */}
        <div className="flex items-center gap-4">
          <div
            onClick={() => setViewMode('personal')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded bg-black border border-[#00ff66] flex items-center justify-center text-[#00ff66] shadow-[0_0_8px_rgba(0,255,102,0.3)]">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="hidden sm:block">
              <span className="text-xs font-bold tracking-wider text-white group-hover:text-[#00ff66] transition-colors">
                SPRINTFLOW<span className="text-[#00ff66]">_OS</span>
              </span>
            </div>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Personal Workspace Switcher Button */}
          <button
            onClick={() => setViewMode('personal')}
            className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'personal'
                ? 'bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/50 shadow-[0_0_10px_rgba(0,255,102,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>[PERSONAL_WORKSPACE]</span>
          </button>

          {/* Organization / Team Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOrgDropdownOpen(!isOrgDropdownOpen)}
              className={`px-3 py-1 rounded text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === 'team'
                  ? 'bg-slate-900 text-white border border-[#00ff66]/40'
                  : 'text-slate-400 hover:text-white bg-slate-950 border border-slate-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-[#00ff66]" />
              <span className="truncate max-w-[130px] sm:max-w-[160px]">{currentOrg?.name}</span>
              <span className="text-[10px] text-[#00ff66] bg-[#00ff66]/10 px-1 rounded uppercase">
                [{currentOrg?.role}]
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isOrgDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-[#080a0e] border border-[#00ff66]/30 rounded p-1.5 z-50 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 mb-1">
                  // TEAMS_AND_ORGANIZATIONS
                </div>

                {orgs.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => {
                      selectOrg(org.id);
                      setIsOrgDropdownOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      org.id === currentOrg?.id && viewMode === 'team'
                        ? 'bg-[#00ff66]/15 text-[#00ff66] border border-[#00ff66]/30'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{org.name}</p>
                      <p className="text-[10px] text-slate-500">{org.description?.substring(0, 32)}...</p>
                    </div>
                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black border border-slate-800 text-slate-400">
                      {org.role}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Search / Cmd+K, Heartbeat status, User profile */}
        <div className="flex items-center gap-3">
          {/* Quick Command Palette Button */}
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-black border border-slate-800 hover:border-[#00ff66]/40 text-xs text-slate-400 hover:text-[#00ff66] transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search / Run</span>
            <kbd className="px-1 py-0.2 bg-slate-900 border border-slate-700 rounded text-[10px] text-slate-400 font-mono">
              Ctrl+K
            </kbd>
          </button>

          {/* Telemetry Node Status */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-[#00ff66]">
            <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse"></span>
            <span>NODE_LIVE [12ms]</span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* User Tag */}
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-black border border-slate-800 text-xs text-slate-200">
            <span className="text-[#00ff66] font-bold">@</span>
            <span className="font-bold">{currentUser.username}</span>
          </div>
        </div>

      </div>
    </header>
  );
}
