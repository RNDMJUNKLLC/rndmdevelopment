import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@store/index';
import { uiActions } from '@store/slices/uiSlice';
import { initializeEmailJS } from '@/hooks';
import Navigation from '@components/layout/Navigation';
import Footer from '@components/layout/Footer';
import Home from '@components/pages/Home';
import About from '@components/pages/About';
import Services from '@components/pages/Services';
import Contact from '@components/pages/Contact';
import Token from '@components/pages/Token';
import Account from '@components/pages/Account';
import NotificationContainer from '@components/ui/NotificationContainer';
import ParticleBackground from '@components/ui/ParticleBackground';
import GlowOrbs from '@components/ui/GlowOrbs';

function App() {
  const dispatch = useDispatch();
  const { currentPage } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    // Initialize EmailJS
    initializeEmailJS();

    // Force dark mode — site is always dark
    document.documentElement.classList.add('dark');
    dispatch(uiActions.setDarkMode(true));
  }, [dispatch]);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'about':
        return <About />;
      case 'services':
        return <Services />;
      case 'contact':
        return <Contact />;
      case 'token':
        return <Token />;
      case 'account':
        return <Account />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Ambient background effects */}
      <ParticleBackground />
      <GlowOrbs />

      <Navigation />
      <main className="flex-grow relative z-10">
        {renderPage()}
      </main>
      <Footer />
      <NotificationContainer />
    </div>
  );
}

export default App;
