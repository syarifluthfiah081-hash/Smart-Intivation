import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number | string;
}

export const AppLogo: React.FC<AppLogoProps> = ({ className = 'w-full h-full object-contain', size }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      width={size || '100%'} 
      height={size || '100%'}
      className={className}
    >
      <defs>
        {/* Background Gradients */}
        <linearGradient id="appBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="50%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>
        
        <linearGradient id="appBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        {/* Letter & Shield Gradients */}
        <linearGradient id="appShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>

        <linearGradient id="appLetterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>

        <linearGradient id="appLetterFoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>

        <linearGradient id="appGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        {/* Glow & Shadow Filters */}
        <filter id="appGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="appSubtleShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.45" />
        </filter>
      </defs>

      {/* Base Rounded Squircle */}
      <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#appBgGrad)" stroke="url(#appBorderGrad)" strokeWidth="6" filter="url(#appSubtleShadow)" />

      {/* Cyber/Smart Grid Accents */}
      <g opacity="0.15" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round">
        <circle cx="256" cy="256" r="180" fill="none" strokeDasharray="12 8" />
        <circle cx="256" cy="256" r="140" fill="none" opacity="0.6" />
        <line x1="256" y1="40" x2="256" y2="70" />
        <line x1="256" y1="442" x2="256" y2="472" />
        <line x1="40" y1="256" x2="70" y2="256" />
        <line x1="442" y1="256" x2="472" y2="256" />
      </g>

      {/* Glowing Aura */}
      <circle cx="256" cy="250" r="120" fill="#3b82f6" opacity="0.25" filter="url(#appGlow)" />

      {/* Shield Base Contour */}
      <path 
        d="M 256 100 C 340 100, 390 140, 390 220 C 390 320, 290 380, 256 405 C 222 380, 122 320, 122 220 C 122 140, 172 100, 256 100 Z" 
        fill="url(#appShieldGrad)" 
        stroke="url(#appLetterGrad)" 
        strokeWidth="5" 
        filter="url(#appSubtleShadow)" 
      />

      {/* Letter / Smart Document Core Shape */}
      <path 
        d="M 160 175 L 352 175 L 352 325 C 352 335, 344 345, 332 345 L 180 345 C 168 345, 160 335, 160 325 Z" 
        fill="#1e293b" 
        stroke="#475569" 
        strokeWidth="2" 
      />

      {/* Document Lines */}
      <rect x="195" y="210" width="122" height="6" rx="3" fill="#64748b" opacity="0.8" />
      <rect x="195" y="230" width="85" height="6" rx="3" fill="#64748b" opacity="0.8" />
      <rect x="195" y="250" width="105" height="6" rx="3" fill="#64748b" opacity="0.8" />

      {/* Envelope Flaps */}
      <path 
        d="M 152 200 L 256 280 L 360 200 L 360 325 C 360 345, 345 355, 330 355 L 182 355 C 165 355, 152 345, 152 325 Z" 
        fill="url(#appLetterGrad)" 
        opacity="0.95" 
      />

      <path 
        d="M 152 330 L 225 260 L 256 285 L 287 260 L 360 330 C 350 352, 335 355, 325 355 L 187 355 C 175 355, 162 352, 152 330 Z" 
        fill="url(#appLetterFoldGrad)" 
      />

      {/* Quill Stylus */}
      <path 
        d="M 256 125 L 282 195 L 266 195 L 262 265 L 256 278 L 250 265 L 246 195 L 230 195 Z" 
        fill="url(#appGoldGrad)" 
        filter="url(#appSubtleShadow)" 
      />

      <line x1="256" y1="135" x2="256" y2="235" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="256" cy="235" r="3.5" fill="#78350f" />

      {/* Academic Cap Diamond */}
      <path d="M 256 75 L 295 95 L 256 115 L 217 95 Z" fill="url(#appGoldGrad)" filter="url(#appGlow)" />
      <circle cx="302" cy="112" r="4" fill="#fef08a" />
      <path d="M 295 95 Q 302 102 302 112" stroke="#fef08a" strokeWidth="2" fill="none" />

      {/* Bottom Sparkles */}
      <g fill="#38bdf8" filter="url(#appGlow)">
        <circle cx="256" cy="385" r="4" />
        <circle cx="236" cy="380" r="3" opacity="0.8" />
        <circle cx="276" cy="380" r="3" opacity="0.8" />
      </g>
    </svg>
  );
};
