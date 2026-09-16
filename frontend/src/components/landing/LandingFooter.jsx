import React from 'react';
import { Kanban, Globe, ArrowRight, Sparkles } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-white border-t border-slate-200 text-[#44546f] text-xs pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 pb-12">
          
          {/* Logo / Brand column (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#0052cc] flex items-center justify-center text-white font-black shadow-sm">
                <Kanban className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-[#172b4d]">SprintFlow</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                  100% Free
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
              Frictionless agile project management, real-time whiteboards, and team spaces for high-velocity software engineering.
            </p>
          </div>

          {/* 1. CREATE */}
          <div className="space-y-3">
            <p className="font-extrabold text-[#172b4d] uppercase tracking-wider text-xs flex items-center gap-1.5">
              <span>Create</span>
            </p>
            <p><a href="#features" className="hover:text-[#0052cc] transition-colors">Tasks & Epics</a></p>
            <p><a href="#features" className="hover:text-[#0052cc] transition-colors">Bug Tracking</a></p>
            <p><a href="#features" className="hover:text-[#0052cc] transition-colors">Flowcharts & Diagrams</a></p>
            <p><a href="#features" className="hover:text-[#0052cc] transition-colors">Acceptance Criteria</a></p>
            <p><a href="#features" className="hover:text-[#0052cc] transition-colors">Sprint Backlogs</a></p>
          </div>

          {/* 2. ORGANIZE */}
          <div className="space-y-3">
            <p className="font-extrabold text-[#172b4d] uppercase tracking-wider text-xs flex items-center gap-1.5">
              <span>Organize</span>
            </p>
            <p><a href="#workflow" className="hover:text-[#0052cc] transition-colors">Kanban Boards</a></p>
            <p><a href="#workflow" className="hover:text-[#0052cc] transition-colors">Sprint Roadmaps</a></p>
            <p><a href="#workflow" className="hover:text-[#0052cc] transition-colors">Multi-Team Spaces</a></p>
            <p><a href="#workflow" className="hover:text-[#0052cc] transition-colors">Project Milestones</a></p>
            <p><a href="#workflow" className="hover:text-[#0052cc] transition-colors">Personal Workspaces</a></p>
          </div>

          {/* 3. BUILD */}
          <div className="space-y-3">
            <p className="font-extrabold text-[#172b4d] uppercase tracking-wider text-xs flex items-center gap-1.5">
              <span>Build</span>
            </p>
            <p><a href="#workflow" className="hover:text-[#0052cc] transition-colors">Live Drawing Canvas</a></p>
            <p><a href="#workflow" className="hover:text-[#0052cc] transition-colors">Real-Time Team Chat</a></p>
            <p><a href="#workflow" className="hover:text-[#0052cc] transition-colors">Instant Auto-Save</a></p>
            <p><a href="#workflow" className="hover:text-[#0052cc] transition-colors">PNG Architecture Export</a></p>
            <p><a href="#workflow" className="hover:text-[#0052cc] transition-colors">Open API & WebSocket</a></p>
          </div>
        </div>

        {/* Bottom copyright & language bar */}
        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            SprintFlow &copy; 2026. Built for agile software teams. Free & open.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-[#0052cc]">Privacy Policy</a>
            <a href="#" className="hover:text-[#0052cc]">Terms of Service</a>
            <a href="#" className="hover:text-[#0052cc]">Open Source</a>
            <div className="flex items-center gap-1 text-slate-700 font-semibold cursor-pointer">
              <Globe className="w-3.5 h-3.5" />
              <span>English</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
