import React, { useEffect, useMemo, useState } from 'react';
import { AppWindow, Archive, BookOpen, BriefcaseBusiness, ChevronDown, ChevronUp, Filter, Flag, FolderKanban, LayoutDashboard, Map as MapIcon, PanelsTopLeft, Settings2, Sparkles, Star, Users, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const defaultItems = [
  { id: 'personal', label: 'For you', icon: Sparkles }, { id: 'recent', label: 'Recent', icon: PanelsTopLeft }, { id: 'starred', label: 'Starred', icon: Star }, { id: 'apps', label: 'Apps', icon: AppWindow }, { id: 'roadmaps', label: 'Roadmaps', icon: MapIcon }, { id: 'plans', label: 'Plans', icon: BookOpen },
  { id: 'spaces', label: 'Spaces', icon: BriefcaseBusiness, section: 'Workspace' }, { id: 'filters', label: 'Filters', icon: Filter }, { id: 'dashboards', label: 'Dashboards', icon: LayoutDashboard },
  { id: 'assets', label: 'Assets', icon: Archive, section: 'Tools' }, { id: 'teams', label: 'Teams', icon: Users }, { id: 'goals', label: 'Goals', icon: Flag }, { id: 'projects', label: 'Projects', icon: FolderKanban },
];

function readPreferences() {
  try { return JSON.parse(localStorage.getItem('sprintflow_sidebar_preferences')) || {}; } catch { return {}; }
}

export function SidebarNavigation({ isMobileOpen, onClose }) {
  const { workspacePage, navigateTo, setViewMode, setTeamTab } = useApp();
  const [preferences, setPreferences] = useState(readPreferences);
  const items = useMemo(() => {
    const order = preferences.order || defaultItems.map((item) => item.id);
    const byId = new Map(defaultItems.map((item) => [item.id, item]));
    return order.map((id) => byId.get(id)).filter(Boolean).filter((item) => preferences.hidden?.includes(item.id) !== true);
  }, [preferences]);

  useEffect(() => { localStorage.setItem('sprintflow_sidebar_preferences', JSON.stringify(preferences)); }, [preferences]);
  const open = (id) => {
    navigateTo(id);
    if (['personal', 'dashboards'].includes(id)) setViewMode('personal');
    if (['spaces', 'projects'].includes(id)) { setViewMode('team'); setTeamTab('board'); }
    if (id === 'roadmaps') { setViewMode('team'); setTeamTab('roadmap'); }
    onClose?.();
  };

  return <>
    {isMobileOpen && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/25 lg:hidden" />}
    <aside className={`fixed inset-y-16 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white px-3 py-4 shadow-xl transition-transform lg:sticky lg:top-16 lg:z-20 lg:h-[calc(100vh-4rem)] lg:shrink-0 lg:translate-x-0 lg:shadow-none ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`} aria-label="Workspace navigation">
      <div className="mb-3 flex items-center justify-between px-2 lg:hidden"><span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span><button onClick={onClose} aria-label="Close navigation" className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"><X className="h-4 w-4" /></button></div>
      <nav className="min-h-0 flex-1 overflow-y-auto" aria-label="SprintFlow workspace">
        {items.map((item, index) => {
          const previous = items[index - 1]; const Icon = item.icon; const active = workspacePage === item.id || (item.id === 'personal' && workspacePage === 'dashboards');
          return <React.Fragment key={item.id}>
            {item.section && item.section !== previous?.section && <p className="mb-1 mt-4 px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.section}</p>}
            <button onClick={() => open(item.id)} aria-current={active ? 'page' : undefined} className={`mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0052cc] ${active ? 'bg-blue-50 text-[#0052cc]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}><Icon className="h-4 w-4" />{item.label}</button>
          </React.Fragment>;
        })}
      </nav>
      <SidebarCustomizer preferences={preferences} setPreferences={setPreferences} />
    </aside>
  </>;
}

function SidebarCustomizer({ preferences, setPreferences }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const closeOnEscape = (event) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);
  const ordered = (preferences.order || defaultItems.map((item) => item.id)).map((id) => defaultItems.find((item) => item.id === id)).filter(Boolean);
  const move = (id, direction) => setPreferences((current) => {
    const order = [...(current.order || defaultItems.map((item) => item.id))]; const index = order.indexOf(id); const next = index + direction;
    if (next < 0 || next >= order.length) return current;
    [order[index], order[next]] = [order[next], order[index]]; return { ...current, order };
  });
  return <div className="mt-3 border-t border-slate-100 pt-3"><button onClick={() => setOpen(true)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0052cc]"><Settings2 className="h-4 w-4" />Customize sidebar</button>
    {open && <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"><button aria-label="Close sidebar customization" onClick={() => setOpen(false)} className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm" /><section role="dialog" aria-modal="true" aria-labelledby="sidebar-settings-title" className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl"><div className="flex items-start justify-between"><div><h2 id="sidebar-settings-title" className="text-lg font-extrabold text-[#172b4d]">Customize sidebar</h2><p className="mt-0.5 text-xs text-slate-500">Choose what appears and arrange the order.</p></div><button onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-4 max-h-[55vh] space-y-1 overflow-y-auto">{ordered.map((item, index) => { const Icon = item.icon; const hidden = preferences.hidden?.includes(item.id); return <div key={item.id} className="flex items-center gap-2 rounded-xl border border-slate-100 px-2 py-2"><Icon className="h-4 w-4 text-[#0052cc]" /><span className="flex-1 text-xs font-semibold text-slate-700">{item.label}</span><button onClick={() => setPreferences((current) => ({ ...current, hidden: hidden ? (current.hidden || []).filter((id) => id !== item.id) : [...(current.hidden || []), item.id] }))} className="rounded-md px-2 py-1 text-[11px] font-bold text-slate-500 hover:bg-slate-100">{hidden ? 'Show' : 'Hide'}</button><button disabled={index === 0} onClick={() => move(item.id, -1)} aria-label={`Move ${item.label} up`} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button><button disabled={index === ordered.length - 1} onClick={() => move(item.id, 1)} aria-label={`Move ${item.label} down`} className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button></div>; })}</div><div className="mt-4 flex justify-between border-t border-slate-100 pt-4"><button onClick={() => setPreferences({})} className="text-xs font-bold text-[#0052cc] hover:text-[#0041a8]">Reset defaults</button><button onClick={() => setOpen(false)} className="rounded-xl bg-[#0052cc] px-4 py-2 text-xs font-bold text-white hover:bg-[#0041a8]">Done</button></div></section></div>}
  </div>;
}
