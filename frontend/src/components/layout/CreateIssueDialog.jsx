import React, { useEffect, useRef, useState } from 'react';
import { Bug, CheckSquare, Flag, Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const issueTypes = [
  { id: 'task', label: 'Task', description: 'A focused piece of work', icon: CheckSquare },
  { id: 'story', label: 'Story', description: 'A user-facing outcome', icon: Sparkles },
  { id: 'epic', label: 'Epic', description: 'A larger body of work', icon: Flag },
  { id: 'bug', label: 'Bug', description: 'An issue to investigate', icon: Bug },
];

export function CreateIssueDialog({ isOpen, onClose, initialType = 'task' }) {
  const { addTask, currentOrg, userSpaces, orgs } = useApp();
  const availableSpaces = userSpaces?.length > 0 ? userSpaces : orgs;
  const titleRef = useRef(null);
  const [type, setType] = useState(initialType);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [orgId, setOrgId] = useState(currentOrg?.id || availableSpaces[0]?.id || 'org-1');

  useEffect(() => {
    if (!isOpen) return undefined;
    const focusTimer = window.setTimeout(() => titleRef.current?.focus(), 0);
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    addTask({ title: title.trim(), description: description.trim(), priority, orgId, type });
    setTitle('');
    setDescription('');
    setPriority('medium');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <button className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" aria-label="Close create issue dialog" onClick={onClose} />
      <section role="dialog" aria-modal="true" aria-labelledby="create-issue-title" className="relative z-10 w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 id="create-issue-title" className="text-lg font-extrabold text-[#172b4d]">Create work item</h2>
            <p className="mt-0.5 text-xs text-slate-500">Add it directly to a SprintFlow project.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <fieldset>
            <legend className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Issue type</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {issueTypes.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => setType(id)} className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc] ${type === id ? 'border-blue-300 bg-blue-50 text-[#0052cc]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <Icon className="mx-auto mb-1 h-4 w-4" />{label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block text-xs font-bold text-slate-700">Summary
            <input ref={titleRef} value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="What needs to happen?" className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0052cc] focus:bg-white focus:outline-none" />
          </label>
          <label className="block text-xs font-bold text-slate-700">Description <span className="font-normal text-slate-400">(optional)</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows="3" placeholder="Add helpful context..." className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0052cc] focus:bg-white focus:outline-none" />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="text-xs font-bold text-slate-700">Space / Project
              <select value={orgId} onChange={(event) => setOrgId(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-[#0052cc] focus:outline-none">{availableSpaces.map((org) => <option key={org.id} value={org.id}>{org.name}</option>)}</select>
            </label>
            <label className="text-xs font-bold text-slate-700">Priority
              <select value={priority} onChange={(event) => setPriority(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700 focus:border-[#0052cc] focus:outline-none"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
            </label>
          </div>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={onClose} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]">Cancel</button><button type="submit" className="rounded-xl bg-[#0052cc] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#0041a8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]">Create {issueTypes.find((item) => item.id === type)?.label}</button></div>
        </form>
      </section>
    </div>
  );
}
