import React from 'react';
import { useDispatch } from 'react-redux';
import SEOHead from '@components/SEOHead';
import { uiActions } from '@store/slices/uiSlice';

export const About: React.FC = () => {
  const dispatch = useDispatch();

  return (
    <>
      <SEOHead
        title="About RNDM Development - Our Story & Projects"
        description="Learn about RNDM Development - where creativity meets code. Explore our team, values, and featured projects."
        path="/about"
        keywords="about us, web development company, team, expertise, projects"
      />
      <div className="section container-max">
        <h1 className="text-4xl font-bold mb-8 text-center">About RNDM Development</h1>

        {/* Hero Intro */}
        <section className="text-center mb-16">
          <h2 className="text-3xl font-bold text-accent-600 dark:text-accent-400 mb-4">
            Where Creativity Meets Code
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            We&apos;re not your average development team. We&apos;re the creative chaos that turns wild ideas into digital reality.
          </p>
        </section>

        {/* Mission / Approach / Style Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold mb-3">Our Mission</h3>
            <p className="text-slate-600 dark:text-slate-300">
              To bridge the gap between professional web development and creative innovation. We believe the best websites are born from organized chaos and methodical madness.
            </p>
          </div>
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-3">Our Approach</h3>
            <p className="text-slate-600 dark:text-slate-300">
              We combine cutting-edge technology with unconventional thinking. Every project gets the perfect blend of technical expertise and creative flair.
            </p>
          </div>
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-bold mb-3">Our Style</h3>
            <p className="text-slate-600 dark:text-slate-300">
              Professional yet playful, serious yet fun. We create websites that perform flawlessly while making users smile. Because why choose between function and personality?
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">The RNDM Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">👨‍💻</div>
              <h4 className="text-xl font-bold mb-1">William</h4>
              <p className="text-sm text-accent-600 dark:text-accent-400 font-medium mb-3">
                Lead Developer &amp; Chaos Coordinator
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Full-stack developer with a passion for turning coffee into code and ideas into reality. Specializes in making the impossible look easy.
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">🤖</div>
              <h4 className="text-xl font-bold mb-1">AI Assistant</h4>
              <p className="text-sm text-accent-600 dark:text-accent-400 font-medium mb-3">
                Code Optimization &amp; Quality Assurance
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Our digital team member that never sleeps, ensuring every line of code is optimized and every user experience is smooth.
              </p>
            </div>
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">☕</div>
              <h4 className="text-xl font-bold mb-1">Coffee</h4>
              <p className="text-sm text-accent-600 dark:text-accent-400 font-medium mb-3">
                Motivation &amp; Energy Catalyst
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                The unofficial third team member. Without coffee, there would be no RNDM Development. Essential for all late-night coding sessions.
              </p>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-2">🚀 Our Projects</h2>
          <p className="text-center text-slate-500 dark:text-slate-400 italic mb-8">
            &quot;Showcasing our random innovations&quot;
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* RNDM Development */}
            <div className="card p-8 border-2 border-accent-600 dark:border-accent-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🌐</span> RNDM Development
                </h3>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  Live
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Professional yet fun web development agency specializing in custom websites, mobile apps, and complete digital solutions. Built with modern technologies featuring multi-page architecture, Firebase authentication, Discord webhook integration, and dynamic project management system.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Vite', 'TypeScript', 'React', 'Firebase', 'Discord API'].map((tech) => (
                  <span key={tech} className="px-3 py-1 text-xs rounded-full bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => dispatch(uiActions.setCurrentPage('home'))}
                  className="btn-primary text-sm"
                >
                  View Site
                </button>
                <button
                  onClick={() => dispatch(uiActions.setCurrentPage('contact'))}
                  className="btn-secondary text-sm"
                >
                  Start Your Project
                </button>
              </div>
            </div>

            {/* Dia-Hub */}
            <div className="card p-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🏥</span> Dia-Hub
                </h3>
                <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  Live
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Comprehensive diabetes management platform connecting patients with healthcare resources. Features smart supply tracking, automated reorder reminders, insurance coordination, and direct connections to medical suppliers for seamless diabetes care management.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                {['Web Platform', 'Healthcare Integration', 'Supply Management', 'Patient Portal'].map((tech) => (
                  <span key={tech} className="px-3 py-1 text-xs rounded-full bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300">
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <a
                  href="https://dia-hub.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary text-sm inline-block"
                >
                  Visit Dia-Hub
                </a>
                <button
                  onClick={() => dispatch(uiActions.setCurrentPage('contact'))}
                  className="btn-secondary text-sm"
                >
                  Request Similar
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">What We Believe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: '💡', title: 'Innovation First', desc: "We don't just follow trends, we create them. Every project pushes boundaries." },
              { icon: '🎯', title: 'Quality Always', desc: "Perfect code, flawless design, exceptional performance. We don't compromise." },
              { icon: '🤝', title: 'Client Partnership', desc: "Your success is our success. We're not just developers, we're your digital allies." },
              { icon: '🌟', title: 'Fun in Function', desc: 'Great websites should be a joy to use and a pleasure to build.' },
            ].map((value) => (
              <div key={value.title} className="flex items-start gap-4 p-6 card">
                <span className="text-3xl">{value.icon}</span>
                <div>
                  <h4 className="text-lg font-bold mb-1">{value.title}</h4>
                  <p className="text-slate-600 dark:text-slate-300">{value.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Something Amazing?</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
            Let&apos;s turn your vision into digital reality. Whether it&apos;s a simple website or a complex web application, we&apos;re here to make it happen.
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => dispatch(uiActions.setCurrentPage('contact'))}
              className="btn-primary"
            >
              Start Your Project
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
    </>
  );
};

export default About;
