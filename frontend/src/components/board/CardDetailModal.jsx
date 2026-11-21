import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Calendar,
  User,
  MessageSquare,
  CheckSquare,
  Plus,
  Send,
  Clock,
  Layers,
  Sparkles,
  Bug,
  Flag,
  CheckCircle2,
  Paperclip,
  Download,
  FileText,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

export function CardDetailModal({ taskId, isOpen, onClose }) {
  const {
    tasks,
    allTasks,
    updateTask,
    deleteTask,
    members,
    currentUser,
    currentOrg,
  } = useApp();
  const toast = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const taskList = allTasks || tasks || [];
  const currentTask = taskList.find((t) => t.id === taskId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [type, setType] = useState('task');
  const [assigneeId, setAssigneeId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [checklists, setChecklists] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [tags, setTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState('');

  useEffect(() => {
    if (currentTask) {
      setTitle(currentTask.title || '');
      setDescription(currentTask.description || '');
      setStatus(currentTask.status || 'todo');
      setPriority(currentTask.priority || 'medium');
      setType(currentTask.type || 'task');
      setAssigneeId(currentTask.assigneeId || '');
      setDueDate(currentTask.dueDate || '');
      setChecklists(currentTask.acceptanceCriteria || currentTask.checklists || []);
      setComments(currentTask.comments || []);
      setAttachments(currentTask.attachments || []);
      setTags(currentTask.tags || []);
    }
  }, [currentTask]);

  if (!isOpen || !currentTask) return null;

  const handleTitleBlur = () => {
    if (title.trim() && title !== currentTask.title) {
      updateTask(currentTask.id, { title: title.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== currentTask.description) {
      updateTask(currentTask.id, { description });
    }
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    updateTask(currentTask.id, { status: newStatus });
  };

  const handlePriorityChange = (newPriority) => {
    setPriority(newPriority);
    updateTask(currentTask.id, { priority: newPriority });
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    updateTask(currentTask.id, { type: newType });
  };

  const handleAssigneeChange = (newAssigneeId) => {
    setAssigneeId(newAssigneeId);
    updateTask(currentTask.id, { assigneeId: newAssigneeId });
  };

  const handleDueDateChange = (newDate) => {
    setDueDate(newDate);
    updateTask(currentTask.id, { dueDate: newDate });
  };

  // Checklist handlers
  const handleToggleChecklist = (index) => {
    const updated = checklists.map((item, idx) =>
      idx === index ? { ...item, done: !item.done } : item
    );
    setChecklists(updated);
    updateTask(currentTask.id, { acceptanceCriteria: updated });
  };

  const handleAddChecklist = (e) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    const updated = [...checklists, { text: newChecklistText.trim(), done: false }];
    setChecklists(updated);
    updateTask(currentTask.id, { acceptanceCriteria: updated });
    setNewChecklistText('');
  };

  const handleDeleteChecklist = (index) => {
    const updated = checklists.filter((_, idx) => idx !== index);
    setChecklists(updated);
    updateTask(currentTask.id, { acceptanceCriteria: updated });
  };

  // Comments handlers
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const newComment = {
      id: `comm-${Date.now()}`,
      userId: currentUser?.id || 'usr-guest',
      userName: currentUser?.name || 'Guest User',
      userAvatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      text: newCommentText.trim(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const updated = [...comments, newComment];
    setComments(updated);
    updateTask(currentTask.id, { comments: updated });
    setNewCommentText('');
    toast.success('Comment posted', 'Your note has been added.');
  };

  // Attachment upload handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newAttachment = {
          id: `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: event.target.result,
          uploadedAt: new Date().toISOString(),
        };
        setAttachments((prev) => {
          const updated = [...prev, newAttachment];
          updateTask(currentTask.id, { attachments: updated });
          return updated;
        });
      };
      reader.readAsDataURL(file);
    });
    toast.success('Files attached', `${files.length} attachment(s) uploaded successfully.`);
    e.target.value = '';
  };

  const handleDeleteAttachment = (attId) => {
    const updated = attachments.filter((a) => a.id !== attId);
    setAttachments(updated);
    updateTask(currentTask.id, { attachments: updated });
    toast.info('Attachment removed', 'File attachment was removed.');
  };

  // Tag handlers
  const handleAddTag = (e) => {
    e.preventDefault();
    const clean = newTagInput.trim().replace(/^#/, '');
    if (!clean || tags.includes(clean)) return;
    const updated = [...tags, clean];
    setTags(updated);
    updateTask(currentTask.id, { tags: updated });
    setNewTagInput('');
  };

  const handleDeleteTag = (tagToRemove) => {
    const updated = tags.filter((t) => t !== tagToRemove);
    setTags(updated);
    updateTask(currentTask.id, { tags: updated });
  };

  const handleDeleteCard = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteTask(currentTask.id);
    toast.success('Task deleted', `"${currentTask.title}" was permanently removed.`);
    setIsDeleteDialogOpen(false);
    onClose();
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const completedChecklistCount = checklists.filter((c) => c.done).length;
  const checklistPercentage = checklists.length > 0 ? Math.round((completedChecklistCount / checklists.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto" role="presentation">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-150 text-[#172b4d] dark:text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50 dark:bg-slate-800/80">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-extrabold text-[#0052cc] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
              {currentTask.key || 'TASK'}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              in space <strong className="text-slate-800 dark:text-slate-200">{currentOrg.name}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDeleteCard}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title="Delete Card"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Title, Description, Attachments, Checklists, Comments (8 cols) */}
          <div className="md:col-span-8 space-y-6">
            
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                className="w-full text-lg sm:text-xl font-extrabold text-[#172b4d] dark:text-slate-100 bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-[#0052cc] focus:bg-slate-50 dark:focus:bg-slate-800/50 px-1 py-1 rounded transition-colors focus:outline-none"
                placeholder="Issue title..."
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="Add a detailed description, acceptance criteria, or technical notes..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0052cc] focus:ring-1 focus:ring-[#0052cc] transition-colors"
              />
            </div>

            {/* Attachments Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-[#0052cc] dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Attachments ({attachments.length})
                  </span>
                </div>
                <label className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-[#0052cc] dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload File</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {attachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {attachments.map((file) => {
                    const isImg = file.type?.startsWith('image/') || file.url?.startsWith('data:image/');
                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-500 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {isImg ? (
                            <img
                              src={file.url}
                              alt={file.name}
                              className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[#0052cc] dark:text-blue-400 flex-shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={file.name}>
                              {file.name}
                            </p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500">
                              {formatFileSize(file.size)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <a
                            href={file.url}
                            download={file.name}
                            className="p-1 text-slate-400 hover:text-[#0052cc] dark:hover:text-blue-400 transition-colors"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(file.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete file"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-3 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/50">
                  No attachments yet. Upload design mockups, logs, or screenshots.
                </div>
              )}
            </div>

            {/* Subtasks / Checklist */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-[#0052cc] dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Checklist & Acceptance Criteria
                  </span>
                </div>
                {checklists.length > 0 && (
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {completedChecklistCount}/{checklists.length} ({checklistPercentage}%)
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {checklists.length > 0 && (
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${checklistPercentage}%` }}
                  />
                </div>
              )}

              {/* Items List */}
              <div className="space-y-1.5">
                {checklists.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/60 dark:border-slate-700 transition-colors group"
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => handleToggleChecklist(idx)}
                        className="w-4 h-4 rounded text-[#0052cc] focus:ring-[#0052cc] cursor-pointer"
                      />
                      <span className={`text-xs font-semibold ${item.done ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}`}>
                        {item.text}
                      </span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteChecklist(idx)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 transition-opacity p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add checklist item */}
              <form onSubmit={handleAddChecklist} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  placeholder="Add item or acceptance criterion..."
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0052cc]"
                />
                <button
                  type="submit"
                  disabled={!newChecklistText.trim()}
                  className="px-3 py-1.5 rounded-lg bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Comments Thread */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0052cc] dark:text-blue-400" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Discussion & Activity ({comments.length})
                </span>
              </div>

              {/* Comments List */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {comments.length > 0 ? (
                  comments.map((comm) => (
                    <div key={comm.id} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={comm.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={comm.userName}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{comm.userName}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{comm.createdAt}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 pl-7 leading-relaxed">{comm.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">No comments yet. Start the discussion!</p>
                )}
              </div>

              {/* Add Comment Box */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0052cc]"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="px-4 py-2 rounded-xl bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>

          </div>

          {/* Right Column: Status, Priority, Type, Assignee, Dates, Tags (4 cols) */}
          <div className="md:col-span-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 space-y-4">
            
            {/* Status */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0052cc] cursor-pointer"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0052cc] cursor-pointer"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Issue Type */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5">
                Issue Type
              </label>
              <select
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0052cc] cursor-pointer"
              >
                <option value="task">Task</option>
                <option value="feature">Feature</option>
                <option value="story">Story</option>
                <option value="bug">Bug</option>
                <option value="epic">Epic</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5">
                Assignee
              </label>
              <select
                value={assigneeId}
                onChange={(e) => handleAssigneeChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0052cc] cursor-pointer"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.title || 'Member'})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => handleDueDateChange(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#0052cc] cursor-pointer"
              />
            </div>

            {/* Tags / Labels */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5">
                Labels & Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0052cc] dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(tag)}
                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <form onSubmit={handleAddTag} className="flex gap-1.5">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="New tag..."
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-[#0052cc]"
                />
                <button
                  type="submit"
                  disabled={!newTagInput.trim()}
                  className="px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-40 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Metadata Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-400 dark:text-slate-500 space-y-1">
              <div>Created: {currentTask.dueDate || 'Recently'}</div>
              <div>Space: {currentOrg.name}</div>
            </div>

          </div>

        </div>

      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Task"
        description={`Are you sure you want to permanently delete "${currentTask?.title || 'this task'}"? All checklist items, comments, and attachments will be deleted.`}
        confirmText="Delete Task"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
