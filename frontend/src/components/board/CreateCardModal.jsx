import React, { useState } from 'react';
import {
  X,
  Plus,
  Bug,
  Sparkles,
  CheckSquare,
  AlertCircle,
  Calendar,
  User,
} from 'lucide-react';
import { useBoard } from '../../context/BoardContext';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';

export function CreateCardModal() {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    createListId,
    setCreateListId,
    lists,
    addCard,
  } = useBoard();

  const { members, allUsers, currentUser } = useApp();
  const assigneeList = (members && members.length > 0) ? members : (allUsers || []);

  const [type, setType] = useState('feature');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [listId, setListId] = useState(createListId || lists[0]?.id || 'list-1');
  const [assigneeId, setAssigneeId] = useState(currentUser?.id || '');
  const [dueDate, setDueDate] = useState('');

  // Type-specific state
  const [storyPoints, setStoryPoints] = useState(5);
  const [severity, setSeverity] = useState('major');
  const [environment, setEnvironment] = useState('Staging');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(4);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let metadata = {};
    if (type === 'feature') {
      metadata = {
        storyPoints: Number(storyPoints) || 3,
        milestone: 'Current Sprint',
        acceptanceCriteria: [
          { text: 'Design and unit tests verified', done: false },
          { text: 'Peer review and QA passed', done: false },
        ],
      };
    } else if (type === 'bug') {
      metadata = {
        severity,
        environment,
        reproductionSteps,
      };
    } else {
      metadata = {
        estimatedHours: Number(estimatedHours) || 2,
        subtasks: [
          { text: 'Setup requirements and scope', done: false },
          { text: 'Implement and verify', done: false },
        ],
      };
    }

    addCard(type, {
      title: title.trim(),
      description: description.trim(),
      priority,
      listId: listId || createListId || lists[0]?.id,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      metadata,
    });

    // Reset and close
    setTitle('');
    setDescription('');
    setReproductionSteps('');
    setIsCreateModalOpen(false);
    setCreateListId(null);
  };

  return (
    <Modal
      isOpen={isCreateModalOpen}
      onClose={() => {
        setIsCreateModalOpen(false);
        setCreateListId(null);
      }}
      title="Create New Issue"
      subtitle="Instantiate a typed work item using the Card Factory"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector Tabs */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
            Issue Type (Factory Archetype)
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setType('task')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                type === 'task'
                  ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-500 text-sky-700 dark:text-sky-300 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <CheckSquare className="w-4 h-4 text-sky-500" />
              <span>Standard Task</span>
            </button>

            <button
              type="button"
              onClick={() => setType('feature')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                type === 'feature'
                  ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>New Feature</span>
            </button>

            <button
              type="button"
              onClick={() => setType('bug')}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                type === 'bug'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Bug className="w-4 h-4 text-rose-500" />
              <span>Bug Defect</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
            Summary / Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Implement OAuth2 Refresh Token Rotation"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0052cc]"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
            Description
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide context, acceptance criteria, or technical details..."
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#0052cc] resize-none"
          />
        </div>

        {/* Type Specific Form Inputs */}
        {type === 'feature' && (
          <div className="p-3.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-800 dark:text-purple-300">
              Story Points (Fibonacci Estimation):
            </span>
            <input
              type="number"
              min="1"
              max="34"
              value={storyPoints}
              onChange={(e) => setStoryPoints(e.target.value)}
              className="w-20 px-2 py-1 rounded bg-white dark:bg-slate-900 border border-purple-300 dark:border-purple-500/40 text-xs font-bold text-purple-700 dark:text-purple-300 text-center"
            />
          </div>
        )}

        {type === 'bug' && (
          <div className="p-3.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-800 dark:text-rose-200 cursor-pointer"
                >
                  <option value="minor">Minor</option>
                  <option value="major">Major</option>
                  <option value="critical">Critical</option>
                  <option value="blocker">Blocker</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  Environment
                </label>
                <input
                  type="text"
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mb-1">
                Reproduction Steps
              </label>
              <textarea
                rows={2}
                value={reproductionSteps}
                onChange={(e) => setReproductionSteps(e.target.value)}
                placeholder="Steps to trigger the bug..."
                className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        )}

        {type === 'task' && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-800 dark:text-sky-300">Estimated Duration (Hours):</span>
            <input
              type="number"
              min="1"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="w-20 px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-sky-800 dark:text-sky-300 text-center"
            />
          </div>
        )}

        {/* Priority & Column */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Initial Board Column
            </label>
            <select
              value={listId}
              onChange={(e) => setListId(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignee & Due Date */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Assignee
            </label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <option value="">Unassigned</option>
              {assigneeList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsCreateModalOpen(false);
              setCreateListId(null);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Issue</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
