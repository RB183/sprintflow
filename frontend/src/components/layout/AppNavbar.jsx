import React, { useState } from 'react';
import {
  Kanban,
  User,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  Moon,
  Sun,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { MOCK_USERS } from '../../data/mockData';
import { CreateButton } from './CreateButton';

export function AppNavbar({ onToggleSidebar }) {
  const {
    currentUser,
    logout,
    login,
    viewMode,
    setViewMode,
    navigateTo,
  } = useApp();
  const { theme, toggleTheme } = useTheme();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 font-sans">
        
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Open workspace navigation"
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 hover:text-[#0052cc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc] lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div
            onClick={() => { setViewMode('personal'); navigateTo('personal'); }}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#0052cc] flex items-center justify-center text-white font-black shadow-sm group-hover:bg-[#0041a8] transition-colors">
              <Kanban className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-extrabold text-[#172b4d] tracking-tight">
                SprintFlow
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden md:block" />

          {/* Personal Workspace Switcher */}
          <button
            onClick={() => { setViewMode('personal'); navigateTo('personal'); }}
            className={`hidden md:flex px-3 py-1.5 rounded-lg text-xs font-bold transition-all items-center gap-1.5 cursor-pointer ${
              viewMode === 'personal'
                ? 'bg-blue-50 text-[#0052cc] border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personal Workspace</span>
          </button>
        </div>

        {/* Right: Overview link & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <CreateButton />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="rounded-lg border border-slate-200 bg-slate-50 p-1.5 text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#0052cc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc]"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {/* Back to Landing Page / Overview */}
          <button
            onClick={() => setViewMode('landing')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:text-[#0052cc] hover:bg-blue-50/50 transition-colors cursor-pointer"
            title="View Product Overview Landing Page"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span>Product Overview</span>
          </button>

          {/* User Persona & Logout Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pr-2.5 rounded-full border border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
            >
              <img
                src={currentUser?.avatar || MOCK_USERS[0].avatar}
                alt={currentUser?.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#172b4d] leading-none truncate max-w-[120px]">
                  {currentUser?.name || 'Alex Chen'}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">{currentUser?.role || 'Admin'}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 light-dropdown rounded-xl p-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="text-xs font-bold text-[#172b4d]">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                </div>

                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                  Switch Persona (Demo)
                </div>

                <div className="space-y-1 mb-2">
                  {MOCK_USERS.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => {
                        login(user);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        user.id === currentUser?.id
                          ? 'bg-blue-50 text-[#0052cc] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="truncate">{user.name} ({user.title.split(' ')[0]})</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
