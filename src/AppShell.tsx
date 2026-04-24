import { useEffect, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { uiActions } from '@store/slices/uiSlice';
import { initializeEmailJS } from '@/hooks';
import Navigation from '@components/layout/Navigation';
import Footer from '@components/layout/Footer';
import NotificationContainer from '@components/ui/NotificationContainer';
import ParticleBackground from '@components/ui/ParticleBackground';
import GlowOrbs from '@components/ui/GlowOrbs';

interface AppShellProps {
  children: ReactNode;
}

/**
 * Shared layout wrapper used by every page entry.
 * Each route is a separate HTML document; this component supplies the
 * common chrome (nav, footer, background effects, notifications) and
 * one-time initialisation (EmailJS, dark mode).
 */
function AppShell({ children }: AppShellProps) {
  const dispatch = useDispatch();

  useEffect(() => {
    initializeEmailJS();

    // Force dark mode — site is always dark
    document.documentElement.classList.add('dark');
    dispatch(uiActions.setDarkMode(true));
  }, [dispatch]);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Ambient background effects */}
      <ParticleBackground />
      <GlowOrbs />

      <Navigation />
      <main className="flex-grow relative z-10">{children}</main>
      <Footer />
      <NotificationContainer />
    </div>
  );
}

export default AppShell;
