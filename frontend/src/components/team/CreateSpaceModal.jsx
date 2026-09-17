import React, { useEffect, useRef, useState } from 'react';
import {
  BriefcaseBusiness,
  Check,
  Copy,
  Link,
  Plus,
  Send,
  Sparkles,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const spaceColors = [
  { id: '#0052cc', label: 'Classic Blue' },
  { id: '#00ff66', label: 'Cyber Green' },
  { id: '#00f0ff', label: 'Neon Cyan' },
  { id: '#ffb000', label: 'Amber Gold' },
  { id: '#8b5cf6', label: 'Purple Pulse' },
  { id: '#ec4899', label: 'Pink Neon' },
];

export function CreateSpaceModal({ isOpen, onClose }) {
  const { createSpace, allUsers, currentUser } = useApp();
  const nameRef = useRef(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#0052cc');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [customEmailOrName, setCustomEmailOrName] = useState('');
  const [customInvites, setCustomInvites] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [inviteTab, setInviteTab] = useState('link'); // 'link' | 'email' | 'team'

  // Generate dynamic invite link preview
  const inviteCode = (name.trim() ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'space') + '-' + (Math.random().toString(36).substring(2, 7));
  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/join/${inviteCode}`;

  // Filter out current user
  const availableUsers = (allUsers || []).filter(
    (u) => u.id !== currentUser?.id && u.id !== 'usr-root'
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedMemberIds([]);
      setCustomInvites([]);
      setCustomEmailOrName('');
      setIsCopied(false);
      setInviteTab('link');
      return undefined;
    }
    const focusTimer = window.setTimeout(() => nameRef.current?.focus(), 50);
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleMember = (userId) => {
    setSelectedMemberIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAddCustomInvite = (e) => {
    e.preventDefault();
    if (!customEmailOrName.trim()) return;
    if (!customInvites.includes(customEmailOrName.trim())) {
      setCustomInvites((prev) => [...prev, customEmailOrName.trim()]);
    }
    setCustomEmailOrName('');
  };

  const removeCustomInvite = (item) => {
    setCustomInvites((prev) => prev.filter((i) => i !== item));
  };

  const copyInviteLink = () => {
    try {
      navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    createSpace({
      name: name.trim(),
      description: description.trim(),
      color,
      invitedMemberIds: selectedMemberIds,
      customInvites,
    });
    setName('');
    setDescription('');
    setColor('#0052cc');
    setSelectedMemberIds([]);
    setCustomInvites([]);
    onClose();
  };

  const totalInvitedCount = selectedMemberIds.length + customInvites.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" role="presentation">
      <button
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
        aria-label="Close create space modal"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-space-title"
        className="relative z-10 w-full max-w-lg my-auto rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 fade-in font-sans flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-[#0052cc]">
              <BriefcaseBusiness className="w-4 h-4" />
            </div>
            <div>
              <h2 id="create-space-title" className="text-base font-extrabold text-[#172b4d] tracking-tight leading-tight">
                Create New Space
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Workspace for your team, boards, roadmap, and chat.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Space Name */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Space Name <span className="text-rose-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Autonomous AI Labs, Quantum Sec..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0052cc] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Description <span className="font-normal text-slate-500">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short summary of what this space is for..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-[#0052cc] focus:bg-white focus:outline-none transition-colors"
            />
          </div>

          {/* Accent Color Selection */}
          <div className="flex items-center justify-between pt-0.5 pb-0.5">
            <label className="text-xs font-bold text-slate-800">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              {spaceColors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  title={c.label}
                  className={`w-5 h-5 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                    color === c.id ? 'ring-2 ring-offset-1 ring-[#0052cc] scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.id }}
                />
              ))}
            </div>
          </div>

          {/* Member Invitation Container */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-[#0052cc]" />
                <span className="text-xs font-bold text-slate-800">Invite Members</span>
              </div>
              {totalInvitedCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0052cc] border border-blue-200">
                  {totalInvitedCount} invited
                </span>
              )}
            </div>

            {/* Invite Tabs */}
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
                <span>By Email {customInvites.length > 0 && `(${customInvites.length})`}</span>
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
                <span>Team Roster {selectedMemberIds.length > 0 && `(${selectedMemberIds.length})`}</span>
              </button>
            </div>

            {/* Tab 1: Share Joining Link */}
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
                    onClick={copyInviteLink}
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

            {/* Tab 2: Invite by Email / Username */}
            {inviteTab === 'email' && (
              <div className="space-y-2.5 animate-in fade-in duration-150">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customEmailOrName}
                    onChange={(e) => setCustomEmailOrName(e.target.value)}
                    placeholder="colleague@company.com or username..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomInvite(e);
                      }
                    }}
                    className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-[#0052cc] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomInvite}
                    disabled={!customEmailOrName.trim()}
                    className="px-4 py-2 rounded-lg bg-[#0052cc] hover:bg-[#0041a8] text-white disabled:opacity-40 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                {customInvites.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {customInvites.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-[#0052cc] border border-blue-200 text-xs font-bold"
                      >
                        <span>{item}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomInvite(item)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Select from Registered Team Members */}
            {inviteTab === 'team' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-1 animate-in fade-in duration-150">
                {availableUsers.map((user) => {
                  const isSelected = selectedMemberIds.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleMember(user.id)}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-300 bg-blue-50 text-[#0052cc]'
                          : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate leading-tight">{user.name}</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">{user.title || user.email}</p>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#0052cc] border-[#0052cc] text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 bg-slate-50 rounded-b-2xl flex-shrink-0">
          <span className="text-xs text-slate-600 font-medium">
            You will become the <strong className="text-slate-800 font-bold">Admin</strong>
          </span>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!name.trim()}
              className="rounded-xl bg-[#0052cc] px-5 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#0041a8] disabled:opacity-50 cursor-pointer"
            >
              Create Space
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
