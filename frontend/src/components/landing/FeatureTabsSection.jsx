import React, { useState } from 'react';
import { Check, Calendar, ArrowRight, Layers, Sparkles, Zap, RefreshCw, Smartphone } from 'lucide-react';

export function FeatureTabsSection({ onEnterApp }) {
  const [activeTab, setActiveTab] = useState('track');

  const tabContents = {
    plan: {
      title: 'Plan sprints with AI precision',
      bullets: [
        {
          head: 'Break down epics into actionable stories:',
          desc: 'Automatically generate subtasks and estimate story points based on historical team velocity.',
        },
        {
          head: 'Cross-functional backlog refinement:',
          desc: 'Align product managers, engineers, and designers in a single unified planning environment.',
        },
        {
          head: 'Capacity and allocation forecasting:',
          desc: 'Balance team workload to prevent developer burnout before the sprint even starts.',
        },
      ],
      mockupTitle: 'Sprint 24 Architecture Kickoff',
      badge: 'PLANNING',
      team: 'Platform Architecture Team',
    },
    track: {
      title: 'Stay on schedule',
      bullets: [
        {
          head: 'Monitor progress, your way:',
          desc: 'Visualize your projects in a board, list, timeline, or calendar view.',
        },
        {
          head: 'Manage risks and dependencies:',
          desc: 'Get status updates and any potential blockers from AI agents.',
        },
        {
          head: 'Coordinate across teams:',
          desc: 'Connect engineering, product, and marketing initiatives with release announcements.',
        },
      ],
      mockupTitle: 'App soft launch',
      badge: 'UNRELEASED',
      team: 'iOS Team',
    },
    accelerate: {
      title: 'Automate repetitive workflows',
      bullets: [
        {
          head: 'No-code automation rules:',
          desc: 'Auto-assign pull request reviewers, transition card statuses on GitHub merge, and trigger builds.',
        },
        {
          head: 'Smart alert routing:',
          desc: 'Deliver high-priority defect alerts straight to Slack and MS Teams without cluttering email.',
        },
        {
          head: 'Instant CI/CD synchronization:',
          desc: 'Deploy with confidence by verifying status transitions against passing end-to-end tests.',
        },
      ],
      mockupTitle: 'CI/CD Deployment Pipeline',
      badge: 'AUTOMATED',
      team: 'DevOps & SRE Team',
    },
    iterate: {
      title: 'Continuous retrospective insights',
      bullets: [
        {
          head: 'Real-time velocity & burndown charts:',
          desc: 'Track completed story points vs. scope creep dynamically throughout the 2-week cycle.',
        },
        {
          head: 'Automated sprint retrospectives:',
          desc: 'Synthesize what went well and what needs improvement with actionable AI summaries.',
        },
        {
          head: 'Executive health reports:',
          desc: 'Export stakeholder-ready dashboards with one click.',
        },
      ],
      mockupTitle: 'Sprint 23 Retrospective',
      badge: 'INSIGHTS',
      team: 'Product Leadership',
    },
  };

  const current = tabContents[activeTab];

  return (
    <section id="features" className="py-20 bg-white border-b border-slate-200 text-[#172b4d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Headline */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#172b4d] tracking-tight">
            Discover AI features that power your agile teams
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mb-14 border-b border-slate-200 pb-4">
          {['plan', 'track', 'accelerate', 'iterate'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#deebff] text-[#0052cc] shadow-sm'
                  : 'text-[#44546f] hover:text-[#172b4d] hover:bg-slate-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left: Copy & Bullet Checklist */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#172b4d]">
              {current.title}
            </h3>

            <div className="space-y-4">
              {current.bullets.map((b, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-700">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#172b4d] leading-relaxed">
                      <span className="font-bold">{b.head}</span> {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={onEnterApp}
                className="inline-flex items-center gap-2 text-sm font-bold text-[#0052cc] hover:text-[#003da5] group cursor-pointer"
              >
                <span>Experience {activeTab} mode in live demo</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right: Jira-Style Visual Showcase Card */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Green backing decorative shape matching screenshot */}
            <div className="absolute -inset-3 bg-[#e3fcef] rounded-3xl transform rotate-2 scale-95" />

            {/* Backing Calendar / Table Preview Mock */}
            <div className="relative w-full max-w-lg bg-slate-800 rounded-2xl p-5 shadow-2xl text-slate-200 border border-slate-700">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">The Next Big Thing</span>
                </div>
                <span className="text-[11px] text-slate-400">October 2026</span>
              </div>

              {/* Grid rows */}
              <div className="grid grid-cols-4 gap-2 py-4 text-center text-xs opacity-60">
                <div className="p-3 bg-slate-900/60 rounded">Mon 12</div>
                <div className="p-3 bg-slate-900/60 rounded">Tue 13</div>
                <div className="p-3 bg-slate-900/60 rounded">Wed 14</div>
                <div className="p-3 bg-slate-900/60 rounded">Thu 15</div>
              </div>

              {/* Floating White Release Card matching screenshot */}
              <div className="mt-2 bg-white rounded-xl shadow-xl p-5 text-slate-800 border border-slate-200 animate-in fade-in duration-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#0052cc]" />
                    <span className="font-bold text-sm text-[#172b4d]">{current.mockupTitle}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-[#deebff] text-[#0052cc] text-[10px] font-extrabold uppercase">
                    {current.badge}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden my-2.5">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-[#0052cc]" style={{ width: '68%' }} />
                </div>

                <p className="text-xs text-slate-600 mb-3">This is the latest v3 enterprise release</p>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[9px] block">START DATE</span>
                    <span className="font-semibold text-slate-700">02/10/2026</span>
                  </div>
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[9px] block">RELEASE DATE</span>
                    <span className="font-semibold text-slate-700">01/01/2027</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">SOURCE</span>
                  <div className="flex items-center gap-1.5 font-bold text-[#0052cc]">
                    <span>{current.team}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
