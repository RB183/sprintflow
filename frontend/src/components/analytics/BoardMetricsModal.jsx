import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  CheckSquare,
  Users,
  Flame,
  PieChart,
} from 'lucide-react';
import { useBoard } from '../../context/BoardContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';

export function BoardMetricsModal() {
  const { isMetricsOpen, setIsMetricsOpen, currentBoard, lists, allCards } = useBoard();
  const { users } = useAuth();

  const boardCards = allCards.filter((c) => c.boardId === currentBoard?.id);
  const doneCards = boardCards.filter((c) => {
    const list = lists.find((l) => l.id === c.listId);
    return list?.title.toLowerCase().includes('done');
  });

  const totalPoints = boardCards.reduce(
    (acc, c) => acc + (c.metadata?.storyPoints || (c.type === 'task' ? 2 : 1)),
    0
  );

  const donePoints = doneCards.reduce(
    (acc, c) => acc + (c.metadata?.storyPoints || (c.type === 'task' ? 2 : 1)),
    0
  );

  const bugs = boardCards.filter((c) => c.type === 'bug');
  const features = boardCards.filter((c) => c.type === 'feature');
  const tasks = boardCards.filter((c) => c.type === 'task');

  const urgentCards = boardCards.filter((c) => c.priority === 'urgent');

  return (
    <Modal
      isOpen={isMetricsOpen}
      onClose={() => setIsMetricsOpen(false)}
      title="Sprint Telemetry & Insights"
      subtitle={`Real-time metrics for ${currentBoard?.title}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Metric Cards Top Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Issues
            </p>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">{boardCards.length}</p>
            <p className="text-[11px] text-emerald-400 mt-0.5 font-medium">
              {doneCards.length} completed
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30">
            <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
              Velocity
            </p>
            <p className="text-2xl font-extrabold text-indigo-200 mt-1">
              {donePoints}/{totalPoints} <span className="text-xs font-normal">pts</span>
            </p>
            <p className="text-[11px] text-indigo-400 mt-0.5">
              {Math.round((donePoints / (totalPoints || 1)) * 100)}% burndown
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/30">
            <p className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">
              Active Bugs
            </p>
            <p className="text-2xl font-extrabold text-rose-200 mt-1">{bugs.length}</p>
            <p className="text-[11px] text-rose-400 mt-0.5">
              {urgentCards.length} urgent priority
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30">
            <p className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
              Features
            </p>
            <p className="text-2xl font-extrabold text-purple-200 mt-1">{features.length}</p>
            <p className="text-[11px] text-purple-400 mt-0.5">{tasks.length} technical tasks</p>
          </div>
        </div>

        {/* Workload by Team Member */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Team Member Workload Distribution</span>
          </h4>

          <div className="space-y-3">
            {users.map((user) => {
              const userCards = boardCards.filter((c) => c.assigneeId === user.id);
              const userDone = userCards.filter((c) => {
                const list = lists.find((l) => l.id === c.listId);
                return list?.title.toLowerCase().includes('done');
              });
              const pct = userCards.length > 0 ? (userDone.length / userCards.length) * 100 : 0;

              return (
                <div key={user.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-200">{user.name}</span>
                      <span className="text-[10px] text-slate-400">({user.title})</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {userDone.length}/{userCards.length} tasks ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown by Column / List */}
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-400" />
            <span>Column Throughput</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {lists.map((list) => {
              const count = boardCards.filter((c) => c.listId === list.id).length;
              return (
                <div key={list.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-[11px] font-semibold text-slate-400 truncate">{list.title}</p>
                  <p className="text-lg font-bold text-slate-200 mt-0.5">{count} cards</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}
