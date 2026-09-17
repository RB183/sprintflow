import React from 'react';
import { Kanban, ArrowRight, Zap, Sparkles, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function LandingNavbar({ onOpenAuth, onDemoLogin }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Links */}
        <div className="flex items-center gap-8">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-8 h-8 rounded-lg bg-[#0052cc] flex items-center justify-center text-white font-black shadow-sm">
              <Kanban className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold text-[#172b4d] tracking-tight">SprintFlow</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                100% Free
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#44546f]">
            <a href="#features" className="hover:text-[#0052cc] transition-colors">Features</a>
            <a href="#workflow" className="hover:text-[#0052cc] transition-colors">Workflows</a>
            <a href="#templates" className="hover:text-[#0052cc] transition-colors">Templates</a>
            <a href="#community" className="hover:text-[#0052cc] transition-colors">Community</a>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#0052cc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {/* Instant 1-Click Demo */}
          <button
            onClick={onDemoLogin}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-colors cursor-pointer shadow-sm"
            title="Instant 1-Click Access Without Credentials"
          >
            <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
            <span>⚡ Demo Sign In</span>
          </button>

          <button
            onClick={() => onOpenAuth('signin')}
            className="text-sm font-semibold text-[#0052cc] hover:text-[#003da5] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Sign in
          </button>

          <button
            onClick={() => onOpenAuth('signup')}
            className="text-sm font-bold bg-[#0052cc] hover:bg-[#0041a8] text-white px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
