import React from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/hooks';
import AdminDashboard from '@components/admin/AdminDashboard';
import { uiActions } from '@store/slices/uiSlice';

export const Home: React.FC = () => {
  const dispatch = useDispatch();
  const { isLoggedIn } = useAuth();

  // Show admin dashboard if logged in
  if (isLoggedIn) {
    return <AdminDashboard />;
  }

  return (
    <div className="section container-max">
      <section className="py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">RNDM Development</h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
          Professional yet fun random website development
        </p>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
          Where creativity meets code and chaos creates brilliance
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => dispatch(uiActions.setCurrentPage('contact'))}
            className="btn-primary"
          >
            Get In Touch
          </button>
          <button
            onClick={() => dispatch(uiActions.setCurrentPage('services'))}
            className="btn-secondary"
          >
            View Services
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
