import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import {
  MessageSquare,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Sparkles,
  CheckSquare,
} from 'lucide-react';
import { TypeBadge, PriorityBadge, SeverityBadge } from '../common/Badge';
import { useBoard } from '../../context/BoardContext';
import { useAuth } from '../../context/AuthContext';

export function KanbanCard({ card, index }) {
  const { setSelectedCardId } = useBoard();
  const { users } = useAuth();

  const assignee = users.find((u) => u.id === card.assigneeId);

  // Subtasks/acceptance criteria progress
  let completedItems = 0;
  let totalItems = 0;

  if (card.type === 'feature' && card.metadata?.acceptanceCriteria) {
    totalItems = card.metadata.acceptanceCriteria.length;
    completedItems = card.metadata.acceptanceCriteria.filter((c) => c.done).length;
  } else if (card.type === 'task' && card.metadata?.subtasks) {
    totalItems = card.metadata.subtasks.length;
    completedItems = card.metadata.subtasks.filter((s) => s.done).length;
  }

  // Due date formatting
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && card.listId !== 'list-4';

  return (
    <Draggable draggableId={card.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => setSelectedCardId(card.id)}
          className={`group relative rounded-xl p-3.5 mb-3 bg-slate-900/90 border transition-all duration-150 cursor-pointer select-none ${
            snapshot.isDragging
              ? 'border-indigo-500 shadow-2xl shadow-indigo-500/30 scale-[1.02] bg-slate-800 rotate-1 z-50'
              : 'border-slate-800/80 hover:border-slate-700 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5'
          }`}
        >
          {/* Card Top: Key, Type, Priority */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] font-bold text-slate-400 group-hover:text-indigo-400 transition-colors">
                {card.key}
              </span>
              <TypeBadge type={card.type} />
            </div>
            <PriorityBadge priority={card.priority} />
          </div>

          {/* Title */}
          <h4 className="text-xs sm:text-sm font-semibold text-slate-200 line-clamp-2 mb-2.5 group-hover:text-white leading-snug">
            {card.title}
          </h4>

          {/* Factory Metadata Highlights */}
          {card.type === 'bug' && card.metadata?.severity && (
            <div className="mb-2.5">
              <SeverityBadge severity={card.metadata.severity} />
            </div>
          )}

          {/* Card Bottom Meta Bar */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            {/* Left metrics: Story points / Subtask counters / Due date */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Feature Story Points */}
              {card.type === 'feature' && card.metadata?.storyPoints && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 font-bold border border-purple-500/20 text-[10px]">
                  <Sparkles className="w-2.5 h-2.5" />
                  {card.metadata.storyPoints} pts
                </span>
              )}

              {/* Subtasks Progress */}
              {totalItems > 0 && (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                    completedItems === totalItems ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>
                    {completedItems}/{totalItems}
                  </span>
                </span>
              )}

              {/* Due Date */}
              {card.dueDate && (
                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-medium ${
                    isOverdue ? 'text-rose-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(card.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                </span>
              )}

              {/* Comments Count */}
              {card.comments && card.comments.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] text-slate-400">
                  <MessageSquare className="w-3 h-3" />
                  <span>{card.comments.length}</span>
                </span>
              )}
            </div>

            {/* Right: Assignee Avatar */}
            <div>
              {assignee ? (
                <img
                  src={assignee.avatar}
                  alt={assignee.name}
                  title={`Assigned to ${assignee.name}`}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-700"
                />
              ) : (
                <div
                  title="Unassigned"
                  className="w-5 h-5 rounded-full border border-dashed border-slate-600 flex items-center justify-center text-[9px] text-slate-400"
                >
                  ?
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
