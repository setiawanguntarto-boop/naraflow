import React from "react";

interface WaveBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export const WaveBackground = ({ className = "", children }: WaveBackgroundProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* SVG Wave Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg
          className="absolute bottom-0 w-full h-full"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradient matching Naraflow logo colors */}
            <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4A1A6B" />
              <stop offset="50%" stopColor="#6D2A9A" />
              <stop offset="100%" stopColor="#FFF7E6" />
            </linearGradient>
            
            <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5A1F7D" />
              <stop offset="50%" stopColor="#7D3AB5" />
              <stop offset="100%" stopColor="#F5E6D3" />
            </linearGradient>
            
            <linearGradient id="wave-gradient-3" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3E165A" />
              <stop offset="50%" stopColor="#6D2A9A" />
              <stop offset="100%" stopColor="#E6D4B8" />
            </linearGradient>
          </defs>

          {/* Multiple wave layers for depth */}
          {/* Wave Layer 1 - Back layer, darkest */}
          <path
            d="M0,160 L0,320 L1440,320 L1440,260 C1330,240 1220,200 1110,180 C1000,160 890,160 780,170 C670,180 560,200 450,210 C340,220 230,220 120,200 C80,190 60,185 40,180 L0,160 Z"
            fill="url(#wave-gradient-1)"
            opacity="0.15"
          />

          {/* Wave Layer 2 - Middle layer */}
          <path
            d="M0,180 L0,320 L1440,320 L1440,280 C1320,260 1200,220 1080,200 C960,180 840,180 720,190 C600,200 480,220 360,230 C240,240 120,240 60,230 L0,220 Z"
            fill="url(#wave-gradient-2)"
            opacity="0.12"
          />

          {/* Wave Layer 3 - Front layer, lightest */}
          <path
            d="M0,200 L0,320 L1440,320 L1440,300 C1310,290 1180,260 1050,240 C920,220 790,220 660,230 C530,240 400,260 270,270 C140,280 70,275 35,270 L0,260 Z"
            fill="url(#wave-gradient-3)"
            opacity="0.1"
          />
        </svg>
      </div>

      {/* Content */}
      {children}
    </div>
  );
};

