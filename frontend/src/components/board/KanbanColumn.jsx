import React, { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { Plus, MoreHorizontal, Trash2, Edit2, X, Check } from 'lucide-react';
import { KanbanCard } from './KanbanCard';
import { useBoard } from '../../context/BoardContext';

export function KanbanColumn({ list, cards }) {
  const { setCreateListId, setIsCreateModalOpen, addCard, deleteList, updateList } = useBoard();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState(list.title);
  const [isQuickAdding, setIsQuickAdding] = useState(false);
  const [quickTitle, setQuickTitle] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSaveTitle = () => {
    if (newTitle.trim()) {
      updateList(list.id, newTitle.trim());
    }
    setIsEditingTitle(false);
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    if (quickTitle.trim()) {
      addCard('task', {
        title: quickTitle.trim(),
        listId: list.id,
      });
      setQuickTitle('');
      setIsQuickAdding(false);
    }
  };

  const colorVariants = {
    slate: 'bg-slate-500',
    blue: 'bg-indigo-500',
    purple: 'bg-purple-500',
    emerald: 'bg-emerald-500',
  };

  return (
    <div className="flex flex-col w-80 flex-shrink-0 bg-slate-900/60 rounded-2xl border border-slate-800/80 max-h-[calc(100vh-210px)] flex-1">
      {/* Column Header */}
      <div className="p-3.5 pb-2 flex items-center justify-between gap-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className={`w-2 h-2 rounded-full ${
              colorVariants[list.color] || 'bg-indigo-500'
            }`}
          />
          {isEditingTitle ? (
            <div className="flex items-center gap-1 flex-1">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                autoFocus
                className="w-full px-2 py-0.5 rounded bg-slate-800 border border-indigo-500 text-xs text-white focus:outline-none"
              />
              <button onClick={handleSaveTitle} className="p-1 text-emerald-400 hover:text-emerald-300">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setIsEditingTitle(false)} className="p-1 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <h3
              onClick={() => setIsEditingTitle(true)}
              className="text-xs font-bold text-slate-200 uppercase tracking-wider truncate cursor-pointer hover:text-indigo-400 transition-colors"
            >
              {list.title}
            </h3>
          )}

          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] font-bold text-slate-400">
            {cards.length}
          </span>
        </div>

        {/* Actions Dropdown & Add Card Button */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setCreateListId(list.id);
              setIsCreateModalOpen(true);
            }}
            title="Add Issue to Column"
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-md transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-36 glass-dropdown rounded-lg p-1 z-30 shadow-xl">
                <button
                  onClick={() => {
                    setIsEditingTitle(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded text-xs font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-2"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Rename List</span>
                </button>
                <button
                  onClick={() => {
                    deleteList(list.id);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded text-xs font-medium text-rose-400 hover:bg-rose-500/10 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete List</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Droppable Card Container */}
      <Droppable droppableId={list.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`p-3 flex-1 overflow-y-auto kanban-scroll transition-colors min-h-[140px] ${
              snapshot.isDraggingOver ? 'bg-indigo-950/20 rounded-b-2xl' : ''
            }`}
          >
            {cards.map((card, index) => (
              <KanbanCard key={card.id} card={card} index={index} />
            ))}
            {provided.placeholder}

            {/* Quick Add Inline Form */}
            {isQuickAdding ? (
              <form onSubmit={handleQuickAdd} className="mt-2">
                <textarea
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  autoFocus
                  rows={2}
                  className="w-full p-2 rounded-lg bg-slate-800 border border-indigo-500 text-xs text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleQuickAdd(e);
                    }
                  }}
                />
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="submit"
                    className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsQuickAdding(false)}
                    className="px-2.5 py-1 rounded text-slate-400 hover:text-slate-200 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsQuickAdding(true)}
                className="w-full mt-1 py-2 px-3 rounded-lg border border-dashed border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors group"
              >
                <Plus className="w-3.5 h-3.5 group-hover:text-indigo-400" />
                <span>Quick Add</span>
              </button>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
