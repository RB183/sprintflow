import React, { useState } from 'react';
import {
  Kanban,
  Map,
  Edit3,
  MessageSquare,
  Users,
  UserPlus,
  BarChart3,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InviteMemberModal } from './InviteMemberModal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export function TeamSpaceHeader() {
  const { currentOrg, teamTab, setTeamTab, members, setIsMetricsOpen, currentUser, deleteSpace } = useApp();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const isOwner = Boolean(
    currentUser?.id &&
    (currentOrg?.ownerId === currentUser.id ||
      currentOrg?.ownerId?._id === currentUser.id ||
      currentOrg?.ownerId?.toString() === currentUser.id.toString())
  );
  const isAdmin = currentOrg?.role === 'admin' || isOwner;

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

        {/* Member presence & Invite button */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
            <Users className="w-4 h-4 text-[#0052cc]" />
            <span className="font-semibold">{members.length} {members.length === 1 ? 'Member' : 'Members'}</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-600 font-bold">● Live</span>
          </div>

          <button
            type="button"
            onClick={() => setIsMetricsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer shadow-xs"
            title="View Sprint Telemetry & Insights"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#0052cc]" />
            <span>Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0052cc] text-xs font-bold border border-blue-200 transition-colors cursor-pointer shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:text-rose-400 text-xs font-bold border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer shadow-xs"
              title="Delete this space (Admin only)"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Space</span>
            </button>
          )}
        </div>
      </div>

      <InviteMemberModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={() => deleteSpace(currentOrg?.id || currentOrg?._id)}
        title={`Delete "${currentOrg?.name}"?`}
        description="Are you sure you want to delete this space? All associated boards, cards, plans, and chat channels will be permanently erased. This action cannot be undone."
        confirmText="Delete Space"
        cancelText="Cancel"
        variant="danger"
      />

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
