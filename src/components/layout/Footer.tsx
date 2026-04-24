import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-lg font-bold text-gradient mb-4">
              RNDM DEVS
            </h3>
            <p className="text-slate-500">
              Professional web development with a creative twist.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Navigation
            </h3>
            <ul className="space-y-2 text-slate-500">
              <li>
                <a href="/" className="hover:text-purple-400 transition">
                  Home
                </a>
              </li>
              <li>
                <a href="/about/" className="hover:text-purple-400 transition">
                  About
                </a>
              </li>
              <li>
                <a href="/services/" className="hover:text-purple-400 transition">
                  Services
                </a>
              </li>
              <li>
                <a href="/contact/" className="hover:text-purple-400 transition">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">
              Connect
            </h3>
            <ul className="space-y-2 text-slate-500">
              <li>
                <a
                  href="https://github.com/RNDMJUNKLLC"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-400 transition"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com/RNDMDevelopment"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-purple-400 transition"
                >
                  Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="divider-glow mt-8 mb-6" />
        <p className="text-center text-slate-600 text-sm">
          &copy; {new Date().getFullYear()} RNDM Development. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
