import React from 'react';
import {
  Kanban,
  Map,
  Edit3,
  MessageSquare,
  Users,
  Shield,
  Layers,
  Cpu,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function TeamSpaceHeader() {
  const { currentOrg, teamTab, setTeamTab, members } = useApp();

  const tabs = [
    { id: 'board', label: 'Kanban Board', icon: Kanban },
    { id: 'roadmap', label: 'Roadmap & Milestones', icon: Map },
    { id: 'canvas', label: 'Live Drawing Whiteboard', icon: Edit3 },
    { id: 'chat', label: 'Team Chat', icon: MessageSquare },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2 space-y-4 font-sans">
      
      {/* Team Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172b4d] tracking-tight">
              {currentOrg.name}
            </h1>
            <span className="text-xs uppercase font-bold px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0052cc]">
              {currentOrg.role}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            {currentOrg.description}
          </p>
        </div>

        {/* Member presence */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
            <Users className="w-4 h-4 text-[#0052cc]" />
            <span className="font-semibold">{currentOrg.memberCount} Members</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-600 font-bold">● 4 Online</span>
          </div>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = teamTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setTeamTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#0052cc] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}
