import React from 'react';

interface LogoProps {
  variant?: 'full' | 'mark' | 'horizontal-light' | 'horizontal-dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal-light',
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: { mark: 32, text: 'text-sm', sub: 'text-[9px]' },
    md: { mark: 42, text: 'text-base', sub: 'text-[10px]' },
    lg: { mark: 56, text: 'text-xl', sub: 'text-xs' },
    xl: { mark: 72, text: 'text-2xl', sub: 'text-sm' },
  };

  const dim = sizeMap[size].mark;

  // The circular Momentum mark
  const MarkSVG = (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-label="Momentum Transportation & Hauling Emblem"
    >
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E5B94E" />
          <stop offset="50%" stopColor="#C99A31" />
          <stop offset="100%" stopColor="#9C731A" />
        </linearGradient>
        <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0B2B5C" />
          <stop offset="100%" stopColor="#071E41" />
        </linearGradient>
      </defs>

      {/* Outer circular crest */}
      <circle cx="50" cy="50" r="47" fill="url(#navyGrad)" stroke="url(#goldGrad)" strokeWidth="3.5" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="#C99A31" strokeWidth="0.75" strokeDasharray="3 2" opacity="0.6" />

      {/* Dynamic Forward Momentum Wing / Chevron */}
      <path
        d="M26 68L26 34L50 56L74 34L74 68"
        stroke="#FFFFFF"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Interior Gold Ascending Chevron */}
      <path
        d="M34 68L50 49L66 68"
        stroke="url(#goldGrad)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Center Forward Arrow Apex */}
      <circle cx="50" cy="27" r="3.5" fill="url(#goldGrad)" />
    </svg>
  );

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {MarkSVG}
      </div>
    );
  }

  const isDarkBg = variant === 'horizontal-dark';

  return (
    <div className={`inline-flex items-center gap-3.5 group select-none ${className}`}>
      {MarkSVG}
      <div className="flex flex-col text-left">
        <span
          className={`font-extrabold tracking-tight font-display leading-none ${sizeMap[size].text} ${
            isDarkBg ? 'text-white' : 'text-[#071E41]'
          }`}
        >
          MOMENTUM
        </span>
        <span
          className={`font-semibold tracking-wider uppercase font-display mt-0.5 leading-none ${sizeMap[size].sub} ${
            isDarkBg ? 'text-[#C99A31]' : 'text-[#C99A31]'
          }`}
        >
          TRANSPORTATION &amp; HAULING LLC
        </span>
      </div>
    </div>
  );
};
