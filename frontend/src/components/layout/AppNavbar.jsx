import React, { useState, useEffect, useRef } from 'react';
import {
  Kanban,
  User,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  Moon,
  Sun,
  Search,
  Settings,
  Bell,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Sparkles,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { CreateButton } from './CreateButton';

export function AppNavbar({ onToggleSidebar }) {
  const {
    currentUser,
    logout,
    viewMode,
    setViewMode,
    navigateTo,
    setIsProfileModalOpen,
    setIsCommandPaletteOpen,
    selectOrg,
    setTeamTab,
    notifications = [],
    unreadNotificationsCount = 0,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useApp();
  const { theme, toggleTheme } = useTheme();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns when clicking anywhere outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsNotificationOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleNotificationClick = async (notif) => {
    if (!notif.read && markNotificationRead) {
      await markNotificationRead(notif._id || notif.id);
    }

    if (notif.spaceId) {
      const targetOrgId = typeof notif.spaceId === 'object' ? notif.spaceId._id : notif.spaceId;
      selectOrg(targetOrgId);
      setViewMode('team');
      setTeamTab('board');
      setIsNotificationOpen(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (markAllNotificationsRead) {
      await markAllNotificationsRead();
    }
  };

  const handleClearNotifications = () => {
    if (clearNotifications) {
      clearNotifications();
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    try {
      const diffSec = Math.floor((new Date() - new Date(dateStr)) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return 'Recently';
    }
  };

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 font-sans">
        
        {/* Left: Brand & Navigation */}
        <div className="flex items-center gap-3 sm:gap-6">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Open workspace navigation"
            className="rounded-lg p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-[#0052cc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052cc] lg:hidden cursor-pointer"
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
              <span className="text-base font-extrabold text-[#172b4d] dark:text-slate-100 tracking-tight">
                SprintFlow
              </span>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

          {/* Personal Workspace Switcher */}
          <button
            onClick={() => { setViewMode('personal'); navigateTo('personal'); }}
            className={`hidden md:flex px-3 py-1.5 rounded-lg text-xs font-bold transition-all items-center gap-1.5 cursor-pointer ${
              viewMode === 'personal'
                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0052cc] dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Personal Workspace</span>
          </button>
        </div>

        {/* Right: Search, Notification Bell, Theme & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer"
            title="Search or jump to command (Ctrl+K)"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search...</span>
            <kbd className="px-1.5 py-0.2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-mono text-slate-400 dark:text-slate-300">
              ⌘K
            </kbd>
          </button>

          <CreateButton />

          {/* Interactive Notifications Bell */}
          <div ref={notificationRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setIsNotificationOpen((prev) => {
                  const nextState = !prev;
                  if (nextState && refreshNotifications) refreshNotifications();
                  return nextState;
                });
                if (isUserMenuOpen) setIsUserMenuOpen(false);
              }}
              aria-label="View notifications"
              className="relative rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#0052cc] cursor-pointer"
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-black text-white shadow-xs animate-in zoom-in-50">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 z-50 animate-in fade-in zoom-in-95 shadow-2xl text-slate-900 dark:text-slate-100">
                <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Notifications
                    </span>
                    {unreadNotificationsCount > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-[10px] font-bold">
                        {unreadNotificationsCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    {unreadNotificationsCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="font-semibold text-[#0052cc] dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={handleClearNotifications}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        title="Clear view"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setIsNotificationOpen(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-1"
                      title="Close"
                      aria-label="Close notifications"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => {
                      const notifId = notif._id || notif.id;
                      return (
                        <div
                          key={notifId}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-2.5 rounded-xl border transition-colors flex items-start justify-between gap-2.5 cursor-pointer ${
                            notif.read
                              ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-800/60 opacity-80'
                              : 'bg-blue-50/40 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/80 shadow-2xs hover:bg-blue-50/70'
                          }`}
                        >
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              notif.type === 'assignment'
                                ? 'bg-blue-50 dark:bg-blue-900/40 text-[#0052cc] dark:text-blue-400'
                                : notif.type === 'invite'
                                ? 'bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
                                : 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {notif.type === 'assignment' ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : notif.type === 'invite' ? (
                                <Sparkles className="w-3.5 h-3.5" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                                {notif.title}
                              </p>
                              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed line-clamp-2">
                                {notif.message || notif.text}
                              </p>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-1 block">
                                {formatTime(notif.createdAt || notif.time)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500">
                      You are all caught up! No active notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-[#0052cc] cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* Back to Landing Page / Overview */}
          <button
            onClick={() => setViewMode('landing')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#0052cc] hover:bg-blue-50/50 transition-colors cursor-pointer"
            title="View Product Overview Landing Page"
          >
            <Home className="w-3.5 h-3.5 text-slate-500" />
            <span>Product Overview</span>
          </button>

          {/* User Account & Logout Dropdown */}
          <div ref={userMenuRef} className="relative">
            <button
              onClick={() => {
                setIsUserMenuOpen((prev) => !prev);
                if (isNotificationOpen) setIsNotificationOpen(false);
              }}
              className="flex items-center gap-2 p-1 pr-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors cursor-pointer bg-white dark:bg-slate-800"
            >
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.name || 'User'}
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-[#172b4d] dark:text-slate-100 leading-none truncate max-w-[120px]">
                  {currentUser?.name || 'User'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">{currentUser?.title || 'Engineer'}</p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 z-50 animate-in fade-in zoom-in-95 shadow-2xl text-slate-900 dark:text-slate-100">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-xs font-bold text-[#172b4d] dark:text-slate-100">{currentUser?.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setIsUserMenuOpen(false);
                    }}
                    className="mt-2 w-full flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#0052cc] dark:text-blue-300 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors cursor-pointer"
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
