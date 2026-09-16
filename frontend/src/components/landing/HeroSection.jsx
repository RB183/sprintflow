import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Check,
  HelpCircle,
  RotateCw,
  X,
  MousePointer2,
  Zap,
} from 'lucide-react';

export function HeroSection({ onOpenAuth, onDemoLogin, onGoogleLogin }) {
  const [email, setEmail] = useState('');

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    onOpenAuth('signup', email);
  };

  return (
    <section className="relative w-full bg-[#0052cc] text-white pt-12 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headline, Email Signup, SSO, Demo */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/60 border border-blue-400 text-xs font-semibold text-blue-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>100% Free & Open Project Management</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              Agile teams choose SprintFlow
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 font-normal max-w-xl">
              Intuitive project management and real-time collaboration. Free forever for teams of any size.
            </p>

            {/* Email Signup Form */}
            <form onSubmit={handleSignupSubmit} className="space-y-3 max-w-md">
              <div>
                <label className="text-xs font-semibold text-blue-100 block mb-1.5">
                  Work email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 rounded-lg bg-white text-slate-900 placeholder-slate-400 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-sm"
                />
              </div>

              <p className="text-[11px] text-blue-200">
                Using a work email helps find teammates and boost collaboration.
              </p>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-lg bg-[#ffab00] hover:bg-[#ff991f] text-[#172b4d] font-extrabold text-base shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 hover:shadow-lg"
              >
                <span>Sign up free</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* SSO Options & Instant Demo Button */}
            <div className="max-w-md pt-2 space-y-3">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-blue-400/40"></div>
                <span className="flex-shrink mx-4 text-xs text-blue-200 font-medium">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-blue-400/40"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onGoogleLogin}
                  type="button"
                  className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                {/* 1-Click Instant Demo Button */}
                <button
                  onClick={onDemoLogin}
                  type="button"
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>1-Click Demo</span>
                </button>
              </div>
            </div>

            {/* Account Prompt */}
            <div className="pt-2">
              <p className="text-xs text-blue-200">
                Already have an account?{' '}
                <button
                  onClick={() => onOpenAuth('signin')}
                  className="underline font-semibold hover:text-white cursor-pointer"
                >
                  Sign in here
                </button>
              </p>
            </div>
          </div>

          {/* Right Column: Floating Jira-Style Sprint Insights Mockup */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            {/* Background Graphic Shape */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-lime-400/90 to-emerald-500 rounded-3xl transform -rotate-3 scale-95 opacity-90 shadow-2xl" />

            {/* Background Mock Board Preview */}
            <div className="relative w-full max-w-lg bg-slate-800/90 rounded-2xl p-4 border border-slate-700 text-slate-200 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 text-xs">
                <span className="font-bold text-amber-400">⚡ The Next Big Thing</span>
                <div className="flex -space-x-1.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-500 border border-slate-900" />
                  <div className="w-5 h-5 rounded-full bg-pink-500 border border-slate-900" />
                  <div className="w-5 h-5 rounded-full bg-emerald-500 border border-slate-900" />
                </div>
              </div>

              {/* Rows */}
              <div className="py-2 space-y-2 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/60">
                  <span className="font-mono text-indigo-300">NUC-364</span>
                  <span className="text-slate-300">Update API Gateway auth</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px]">DONE</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/60">
                  <span className="font-mono text-indigo-300">NUC-358</span>
                  <span className="text-slate-300">Redis failover cluster</span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[9px]">IN PROGRESS</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-900/60">
                  <span className="font-mono text-indigo-300">NUC-350</span>
                  <span className="text-slate-300">Multi-region latency</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 text-[9px]">TO DO</span>
                </div>
              </div>
            </div>

            {/* Foreground Floating White Insights Card */}
            <div className="absolute -top-6 right-2 sm:right-6 w-72 sm:w-80 bg-white rounded-xl shadow-2xl p-4 text-slate-800 border border-slate-200 z-20 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-[#172b4d]">Insights</span>
                  <span className="px-1.5 py-0.2 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                    CLE SPRINT 48
                  </span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <HelpCircle className="w-3.5 h-3.5 hover:text-slate-600 cursor-pointer" />
                  <RotateCw className="w-3.5 h-3.5 hover:text-slate-600 cursor-pointer" />
                  <X className="w-3.5 h-3.5 hover:text-slate-600 cursor-pointer" />
                </div>
              </div>

              {/* Sprint progress */}
              <div className="py-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#172b4d] mb-1">
                  <span>Sprint progress</span>
                  <span className="text-slate-500 text-[11px] font-medium">13% done</span>
                </div>

                {/* Segmented bar */}
                <div className="w-full h-2 rounded-full flex overflow-hidden bg-slate-100 mb-2">
                  <div className="bg-emerald-500 h-full" style={{ width: '13%' }} />
                  <div className="bg-blue-500 h-full" style={{ width: '24%' }} />
                  <div className="bg-slate-300 h-full" style={{ width: '63%' }} />
                </div>

                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <div>
                    <span className="text-emerald-600 font-bold block text-xs">13%</span>
                    <span>Done</span>
                  </div>
                  <div>
                    <span className="text-blue-600 font-bold block text-xs">24%</span>
                    <span>In progress</span>
                  </div>
                  <div>
                    <span className="text-slate-600 font-bold block text-xs">63%</span>
                    <span>Not started</span>
                  </div>
                </div>
              </div>

              {/* Sprint Burndown chart */}
              <div className="pt-2 border-t border-slate-100">
                <div className="text-xs font-bold text-[#172b4d]">Sprint burndown</div>
                <p className="text-[11px] text-slate-500 font-medium">100 remaining points out of 120</p>

                {/* Chart SVG */}
                <div className="mt-2 h-20 w-full bg-slate-50/80 rounded border border-slate-100 relative overflow-hidden flex items-end p-2">
                  <svg className="w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
                    <line x1="10" y1="10" x2="190" y2="55" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3,3" />
                    <path
                      d="M 10 10 L 45 15 L 85 30 L 120 25 L 160 38 L 190 52"
                      fill="none"
                      stroke="#0052cc"
                      strokeWidth="2.5"
                    />
                  </svg>
                  <span className="absolute bottom-1 right-2 text-[9px] text-slate-400 font-mono">
                    Remaining work / Guideline
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive User Cursor Pill matching screenshot */}
            <div className="absolute bottom-14 right-12 z-30 flex items-center gap-1.5 animate-bounce">
              <MousePointer2 className="w-5 h-5 text-purple-600 fill-purple-600" />
              <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white text-xs font-bold shadow-lg">
                @Natalie
              </span>
            </div>

            {/* User Avatar Circle */}
            <div className="absolute -bottom-6 left-12 z-30">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                alt="Natalie"
                className="w-16 h-16 rounded-full border-4 border-white shadow-xl object-cover"
              />
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
