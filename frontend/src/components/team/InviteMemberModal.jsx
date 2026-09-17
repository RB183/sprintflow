import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Link,
  Shield,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function InviteMemberModal({ isOpen, onClose }) {
  const { currentOrg, members, allUsers, inviteMemberToSpace, currentUser } = useApp();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [customEmail, setCustomEmail] = useState('');
  const [invitedSuccess, setInvitedSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [inviteTab, setInviteTab] = useState('link'); // 'link' | 'email' | 'team'

  // Available registered users not yet in space
  const availableUsers = (allUsers || []).filter(
    (u) => !members.some((m) => m.id === u.id)
  );

  const inviteCode = (currentOrg.slug || 'space') + '-' + currentOrg.id;
  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/join/${inviteCode}`;

  useEffect(() => {
    if (availableUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(availableUsers[0].id);
    }
  }, [availableUsers, selectedUserId]);

  useEffect(() => {
    if (!isOpen) {
      setInvitedSuccess(false);
      setCustomEmail('');
      setIsCopied(false);
      setInviteTab('link');
      return undefined;
    }
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleInviteUser = (e) => {
    e.preventDefault();
    if (!selectedUserId) return;
    inviteMemberToSpace(currentOrg.id, {
      userId: selectedUserId,
      role: selectedRole,
    });
    setInvitedSuccess(true);
    setTimeout(() => {
      setInvitedSuccess(false);
      const nextAvailable = availableUsers.filter((u) => u.id !== selectedUserId);
      setSelectedUserId(nextAvailable[0]?.id || '');
    }, 1200);
  };

  const handleInviteCustom = (e) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    inviteMemberToSpace(currentOrg.id, {
      email: customEmail.trim(),
      role: selectedRole,
    });
    setCustomEmail('');
    setInvitedSuccess(true);
    setTimeout(() => setInvitedSuccess(false), 1500);
  };

  const handleRoleChange = (userId, newRole) => {
    inviteMemberToSpace(currentOrg.id, {
      userId,
      role: newRole,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" role="presentation">
      <button
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity"
        aria-label="Close invite member modal"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-member-title"
        className="relative z-10 w-full max-w-lg my-auto rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 fade-in font-sans flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0052cc]">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 id="invite-member-title" className="text-base font-extrabold text-[#172b4d] tracking-tight leading-tight">
                Manage Space Members
              </h2>
              <p className="text-[11px] text-slate-500">
                Space: <strong className="text-[#0052cc]">{currentOrg.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Invite Container with Tabs */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#0052cc]" />
                <span className="text-xs font-bold text-slate-800">Invite New Members</span>
              </div>
              <span className="text-[11px] text-slate-600 font-medium">Share link or invite by email</span>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setInviteTab('link')}
                className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  inviteTab === 'link'
                    ? 'bg-white text-[#0052cc] shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Link className="w-3.5 h-3.5" />
                <span>Joining Link</span>
              </button>
              <button
                type="button"
                onClick={() => setInviteTab('email')}
                className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  inviteTab === 'email'
                    ? 'bg-white text-[#0052cc] shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>By Email</span>
              </button>
              <button
                type="button"
                onClick={() => setInviteTab('team')}
                className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  inviteTab === 'team'
                    ? 'bg-white text-[#0052cc] shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Team Roster</span>
              </button>
            </div>

            {/* Tab 1: Joining Link */}
            {inviteTab === 'link' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteLink}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 font-mono select-all focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-[#0052cc] hover:bg-[#0041a8] text-white'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  Anyone with this link will instantly join this space.
                </p>
              </div>
            )}

            {/* Tab 2: By Email */}
            {inviteTab === 'email' && (
              <form onSubmit={handleInviteCustom} className="space-y-2.5 animate-in fade-in duration-150">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="colleague@company.com or username..."
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0052cc] focus:outline-none"
                  />
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0052cc] focus:outline-none cursor-pointer"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="submit"
                    disabled={!customEmail.trim()}
                    className="px-4 py-2 rounded-lg bg-[#0052cc] hover:bg-[#0041a8] text-white disabled:opacity-40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Invite
                  </button>
                </div>
              </form>
            )}

            {/* Tab 3: Select from Registered Team Members */}
            {inviteTab === 'team' && (
              <div className="animate-in fade-in duration-150">
                {availableUsers.length > 0 ? (
                  <form onSubmit={handleInviteUser} className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0052cc] focus:outline-none cursor-pointer"
                    >
                      {availableUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.title || u.email})
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-[#0052cc] focus:outline-none cursor-pointer"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>

                    <button
                      type="submit"
                      disabled={!selectedUserId}
                      className="rounded-lg bg-[#0052cc] hover:bg-[#0041a8] text-white px-4 py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </form>
                ) : (
                  <p className="text-xs text-slate-600 font-medium py-1">
                    All registered team members are already in this space.
                  </p>
                )}
              </div>
            )}

            {invitedSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Member invited successfully!</span>
              </div>
            )}
          </div>

          {/* Space Members Roster */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Current Space Members ({members.length})
              </span>
            </div>

            <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#172b4d] truncate leading-tight">
                        {member.name}
                        {member.id === currentUser?.id && (
                          <span className="ml-1 text-[10px] text-[#0052cc] font-bold">(You)</span>
                        )}
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium truncate">{member.title || member.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="text-[11px] font-bold uppercase rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[#0052cc] focus:outline-none cursor-pointer"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-100 px-5 py-4 bg-slate-50 rounded-b-2xl flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </section>
    </div>
  );
}
