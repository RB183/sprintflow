import React from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { FeatureTabsSection } from './FeatureTabsSection';
import { WorkflowShowcase } from './WorkflowShowcase';
import { CtaBanner } from './CtaBanner';
import { LandingFooter } from './LandingFooter';
import { useApp } from '../../context/AppContext';
import { MOCK_USERS } from '../../data/mockData';

export function LandingPage() {
  const { login, demoLogin, setIsAuthModalOpen } = useApp();

  const handleOpenAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handleDemoLogin = () => {
    demoLogin(MOCK_USERS[0]); // Alex Chen
  };

  const handleGoogleLogin = () => {
    login({
      id: 'usr-google',
      name: 'Google User',
      email: 'user@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      role: 'admin',
      title: 'Senior Engineer',
    });
  };

  return (
    <div className="landing-page min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans selection:bg-blue-100 selection:text-blue-900">
      <LandingNavbar
        onOpenAuth={handleOpenAuth}
        onDemoLogin={handleDemoLogin}
      />
      <HeroSection
        onOpenAuth={handleOpenAuth}
        onDemoLogin={handleDemoLogin}
        onGoogleLogin={handleGoogleLogin}
      />
      <div id="features">
        <FeatureTabsSection onEnterApp={handleDemoLogin} />
      </div>
      <div id="workflow">
        <WorkflowShowcase onEnterApp={handleDemoLogin} />
      </div>
      <div id="get-started">
        <CtaBanner onEnterApp={handleDemoLogin} />
      </div>
      <LandingFooter />
    </div>
  );
}
