import React from 'react';
import { LOGOS } from '../../config/assets';

interface LogoProps {
  variant?: 'full' | 'mark' | 'horizontal-light' | 'horizontal-dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showTagline?: boolean;
  compactOnMobile?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal-light',
  className = '',
  size = 'md',
  showTagline = false,
  compactOnMobile = false,
}) => {
  const sizeMap = {
    sm: { img: 'w-9 h-9 sm:w-10 sm:h-10', text: 'text-sm font-extrabold', sub: 'text-[9px] font-bold', gap: 'gap-2 sm:gap-2.5' },
    md: {
      img: compactOnMobile ? 'w-9 h-9 sm:w-12 sm:h-12 md:w-14 md:h-14' : 'w-11 h-11 md:w-14 md:h-14',
      text: compactOnMobile ? 'text-sm sm:text-lg md:text-xl font-extrabold' : 'text-base sm:text-lg md:text-xl font-extrabold',
      sub: compactOnMobile ? 'text-[9px] sm:text-[11px] md:text-xs font-bold' : 'text-[10px] sm:text-[11px] md:text-xs font-bold',
      gap: compactOnMobile ? 'gap-2 sm:gap-3.5' : 'gap-2.5 sm:gap-3.5',
    },
    lg: { img: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16', text: 'text-lg sm:text-2xl font-extrabold', sub: 'text-[10px] sm:text-xs font-bold', gap: 'gap-3 sm:gap-3.5' },
    xl: { img: 'w-14 h-14 sm:w-20 sm:h-20', text: 'text-xl sm:text-3xl font-extrabold', sub: 'text-[11px] sm:text-sm font-bold', gap: 'gap-3 sm:gap-4' },
    hero: { img: 'w-14 h-14 sm:w-20 sm:h-20', text: 'text-xl sm:text-2xl md:text-3xl font-extrabold', sub: 'text-[10px] sm:text-xs md:text-sm font-bold', gap: 'gap-3 sm:gap-4' },
  };

  const currentSize = sizeMap[size];
  const isDarkBg = variant === 'horizontal-dark';
  const logoSrc = LOGOS.original;

  const EmblemImg = (
    <img
      src={logoSrc}
      alt="Momentum Transportation & Hauling LLC Official Emblem"
      width={size === 'hero' ? 80 : size === 'md' ? 56 : 48}
      height={size === 'hero' ? 80 : size === 'md' ? 56 : 48}
      className={`${currentSize.img} object-contain shrink-0 aspect-square select-none`}
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
    <div className={`inline-flex items-center min-w-0 ${currentSize.gap} group select-none ${className}`}>
      {EmblemImg}
      <div className="flex flex-col text-left justify-center min-w-0">
        <span
          className={`tracking-tight font-display leading-none truncate ${currentSize.text} ${
            isDarkBg ? 'text-white' : 'text-[#071E41]'
          }`}
        >
          MOMENTUM
        </span>
        <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5 min-w-0">
          <span className="w-2.5 sm:w-3 h-[2px] bg-[#C99A31] shrink-0" />
          {compactOnMobile ? (
            <>
              <span
                className={`sm:hidden tracking-wide uppercase font-display leading-none whitespace-nowrap ${currentSize.sub} ${
                  isDarkBg ? 'text-slate-200' : 'text-[#071E41]'
                }`}
              >
                TRANSPORT &amp; HAULING
              </span>
              <span
                className={`hidden sm:inline tracking-wider uppercase font-display leading-none whitespace-nowrap ${currentSize.sub} ${
                  isDarkBg ? 'text-slate-200' : 'text-[#071E41]'
                }`}
              >
                TRANSPORTATION &amp; HAULING LLC
              </span>
            </>
          ) : (
            <span
              className={`tracking-wider uppercase font-display leading-none ${currentSize.sub} ${
                isDarkBg ? 'text-slate-200' : 'text-[#071E41]'
              }`}
            >
              TRANSPORTATION &amp; HAULING LLC
            </span>
          )}
        </div>
        {showTagline && (
          <span className="text-[11px] sm:text-xs italic font-medium text-[#C99A31] mt-1 tracking-normal font-display">
            Moving Business Forward.
          </span>
        )}
      </div>
    </div>
  );
};
