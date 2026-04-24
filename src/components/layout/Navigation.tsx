import React, { useState } from 'react';
import { useAuth } from '@/hooks';

/**
 * Map a pathname to the logical "page" key used for active-link styling.
 * Treats both `/about` and `/about/` as the about page, etc.
 */
const pathToPage = (pathname: string): string => {
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  if (trimmed === '' || trimmed === '/') return 'home';
  const first = trimmed.split('/')[1];
  return first || 'home';
};

export const Navigation: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentPage =
    typeof window !== 'undefined' ? pathToPage(window.location.pathname) : 'home';

  const navLinks = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'about', label: 'About', href: '/about/' },
    { id: 'services', label: 'Services', href: '/services/' },
    { id: 'contact', label: 'Contact', href: '/contact/' },
    { id: 'account', label: 'Account', href: '/account/' },
  ];

  return (
    <nav className="glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a
            href="/"
            className="font-display text-xl font-bold tracking-wider text-gradient transition-all hover:scale-105"
          >
            RNDM DEVS
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  currentPage === link.id
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {currentPage === link.id && (
                  <span className="absolute inset-0 rounded-lg bg-white/5 border border-purple-500/20" />
                )}
                <span className="relative flex items-center gap-1.5">
                  {link.id === 'account' && isLoggedIn && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  )}
                  {link.label}
                </span>
              </a>
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
                <a
                  key={link.id}
                  href={link.href}
                  className={`px-4 py-3 rounded-lg text-sm font-medium text-left transition-all ${
                    currentPage === link.id
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
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
