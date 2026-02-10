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

function App() {
  const dispatch = useDispatch();
  const { currentPage, isDarkMode } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    // Initialize EmailJS
    initializeEmailJS();

    // Initialize dark mode based on system preference or localStorage
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedMode ? JSON.parse(savedMode) : prefersDark;
    
    dispatch(uiActions.setDarkMode(shouldBeDark));
    updateDarkModeClass(shouldBeDark);
  }, [dispatch]);

  useEffect(() => {
    // Update dark mode class and localStorage
    updateDarkModeClass(isDarkMode);
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const updateDarkModeClass = (dark: boolean) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 transition-colors duration-300">
      <Navigation />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
      <NotificationContainer />
    </div>
  );
}

export default App;
