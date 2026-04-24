import React, { useState } from 'react';
import SEOHead from '@components/SEOHead';

type ServiceTab = 'websites' | 'mobile' | 'software';

interface ServiceTier {
  title: string;
  subtitle: string;
  idealFor: string;
  price: string;
  timeline: string;
  features: string[];
  featured?: boolean;
}

const serviceTiers: Record<ServiceTab, { heading: string; description: string; tiers: ServiceTier[] }> = {
  websites: {
    heading: '💻 Website Development Solutions',
    description: 'From simple landing pages to complex web applications',
    tiers: [
      {
        title: '🚀 Starter Website',
        subtitle: 'Perfect for Getting Online Fast',
        idealFor: 'Personal portfolios, small projects',
        price: 'FREE initial setup',
        timeline: '1-2 business days',
        features: [
          'Professional landing page',
          'Essential pages: Home, About, Contact',
          'Mobile-responsive design',
          'Basic SEO optimization',
        ],
      },
      {
        title: '💼 Professional Website',
        subtitle: 'Built for Business Growth',
        idealFor: 'Small businesses, service providers',
        price: 'Starting at $35',
        timeline: '2-4 business days',
        features: [
          'Multi-page professional website',
          'Custom contact forms',
          'Enhanced SEO and performance',
          'Social media integration',
          'Basic analytics setup',
        ],
        featured: true,
      },
      {
        title: '🏢 Enterprise Website',
        subtitle: 'Complete Digital Solutions',
        idealFor: 'Established businesses, e-commerce',
        price: 'Starting at $100',
        timeline: 'Varies by complexity',
        features: [
          'Fully custom design & functionality',
          'Advanced features (e-commerce, user accounts)',
          'Premium performance optimization',
          'Advanced analytics and reporting',
          'Priority support',
        ],
      },
    ],
  },
  mobile: {
    heading: '📱 Mobile Application Development',
    description: 'Native Android apps that deliver exceptional user experiences',
    tiers: [
      {
        title: '🚀 Basic Mobile App',
        subtitle: 'Essential Mobile Presence',
        idealFor: 'Simple apps, MVP launches',
        price: 'Starting at $60',
        timeline: '1-2 weeks',
        features: [
          '3-5 core screens',
          'Basic user interface',
          'Local data storage',
          'Play Store submission',
          'Basic analytics',
        ],
      },
      {
        title: '💼 Professional Mobile App',
        subtitle: 'Feature-Rich Mobile Solutions',
        idealFor: 'Business apps, service platforms',
        price: 'Starting at $120',
        timeline: '2-4 weeks',
        features: [
          '10+ custom screens',
          'User authentication',
          'API integrations',
          'Push notifications',
          'Advanced UI/UX design',
          'Backend database',
        ],
        featured: true,
      },
      {
        title: '🏢 Enterprise Mobile App',
        subtitle: 'Complex Mobile Solutions',
        idealFor: 'Large businesses, complex workflows',
        price: 'Starting at $200+',
        timeline: '4-8 weeks',
        features: [
          'Unlimited screens & features',
          'Advanced security features',
          'Real-time data sync',
          'Multi-user roles & permissions',
          'Advanced analytics & reporting',
          'Priority support & maintenance',
        ],
      },
    ],
  },
  software: {
    heading: '⚙️ Custom Software Development',
    description: 'Tailored software solutions for your unique business needs',
    tiers: [
      {
        title: '🚀 Basic Software Tool',
        subtitle: 'Simple Automation & Tools',
        idealFor: 'Process automation, simple tools',
        price: 'Starting at $80',
        timeline: '1-3 weeks',
        features: [
          'Simple automation scripts',
          'Basic user interface',
          'File processing capabilities',
          'Basic reporting features',
          'Installation & setup guide',
        ],
      },
      {
        title: '💼 Business Software',
        subtitle: 'Complete Business Solutions',
        idealFor: 'Business management, workflows',
        price: 'Starting at $160',
        timeline: '3-6 weeks',
        features: [
          'Multi-user application',
          'Database management',
          'Advanced reporting & analytics',
          'API integrations',
          'User roles & permissions',
          'Training & documentation',
        ],
        featured: true,
      },
      {
        title: '🏢 Enterprise Software',
        subtitle: 'Large-Scale Custom Solutions',
        idealFor: 'Enterprise systems, complex workflows',
        price: 'Starting at $320+',
        timeline: '6-12 weeks',
        features: [
          'Fully custom enterprise solution',
          'Advanced security & compliance',
          'Scalable cloud architecture',
          'Advanced integrations',
          'Comprehensive testing',
          'Ongoing maintenance & support',
        ],
      },
    ],
  },
};

