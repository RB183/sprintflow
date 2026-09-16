import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Calendar,
  User,
  MessageSquare,
  Sparkles,
  Bug,
  CheckSquare,
  AlertCircle,
  Plus,
  Send,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useBoard } from '../../context/BoardContext';
import { useAuth } from '../../context/AuthContext';
import { TypeBadge, PriorityBadge, SeverityBadge } from '../common/Badge';

export function CardDetailModal() {
  const {
    selectedCard,
    setSelectedCardId,
    updateCard,
    deleteCard,
    addComment,
    lists,
  } = useBoard();

  const { currentUser, users } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [type, setType] = useState('task');
  const [listId, setListId] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [metadata, setMetadata] = useState({});
  const [newCommentText, setNewCommentText] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');

  // Sync internal state when card changes
  useEffect(() => {
    if (selectedCard) {
      setTitle(selectedCard.title || '');
      setDescription(selectedCard.description || '');
      setPriority(selectedCard.priority || 'medium');
      setType(selectedCard.type || 'task');
      setListId(selectedCard.listId || '');
      setAssigneeId(selectedCard.assigneeId || '');
      setDueDate(selectedCard.dueDate || '');
      setMetadata(selectedCard.metadata || {});
    }
  }, [selectedCard]);

  if (!selectedCard) return null;

  const handleSaveField = (key, value) => {
    updateCard(selectedCard.id, { [key]: value });
  };

  const handleMetadataChange = (key, value) => {
    const updatedMeta = { ...metadata, [key]: value };
    setMetadata(updatedMeta);
    updateCard(selectedCard.id, { metadata: updatedMeta });
  };

  const handleToggleChecklist = (index, fieldName) => {
    const list = [...(metadata[fieldName] || [])];
    list[index].done = !list[index].done;
    handleMetadataChange(fieldName, list);
  };

  const handleAddChecklistItem = (fieldName) => {
    if (!newChecklistText.trim()) return;
    const list = [...(metadata[fieldName] || [])];
    list.push({ text: newChecklistText.trim(), done: false });
    handleMetadataChange(fieldName, list);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (index, fieldName) => {
    const list = [...(metadata[fieldName] || [])];
    list.splice(index, 1);
    handleMetadataChange(fieldName, list);
  };

  const handleAddCommentSubmit = (e) => {
    e.preventDefault();
    if (newCommentText.trim()) {
      addComment(selectedCard.id, newCommentText.trim());
      setNewCommentText('');
    }
  };

  const currentList = lists.find((l) => l.id === listId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity"
        onClick={() => setSelectedCardId(null)}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-10 my-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/90 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded border border-indigo-500/20">
              {selectedCard.key}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Layers className="w-3.5 h-3.5" />
              <span>{currentList?.title || 'List'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => deleteCard(selectedCard.id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
              title="Delete Card"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedCardId(null)}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - 2 Columns */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Input */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => handleSaveField('title', title)}
                className="w-full text-base sm:text-lg font-bold bg-slate-800/60 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Description Textarea */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 block">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleSaveField('description', description)}
                rows={4}
                placeholder="Add a detailed description or specification..."
                className="w-full text-xs sm:text-sm bg-slate-800/40 border border-slate-700/80 rounded-xl p-3 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-y"
              />
            </div>

            {/* Dynamic Factory Pattern Fields Based on Card Type */}

            {/* 1. BUG Specific Fields */}
            {type === 'bug' && (
              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-4">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <Bug className="w-4 h-4" />
                  <span>Bug Diagnostic Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">
                      Bug Severity
                    </label>
                    <select
                      value={metadata.severity || 'major'}
                      onChange={(e) => handleMetadataChange('severity', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-rose-500/30 text-xs text-rose-200 focus:outline-none"
                    >
                      <option value="minor">Minor</option>
                      <option value="major">Major</option>
                      <option value="critical">Critical</option>
                      <option value="blocker">Blocker</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 font-medium block mb-1">
                      Environment
                    </label>
                    <input
                      type="text"
                      value={metadata.environment || ''}
                      onChange={(e) => handleMetadataChange('environment', e.target.value)}
                      placeholder="e.g. Production / Node 20"
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 font-medium block mb-1">
                    Reproduction Steps
                  </label>
                  <textarea
                    value={metadata.reproductionSteps || ''}
                    onChange={(e) => handleMetadataChange('reproductionSteps', e.target.value)}
                    rows={3}
                    placeholder="1. Step one\n2. Step two..."
                    className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* 2. FEATURE Specific Fields (Story Points & Acceptance Criteria) */}
            {type === 'feature' && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Feature Requirements & Acceptance Criteria</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Story Points:</span>
                    <input
                      type="number"
                      min="1"
                      max="34"
                      value={metadata.storyPoints || 3}
                      onChange={(e) => handleMetadataChange('storyPoints', Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded bg-slate-900 border border-purple-500/40 text-xs font-bold text-purple-300 text-center"
                    />
                  </div>
                </div>

                {/* Acceptance Criteria Checklist */}
                <div className="space-y-2">
                  {(metadata.acceptanceCriteria || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800"
                    >
                      <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => handleToggleChecklist(idx, 'acceptanceCriteria')}
                          className="w-4 h-4 rounded text-purple-600 bg-slate-800 border-slate-700 focus:ring-0"
                        />
                        <span
                          className={`text-xs ${
                            item.done ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {item.text}
                        </span>
                      </label>
                      <button
                        onClick={() => handleRemoveChecklistItem(idx, 'acceptanceCriteria')}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      placeholder="Add acceptance criterion..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChecklistItem('acceptanceCriteria');
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddChecklistItem('acceptanceCriteria')}
                      className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. TASK Specific Fields (Subtasks) */}
            {type === 'task' && (
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
                    <CheckSquare className="w-4 h-4" />
                    <span>Subtask Checklist</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Est. Hours:</span>
                    <input
                      type="number"
                      min="1"
                      value={metadata.estimatedHours || 2}
                      onChange={(e) => handleMetadataChange('estimatedHours', Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs font-bold text-sky-300 text-center"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {(metadata.subtasks || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-900/80 border border-slate-800"
                    >
                      <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => handleToggleChecklist(idx, 'subtasks')}
                          className="w-4 h-4 rounded text-sky-600 bg-slate-800 border-slate-700 focus:ring-0"
                        />
                        <span
                          className={`text-xs ${
                            item.done ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {item.text}
                        </span>
                      </label>
                      <button
                        onClick={() => handleRemoveChecklistItem(idx, 'subtasks')}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newChecklistText}
                      onChange={(e) => setNewChecklistText(e.target.value)}
                      placeholder="Add subtask item..."
                      className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddChecklistItem('subtasks');
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddChecklistItem('subtasks')}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Comments & Collaboration Stream */}
            <div className="pt-4 border-t border-slate-800">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Discussion & Activity ({selectedCard.comments?.length || 0})</span>
              </h4>

              {/* Comments Feed */}
              <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
                {selectedCard.comments && selectedCard.comments.length > 0 ? (
                  selectedCard.comments.map((comment) => {
                    const author = users.find((u) => u.id === comment.userId);
                    return (
                      <div
                        key={comment.id}
                        className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-3"
                      >
                        <img
                          src={author?.avatar}
                          alt={author?.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-700"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-200">{author?.name}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(comment.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {comment.text}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-slate-500 italic">No comments yet. Start the discussion below.</p>
                )}
              </div>

              {/* Add Comment Input */}
              <form onSubmit={handleAddCommentSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar Metadata (Right col) */}
          <div className="space-y-5 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
            {/* Status Column */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Status / Column
              </label>
              <select
                value={listId}
                onChange={(e) => {
                  setListId(e.target.value);
                  handleSaveField('listId', e.target.value);
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none"
              >
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Issue Type
              </label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  handleSaveField('type', e.target.value);
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none"
              >
                <option value="task">Task</option>
                <option value="feature">Feature</option>
                <option value="bug">Bug</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  handleSaveField('priority', e.target.value);
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => {
                  setAssigneeId(e.target.value);
                  handleSaveField('assigneeId', e.target.value || null);
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 focus:outline-none"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.title})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  handleSaveField('dueDate', e.target.value);
                }}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
