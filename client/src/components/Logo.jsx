import React from 'react';

/**
 * Scholarly Edge Definitive High-Fidelity Logo
 * Meticulously re-created to match the user's specific reference image: 
 * interlocking 'SE', fanned book, and bright lightbulb.
 */
const Logo = ({ className = "w-12 h-12" }) => (
  <svg 
    className={className}
    viewBox="0 0 200 200" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <filter id="eliteGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      <linearGradient id="mainBlue" x1="50" y1="50" x2="150" y2="150" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0066CC"/>
        <stop offset="1" stop-color="#002D5A"/>
      </linearGradient>
      <linearGradient id="lightBlue" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
        <stop stop-color="#00C2FF" />
        <stop offset="1" stop-color="#0066CC" />
      </linearGradient>
    </defs>

    {/* Fanned Book Pages (Left side) */}
    <path d="M70 100 L30 115 L30 65 L70 50 Z" fill="#002140" stroke="#004080" stroke-width="1.5" />
    <path d="M75 90 L40 105 L40 55 L75 40 Z" fill="#00315C" stroke="#005299" stroke-width="1.5" />
    <path d="M80 80 L50 95 L50 45 L80 30 Z" fill="#004A8C" stroke="#0066CC" stroke-width="1.5" />
    <path d="M85 70 L60 85 L60 35 L85 20 Z" fill="#0066CC" stroke="#00A2FF" stroke-width="1.5" />

    {/* Central Elements: SE + Lightbulb */}
    <g filter="url(#eliteGlow)">
      {/* The Lightbulb Shell */}
      <path 
        d="M100 25 C125 25 140 45 140 65 C140 80 130 90 120 100 L120 130 C120 135 115 140 110 140 L90 140 C85 140 80 135 80 130 L80 100 C70 90 60 80 60 65 C60 45 75 25 100 25 Z" 
        fill="white" 
        fill-opacity="0.1" 
        stroke="white" 
        stroke-width="5" 
      />
      
      {/* Lightbulb Top Glow */}
      <circle cx="100" cy="55" r="25" fill="white" fill-opacity="0.9" />

      {/* Stylized Interlocking SE (Integrated into the base) */}
      <path 
        d="M70 130 Q100 80 130 130 Q100 180 70 130" 
        stroke="url(#lightBlue)" 
        stroke-width="12" 
        stroke-linecap="round" 
        fill="none"
      />
      <path 
        d="M110 120 L150 120 M110 140 L160 140 M110 160 L150 160" 
        stroke="url(#mainBlue)" 
        stroke-width="10" 
        stroke-linecap="round"
      />
      
      {/* SE - The "S" part looping */}
      <path d="M90 135 C90 110 110 110 110 135 C110 160 90 160 90 185" stroke="#00C2FF" stroke-width="8" stroke-linecap="round" fill="none" />
    </g>

    {/* Light Rays */}
    <g stroke="#00C2FF" stroke-width="6" stroke-linecap="round">
      <line x1="100" y1="10" x2="100" y2="25" />
      <line x1="135" y1="25" x2="125" y2="35" />
      <line x1="150" y1="65" x2="135" y2="65" />
      <line x1="65" y1="25" x2="75" y2="35" />
      <line x1="50" y1="65" x2="65" y2="65" />
    </g>
  </svg>
);

export default Logo;