export const Services: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ServiceTab>('websites');

  const currentService = serviceTiers[activeTab];

  return (
    <>
      <SEOHead
        title="Services - RNDM Development"
        description="RNDM Development services: custom websites, mobile apps, and complete digital solutions. Transparent pricing from FREE starter sites to enterprise solutions."
        path="/services"
        keywords="web development, mobile apps, software development, custom solutions, services, pricing"
      />
      <div className="section container-max relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl font-bold font-display mb-2">🌟 RNDM Development Services</h1>
          <p className="text-lg text-slate-400 italic mb-6">
            &quot;Random ideas become remarkable solutions&quot;
          </p>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-3">🚀 We Build Whatever You Need</h2>
            <p className="text-slate-300">
              At RNDM, we don&apos;t limit your creativity. Got an idea? We&apos;ll build it. Need something custom? We&apos;ll create it. Want something that doesn&apos;t exist yet? We&apos;ll make it happen.{' '}
              <strong>We&apos;ll build whatever you ask for</strong> — as long as it&apos;s legal, we&apos;re up for the challenge. No project is too big, too small, or too &quot;random&quot; for our team.
            </p>
          </div>
        </div>

        {/* Why Choose RNDM */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-6">✨ Why Choose RNDM?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {[
              { icon: '🎯', title: 'Tailored Solutions', desc: 'Every project is unique, just like your business' },
              { icon: '💡', title: 'Innovation First', desc: 'We love bringing creative ideas to life' },
              { icon: '🤝', title: 'Partnership Approach', desc: "We're not just developers, we're your digital partners" },
              { icon: '⚡', title: 'Fast & Reliable', desc: 'Quality work delivered on time, every time' },
            ].map((item) => (
              <div key={item.title} className="card p-6 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-bold mb-2">{item.title}</h4>
                <p className="text-sm text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Package Includes */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-center mb-6">📦 What Every Package Includes</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 stagger-children">
            {[
              'Complete Customization',
              'Lifetime Support',
              'Mobile-First Design',
              'Professional Quality',
              'Security Included',
              'Fast Performance',
            ].map((item) => (
              <div key={item} className="card p-4 text-center text-sm font-medium">
                ✅ {item}
              </div>
            ))}
          </div>
        </section>

        {/* Service Tabs */}
        <section className="mb-12">
          <div className="flex justify-center gap-2 mb-8 border-b border-white/10">
            {([
              { key: 'websites' as ServiceTab, label: '💻 Websites' },
              { key: 'mobile' as ServiceTab, label: '📱 Mobile Apps' },
              { key: 'software' as ServiceTab, label: '⚙️ Software' },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">{currentService.heading}</h2>
            <p className="text-slate-300">{currentService.description}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger-children">
            {currentService.tiers.map((tier) => (
              <div
                key={tier.title}
                className={`card p-8 flex flex-col ${
                  tier.featured ? 'border-2 border-purple-500/50 relative' : ''
                }`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 text-xs font-bold rounded-full bg-purple-500 text-white">
                    POPULAR
                  </span>
                )}
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-1">{tier.title}</h3>
                  <p className="text-sm text-slate-400">{tier.subtitle}</p>
                </div>
                <p className="text-sm text-slate-300 mb-2">
                  <strong>Ideal for:</strong> {tier.idealFor}
                </p>
                <p className="text-2xl font-bold text-purple-400 mb-1">{tier.price}</p>
                <p className="text-sm text-slate-400 mb-4">Timeline: {tier.timeline}</p>
                <div className="flex-1">
                  <h4 className="font-bold mb-2">What You Get:</h4>
                  <ul className="space-y-2">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href="/contact/"
                  className={`mt-6 w-full inline-block text-center ${tier.featured ? 'btn-primary' : 'btn-secondary'}`}
                >
                  Get Started
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">🎯 Ready to Get Started?</h2>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-8">
            Every great project starts with a conversation. We&apos;d love to hear about your ideas, challenges, and goals.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/contact/"
              className="btn-primary inline-block"
            >
              Start Your Project
            </a>
            <a
              href="/about/"
              className="btn-secondary inline-block"
            >
              Learn More About Us
            </a>
          </div>
        </section>
      </div>
    </>
  );
};

export default Services;
