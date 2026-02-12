import React from 'react';
import SEOHead from '@components/SEOHead';

export const Services: React.FC = () => {
  return (
    <>
      <SEOHead
        title="Our Services | RNDM Development"
        description="Explore our web development services - custom solutions, design, and development."
        path="/services"
        keywords="web development, web design, custom solutions, services"
      />
      <div className="section container-max">
        <h1 className="text-4xl font-bold mb-8">Our Services</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          This page will showcase RNDM Development services.
        </p>
      </div>
    </>
  );
};

export default Services;
