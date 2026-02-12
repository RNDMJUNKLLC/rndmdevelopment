import React from 'react';
import SEOHead from '@components/SEOHead';

export const About: React.FC = () => {
  return (
    <>
      <SEOHead
        title="About RNDM Development"
        description="Learn about RNDM Development - our mission, team, and expertise in web development."
        path="/about"
        keywords="about us, web development company, team, expertise"
      />
      <div className="section container-max">
        <h1 className="text-4xl font-bold mb-8">About Us</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          This page will contain information about RNDM Development.
        </p>
      </div>
    </>
  );
};

export default About;
