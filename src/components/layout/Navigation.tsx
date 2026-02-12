import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@store/index';
import { uiActions } from '@store/slices/uiSlice';

export const Navigation: React.FC = () => {
  const dispatch = useDispatch();
  const { currentPage, isDarkMode } = useSelector((state: RootState) => state.ui);

  const navLinks = [
    { id: 'home', label: 'Home', page: 'home' },
    { id: 'about', label: 'About', page: 'about' },
    { id: 'services', label: 'Services', page: 'services' },
    { id: 'contact', label: 'Contact', page: 'contact' },
  ];

  const handleNavigate = (page: string) => {
    dispatch(uiActions.setCurrentPage(page));
    // Scroll to top of page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleDarkMode = () => {
    dispatch(uiActions.toggleDarkMode());
  };

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavigate('home')}
            className="text-2xl font-bold text-accent-600 hover:text-accent-700 dark:hover:text-accent-500 transition-colors"
          >
            RNDM DEVS
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.page)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentPage === link.page
                    ? 'bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={handleToggleDarkMode}
            className="p-2 rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.657-9.193a1 1 0 00-1.414 0l-.707.707A1 1 0 005.05 6.464l.707-.707a1 1 0 011.414 0zM3 11a1 1 0 100-2H2a1 1 0 100 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
