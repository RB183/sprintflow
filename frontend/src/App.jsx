import React, { lazy, Suspense, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { LandingPage } from './components/landing/LandingPage';
import { AppNavbar } from './components/layout/AppNavbar';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/common/ProfileModal';
import { CommandPaletteModal } from './components/common/CommandPaletteModal';
import { BoardMetricsModal } from './components/analytics/BoardMetricsModal';
import { ActivityToastContainer } from './components/common/ActivityToast';
import { SidebarNavigation } from './components/layout/SidebarNavigation';
import { PageSkeleton } from './components/common/PageSkeleton';

const PersonalWorkspace = lazy(() => import('./components/personal/PersonalWorkspace').then((module) => ({ default: module.PersonalWorkspace })));
const TeamSpaceHeader = lazy(() => import('./components/team/TeamSpaceHeader').then((module) => ({ default: module.TeamSpaceHeader })));
const HackerKanbanBoard = lazy(() => import('./components/board/HackerKanbanBoard').then((module) => ({ default: module.HackerKanbanBoard })));
const HackerRoadmap = lazy(() => import('./components/roadmap/HackerRoadmap').then((module) => ({ default: module.HackerRoadmap })));
const WhiteboardCanvas = lazy(() => import('./components/canvas/WhiteboardCanvas').then((module) => ({ default: module.WhiteboardCanvas })));
const TerminalChat = lazy(() => import('./components/chat/TerminalChat').then((module) => ({ default: module.TerminalChat })));
const WorkspacePage = lazy(() => import('./components/layout/WorkspacePage').then((module) => ({ default: module.WorkspacePage })));

function MainApp() {
  const {
    currentUser,
    viewMode,
    teamTab,
    workspacePage,
    isAuthModalOpen,
    setIsAuthModalOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    login,
  } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // STRICT AUTHENTICATION GUARD:
  // If user is not logged in or in landing mode, render ONLY LandingPage & AuthModal.
  // Private workspaces, boards, chats, and canvases cannot be bypassed or accessed.
  if (!currentUser || viewMode === 'landing') {
    return (
      <>
        <LandingPage />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={login}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col">
      <AppNavbar onToggleSidebar={() => setIsSidebarOpen(true)} />

      <div className="flex flex-1">
        <SidebarNavigation isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="min-w-0 flex-1 pb-10" aria-busy="false">
          <Suspense fallback={<PageSkeleton variant={workspacePage === 'personal' || workspacePage === 'dashboards' ? 'personal' : workspacePage === 'roadmaps' || teamTab === 'roadmap' ? 'roadmap' : workspacePage === 'projects' || workspacePage === 'spaces' ? 'board' : 'workspace'} />}>
          {workspacePage === 'personal' || workspacePage === 'dashboards' ? (
            <PersonalWorkspace />
          ) : workspacePage === 'projects' || workspacePage === 'spaces' || workspacePage === 'roadmaps' ? (
            <div className="space-y-2">
              <TeamSpaceHeader />
              {teamTab === 'board' && <HackerKanbanBoard />}
              {teamTab === 'roadmap' && <HackerRoadmap />}
              {teamTab === 'canvas' && <WhiteboardCanvas />}
              {teamTab === 'chat' && <TerminalChat />}
            </div>
          ) : (
            <WorkspacePage />
          )}
          </Suspense>
        </main>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={login}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <CommandPaletteModal />
      <BoardMetricsModal />
      <ActivityToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AppProvider>
          <MainApp />
        </AppProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
