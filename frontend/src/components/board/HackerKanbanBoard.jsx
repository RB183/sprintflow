import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Plus,
  Clock,
  CheckCircle2,
  Play,
  Circle,
  Tag,
  AlertTriangle,
  X,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function HackerKanbanBoard() {
  const { tasks, handleDragEnd, addTask, deleteTask } = useApp();
  const [isAddingInColumn, setIsAddingInColumn] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');

  const columns = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-400' },
    { id: 'in_progress', title: 'In Progress', color: 'bg-[#0052cc]' },
    { id: 'done', title: 'Done', color: 'bg-emerald-500' },
  ];

  const handleCreateCard = (status) => {
    if (!newTitle.trim()) return;
    addTask({
      title: newTitle.trim(),
      priority: newPriority,
      status,
    });
    setNewTitle('');
    setIsAddingInColumn(null);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 font-sans">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {columns.map((column) => {
            const columnTasks = tasks
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
                      {columnTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              className={`p-3.5 bg-white border rounded-xl transition-all select-none cursor-grab active:cursor-grabbing ${
                                dragSnapshot.isDragging
                                  ? 'border-[#0052cc] shadow-2xl scale-[1.02] rotate-1 z-50'
                                  : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 mb-2">
                                <span className="font-mono text-xs font-bold text-[#0052cc]">
                                  {task.key}
                                </span>
                                {getPriorityBadge(task.priority)}
                              </div>

                              <p className="text-xs sm:text-sm font-semibold text-[#172b4d] line-clamp-2 leading-snug">
                                {task.title}
                              </p>

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

                              <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{task.dueDate}</span>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteTask(task.id);
                                  }}
                                  className="text-slate-400 hover:text-rose-600 transition-colors"
                                  title="Delete task"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
