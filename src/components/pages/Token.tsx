import React from 'react';
import SEOHead from '@components/SEOHead';

export const Token: React.FC = () => {
  return (
    <>
      <SEOHead
        title="$rndmdev Token - Support RNDM Development"
        description="Support RNDM Development by adding liquidity to $rndmdev token on Zora/Base network. Help us keep our services affordable!"
        path="/token"
        keywords="token, cryptocurrency, $rndmdev, Zora, Base network, support"
      />
      <div className="section container-max relative z-10">
        {/* Token Hero */}
        <section className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 text-gradient">
            $rndmdev Token
          </h1>
          <p className="text-xl text-slate-300 max-w-xl mx-auto mb-4">
            Support RNDM Development and help us keep our services affordable for everyone
          </p>
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-purple-500/50 bg-purple-500/10">
            <span className="font-bold text-purple-400">$rndmdev</span>
            <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300">
              Zora / Base
            </span>
          </div>
        </section>

        {/* Live Token Data */}
        <section className="py-8">
          <h2 className="text-2xl font-bold text-center text-purple-400 mb-6">
            Live Token Data
          </h2>
        </section>
      </div>

      {/* Charts - Full Width */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 gap-8 mb-12">
          {/* Price Chart */}
          <div className="card overflow-hidden">
            <h3 className="px-6 py-4 font-bold border-b border-white/10">
              <span className="mr-2">💹</span> Price Chart &amp; Recent Transactions
            </h3>
            <iframe
              title="Price Chart with Transactions"
              src="https://www.geckoterminal.com/base/pools/0x41c3662439f1c09512e1460e172c7f9e0c40bc09f79d668b11a41fc3428c3e23?embed=1&info=0&swaps=1&grayscale=0&light_chart=0&chart_type=price&resolution=5m"
              className="w-full h-[500px] border-0"
              allow="clipboard-write"
              allowFullScreen
            />
          </div>

          {/* Market Cap Chart */}
          <div className="card overflow-hidden">
            <h3 className="px-6 py-4 font-bold border-b border-white/10">
              <span className="mr-2">📈</span> Market Cap History
            </h3>
            <iframe
              title="Market Cap Chart"
              src="https://www.geckoterminal.com/base/pools/0x41c3662439f1c09512e1460e172c7f9e0c40bc09f79d668b11a41fc3428c3e23?embed=1&info=0&swaps=0&grayscale=0&light_chart=0&chart_type=market_cap&resolution=5m"
              className="w-full h-[500px] border-0"
              allow="clipboard-write"
              allowFullScreen
            />
          </div>
        </div>
      </div>

      <div className="section container-max relative z-10">
        {/* Why Support Us */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-center text-purple-400 mb-2">
            Why Support Us?
          </h2>
          <p className="text-center text-slate-400 max-w-xl mx-auto mb-8">
            By adding liquidity to $rndmdev, you directly help us maintain affordable services
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '💰',
                title: 'Keep Prices Low',
                desc: 'Your support helps us keep our web development services as affordable as possible for everyone.',
              },
              {
                icon: '🚀',
                title: 'Fund Growth',
                desc: 'Liquidity contributions help us invest in better tools, infrastructure, and expand our capabilities.',
              },
              {
                icon: '🤝',
                title: 'Community Driven',
                desc: 'Be part of our journey and help shape the future of RNDM Development alongside our team.',
              },
            ].map((card) => (
              <div key={card.title} className="card p-8 text-center hover:-translate-y-1 transition-transform">
                <div className="text-4xl mb-4">{card.icon}</div>
                <h3 className="text-lg font-bold text-purple-400 mb-3">{card.title}</h3>
                <p className="text-slate-300">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-8">
          <h2 className="text-2xl font-bold text-purple-400 mb-3">Ready to Support?</h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-6">
            Visit Zora to get $rndmdev tokens and add liquidity to help support our mission.
          </p>
          <a
            href="https://zora.co/rndmdev"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold text-lg hover:scale-105 transition-transform shadow-lg"
          >
            Get $rndmdev on Zora
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>

          {/* Disclaimer */}
          <div className="mt-12 max-w-3xl mx-auto p-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-sm text-slate-400">
            <strong className="text-yellow-400">⚠️ Disclaimer:</strong>{' '}
            Cryptocurrency investments carry risk. $rndmdev is a community support token and should not be considered a financial investment. Please do your own research and only contribute what you can afford. This is not financial advice.
          </div>
        </section>
      </div>
    </>
  );
};

export default Token;
