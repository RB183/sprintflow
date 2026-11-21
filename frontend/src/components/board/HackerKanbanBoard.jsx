import React, { useState, useMemo, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  X,
  Trash2,
  Search,
  Filter,
  Download,
  FileSpreadsheet,
  FileCode,
  Archive,
  CheckSquare,
  Paperclip,
  User,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { CardDetailModal } from './CardDetailModal';

export function HackerKanbanBoard() {
  const {
    tasks,
    handleDragEnd,
    addTask,
    deleteTask,
    archiveDoneTasks,
    currentOrg,
    currentUser,
    members,
  } = useApp();
  const toast = useToast();

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isAddingInColumn, setIsAddingInColumn] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const exportMenuRef = useRef(null);

  useEffect(() => {
    if (!isExportMenuOpen) return;
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setIsExportMenuOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsExportMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExportMenuOpen]);

  const todayStr = new Date().toISOString().split('T')[0];

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-400' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-[#0052cc]' },
    { id: 'done', title: 'Done', color: 'bg-emerald-500' },
  ];

  // Filtered task set
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(query);
        const matchesKey = task.key?.toLowerCase().includes(query);
        const matchesTag = task.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesKey && !matchesTag) return false;
      }

      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }

      // Assignee filter
      if (assigneeFilter === 'me') {
        if (task.assigneeId !== currentUser?.id) return false;
      } else if (assigneeFilter !== 'all' && task.assigneeId !== assigneeFilter) {
        return false;
      }

      // Type filter
      if (typeFilter !== 'all' && task.type !== typeFilter) {
        return false;
      }

      // Overdue filter
      if (overdueOnly) {
        const isTaskOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'done';
        if (!isTaskOverdue) return false;
      }

      return true;
    });
  }, [tasks, searchQuery, priorityFilter, assigneeFilter, typeFilter, overdueOnly, currentUser, todayStr]);

  const handleCreateCard = (status) => {
    if (!newTitle.trim()) return;
    const taskTitle = newTitle.trim();
    addTask({
      title: taskTitle,
      priority: newPriority,
      status,
    });
    toast.success('Task created', `"${taskTitle}" added to ${status.replace('_', ' ')}.`);
    setNewTitle('');
    setIsAddingInColumn(null);
  };

  const handleArchiveDone = () => {
    const doneCount = tasks.filter((t) => t.status === 'done').length;
    if (doneCount === 0) {
      toast.info('No completed tasks', 'Move completed tasks to the Done column before archiving.');
      return;
    }
    setIsArchiveDialogOpen(true);
  };

  const handleConfirmArchive = () => {
    const doneCount = tasks.filter((t) => t.status === 'done').length;
    archiveDoneTasks(currentOrg.id);
    toast.success('Tasks archived', `Archived ${doneCount} completed task${doneCount > 1 ? 's' : ''}.`);
    setIsArchiveDialogOpen(false);
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['Key', 'Title', 'Status', 'Priority', 'Type', 'Assignee', 'Due Date'];
    const rows = filteredTasks.map((t) => {
      const assigneeName = members.find((m) => m.id === t.assigneeId)?.name || 'Unassigned';
      return [
        `"${t.key || ''}"`,
        `"${(t.title || '').replace(/"/g, '""')}"`,
        `"${t.status || ''}"`,
        `"${t.priority || ''}"`,
        `"${t.type || 'task'}"`,
        `"${assigneeName.replace(/"/g, '""')}"`,
        `"${t.dueDate || ''}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentOrg?.slug || 'board'}-tasks-${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
    toast.success('Export downloaded', `Saved ${filteredTasks.length} tasks as CSV.`);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredTasks, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `${currentOrg?.slug || 'board'}-tasks-${todayStr}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportMenuOpen(false);
    toast.success('Export downloaded', `Saved ${filteredTasks.length} tasks as JSON.`);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'urgent':
        return <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Urgent</span>;
      case 'high':
        return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">High</span>;
      case 'medium':
        return <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Medium</span>;
      case 'low':
      default:
        return <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Low</span>;
    }
  };

  const hasActiveFilters = searchQuery || priorityFilter !== 'all' || assigneeFilter !== 'all' || typeFilter !== 'all' || overdueOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 font-sans space-y-4">
      
      {/* Board Controls Bar: Search, Filters, Export, Archive */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Left: Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, key (e.g. CYB-01), or #tag..."
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0052cc]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right: Quick Actions (Export, Archive Done) */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Export Dropdown */}
            <div ref={exportMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                title="Export active tasks"
              >
                <Download className="w-3.5 h-3.5 text-[#0052cc]" />
                <span>Export</span>
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-48 light-dropdown rounded-xl p-1.5 z-40 animate-in fade-in zoom-in-95 shadow-xl">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0052cc] rounded-lg transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Export to CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#0052cc] rounded-lg transition-colors cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-blue-600" />
                    <span>Export to JSON</span>
                  </button>
                </div>
              )}
            </div>

            {/* Archive Done Tasks */}
            <button
              type="button"
              onClick={handleArchiveDone}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              title="Archive all completed tasks"
            >
              <Archive className="w-3.5 h-3.5 text-slate-500" />
              <span>Archive Done</span>
            </button>
          </div>

        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-bold uppercase tracking-wider text-[10px] mr-1">
            <Filter className="w-3 h-3" />
            <span>Filters:</span>
          </div>

          {/* Assignee Filter */}
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 text-xs focus:outline-none focus:border-[#0052cc] cursor-pointer"
          >
            <option value="all">All Assignees</option>
            <option value="me">Assigned to Me</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 text-xs focus:outline-none focus:border-[#0052cc] cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Issue Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg font-semibold text-slate-700 text-xs focus:outline-none focus:border-[#0052cc] cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="task">Task</option>
            <option value="feature">Feature</option>
            <option value="story">Story</option>
            <option value="bug">Bug</option>
            <option value="epic">Epic</option>
          </select>

          {/* Overdue Toggle */}
          <button
            type="button"
            onClick={() => setOverdueOnly(!overdueOnly)}
            className={`px-2.5 py-1 rounded-lg font-semibold text-xs border transition-colors flex items-center gap-1 cursor-pointer ${
              overdueOnly
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-rose-500" />
            <span>Overdue Only</span>
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setPriorityFilter('all');
                setAssigneeFilter('all');
                setTypeFilter('all');
                setOverdueOnly(false);
              }}
              className="text-[11px] font-bold text-[#0052cc] hover:underline cursor-pointer ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Kanban Drag and Drop Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {columns.map((column) => {
            const columnTasks = filteredTasks
              .filter((t) => t.status === column.id)
              .sort((a, b) => a.order - b.order);

            return (
              <div
                key={column.id}
                className="bg-slate-100/90 border border-slate-200 rounded-2xl flex flex-col min-h-[500px] max-h-[calc(100vh-230px)] shadow-xs"
              >
                {/* Column Header */}
                <div className="p-3.5 pb-2.5 flex items-center justify-between border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${column.color}`} />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {column.title}
                    </h3>
                    <span className="px-2 py-0.2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-500">
                      {columnTasks.length}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsAddingInColumn(column.id)}
                    className="p-1 text-slate-500 hover:text-[#0052cc] rounded-lg hover:bg-white transition-colors cursor-pointer"
                    title="Add Issue"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Droppable Card Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`p-3 flex-1 overflow-y-auto space-y-3 transition-colors ${
                        snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-b-2xl' : ''
                      }`}
                    >
                      {/* Inline quick add */}
                      {isAddingInColumn === column.id && (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleCreateCard(column.id);
                          }}
                          className="p-3 bg-white border border-[#0052cc] rounded-xl shadow-md space-y-2 animate-in zoom-in-95"
                        >
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder="What needs to be done?..."
                            autoFocus
                            className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-[#0052cc] rounded-lg"
                          />
                          <div className="flex items-center justify-between pt-1">
                            <select
                              value={newPriority}
                              onChange={(e) => setNewPriority(e.target.value)}
                              className="px-2 py-1 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-lg"
                            >
                              <option value="urgent">Urgent</option>
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>

                            <div className="flex items-center gap-1">
                              <button
                                type="submit"
                                className="px-3 py-1 rounded-lg bg-[#0052cc] hover:bg-[#0041a8] text-white text-xs font-bold transition-colors cursor-pointer"
                              >
                                Add
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setIsAddingInColumn(null);
                                  setNewTitle('');
                                }}
                                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </form>
                      )}

                      {/* Render Draggable Cards */}
                      {columnTasks.map((task, index) => {
                        const isOverdue = task.dueDate && task.dueDate < todayStr && task.status !== 'done';
                        const isDueToday = task.dueDate && task.dueDate === todayStr && task.status !== 'done';
                        const assignee = members.find((m) => m.id === task.assigneeId);
                        const completedSubtasks = task.acceptanceCriteria?.filter((c) => c.done).length || 0;
                        const totalSubtasks = task.acceptanceCriteria?.length || 0;
                        const attachmentsCount = task.attachments?.length || 0;

                        return (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                onClick={() => setSelectedTaskId(task.id)}
                                className={`p-3.5 bg-white border rounded-xl transition-all select-none cursor-pointer ${
                                  dragSnapshot.isDragging
                                    ? 'border-[#0052cc] shadow-2xl scale-[1.02] rotate-1 z-50'
                                    : 'border-slate-200 hover:border-[#0052cc] hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-mono text-xs font-bold text-[#0052cc]">
                                      {task.key}
                                    </span>
                                    {isOverdue && (
                                      <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                        <AlertTriangle className="w-2.5 h-2.5 text-rose-600 animate-pulse" />
                                        Overdue
                                      </span>
                                    )}
                                    {isDueToday && (
                                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                        Due Today
                                      </span>
                                    )}
                                  </div>
                                  {getPriorityBadge(task.priority)}
                                </div>

                                <p className="text-xs sm:text-sm font-semibold text-[#172b4d] line-clamp-2 leading-snug">
                                  {task.title}
                                </p>

                                {/* Tags */}
                                {task.tags && task.tags.length > 0 && (
                                  <div className="flex items-center gap-1 flex-wrap mt-2.5">
                                    {task.tags.map((tag, tIdx) => (
                                      <span
                                        key={tIdx}
                                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                                      >
                                        #{tag}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Bottom Metadata: Subtasks, Attachments, Due Date & Assignee */}
                                <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                                  <div className="flex items-center gap-2">
                                    {task.dueDate && (
                                      <div className={`flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : ''}`}>
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <span>{task.dueDate}</span>
                                      </div>
                                    )}

                                    {totalSubtasks > 0 && (
                                      <div className="flex items-center gap-1 text-slate-500">
                                        <CheckSquare className="w-3 h-3 text-[#0052cc]" />
                                        <span>{completedSubtasks}/{totalSubtasks}</span>
                                      </div>
                                    )}

                                    {attachmentsCount > 0 && (
                                      <div className="flex items-center gap-1 text-slate-500">
                                        <Paperclip className="w-3 h-3 text-slate-400" />
                                        <span>{attachmentsCount}</span>
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    {assignee ? (
                                      <img
                                        src={assignee.avatar}
                                        alt={assignee.name}
                                        title={assignee.name}
                                        className="w-5 h-5 rounded-full object-cover border border-slate-200"
                                      />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                        <User className="w-3 h-3" />
                                      </div>
                                    )}

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setTaskToDelete(task);
                                      }}
                                      className="text-slate-400 hover:text-rose-600 transition-colors p-0.5 cursor-pointer"
                                      title="Delete task"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <CardDetailModal
        taskId={selectedTaskId}
        isOpen={Boolean(selectedTaskId)}
        onClose={() => setSelectedTaskId(null)}
      />

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isArchiveDialogOpen}
        onClose={() => setIsArchiveDialogOpen(false)}
        onConfirm={handleConfirmArchive}
        title="Archive Completed Tasks"
        description={`Are you sure you want to archive ${tasks.filter((t) => t.status === 'done').length} completed task(s)? They will be safely stored and removed from the active board view.`}
        confirmText="Archive Tasks"
        cancelText="Cancel"
        variant="warning"
      />

      {/* Quick Delete Card Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteTask(taskToDelete.id);
            toast.success('Task deleted', `"${taskToDelete.title}" was deleted.`);
            setTaskToDelete(null);
          }
        }}
        title="Delete Task"
        description={`Are you sure you want to permanently delete "${taskToDelete?.title || 'this task'}"? This action cannot be undone.`}
        confirmText="Delete Task"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
