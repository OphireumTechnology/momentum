import React from 'react';
import { LOGOS } from '../../config/assets';

interface LogoProps {
  variant?: 'full' | 'mark' | 'horizontal-light' | 'horizontal-dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal-light',
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const sizeMap = {
    sm: { img: 'w-9 h-9', text: 'text-sm', sub: 'text-[9px]', gap: 'gap-2.5' },
    md: { img: 'w-11 h-11', text: 'text-base sm:text-lg', sub: 'text-[10px] sm:text-[11px]', gap: 'gap-3' },
    lg: { img: 'w-14 h-14', text: 'text-xl sm:text-2xl', sub: 'text-xs', gap: 'gap-3.5' },
    xl: { img: 'w-20 h-20 sm:w-24 sm:h-24', text: 'text-2xl sm:text-3xl', sub: 'text-xs sm:text-sm', gap: 'gap-4' },
  };

  const currentSize = sizeMap[size];
  const isDarkBg = variant === 'horizontal-dark';
  const logoSrc = size === 'sm' || size === 'md' ? LOGOS.header : LOGOS.transparent;

  // Exact circular emblem image element
  const EmblemImg = (
    <img
      src={logoSrc}
      alt="Momentum Transportation & Hauling LLC Official Emblem"
      className={`${currentSize.img} object-contain shrink-0 transition-transform duration-300 group-hover:scale-105`}
      loading="eager"
      decoding="async"
    />
  );

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        {EmblemImg}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center ${currentSize.gap} group select-none ${className}`}>
      {EmblemImg}
      <div className="flex flex-col text-left justify-center">
        <span
          className={`font-extrabold tracking-tight font-display leading-none ${currentSize.text} ${
            isDarkBg ? 'text-white' : 'text-[#071E41]'
          }`}
        >
          MOMENTUM
        </span>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-2.5 h-[1.5px] bg-[#C99A31] shrink-0" />
          <span
            className={`font-bold tracking-wider uppercase font-display leading-none ${currentSize.sub} ${
              isDarkBg ? 'text-slate-200' : 'text-[#071E41]'
            }`}
          >
            TRANSPORTATION &amp; HAULING LLC
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] italic font-medium text-[#C99A31] mt-1 tracking-normal font-display">
            Moving Business Forward.
          </span>
        )}
      </div>
    </div>
  );
};
