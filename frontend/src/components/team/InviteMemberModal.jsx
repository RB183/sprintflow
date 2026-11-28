import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Link,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { api } from '../../services/api';

export function InviteMemberModal({ isOpen, onClose, initialTab = 'members' }) {
  const {
    currentOrg,
    members,
    allUsers,
    inviteMemberToSpace,
    removeMemberFromSpace,
    currentUser,
    refreshSpaceMembers,
  } = useApp();
  const toast = useToast();

  const [mainTab, setMainTab] = useState(initialTab); // 'members' | 'invite'
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [customEmail, setCustomEmail] = useState('');
  const [invitedSuccess, setInvitedSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [inviteTab, setInviteTab] = useState('link'); // 'link' | 'email' | 'team'
  const [shareableLink, setShareableLink] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Role check: Only admin or owner can invite / change roles
  const isOwner = Boolean(
    currentUser?.id &&
    (currentOrg?.ownerId === currentUser.id ||
      currentOrg?.ownerId?._id === currentUser.id ||
      currentOrg?.ownerId?.toString() === currentUser.id.toString())
  );
  const isAdmin = isOwner || currentOrg?.role === 'admin';

  // Available registered users not yet in space
  const availableUsers = (allUsers || []).filter(
    (u) => !members.some((m) => (m.id || m.userId) === (u.id || u._id))
  );

  const fallbackInviteLink = `${
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'
  }/join/${currentOrg.slug || currentOrg.id}`;
  const effectiveInviteLink = shareableLink || fallbackInviteLink;

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      setMainTab(initialTab);
      setMemberSearch('');
      if (typeof refreshSpaceMembers === 'function' && currentOrg?.id) {
        refreshSpaceMembers(currentOrg.id);
      }
    }
  }, [isOpen, initialTab, currentOrg?.id, refreshSpaceMembers]);

  useEffect(() => {
    if (availableUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(availableUsers[0].id);
    }
  }, [availableUsers, selectedUserId]);

  useEffect(() => {
    if (isOpen && currentOrg?.id && isAdmin) {
      api.generateInviteLink(currentOrg.id, 'member')
        .then((res) => {
          if (res?.inviteUrl) {
            setShareableLink(res.inviteUrl);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, currentOrg?.id, isAdmin]);

  useEffect(() => {
    if (!isOpen) {
      setInvitedSuccess(false);
      setCustomEmail('');
      setIsCopied(false);
      setInviteTab('link');
      setFeedbackMsg('');
      setMemberSearch('');
      return undefined;
    }
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Real-time filtered space members
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members;
    const q = memberSearch.trim().toLowerCase();
    return members.filter((m) =>
      (m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.title || '').toLowerCase().includes(q) ||
      (m.role || '').toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  const adminCount = useMemo(
    () => members.filter((m) => m.role === 'admin' || m.id === currentOrg?.ownerId).length,
    [members, currentOrg?.ownerId]
  );
  const memberCount = members.length - adminCount;

  if (!isOpen) return null;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(effectiveInviteLink);
      setIsCopied(true);
      toast.success('Link copied', 'Shareable invite link copied to clipboard.');
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleInviteUser = (e) => {
    e.preventDefault();
    if (!selectedUserId || !isAdmin) return;
    const targetUser = availableUsers.find((u) => u.id === selectedUserId);
    inviteMemberToSpace(currentOrg.id, {
      userId: selectedUserId,
      role: selectedRole,
    });
    setInvitedSuccess(true);
    setFeedbackMsg('Member added to space');
    toast.success('Member added', `${targetUser?.name || 'User'} has been added to ${currentOrg.name}.`);
    setTimeout(() => {
      setInvitedSuccess(false);
      setFeedbackMsg('');
      const nextAvailable = availableUsers.filter((u) => u.id !== selectedUserId);
      setSelectedUserId(nextAvailable[0]?.id || '');
    }, 1500);
  };

  const handleInviteCustom = (e) => {
    e.preventDefault();
    if (!customEmail.trim() || !isAdmin) return;

    const emails = customEmail
      .split(/[,;\s]+/)
      .map((item) => item.trim())
      .filter((item) => item.length > 3);

    inviteMemberToSpace(currentOrg.id, {
      emails,
      email: customEmail.trim(),
      role: selectedRole,
    });

    setCustomEmail('');
    setInvitedSuccess(true);
    setFeedbackMsg(`Invite sent to ${emails.length} recipient(s)`);
    toast.success('Invitations sent', `Invite email dispatched to ${emails.length} recipient(s).`);
    setTimeout(() => {
      setInvitedSuccess(false);
      setFeedbackMsg('');
    }, 2000);
  };

  const handleConfirmRemoveMember = () => {
    if (memberToRemove) {
      removeMemberFromSpace(currentOrg.id, memberToRemove.id);
      toast.success('Member removed', `${memberToRemove.name} was removed from the space.`);
      setMemberToRemove(null);
    }
  };

  const handleRoleChange = (userId, newRole) => {
    if (!isAdmin) return;
    inviteMemberToSpace(currentOrg.id, {
      userId,
      role: newRole,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" role="presentation">
      <button
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        aria-label="Close space members modal"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="space-members-modal-title"
        className="relative z-10 w-full max-w-lg my-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95 fade-in font-sans flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0052cc] dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 id="space-members-modal-title" className="text-base font-extrabold text-[#172b4d] dark:text-slate-100 tracking-tight leading-tight">
                {currentOrg.name} — Members
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {members.length} {members.length === 1 ? 'Person' : 'People'} in this space ({adminCount} {adminCount === 1 ? 'Admin' : 'Admins'}, {memberCount} {memberCount === 1 ? 'Member' : 'Members'})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-slate-50/60 dark:bg-slate-800/40">
          <button
            type="button"
            onClick={() => setMainTab('members')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              mainTab === 'members'
                ? 'border-[#0052cc] text-[#0052cc] dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Space Members ({members.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMainTab('invite')}
            className={`py-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              mainTab === 'invite'
                ? 'border-[#0052cc] text-[#0052cc] dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isAdmin ? 'Invite New Members' : 'Space Invite Link'}</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* TAB 1: VIEW ALL SPACE MEMBERS */}
          {mainTab === 'members' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Search Bar & Member Stats */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Search members by name, email, or role..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#0052cc]"
                  />
                  {memberSearch && (
                    <button
                      type="button"
                      onClick={() => setMemberSearch('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 self-end sm:self-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{filteredMembers.length} active in space</span>
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {filteredMembers.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    No space members found matching &quot;{memberSearch}&quot;.
                  </div>
                ) : (
                  filteredMembers.map((member) => {
                    const isSelf = (member.id || member.userId) === currentUser?.id;
                    const isMemberOwner =
                      (member.id || member.userId) === currentOrg?.ownerId ||
                      (member.id || member.userId) === currentOrg?.ownerId?._id;
                    const isMemberAdmin = member.role === 'admin' || isMemberOwner;

                    return (
                      <div
                        key={member.id || member.userId}
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:border-blue-300 dark:hover:border-blue-800 transition-colors shadow-2xs"
                      >
                        {/* Member Identity */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <img
                              src={
                                member.avatar ||
                                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                              }
                              alt={member.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <span
                              className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800"
                              title="Online in space"
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                                {member.name}
                              </span>
                              {isSelf && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0052cc] dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                  You
                                </span>
                              )}
                            </div>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {member.title || 'Team Member'}
                              {member.email && ` • ${member.email}`}
                            </p>
                          </div>
                        </div>

                        {/* Member Role & Admin Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isAdmin && !isSelf && !isMemberOwner ? (
                            <>
                              <select
                                value={member.role || 'member'}
                                onChange={(e) => handleRoleChange(member.id || member.userId, e.target.value)}
                                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                              >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                              </select>

                              <button
                                type="button"
                                onClick={() => setMemberToRemove(member)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                title="Remove member from space"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                isMemberAdmin
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0052cc] dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {isMemberAdmin && <ShieldCheck className="w-3 h-3 text-[#0052cc] dark:text-blue-400" />}
                              <span>{isMemberOwner ? 'Owner' : isMemberAdmin ? 'Admin' : 'Member'}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Informative Footer for standard members */}
              {!isAdmin && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                  You have full member access to collaborate on all tasks, whiteboards, and discussions in this space.
                </p>
              )}
            </div>
          )}

          {/* TAB 2: INVITE NEW MEMBERS CONTAINER */}
          {mainTab === 'invite' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Invite Collaborators to {currentOrg.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAdmin ? 'Choose how you want to invite new members to this space.' : 'Share the space link with your team.'}
                  </p>
                </div>
              </div>

              {/* Subtabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setInviteTab('link')}
                  className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    inviteTab === 'link'
                      ? 'bg-white dark:bg-slate-700 text-[#0052cc] dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Link className="w-3.5 h-3.5" />
                  <span>Joining Link</span>
                </button>

                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => setInviteTab('email')}
                      className={`flex-1 py-1.5 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        inviteTab === 'email'
                          ? 'bg-white dark:bg-slate-700 text-[#0052cc] dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
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
                          ? 'bg-white dark:bg-slate-700 text-[#0052cc] dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Team Roster</span>
                    </button>
                  </>
                )}
              </div>

              {/* Subtab 1: Joining Link */}
              {inviteTab === 'link' && (
                <div className="space-y-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Shareable Space Link
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={effectiveInviteLink}
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono select-all focus:outline-none"
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
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Anyone who signs into SprintFlow with this secure link will be added to <strong>{currentOrg.name}</strong> as a collaborator.
                  </p>
                </div>
              )}

              {/* Subtab 2: By Email (Admin only) */}
              {isAdmin && inviteTab === 'email' && (
                <form onSubmit={handleInviteCustom} className="space-y-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                    Invite Teammates via Email
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="teammate@company.com (comma separated)..."
                      className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#0052cc] focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-[#0052cc] focus:outline-none cursor-pointer"
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
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Sends an invitation email with an instant-join token.
                  </p>
                </form>
              )}

              {/* Subtab 3: Platform Users (Admin only) */}
              {isAdmin && inviteTab === 'team' && (
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
                    Add Existing Registered Platform Users
                  </span>
                  {availableUsers.length > 0 ? (
                    <form onSubmit={handleInviteUser} className="flex flex-col sm:flex-row gap-2">
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-[#0052cc] focus:outline-none cursor-pointer"
                      >
                        {availableUsers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.title || u.email})
                          </option>
                        ))}
                      </select>

                      <div className="flex gap-2">
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:border-[#0052cc] focus:outline-none cursor-pointer"
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
                      </div>
                    </form>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium py-1">
                      All registered team members are already in this space.
                    </p>
                  )}
                </div>
              )}

              {invitedSuccess && (
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span>{feedbackMsg || 'Member invited successfully!'}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Remove Member Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleConfirmRemoveMember}
        title="Remove Member from Space"
        description={`Are you sure you want to remove "${memberToRemove?.name}" from this space? They will lose access to all tasks, roadmaps, and chat channels within this space.`}
        confirmText="Remove Member"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
