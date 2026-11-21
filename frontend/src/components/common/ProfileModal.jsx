import React, { useState, useEffect } from 'react';
import { X, User, Briefcase, Camera, Check, Shield } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function ProfileModal({ isOpen, onClose }) {
  const { currentUser, updateCurrentUser } = useApp();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setTitle(currentUser.title || '');
      setAvatar(currentUser.avatar || '');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateCurrentUser({
        name: name.trim(),
        title: title.trim(),
        avatar: avatar.trim(),
      });
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" role="presentation">
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-extrabold text-[#172b4d]">Profile Settings</h3>
            <p className="text-xs text-slate-500">Manage your SprintFlow identity and preferences</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Avatar Preview & Selection */}
          <div className="flex items-center gap-4">
            <img
              src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt="Avatar preview"
              className="w-16 h-16 rounded-full object-cover ring-2 ring-[#0052cc] shadow-sm flex-shrink-0"
            />
            <div className="space-y-1.5 min-w-0 flex-1">
              <label className="text-xs font-bold text-slate-700 block">Avatar Presets</label>
              <div className="flex items-center gap-2">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatar(preset)}
                    className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                      avatar === preset ? 'border-[#0052cc] scale-110 shadow-xs' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Avatar Image URL</label>
            <div className="relative">
              <Camera className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0052cc]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0052cc]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Job Title</label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lead Architect, QA Engineer..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0052cc]"
              />
            </div>
          </div>

          <div className="pt-2">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Shield className="w-3.5 h-3.5 text-[#0052cc]" />
                <span>Account Email</span>
              </span>
              <span className="font-semibold text-slate-800">{currentUser?.email || 'guest@sprintflow.io'}</span>
            </div>
          </div>

          {isSaved && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
