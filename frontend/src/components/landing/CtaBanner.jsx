import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CtaBanner({ onEnterApp }) {
  return (
    <section className="w-full bg-[#0052cc] py-16 text-center text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
          Start planning your next sprint in minutes
        </h2>
        <p className="text-base text-blue-100 max-w-xl mx-auto mb-8 font-normal">
          Join over 300,000 high-velocity engineering and product teams building with SprintFlow.
        </p>
        <button
          onClick={onEnterApp}
          className="px-8 py-3.5 rounded-md bg-[#ffab00] hover:bg-[#ff991f] text-[#172b4d] font-extrabold text-base shadow-lg transition-all cursor-pointer inline-flex items-center gap-2 hover:scale-105"
        >
          <span>Get it free</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
