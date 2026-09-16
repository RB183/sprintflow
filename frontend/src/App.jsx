import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LandingPage } from './components/landing/LandingPage';
import { AppNavbar } from './components/layout/AppNavbar';
import { PersonalWorkspace } from './components/personal/PersonalWorkspace';
import { TeamSpaceHeader } from './components/team/TeamSpaceHeader';
import { HackerKanbanBoard } from './components/board/HackerKanbanBoard';
import { HackerRoadmap } from './components/roadmap/HackerRoadmap';
import { WhiteboardCanvas } from './components/canvas/WhiteboardCanvas';
import { TerminalChat } from './components/chat/TerminalChat';
import { AuthModal } from './components/auth/AuthModal';

function MainApp() {
  const {
    viewMode,
    teamTab,
    isAuthModalOpen,
    setIsAuthModalOpen,
    login,
  } = useApp();

  if (viewMode === 'landing') {
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
    <div className="min-h-screen bg-[#f4f5f7] text-[#172b4d] font-sans flex flex-col">
      <AppNavbar />

      <main className="flex-1 pb-10">
        {viewMode === 'personal' ? (
          <PersonalWorkspace />
        ) : (
          <div className="space-y-2">
            <TeamSpaceHeader />
            {teamTab === 'board' && <HackerKanbanBoard />}
            {teamTab === 'roadmap' && <HackerRoadmap />}
            {teamTab === 'canvas' && <WhiteboardCanvas />}
            {teamTab === 'chat' && <TerminalChat />}
          </div>
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={login}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
}
