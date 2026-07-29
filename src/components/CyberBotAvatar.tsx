'use client';

import React from 'react';

interface CyberBotAvatarProps {
  size?: 'sm' | 'md' | 'lg';
  isThinking?: boolean;
  state?: 'idle' | 'active' | 'thinking';
}

export const CyberBotAvatar: React.FC<CyberBotAvatarProps> = ({ size = 'md', isThinking = false, state = 'idle' }) => {
  const dimensionClass = size === 'sm' ? 'h-7 w-7' : size === 'lg' ? 'h-14 w-14' : 'h-10 w-10';
  
  // Backwards compatibility for isThinking prop
  const currentState = isThinking ? 'thinking' : state;

  return (
    <div className={`relative flex items-center justify-center shrink-0 rounded-full overflow-hidden ${dimensionClass}`}>
      {/* Main Circular Light Base Container */}
      <div className="relative h-full w-full rounded-full bg-zinc-200 p-0.5 border border-zinc-300 shadow-sm flex items-center justify-center overflow-hidden">
        {/* SVG ROG-Inspired Cyber Bot Mascot on Light Background */}
        <svg viewBox="0 0 100 100" className="w-full h-full object-contain">
          <defs>
            <linearGradient id="helmetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f4f4f5" />
              <stop offset="100%" stopColor="#e4e4e7" />
            </linearGradient>

            <linearGradient id="earGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0284c7" />
            </linearGradient>
          </defs>

          {/* Bright Light Field (Nền sáng) */}
          <circle cx="50" cy="50" r="48" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="2" />

          {/* Cyber Ears / Radar Speakers */}
          <g>
            {/* Left Ear Antenna */}
            <path d="M 20 32 L 28 20 L 34 26 L 26 38 Z" fill="url(#helmetGrad)" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="22" y="24" width="7" height="9" rx="1.5" fill="url(#earGrad)" />
            {/* Right Ear Antenna */}
            <path d="M 80 32 L 72 20 L 66 26 L 74 38 Z" fill="url(#helmetGrad)" stroke="#38bdf8" strokeWidth="1.5" />
            <rect x="71" y="24" width="7" height="9" rx="1.5" fill="url(#earGrad)" />
          </g>

          {/* Blue Hoodie Collar */}
          <path d="M 28 76 Q 50 94 72 76 L 68 92 Q 50 98 32 92 Z" fill="#0284c7" />

          {/* Outer Cyber Helmet Structure */}
          <rect x="25" y="32" width="50" height="46" rx="18" fill="url(#helmetGrad)" stroke="#cbd5e1" strokeWidth="2.5" />

          {/* Helmet Top Plate Notch */}
          <path d="M 40 32 L 50 26 L 60 32 Z" fill="#e2e8f0" stroke="#38bdf8" strokeWidth="1" />

          {/* Digital Screen Visor (Face) */}
          <rect x="30" y="39" width="40" height="30" rx="12" fill="#0f172a" stroke="#38bdf8" strokeWidth="1.5" />

          {/* Visor Scanlines Effect */}
          <line x1="30" y1="46" x2="70" y2="46" stroke="#0284c7" strokeWidth="0.5" strokeOpacity="0.4" />
          <line x1="30" y1="54" x2="70" y2="54" stroke="#0284c7" strokeWidth="0.5" strokeOpacity="0.4" />

          {/* Animated LED Robot Eyes */}
          {currentState === 'thinking' && (
            <g className="animate-pulse">
              <circle cx="41" cy="52" r="3.5" fill="#38bdf8" />
              <circle cx="59" cy="52" r="3.5" fill="#38bdf8" />
              <line x1="44" y1="60" x2="56" y2="60" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
            </g>
          )}
          {currentState === 'active' && (
            <g>
              <circle cx="41" cy="52" r="3.5" fill="#38bdf8" />
              <circle cx="59" cy="52" r="3.5" fill="#38bdf8" />
              <path d="M 44 60 Q 50 65 56 60" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}
          {currentState === 'idle' && (
            <g>
              <path d="M 37 54 L 42 49 L 47 54" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 53 54 L 58 49 L 63 54" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M 44 60 Q 50 65 56 60" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {/* Cheek Glow Marks */}
          <circle cx="34" cy="58" r="1.5" fill="#38bdf8" opacity="0.8" />
          <circle cx="66" cy="58" r="1.5" fill="#38bdf8" opacity="0.8" />
        </svg>
      </div>
    </div>
  );
};
