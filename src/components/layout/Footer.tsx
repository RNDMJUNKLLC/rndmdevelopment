import React from 'react';
import { useDispatch } from 'react-redux';
import { uiActions } from '@store/slices/uiSlice';

export const Footer: React.FC = () => {
  const dispatch = useDispatch();

  const handleNavigate = (page: string) => {
    dispatch(uiActions.setCurrentPage(page));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white border-t border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">RNDM DEVS</h3>
            <p className="text-slate-400">Professional web development with a creative twist.</p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Navigation</h3>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={() => handleNavigate('home')} className="hover:text-white transition">Home</button></li>
              <li><button onClick={() => handleNavigate('about')} className="hover:text-white transition">About</button></li>
              <li><button onClick={() => handleNavigate('services')} className="hover:text-white transition">Services</button></li>
              <li><button onClick={() => handleNavigate('contact')} className="hover:text-white transition">Contact</button></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Connect</h3>
            <ul className="space-y-2 text-slate-400">
              <li><a href="https://github.com/RNDMJUNKLLC" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">GitHub</a></li>
              <li><a href="https://twitter.com/RNDMDevelopment" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Twitter</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
          <p>&copy; {new Date().getFullYear()} RNDM Development. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
