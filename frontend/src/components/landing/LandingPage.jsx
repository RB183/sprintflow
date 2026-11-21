import React from 'react';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { FeatureTabsSection } from './FeatureTabsSection';
import { WorkflowShowcase } from './WorkflowShowcase';
import { CtaBanner } from './CtaBanner';
import { LandingFooter } from './LandingFooter';
import { useApp } from '../../context/AppContext';

export function LandingPage() {
  const { setIsAuthModalOpen } = useApp();

  const handleOpenAuth = () => {
    setIsAuthModalOpen(true);
  };

  const handleGoogleLogin = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <div className="landing-page min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans selection:bg-blue-100 selection:text-blue-900">
      <LandingNavbar
        onOpenAuth={handleOpenAuth}
      />
      <HeroSection
        onOpenAuth={handleOpenAuth}
        onGoogleLogin={handleGoogleLogin}
      />
      <div id="features">
        <FeatureTabsSection onEnterApp={handleOpenAuth} />
      </div>
      <div id="workflow">
        <WorkflowShowcase onEnterApp={handleOpenAuth} />
      </div>
      <div id="get-started">
        <CtaBanner onEnterApp={handleOpenAuth} />
      </div>
      <LandingFooter />
    </div>
  );
}
