import React from 'react';
import { Kanban, ArrowRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function LandingNavbar({ onOpenAuth }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
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
              <span className="text-xl font-extrabold text-[#172b4d] dark:text-slate-100 tracking-tight">SprintFlow</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                100% Free
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#44546f] dark:text-slate-300">
            <a href="#features" className="hover:text-[#0052cc] dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-[#0052cc] dark:hover:text-blue-400 transition-colors">Workflows</a>
            <a href="#get-started" className="hover:text-[#0052cc] dark:hover:text-blue-400 transition-colors">Get started</a>
          </div>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#0052cc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc] cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={() => onOpenAuth('signin')}
            className="text-sm font-semibold text-[#0052cc] dark:text-blue-400 hover:text-[#003da5] dark:hover:text-blue-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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
