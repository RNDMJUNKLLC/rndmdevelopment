import React from 'react';

export const Navigation: React.FC = () => {
  return (
    <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <a href="#" className="text-2xl font-bold text-accent-600">RNDM DEVS</a>
          </div>
          {/* Navigation links will be added here */}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
