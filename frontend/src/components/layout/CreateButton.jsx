import React, { useEffect, useRef, useState } from 'react';
import { Bug, CheckSquare, ChevronDown, Flag, Plus, Sparkles } from 'lucide-react';
import { CreateIssueDialog } from './CreateIssueDialog';

const options = [
  { id: 'task', label: 'Create Task', icon: CheckSquare },
  { id: 'story', label: 'Create Story', icon: Sparkles },
  { id: 'epic', label: 'Create Epic', icon: Flag },
  { id: 'bug', label: 'Create Bug', icon: Bug },
];

export function CreateButton() {
  const containerRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dialogType, setDialogType] = useState(null);

  useEffect(() => {
    const closeMenu = (event) => {
      if (!containerRef.current?.contains(event.target)) setIsMenuOpen(false);
    };
    const closeOnEscape = (event) => event.key === 'Escape' && setIsMenuOpen(false);
    document.addEventListener('mousedown', closeMenu);
    window.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('mousedown', closeMenu); window.removeEventListener('keydown', closeOnEscape); };
  }, []);

  const chooseType = (type) => { setDialogType(type); setIsMenuOpen(false); };
  return <div ref={containerRef} className="relative">
    <button type="button" onClick={() => setIsMenuOpen((open) => !open)} aria-haspopup="menu" aria-expanded={isMenuOpen} className="flex items-center gap-1.5 rounded-lg bg-[#0052cc] px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-[#0041a8] active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]"><Plus className="h-4 w-4" /><span>Create</span><ChevronDown className="h-3 w-3" /></button>
    {isMenuOpen && <div role="menu" aria-label="Create work item" className="absolute right-0 z-50 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
      {options.map(({ id, label, icon: Icon }) => <button role="menuitem" key={id} type="button" onClick={() => chooseType(id)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-[#0052cc] focus-visible:bg-blue-50 focus-visible:outline-none"><Icon className="h-4 w-4 text-[#0052cc]" />{label}</button>)}
    </div>}
    <CreateIssueDialog key={dialogType || 'closed'} isOpen={dialogType !== null} initialType={dialogType || 'task'} onClose={() => setDialogType(null)} />
  </div>;
}
