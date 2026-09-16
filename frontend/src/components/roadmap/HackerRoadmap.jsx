import React from 'react';
import {
  Map,
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export function HackerRoadmap() {
  const { roadmapItems, currentOrg } = useApp();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs font-bold">✓ Completed</span>;
      case 'IN_PROGRESS':
        return <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs font-bold">● In Progress</span>;
      case 'UPCOMING':
      default:
        return <span className="text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-xs font-bold">Upcoming</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 font-sans space-y-4">
      
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
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          3 Epics Registered
        </span>
      </div>

      {/* Epics List */}
      <div className="space-y-4">
        {roadmapItems.map((item, idx) => (
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
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
                <span>Execution Progress</span>
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
                Deliverables & Subsystems
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {item.deliverables.map((deliv, dIdx) => (
                  <div
                    key={dIdx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-center gap-2"
                  >
                    <CheckCircle2
                      className={`w-4 h-4 flex-shrink-0 ${
                        item.progress === 100
                          ? 'text-emerald-600'
                          : item.progress > 50 && dIdx === 0
                          ? 'text-[#0052cc]'
                          : 'text-slate-300'
                      }`}
                    />
                    <span className="truncate font-medium">{deliv}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
