import React from 'react';
import { useDispatch } from 'react-redux';
import SEOHead from '@components/SEOHead';
import { uiActions } from '@store/slices/uiSlice';

export const Home: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <>
      <SEOHead
        title="RNDM Development | Professional Web Solutions"
        description="Professional yet fun random website development by RNDM Development (RNDM DEVS). Contact us for your next web project!"
        path="/"
        keywords="web development, web design, project management, business solutions"
      />
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="section container-max text-center min-h-[70vh] flex flex-col justify-center">
          <div className="animate-fade-in-up">
            <p className="text-sm font-semibold tracking-[0.3em] uppercase text-purple-400 mb-4">
              Creative Digital Agency
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-black mb-6 tracking-tight">
              <span className="text-shimmer">RNDM</span>{' '}
              <span className="text-white">Development</span>
            </h1>
            <p className="text-xl text-slate-300 mb-2 max-w-2xl mx-auto">
              Professional yet fun random website development
            </p>
            <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto">
              Where creativity meets code and chaos creates brilliance
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => dispatch(uiActions.setCurrentPage('contact'))}
                className="btn-primary text-lg px-8 py-3"
              >
                Get In Touch
              </button>
              <button
                onClick={() => dispatch(uiActions.setCurrentPage('services'))}
                className="btn-secondary text-lg px-8 py-3"
              >
                Our Services
              </button>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="divider-glow mx-auto max-w-4xl" />

        {/* What We Do Section */}
        <section className="section container-max text-center">
          <h2 className="font-display text-3xl font-bold text-gradient mb-4">
            What We Do
          </h2>
          <p className="text-slate-400 mb-12 max-w-xl mx-auto">
            Transforming ideas into digital experiences
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
            <div className="card p-8 text-left group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🚀</div>
              <h3 className="text-xl font-bold text-purple-300 mb-3">
                Web Development
              </h3>
              <p className="text-slate-400">
                Modern, responsive websites with cutting-edge technology and professional design.
              </p>
            </div>
            <div className="card p-8 text-left group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">⚡</div>
              <h3 className="text-xl font-bold text-purple-300 mb-3">
                Performance Optimization
              </h3>
              <p className="text-slate-400">
                Lightning-fast websites optimized for speed, SEO, and user experience.
              </p>
            </div>
            <div className="card p-8 text-left group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🎨</div>
              <h3 className="text-xl font-bold text-purple-300 mb-3">
                Creative Design
              </h3>
              <p className="text-slate-400">
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
