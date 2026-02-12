import React from 'react';
import SEOHead from '@components/SEOHead';

export const Token: React.FC = () => {
  return (
    <>
      <SEOHead
        title="$rndmdev Token | RNDM Development"
        description="Learn about the $rndmdev token and its features."
        path="/token"
        keywords="token, cryptocurrency, $rndmdev"
      />
      <div className="section container-max">
        <h1 className="text-4xl font-bold mb-8">$rndmdev Token</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          This page will contain information about the $rndmdev token.
        </p>
      </div>
    </>
  );
};

export default Token;
