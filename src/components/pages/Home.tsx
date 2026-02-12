import React from 'react';
import { useDispatch } from 'react-redux';
import { useAuth } from '@/hooks';
import SEOHead from '@components/SEOHead';
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
    <>
      <SEOHead
        title="RNDM Development | Professional Web Solutions"
        description="Professional yet fun random website development by RNDM Development (RNDM DEVS). Contact us for your next web project!"
        path="/"
        keywords="web development, web design, project management, business solutions"
      />
      <div className="section container-max">
        {/* Hero Section */}
        <section className="py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">RNDM Development</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-2">
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
              onClick={() => dispatch(uiActions.setCurrentPage('account'))}
              className="btn-secondary"
            >
              Account Access
            </button>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="py-16 text-center">
          <h2 className="text-3xl font-bold text-accent-600 dark:text-accent-400 mb-8">
            What We Do
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="card p-8 text-left">
              <h3 className="text-xl font-bold text-accent-600 dark:text-accent-400 mb-3">
                🚀 Web Development
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Modern, responsive websites with cutting-edge technology and professional design.
              </p>
            </div>
            <div className="card p-8 text-left">
              <h3 className="text-xl font-bold text-accent-600 dark:text-accent-400 mb-3">
                ⚡ Performance Optimization
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Lightning-fast websites optimized for speed, SEO, and user experience.
              </p>
            </div>
            <div className="card p-8 text-left">
              <h3 className="text-xl font-bold text-accent-600 dark:text-accent-400 mb-3">
                🎨 Creative Design
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Unique, engaging designs that blend professionalism with creative flair.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
