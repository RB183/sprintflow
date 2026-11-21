import React, { useState } from 'react';
import {
  AppWindow,
  Archive,
  ArrowRight,
  Flag,
  LayoutDashboard,
  PanelsTopLeft,
  Star,
  Users,
  Target,
  FileText,
  Calendar,
  Sparkles,
  ExternalLink,
  Plus,
  CheckCircle2,
  TrendingUp,
  Trash2,
  Edit2,
  Settings,
  GitBranch,
  MessageSquare,
  Webhook,
  Download,
  X,
  Sliders,
  Check,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

export function WorkspacePage() {
  const {
    workspacePage,
    recentPages,
    userSpaces,
    orgs,
    starredOrgIds,
    toggleStarredOrg,
    selectOrg,
    setTeamTab,
    setViewMode,
    allTasks,
    navigateTo,
    currentUser,
    deleteSpace,
  } = useApp();

  const activeSpaces = userSpaces?.length ? userSpaces : orgs;
  const goToOrg = (orgId, tab = 'board') => {
    selectOrg(orgId);
    setViewMode('team');
    setTeamTab(tab);
  };

  if (workspacePage === 'plans') {
    return <PlansView onOpenBoard={() => { setViewMode('team'); setTeamTab('board'); }} />;
  }
  if (workspacePage === 'assets') {
    return <AssetsView onOpenCanvas={() => { setViewMode('team'); setTeamTab('canvas'); }} />;
  }
  if (workspacePage === 'goals') {
    return <GoalsView onOpenRoadmap={() => { setViewMode('team'); setTeamTab('roadmap'); }} />;
  }

  if (workspacePage === 'recent') {
    return (
      <PageShell title="Recent" subtitle="Pick up where you left off.">
        <div className="space-y-2">
          {recentPages
            .filter((page) => page !== 'recent')
            .map((page) => (
              <button
                key={page}
                onClick={() => navigateTo(page)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-left text-sm font-semibold text-slate-800 dark:text-slate-100 hover:border-[#0052cc] hover:text-[#0052cc] dark:hover:text-blue-400 cursor-pointer transition-colors shadow-xs"
              >
                <span className="capitalize">{page === 'personal' ? 'For you' : page}</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
        </div>
      </PageShell>
    );
  }

  if (workspacePage === 'starred') {
    return (
      <PageShell title="Starred" subtitle="Spaces you have pinned for faster access.">
        <ProjectList
          orgs={activeSpaces.filter((org) => starredOrgIds.includes(org.id))}
          onOpen={goToOrg}
          onStar={toggleStarredOrg}
          starredOrgIds={starredOrgIds}
          empty="Star spaces from the Spaces list to see them here."
          onDeleteSpace={deleteSpace}
          currentUserId={currentUser?.id}
        />
      </PageShell>
    );
  }

  if (workspacePage === 'teams' || workspacePage === 'spaces') {
    return (
      <PageShell title="Spaces" subtitle="Your accessible SprintFlow spaces and workspaces.">
        <ProjectList
          orgs={activeSpaces}
          onOpen={goToOrg}
          onStar={toggleStarredOrg}
          starredOrgIds={starredOrgIds}
          onDeleteSpace={deleteSpace}
          currentUserId={currentUser?.id}
        />
      </PageShell>
    );
  }

  if (workspacePage === 'apps') {
    return <AppsView />;
  }

  if (workspacePage === 'filters') {
    return (
      <PageShell title="Filters" subtitle="A live view of your actual work items across all spaces.">
        <div className="space-y-2">
          {allTasks.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 text-xs font-medium">
              No tasks found across spaces. Create a card on any Kanban board to view it here.
            </div>
          ) : (
            allTasks.slice(0, 20).map((task) => (
              <button
                onClick={() => goToOrg(task.orgId)}
                key={task.id}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-left hover:border-[#0052cc] dark:hover:border-blue-500 transition-colors cursor-pointer shadow-xs"
              >
                <span className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-[#0052cc] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    {task.key || 'TSK'}
                  </span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{task.title}</span>
                </span>
                <span className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                  {task.status?.replace('_', ' ')}
                </span>
              </button>
            ))
          )}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title="Workspace" subtitle="SprintFlow workspace">
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center">
        <PanelsTopLeft className="mx-auto h-8 w-8 text-[#0052cc] dark:text-blue-400" />
        <h2 className="mt-3 text-sm font-bold text-slate-800 dark:text-slate-100">SprintFlow Workspace</h2>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Choose an item in the sidebar navigation to view and manage team progress.
        </p>
      </div>
    </PageShell>
  );
}

// 1. Fully-functional Plans View (MongoDB-backed Sprint Planning)
function PlansView({ onOpenBoard }) {
  const { plans, addPlan, updatePlan, deletePlan } = useApp();
  const [filter, setFilter] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newStatus, setNewStatus] = useState('Active');
  const [newPoints, setNewPoints] = useState(40);
  const [newStartDate, setNewStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTargetDate, setNewTargetDate] = useState(() => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [newDeliverables, setNewDeliverables] = useState('API Integration, Unit Tests, Cloud Deploy');

  const filteredPlans = plans.filter((p) => {
    if (filter === 'All') return true;
    return (p.status || '').toLowerCase() === filter.toLowerCase();
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const delivs = newDeliverables
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    await addPlan({
      title: newTitle.trim(),
      status: newStatus,
      committedPoints: Number(newPoints) || 40,
      startDate: newStartDate,
      targetDate: newTargetDate,
      deliverables: delivs,
    });

    setNewTitle('');
    setIsCreateOpen(false);
  };

  const handleStatusChange = async (planId, status) => {
    await updatePlan(planId, { status });
  };

  const handleIncrementPoints = async (plan, delta) => {
    const committed = plan.committedPoints || 40;
    const completed = Math.max(0, Math.min(committed, (plan.completedPoints || 0) + delta));
    await updatePlan(plan.id || plan._id, { completedPoints: completed });
  };

  return (
    <PageShell
      title="Sprint Plans & Velocity"
      subtitle="Manage sprint capacity, velocity targets, and milestone deliveries."
    >
      <div className="space-y-4">
        {/* Controls & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'Active', 'Upcoming', 'Completed'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filter === tab
                    ? 'bg-[#0052cc] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold transition-all shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Sprint Plan</span>
          </button>
        </div>

        {/* Plans List */}
        {filteredPlans.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
            <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">No sprint plans found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create your first sprint plan to establish committed story points, dates, and deliverables.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 px-4 py-2 bg-[#0052cc] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#0041a8] cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Sprint Plan</span>
            </button>
          </div>
        ) : (
          filteredPlans.map((plan) => {
            const planId = plan.id || plan._id;
            const velocity = plan.velocityRate || (plan.committedPoints > 0 ? Math.round(((plan.completedPoints || 0) / plan.committedPoints) * 100) : 0);

            return (
              <div
                key={planId}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-slate-900 dark:text-slate-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{plan.title}</h3>
                      <select
                        value={plan.status || 'Active'}
                        onChange={(e) => handleStatusChange(planId, e.target.value)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none"
                      >
                        <option value="Active">Active</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0052cc] dark:text-blue-400" />
                      <span>{plan.startDate || '2026-11-10'} &rarr; {plan.targetDate || '2026-11-24'}</span>
                      <span className="text-slate-300 dark:text-slate-700">|</span>
                      <span>Lead: {plan.lead || 'Lead Architect'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Velocity</span>
                      <p className="text-sm font-black text-[#0052cc] dark:text-blue-400">
                        {plan.completedPoints || 0} / {plan.committedPoints || 40} pts ({velocity}%)
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleIncrementPoints(plan, -5)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold hover:bg-slate-100 text-slate-700 dark:text-slate-300 cursor-pointer"
                        title="-5 Points"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={() => handleIncrementPoints(plan, 5)}
                        className="w-7 h-7 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold hover:bg-slate-100 text-slate-700 dark:text-slate-300 cursor-pointer"
                        title="+5 Points"
                      >
                        +5
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={onOpenBoard}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0052cc] dark:text-blue-300 text-xs font-bold transition-colors cursor-pointer border border-blue-200 dark:border-blue-800 flex items-center gap-1"
                    >
                      <span>Board</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setPlanToDelete(plan)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-[#0052cc] dark:bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${velocity}%` }}
                  />
                </div>

                {/* Deliverables tags */}
                {plan.deliverables?.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Deliverables:</span>
                    {plan.deliverables.map((deliv, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-300"
                      >
                        {deliv}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Sprint Plan Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base">Create Sprint Plan</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Sprint Name / Objective
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sprint 26 — High Availability & Sharding"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Committed Story Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newPoints}
                    onChange={(e) => setNewPoints(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc] cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Deliverables (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Lock, Replication Setup, Load Testing"
                  value={newDeliverables}
                  onChange={(e) => setNewDeliverables(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold cursor-pointer"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(planToDelete)}
        onClose={() => setPlanToDelete(null)}
        onConfirm={() => {
          if (planToDelete) {
            deletePlan(planToDelete.id || planToDelete._id);
            setPlanToDelete(null);
          }
        }}
        title="Delete Sprint Plan"
        description={`Are you sure you want to permanently delete "${planToDelete?.title}"? All velocity and deliverable tracking will be removed.`}
        confirmText="Delete Plan"
        cancelText="Cancel"
        variant="danger"
      />
    </PageShell>
  );
}

// 2. Fully-functional Goals View (MongoDB-backed OKRs & Progress Sliders)
function GoalsView({ onOpenRoadmap }) {
  const { goals, addGoal, updateGoal, deleteGoal } = useApp();
  const [filter, setFilter] = useState('All');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newStatus, setNewStatus] = useState('On Track');
  const [newProgress, setNewProgress] = useState(25);
  const [newTargetDate, setNewTargetDate] = useState(() => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [newKeyResults, setNewKeyResults] = useState('Sub-50ms WebSocket broadcast latency, Zero-downtime MongoDB indexing, 99.9% Uptime');

  const filteredGoals = goals.filter((g) => {
    if (filter === 'All') return true;
    return (g.status || '').toLowerCase() === filter.toLowerCase();
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const krs = newKeyResults
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
      .map((text) => ({ text, done: false }));

    await addGoal({
      title: newTitle.trim(),
      status: newStatus,
      progress: Number(newProgress) || 0,
      targetDate: newTargetDate,
      keyResults: krs,
    });

    setNewTitle('');
    setIsCreateOpen(false);
  };

  const handleSliderChange = async (goalId, value) => {
    await updateGoal(goalId, { progress: Number(value) });
  };

  const handleStatusChange = async (goalId, status) => {
    await updateGoal(goalId, { status });
  };

  const handleToggleKeyResult = async (goal, index) => {
    const goalId = goal.id || goal._id;
    const currentKrs = [...(goal.keyResults || [])];
    if (currentKrs[index]) {
      currentKrs[index].done = !currentKrs[index].done;
      const completedCount = currentKrs.filter((k) => k.done).length;
      const autoProgress = Math.round((completedCount / currentKrs.length) * 100);
      await updateGoal(goalId, {
        keyResults: currentKrs,
        progress: autoProgress,
        status: autoProgress === 100 ? 'Completed' : goal.status,
      });
    }
  };

  return (
    <PageShell
      title="Team Objectives & Key Results (OKRs)"
      subtitle="Track quarterly horizons, measurable key outcomes, and execution targets."
    >
      <div className="space-y-4">
        {/* Filter bar & Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['All', 'On Track', 'At Risk', 'Behind', 'Completed'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filter === tab
                    ? 'bg-[#0052cc] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold transition-all shadow-xs cursor-pointer ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create Goal / OKR</span>
          </button>
        </div>

        {/* Goals List */}
        {filteredGoals.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
            <Target className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-100">No strategic goals tracked yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Define team objectives with measurable key results and track live progress towards company targets.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 px-4 py-2 bg-[#0052cc] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#0041a8] cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Goal</span>
            </button>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const goalId = goal.id || goal._id;
            const progress = goal.progress || 0;

            const badgeStyles = {
              'On Track': 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
              'At Risk': 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
              'Behind': 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
              'Completed': 'bg-blue-50 dark:bg-blue-950/60 text-[#0052cc] dark:text-blue-400 border-blue-200 dark:border-blue-800',
            };

            return (
              <div
                key={goalId}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-slate-900 dark:text-slate-100"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-[#0052cc] dark:text-blue-400 flex-shrink-0" />
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{goal.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <select
                        value={goal.status || 'On Track'}
                        onChange={(e) => handleStatusChange(goalId, e.target.value)}
                        className={`rounded-lg border px-2 py-0.5 text-[11px] font-bold cursor-pointer focus:outline-none ${
                          badgeStyles[goal.status] || badgeStyles['On Track']
                        }`}
                      >
                        <option value="On Track">On Track</option>
                        <option value="At Risk">At Risk</option>
                        <option value="Behind">Behind</option>
                        <option value="Completed">Completed</option>
                      </select>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Target Date: {goal.targetDate || 'End of Quarter'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-base font-black text-[#0052cc] dark:text-blue-400">{progress}%</span>
                    <button
                      type="button"
                      onClick={onOpenRoadmap}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0052cc] dark:text-blue-300 text-xs font-bold hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200 dark:border-blue-800"
                    >
                      Roadmap
                    </button>
                    <button
                      type="button"
                      onClick={() => setGoalToDelete(goal)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Interactive Live Progress Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Progress Slider (Drag to adjust target completion)</span>
                    <span className="font-bold text-[#0052cc] dark:text-blue-400">{progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={(e) => handleSliderChange(goalId, e.target.value)}
                    className="w-full accent-[#0052cc] cursor-pointer"
                  />
                </div>

                {/* Key Results Checklist */}
                {goal.keyResults?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Key Results (Click check to complete)
                    </span>
                    <div className="space-y-1.5">
                      {goal.keyResults.map((kr, kIdx) => (
                        <div
                          key={kIdx}
                          onClick={() => handleToggleKeyResult(goal, kIdx)}
                          className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-200 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                        >
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                              kr.done
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                            }`}
                          >
                            {kr.done && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className={kr.done ? 'line-through text-slate-400 dark:text-slate-500' : ''}>
                            {kr.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Create Goal Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base">Create Objective / OKR</h3>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Objective Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 2026: Sub-50ms WebSocket Broadcast Latency"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc] cursor-pointer"
                  >
                    <option value="On Track">On Track</option>
                    <option value="At Risk">At Risk</option>
                    <option value="Behind">Behind</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Initial Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newProgress}
                    onChange={(e) => setNewProgress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Key Results (Comma-separated)
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Zero-downtime MongoDB indexing, 99.9% Uptime SLA, Multi-tenant sharding"
                  value={newKeyResults}
                  onChange={(e) => setNewKeyResults(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold cursor-pointer"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(goalToDelete)}
        onClose={() => setGoalToDelete(null)}
        onConfirm={() => {
          if (goalToDelete) {
            deleteGoal(goalToDelete.id || goalToDelete._id);
            setGoalToDelete(null);
          }
        }}
        title="Delete Objective"
        description={`Are you sure you want to permanently delete "${goalToDelete?.title}"? All key results progress will be lost.`}
        confirmText="Delete Objective"
        cancelText="Cancel"
        variant="danger"
      />
    </PageShell>
  );
}

// 3. Fully-functional Apps & Integrations View (MongoDB-backed configuration)
function AppsView() {
  const { apps, toggleApp, configureApp } = useApp();
  const toast = useToast();
  const [activeConfigApp, setActiveConfigApp] = useState(null);
  const [configValues, setConfigValues] = useState({});

  const defaultIntegrations = [
    {
      appId: 'github',
      name: 'GitHub VCS & PR Sync',
      desc: 'Link commits, branch statuses, and automated PR merge webhooks to tasks.',
      category: 'Developer Tools',
      icon: GitBranch,
    },
    {
      appId: 'slack',
      name: 'Slack Notification Dispatcher',
      desc: 'Stream sprint progress, blocker alerts, and card assignments to Slack channels.',
      category: 'Communication',
      icon: MessageSquare,
    },
    {
      appId: 'webhooks',
      name: 'Custom Webhooks & Automation',
      desc: 'Trigger HTTP webhooks on card creation, moves, and completion events.',
      category: 'Automation',
      icon: Webhook,
    },
    {
      appId: 'canvas_sync',
      name: 'Architecture Canvas Live Mesh',
      desc: 'Real-time WebSocket synchronization for system architecture whiteboard drawings.',
      category: 'Collaboration',
      icon: LayoutDashboard,
    },
    {
      appId: 'csv_export',
      name: 'Automated Data & CSV Exporter',
      desc: 'One-click scheduled snapshot export of all sprint telemetry, cards, and velocity logs.',
      category: 'Telemetry',
      icon: Download,
    },
  ];

  const appList = defaultIntegrations.map((def) => {
    const live = apps.find((a) => a.appId === def.appId);
    return {
      ...def,
      enabled: live ? live.enabled : false,
      config: live ? live.config : {},
    };
  });

  const handleOpenConfig = (app) => {
    setActiveConfigApp(app);
    setConfigValues(app.config || {});
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    if (!activeConfigApp) return;

    await configureApp(activeConfigApp.appId, configValues);
    setActiveConfigApp(null);
  };

  return (
    <PageShell
      title="Workspace Apps & Integrations"
      subtitle="Connect your developer tooling, webhooks, alerting bots, and sync services."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {appList.map((app) => {
          const Icon = app.icon;
          return (
            <div
              key={app.appId}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 text-slate-900 dark:text-slate-100"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0052cc] dark:text-blue-400">
                    <Icon className="w-5 h-5" />
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={app.enabled}
                      onChange={(e) => toggleApp(app.appId, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0052cc]"></div>
                  </label>
                </div>

                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{app.name}</h3>
                    <span
                      className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-extrabold ${
                        app.enabled
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {app.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {app.desc}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">{app.category}</span>
                <button
                  type="button"
                  onClick={() => handleOpenConfig(app)}
                  className="px-3 py-1 rounded-lg text-xs font-bold text-[#0052cc] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/60 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* App Configuration Modal */}
      {activeConfigApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base">Configure {activeConfigApp.name}</h3>
              <button
                type="button"
                onClick={() => setActiveConfigApp(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-4">
              {activeConfigApp.appId === 'github' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Repository (owner/repo)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. organization/sprintflow-core"
                      value={configValues.repo || ''}
                      onChange={(e) => setConfigValues({ ...configValues, repo: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Personal Access Token / Secret
                    </label>
                    <input
                      type="password"
                      placeholder="ghp_••••••••••••••••"
                      value={configValues.token || ''}
                      onChange={(e) => setConfigValues({ ...configValues, token: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                    />
                  </div>
                </>
              )}

              {activeConfigApp.appId === 'slack' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Slack Incoming Webhook URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://hooks.slack.com/services/..."
                      value={configValues.webhookUrl || ''}
                      onChange={(e) => setConfigValues({ ...configValues, webhookUrl: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Alerts Channel
                    </label>
                    <input
                      type="text"
                      placeholder="#sprint-alerts"
                      value={configValues.channel || ''}
                      onChange={(e) => setConfigValues({ ...configValues, channel: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                    />
                  </div>
                </>
              )}

              {activeConfigApp.appId === 'webhooks' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Target Webhook URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://api.yourdomain.com/events/sprintflow"
                      value={configValues.endpoint || ''}
                      onChange={(e) => setConfigValues({ ...configValues, endpoint: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      HMAC Signature Secret
                    </label>
                    <input
                      type="text"
                      placeholder="whsec_••••••••••••••••"
                      value={configValues.secret || ''}
                      onChange={(e) => setConfigValues({ ...configValues, secret: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                    />
                  </div>
                </>
              )}

              {activeConfigApp.appId === 'canvas_sync' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Mesh Auto-Snapshot Interval
                  </label>
                  <select
                    value={configValues.snapshotRate || '30s'}
                    onChange={(e) => setConfigValues({ ...configValues, snapshotRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                  >
                    <option value="15s">Every 15 seconds</option>
                    <option value="30s">Every 30 seconds</option>
                    <option value="60s">Every minute</option>
                  </select>
                </div>
              )}

              {activeConfigApp.appId === 'csv_export' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Export Format & Encoding
                  </label>
                  <select
                    value={configValues.encoding || 'utf-8'}
                    onChange={(e) => setConfigValues({ ...configValues, encoding: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-[#0052cc]"
                  >
                    <option value="utf-8">CSV (UTF-8 Comma-Delimited)</option>
                    <option value="json">Structured JSON Array</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveConfigApp(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold cursor-pointer"
                >
                  Save Integration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}

// 4. Shared Assets & Specs View
function AssetsView({ onOpenCanvas }) {
  const assets = [
    { title: 'Core Architecture Diagram', category: 'Architecture', format: 'Whiteboard Canvas', size: '1.4 MB' },
    { title: 'SprintFlow Design Tokens & UI Kit', category: 'Design System', format: 'Figma Tokens', size: '420 KB' },
    { title: 'OpenAPI 3.1 REST Specification', category: 'Backend Spec', format: 'YAML / JSON', size: '85 KB' },
    { title: 'Database Schema & Index Definitions', category: 'Database', format: 'Mongoose Model', size: '34 KB' },
  ];

  return (
    <PageShell title="Shared Assets & Specs" subtitle="Architecture diagrams, design tokens, and documentation.">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {assets.map((item, idx) => (
          <div
            key={idx}
            onClick={onOpenCanvas}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#0052cc] dark:hover:border-blue-500 transition-colors shadow-xs flex items-start justify-between cursor-pointer group"
          >
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[#0052cc] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                {item.category}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#0052cc] dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.format} • {item.size}</p>
            </div>
            <FileText className="w-5 h-5 text-slate-400 group-hover:text-[#0052cc] dark:group-hover:text-blue-400 transition-colors" />
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function PageShell({ title, subtitle, children }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 font-sans">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 font-medium">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function ProjectList({ orgs, onOpen, onStar, starredOrgIds, empty, onDeleteSpace, currentUserId }) {
  const [spaceToDelete, setSpaceToDelete] = useState(null);

  if (!orgs.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-10 text-center text-sm text-slate-600 dark:text-slate-400">
        {empty || 'No spaces available.'}
      </div>
    );
  }
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        {orgs.map((org) => {
          const starred = starredOrgIds.includes(org.id);
          const ownerIdStr = org.ownerId?._id ? org.ownerId._id.toString() : org.ownerId?.toString();
          const isAdmin = org.role === 'admin' || (currentUserId && ownerIdStr === currentUserId.toString());

          return (
            <div key={org.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: org.color || '#0052cc' }} />
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">{org.name}</h2>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {org.role || 'Member'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{org.description || 'Sprint workspace'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin && onDeleteSpace && (
                      <button
                        type="button"
                        onClick={() => setSpaceToDelete(org)}
                        aria-label={`Delete ${org.name}`}
                        title="Delete Space (Admin only)"
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onStar(org.id)}
                      aria-label={`${starred ? 'Unstar' : 'Star'} ${org.name}`}
                      className={`rounded-lg p-1.5 cursor-pointer ${
                        starred ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'
                      }`}
                    >
                      <Star className="h-4 w-4" fill={starred ? 'currentColor' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => onOpen(org.id)}
                  className="text-xs font-bold text-[#0052cc] dark:text-blue-400 hover:text-[#0041a8] dark:hover:text-blue-300 cursor-pointer inline-flex items-center"
                >
                  Open project <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                </button>
                {isAdmin && (
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                    Admin access
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={Boolean(spaceToDelete)}
        onClose={() => setSpaceToDelete(null)}
        onConfirm={async () => {
          if (spaceToDelete && onDeleteSpace) {
            await onDeleteSpace(spaceToDelete.id || spaceToDelete._id);
            setSpaceToDelete(null);
          }
        }}
        title={`Delete "${spaceToDelete?.name}"?`}
        description="Are you sure you want to permanently delete this space? All associated boards, cards, plans, and chat channels will be erased. This action cannot be undone."
        confirmText="Delete Space"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
}
