import React, { useState } from 'react';
import { Truck } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackTitle?: string;
  containerClassName?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt = 'Momentum Transportation & Hauling',
  fallbackTitle = 'Momentum Logistics',
  containerClassName = '',
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative overflow-hidden bg-slate-900 ${containerClassName}`}>
      {/* Background skeleton/gradient */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#071E41] via-[#0D2C5B] to-[#1F2937] animate-pulse" />
      )}

      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#071E41] to-[#041228] p-6 text-center text-white">
          <div className="w-12 h-12 rounded-full bg-[#C99A31]/20 border border-[#C99A31]/40 flex items-center justify-center mb-3">
            <Truck className="w-6 h-6 text-[#C99A31]" />
          </div>
          <p className="text-sm font-semibold tracking-wide font-display text-white">{fallbackTitle}</p>
          <p className="text-xs text-slate-300 mt-1">Momentum Transportation &amp; Hauling LLC · Columbia, SC</p>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
          {...props}
        />
      )}
    </div>
  );
};
