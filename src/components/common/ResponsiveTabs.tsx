import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export interface ResponsiveTabItem<T extends string = string> {
  id: T;
  label: string;
  badge?: string | number;
  sublabel?: string;
}

interface ResponsiveTabsProps<T extends string = string> {
  idPrefix: string;
  ariaLabel: string;
  items: ResponsiveTabItem<T>[];
  activeId: T;
  onChange: (id: T) => void;
  mobileLayout?: 'stacked' | 'select';
  tone?: 'light' | 'dark';
  mobileSelectLabel?: string;
  className?: string;
}

export function getTabId(idPrefix: string, id: string): string {
  return `${idPrefix}-tab-${id}`;
}

export function getPanelId(idPrefix: string, id: string): string {
  return `${idPrefix}-panel-${id}`;
}

export function ResponsiveTabs<T extends string = string>({
  idPrefix,
  ariaLabel,
  items,
  activeId,
  onChange,
  mobileLayout = 'stacked',
  tone = 'light',
  mobileSelectLabel = 'Jump to section',
  className = '',
}: ResponsiveTabsProps<T>) {
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId)
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (index + 1) % items.length;
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (index - 1 + items.length) % items.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = items.length - 1;
    }

    if (nextIndex !== null) {
      event.preventDefault();
      const targetItem = items[nextIndex];
      onChange(targetItem.id);
      requestAnimationFrame(() => {
        buttonRefs.current[targetItem.id]?.focus();
      });
    }
  };

  const isDark = tone === 'dark';

  const containerSurface = isDark
    ? 'bg-[#041228]/95 border border-slate-700/70'
    : 'bg-white border border-slate-200 shadow-xs';

  const handlePrev = () => {
    const prevIdx = (activeIndex - 1 + items.length) % items.length;
    onChange(items[prevIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (activeIndex + 1) % items.length;
    onChange(items[nextIdx].id);
  };

  if (mobileLayout === 'select') {
    return (
      <div className={`w-full min-w-0 ${className}`}>
        {/* Mobile (< md): Native Select + 44x44 Prev/Next Stepper (Zero Clipping) */}
        <div
          className={`md:hidden p-2 rounded-xl ${containerSurface} space-y-2`}
          role="region"
          aria-label={ariaLabel}
        >
          <div className="flex items-center justify-between px-1">
            <label
              htmlFor={`${idPrefix}-mobile-select`}
              className={`text-[11px] font-bold uppercase tracking-wider font-display ${
                isDark ? 'text-[#C99A31]' : 'text-[#071E41]'
              }`}
            >
              {mobileSelectLabel}
            </label>
            <span
              className={`text-[11px] font-semibold tabular-nums ${
                isDark ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              {activeIndex + 1} of {items.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0">
            <button
              type="button"
              onClick={handlePrev}
              aria-label={`Previous ${ariaLabel.toLowerCase()}`}
              className={`min-w-[44px] min-h-[48px] inline-flex items-center justify-center rounded-lg border transition-colors cursor-pointer shrink-0 ${
                isDark
                  ? 'border-slate-700 bg-[#071E41] text-white hover:bg-slate-800'
                  : 'border-slate-300 bg-[#F5F7FA] text-[#071E41] hover:bg-slate-200'
              }`}
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="relative flex-1 min-w-0">
              <select
                id={`${idPrefix}-mobile-select`}
                aria-label={ariaLabel}
                value={activeId}
                onChange={(e) => onChange(e.target.value as T)}
                className={`w-full min-w-0 min-h-[48px] appearance-none pl-3.5 pr-9 py-2.5 text-sm font-bold rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#C99A31] cursor-pointer ${
                  isDark
                    ? 'bg-[#071E41] text-white border-[#C99A31]/70'
                    : 'bg-[#071E41] text-white border-[#071E41]'
                }`}
              >
                {items.map((item) => (
                  <option key={item.id} value={item.id} className="bg-white text-[#071E41]">
                    {item.badge !== undefined ? `${item.badge}. ${item.label}` : item.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="w-4 h-4 text-[#C99A31] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
            </div>

            <button
              type="button"
              onClick={handleNext}
              aria-label={`Next ${ariaLabel.toLowerCase()}`}
              className={`min-w-[44px] min-h-[48px] inline-flex items-center justify-center rounded-lg border transition-colors cursor-pointer shrink-0 ${
                isDark
                  ? 'border-slate-700 bg-[#071E41] text-white hover:bg-slate-800'
                  : 'border-slate-300 bg-[#F5F7FA] text-[#071E41] hover:bg-slate-200'
              }`}
            >
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Tablet & Desktop (md+): Wrapped Accessible ARIA Tablist */}
        <div
          role="tablist"
          aria-label={ariaLabel}
          aria-orientation="horizontal"
          className={`hidden md:flex md:flex-wrap items-center gap-1.5 p-1.5 rounded-xl ${containerSurface}`}
        >
          {items.map((item, idx) => {
            const isSelected = item.id === activeId;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  buttonRefs.current[item.id] = el;
                }}
                type="button"
                role="tab"
                id={getTabId(idPrefix, item.id)}
                aria-selected={isSelected}
                aria-controls={getPanelId(idPrefix, item.id)}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => onChange(item.id)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A31] ${
                  isSelected
                    ? isDark
                      ? 'bg-[#C99A31] text-[#071E41] shadow-sm'
                      : 'bg-[#071E41] text-white shadow-sm'
                    : isDark
                    ? 'text-slate-200 hover:text-white hover:bg-white/10'
                    : 'bg-[#F5F7FA] text-slate-700 hover:bg-slate-200 hover:text-[#071E41]'
                }`}
              >
                {item.badge !== undefined && (
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] inline-flex items-center justify-center font-bold shrink-0 ${
                      isSelected
                        ? isDark
                          ? 'bg-[#071E41] text-[#C99A31]'
                          : 'bg-[#C99A31] text-[#071E41]'
                        : 'bg-slate-300 text-slate-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // mobileLayout === 'stacked': Stacked full-width tabs on narrow phones (< sm),
  // clean 2-up grid on sm, wrapped horizontal tablist on md+ (Zero Overlap or Clipping)
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      aria-orientation="horizontal"
      className={`w-full min-w-0 grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-stretch md:items-center gap-2 md:gap-1.5 p-2 md:p-1.5 rounded-xl ${containerSurface} ${className}`}
    >
      {items.map((item, idx) => {
        const isSelected = item.id === activeId;
        return (
          <button
            key={item.id}
            ref={(el) => {
              buttonRefs.current[item.id] = el;
            }}
            type="button"
            role="tab"
            id={getTabId(idPrefix, item.id)}
            aria-selected={isSelected}
            aria-controls={getPanelId(idPrefix, item.id)}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`min-h-[48px] md:min-h-[44px] w-full md:w-auto px-4 py-2.5 md:py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-between md:justify-center gap-2 text-left md:text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C99A31] ${
              isSelected
                ? isDark
                  ? 'bg-[#C99A31] text-[#071E41] shadow-sm'
                  : 'bg-[#071E41] text-white shadow-sm ring-1 ring-[#C99A31]/40'
                : isDark
                ? 'bg-[#071E41]/70 md:bg-transparent text-slate-200 border border-slate-700/60 md:border-transparent hover:text-white hover:bg-white/10'
                : 'bg-[#F5F7FA] md:bg-transparent text-slate-700 border border-slate-200 md:border-transparent hover:bg-slate-100 hover:text-[#071E41]'
            }`}
          >
            <span className="leading-snug">{item.label}</span>
            {isSelected && (
              <span
                className={`md:hidden w-2 h-2 rounded-full shrink-0 ${
                  isDark ? 'bg-[#071E41]' : 'bg-[#C99A31]'
                }`}
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
