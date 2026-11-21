import React, { useState } from 'react';
import {
  Map,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Layers,
  Plus,
  Trash2,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

export function HackerRoadmap() {
  const { roadmapItems, currentOrg, addEpic, deleteEpic, toggleEpicDeliverable } = useApp();
  const toast = useToast();
  const [isAddEpicOpen, setIsAddEpicOpen] = useState(false);
  const [epicToDelete, setEpicToDelete] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newTargetDate, setNewTargetDate] = useState('2026-12-31');
  const [newDeliverables, setNewDeliverables] = useState('Architecture Design, API Integration, Production Deployment');

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'Completed':
        return <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded text-xs font-bold">✓ Completed</span>;
      case 'IN_PROGRESS':
      case 'Active':
        return <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded text-xs font-bold">● In Progress</span>;
      case 'UPCOMING':
      case 'Upcoming':
      default:
        return <span className="text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded text-xs font-bold">Upcoming</span>;
    }
  };

  const handleCreateEpicSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const epicTitle = newTitle.trim();
    const deliverablesList = newDeliverables
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);

    addEpic({
      title: epicTitle,
      targetDate: newTargetDate,
      deliverables: deliverablesList.length > 0 ? deliverablesList : ['Core Architecture', 'Implementation', 'QA Verification'],
    });

    toast.success('Epic created', `"${epicTitle}" added to the roadmap.`);
    setNewTitle('');
    setIsAddEpicOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 font-sans space-y-4 text-[#172b4d]">
      
      {/* Roadmap Top Header */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-[#0052cc]">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#172b4d]">Sprint Roadmap & Milestones</h2>
            <p className="text-xs text-slate-500">Track high-level deliverables and timelines for {currentOrg.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
            {roadmapItems.length} {roadmapItems.length === 1 ? 'Epic' : 'Epics'} Registered
          </span>
          <button
            type="button"
            onClick={() => setIsAddEpicOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Epic</span>
          </button>
        </div>
      </div>

      {/* Epics List */}
      <div className="space-y-4">
        {roadmapItems.length > 0 ? (
          roadmapItems.map((item, idx) => (
            <div
              key={item.id}
              className="p-5 bg-white border border-slate-200 hover:border-blue-300 rounded-2xl shadow-xs space-y-4 transition-all"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400">0{idx + 1}.</span>
                  <h3 className="text-base font-bold text-[#172b4d]">{item.title}</h3>
                  {getStatusBadge(item.status)}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#0052cc]" />
                    <span>{item.startDate} &rarr; {item.targetDate}</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <User className="w-4 h-4 text-purple-600" />
                    <span>Lead: {item.lead}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEpicToDelete(item)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                    title="Delete Epic"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                  <span>Execution Progress (Click deliverables below to update)</span>
                  <span className="font-bold text-[#0052cc]">{item.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500 rounded-full"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>

              {/* Target Deliverables Checklist */}
              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Deliverables & Subsystems (Click to complete)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {item.deliverables.map((deliv, dIdx) => {
                    const isDone = item.progress >= Math.round(((dIdx + 1) / item.deliverables.length) * 100);
                    return (
                      <button
                        key={dIdx}
                        type="button"
                        onClick={() => toggleEpicDeliverable(item.id, dIdx)}
                        className={`p-2.5 rounded-xl border text-xs text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-semibold'
                            : 'bg-slate-50 border-slate-200 hover:border-blue-300 text-slate-700'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isDone ? 'text-emerald-600' : 'text-slate-300'
                          }`}
                        />
                        <span className={`truncate ${isDone ? 'line-through text-slate-500' : ''}`}>
                          {deliv}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white border border-dashed border-slate-200 rounded-2xl">
            <Map className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No epics in this space yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "New Epic" above to create milestones</p>
          </div>
        )}
      </div>

      {/* Add Epic Modal */}
      {isAddEpicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setIsAddEpicOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-[#172b4d]">Create Roadmap Epic</h3>
              <button
                type="button"
                onClick={() => setIsAddEpicOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEpicSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Epic Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Identity & Multi-tenant Federation v2"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0052cc]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Target Completion Date</label>
                <input
                  type="date"
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0052cc]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Deliverables & Milestones (comma separated)
                </label>
                <textarea
                  rows={3}
                  value={newDeliverables}
                  onChange={(e) => setNewDeliverables(e.target.value)}
                  placeholder="e.g. Database Migration, API Endpoints, Frontend UI, Security Review"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0052cc]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddEpicOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold"
                >
                  Create Epic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Epic Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(epicToDelete)}
        onClose={() => setEpicToDelete(null)}
        onConfirm={() => {
          if (epicToDelete) {
            deleteEpic(epicToDelete.id);
            toast.success('Epic deleted', `"${epicToDelete.title}" was removed.`);
            setEpicToDelete(null);
          }
        }}
        title="Delete Milestone Epic"
        description={`Are you sure you want to permanently delete "${epicToDelete?.title || 'this epic'}"? All deliverables tracking for this milestone will be removed.`}
        confirmText="Delete Epic"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
