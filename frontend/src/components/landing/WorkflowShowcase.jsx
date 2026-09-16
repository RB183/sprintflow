import React from 'react';
import { Kanban, GitPullRequest, ArrowRight, Layers, CheckCircle2, MessageSquare, Paperclip } from 'lucide-react';

export function WorkflowShowcase({ onEnterApp }) {
  return (
    <section className="py-24 bg-[#fafbfc] text-[#172b4d] space-y-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-28">

        {/* 1. Customize how your team's work flows */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Kanban Mock Visual */}
          <div className="lg:col-span-7 relative">
            <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl -rotate-1" />
            <div className="relative bg-white rounded-2xl p-5 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs text-slate-500">
                <span className="font-bold text-[#172b4d]">SprintFlow Software / Board</span>
                <div className="flex -space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">A</div>
                  <div className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[9px] font-bold">M</div>
                  <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[9px] font-bold">S</div>
                </div>
              </div>

              {/* 3 Columns Kanban Mini Mockup */}
              <div className="grid grid-cols-3 gap-3">
                {/* Column 1 */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                  <div className="text-[11px] font-bold text-slate-600 uppercase mb-2">TO DO (2)</div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm text-xs">
                      <span className="text-[10px] font-mono text-slate-400">MAC-12</span>
                      <p className="font-medium text-slate-800 mt-0.5 line-clamp-2">Implement feedback collector API</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm text-xs">
                      <span className="text-[10px] font-mono text-slate-400">MAC-18</span>
                      <p className="font-medium text-slate-800 mt-0.5 line-clamp-2">Bump version for micro-app billing</p>
                    </div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                  <div className="text-[11px] font-bold text-blue-600 uppercase mb-2">IN PROGRESS (2)</div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white rounded-lg border border-blue-300 shadow-sm text-xs">
                      <span className="text-[10px] font-mono text-blue-500 font-bold">MAC-19</span>
                      <p className="font-medium text-slate-800 mt-0.5 line-clamp-2">Improve UI of the feedback form</p>
                    </div>
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200 shadow-sm text-xs">
                      <span className="text-[10px] font-mono text-slate-400">MAC-22</span>
                      <p className="font-medium text-slate-800 mt-0.5 line-clamp-2">Update T&C copy with v1.9 laws</p>
                    </div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200">
                  <div className="text-[11px] font-bold text-emerald-600 uppercase mb-2">DONE (1)</div>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-white rounded-lg border border-emerald-300 shadow-sm text-xs">
                      <span className="text-[10px] font-mono text-emerald-600 font-bold">MAC-10</span>
                      <p className="font-medium text-slate-800 mt-0.5 line-clamp-2">Deploy Cloudflare multi-region</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Copy */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#172b4d] tracking-tight leading-tight">
              Customize how your team's work flows
            </h3>
            <p className="text-base text-slate-600 leading-relaxed">
              Set up, clean up, and automate even the most complicated project workflows. Move cards seamlessly across columns with drag-and-drop.
            </p>
            <div className="pt-2">
              <button
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 font-bold text-[#0052cc] hover:text-[#003da5] text-sm group cursor-pointer"
              >
                <span>Try the interactive Kanban canvas</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* 2. Stay on track - even when the track changes */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Copy */}
          <div className="lg:col-span-5 space-y-4 order-2 lg:order-1">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#172b4d] tracking-tight leading-tight">
              Stay on track – even when the track changes
            </h3>
            <p className="text-base text-slate-600 leading-relaxed">
              Use integrated roadmaps to sketch out the big picture, communicate plans with stakeholders, and ensure your team stays on the same page.
            </p>
            <div className="pt-2">
              <button
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 font-bold text-[#0052cc] hover:text-[#003da5] text-sm group cursor-pointer"
              >
                <span>Explore sprint roadmaps</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right: Roadmap Timeline Mock */}
          <div className="lg:col-span-7 relative order-1 lg:order-2">
            <div className="absolute -inset-4 bg-purple-500/10 rounded-3xl rotate-1" />
            <div className="relative bg-white rounded-2xl p-5 shadow-xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs font-bold text-slate-500">
                <span>Epic Roadmap (Q3 - Q4)</span>
                <div className="flex gap-4 text-[10px] font-mono text-slate-400">
                  <span>JUL</span>
                  <span>AUG</span>
                  <span>SEP</span>
                  <span>OCT</span>
                </div>
              </div>

              {/* Timeline Bars */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 font-semibold mb-1">
                    <span>SR-1 Add user photo to profile</span>
                    <span className="text-purple-600">IN PROGRESS</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-md relative overflow-hidden">
                    <div className="absolute left-[10%] w-[55%] h-full bg-purple-600 rounded-md" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 font-semibold mb-1">
                    <span>MAC-12 New API Access Points</span>
                    <span className="text-emerald-600">DONE</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-md relative overflow-hidden">
                    <div className="absolute left-[20%] w-[70%] h-full bg-emerald-500 rounded-md" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-slate-600 font-semibold mb-1">
                    <span>MAC-18 Homepage refresh v2</span>
                    <span className="text-amber-600">UPCOMING</span>
                  </div>
                  <div className="w-full bg-slate-100 h-4 rounded-md relative overflow-hidden">
                    <div className="absolute left-[40%] w-[45%] h-full bg-amber-500 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Bye-bye, spreadsheets */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Issue Details Modal Visual matching 4th screenshot */}
          <div className="lg:col-span-7 relative">
            <div className="absolute -inset-4 bg-amber-500/10 rounded-3xl -rotate-1" />
            <div className="relative bg-white rounded-2xl p-5 shadow-2xl border-2 border-amber-400/60 text-[#172b4d]">
              {/* Modal Top */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                  ATMT-007
                </span>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    ✓ Done
                  </span>
                </div>
              </div>

              {/* Title */}
              <h4 className="text-base font-bold text-[#172b4d] mt-2 mb-1">
                Add pop-up to ask users for app store review
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                After the 3rd time an iOS user logs into the app, we will send a pop-up that asks if they love the app. If the user loves the app then we'll ask them to leave a review in the iOS app store.
              </p>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Assignee</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[9px] font-bold">JR</div>
                    <span className="font-medium text-slate-800">Jose Romero</span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Reporter</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[9px] font-bold">EG</div>
                    <span className="font-medium text-slate-800">Elena Godinez</span>
                  </div>
                </div>
              </div>

              {/* Attachments preview */}
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium">ios_user_app_guidelines.pdf (2.9 MB)</span>
              </div>
            </div>
          </div>

          {/* Right: Copy */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#172b4d] tracking-tight leading-tight">
              Bye-bye, spreadsheets
            </h3>
            <p className="text-base text-slate-600 leading-relaxed">
              Keep every detail of a project centralized in real time so up-to-date info can flow freely across people, teams, and tools.
            </p>
            <div className="pt-2">
              <button
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 font-bold text-[#0052cc] hover:text-[#003da5] text-sm group cursor-pointer"
              >
                <span>Launch issue manager</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
