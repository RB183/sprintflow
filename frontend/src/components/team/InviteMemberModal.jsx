import React, { useEffect, useState } from 'react';
import {
  Check,
  Copy,
  Link,
  UserPlus,
  Users,
  X,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { api } from '../../services/api';

export function InviteMemberModal({ isOpen, onClose }) {
  const { currentOrg, members, allUsers, inviteMemberToSpace, removeMemberFromSpace, currentUser } = useApp();
  const toast = useToast();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [customEmail, setCustomEmail] = useState('');
  const [invitedSuccess, setInvitedSuccess] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [inviteTab, setInviteTab] = useState('link'); // 'link' | 'email' | 'team'
  const [shareableLink, setShareableLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [memberToRemove, setMemberToRemove] = useState(null);

  // Role check: Only admin or owner can invite
  const isOwner = currentOrg?.ownerId === currentUser?.id;
  const isAdmin = isOwner || currentOrg?.role === 'admin';

  // Available registered users not yet in space
  const availableUsers = (allUsers || []).filter(
    (u) => !members.some((m) => m.id === u.id)
  );

  const fallbackInviteLink = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/join/${currentOrg.slug || currentOrg.id}`;
  const effectiveInviteLink = shareableLink || fallbackInviteLink;

  useEffect(() => {
    if (availableUsers.length > 0 && !selectedUserId) {
      setSelectedUserId(availableUsers[0].id);
    }
  }, [availableUsers, selectedUserId]);

  useEffect(() => {
    if (isOpen && currentOrg?.id && isAdmin) {
      // Fetch or generate shareable token
      setIsGeneratingLink(true);
      api.generateInviteLink(currentOrg.id, 'member')
        .then((res) => {
          if (res?.inviteUrl) {
            setShareableLink(res.inviteUrl);
          }
        })
        .catch(() => {})
        .finally(() => setIsGeneratingLink(false));
    }
  }, [isOpen, currentOrg?.id, isAdmin]);

  useEffect(() => {
    if (!isOpen) {
      setInvitedSuccess(false);
      setCustomEmail('');
      setIsCopied(false);
      setInviteTab('link');
      setFeedbackMsg('');
      return undefined;
    }
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

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
    
    // Support comma/space separated multiple emails
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
        aria-label="Close invite member modal"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-member-title"
        className="relative z-10 w-full max-w-lg my-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl animate-in zoom-in-95 fade-in font-sans flex flex-col max-h-[90vh] text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0052cc] dark:text-blue-400">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 id="invite-member-title" className="text-base font-extrabold text-[#172b4d] dark:text-slate-100 tracking-tight leading-tight">
                Manage Space Members
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Space: <strong className="text-[#0052cc] dark:text-blue-400">{currentOrg.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!isAdmin ? (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Member Access:</strong> Only space administrators can invite new members or change roles. You have full access to view and collaborate on all tasks in this space.
              </div>
            </div>
          ) : (
            /* Invite Container with Tabs */
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-[#0052cc] dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Invite New Members</span>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Share link or invite by email</span>
              </div>

              {/* Tabs */}
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
              </div>

              {/* Tab 1: Joining Link */}
              {inviteTab === 'link' && (
                <div className="space-y-2 animate-in fade-in duration-150">
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
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    Authenticated users with this secure token will automatically be enrolled in this space.
                  </p>
                </div>
              )}

              {/* Tab 2: By Email */}
              {inviteTab === 'email' && (
                <form onSubmit={handleInviteCustom} className="space-y-2.5 animate-in fade-in duration-150">
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
                    Sends a transactional invitation email with an instant-join token.
                  </p>
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

          {/* Current Space Members List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Current Members ({members.length})
              </span>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                      alt={member.name}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {member.name} {member.id === currentUser?.id && '(You)'}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {member.title || member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isAdmin && member.id !== currentUser?.id ? (
                      <>
                        <select
                          value={member.role || 'member'}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => setMemberToRemove(member)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Remove member from space"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        member.role === 'admin'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0052cc] dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {member.role || 'member'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
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
