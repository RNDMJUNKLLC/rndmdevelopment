import React from 'react';

/**
 * Animated gradient orbs that float behind content sections.
 * Creates a soft, dreamy atmosphere with CSS-only animations.
 */
export const GlowOrbs: React.FC = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Large purple orb */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-purple-500/10 dark:bg-purple-500/5 blur-3xl animate-orb-1" />
      {/* Accent blue orb */}
      <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-blue-500/10 dark:bg-blue-400/5 blur-3xl animate-orb-2" />
      {/* Bottom pink orb */}
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 rounded-full bg-pink-500/10 dark:bg-pink-500/5 blur-3xl animate-orb-3" />
      {/* Center violet shimmer */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-500/5 dark:bg-violet-400/5 blur-3xl animate-orb-4" />
    </div>
  );
};

export default GlowOrbs;
