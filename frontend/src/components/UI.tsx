import React from 'react';

export const Card = ({ children, className = "" }) => (
  <div className={`glass p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${className}`}>
    {children}
  </div>
);

export const ProviderCard = ({ provider }) => (
  <Card className="flex flex-col gap-4">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00D4FF] to-[#00FF9C] flex items-center justify-center text-black font-bold text-xl">
        {provider.name?.[0] || 'P'}
      </div>
      <div>
        <h3 className="text-white font-semibold text-lg">{provider.name}</h3>
        <p className="text-gray-400 text-sm">Win Rate: {provider.winRate}%</p>
      </div>
    </div>
    <div className="flex justify-between items-center mt-2">
      <div className="text-[#00FF9C] font-mono">Score: {provider.score}</div>
      <button className="bg-[#00D4FF] text-black px-4 py-2 rounded-xl font-bold hover:glow-border transition-all">
        Subscribe
      </button>
    </div>
  </Card>
);

export const SponsorSlider = ({ sponsors }) => (
  <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
    {sponsors.map((s) => (
      <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
        <div className="glass p-2 rounded-2xl hover:glow-border transition-all">
          <img src={s.logo} alt={s.name} className="h-16 w-32 object-contain rounded-xl grayscale hover:grayscale-0 transition-all" />
        </div>
      </a>
    ))}
  </div>
);
