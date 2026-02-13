import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '@/hooks';
import type { RootState } from '@store/index';
import { uiActions } from '@store/slices/uiSlice';

export const Navigation: React.FC = () => {
  const dispatch = useDispatch();
  const { currentPage } = useSelector((state: RootState) => state.ui);
  const { isLoggedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', page: 'home' },
    { id: 'about', label: 'About', page: 'about' },
    { id: 'services', label: 'Services', page: 'services' },
    { id: 'contact', label: 'Contact', page: 'contact' },
    { id: 'account', label: 'Account', page: 'account' },
  ];

  const handleNavigate = (page: string) => {
    dispatch(uiActions.setCurrentPage(page));
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavigate('home')}
            className="font-display text-xl font-bold tracking-wider text-gradient transition-all hover:scale-105"
          >
            RNDM DEVS
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavigate(link.page)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === link.page
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {currentPage === link.page && (
                  <span className="absolute inset-0 rounded-lg bg-white/5 border border-purple-500/20" />
                )}
                <span className="relative flex items-center gap-1.5">
                  {link.id === 'account' && isLoggedIn && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  )}
                  {link.label}
                </span>
              </button>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-white/5 animate-fade-in-down">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavigate(link.page)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium text-left transition-all ${
                    currentPage === link.page
                      ? 'text-white bg-white/5 border border-purple-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {link.id === 'account' && isLoggedIn && (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    )}
                    {link.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
