import React from 'react';

/**
 * Paintora Brand Logo Component
 * 
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} variant - 'full' (mark + wordmark) | 'mark' (symbol only) | 'light' (inverted for dark backgrounds)
 * @param {string} className - optional extra class name
 */
export default function Logo({ size = 'md', variant = 'full', className = '' }) {
  const isLight = variant === 'light';
  const isMarkOnly = variant === 'mark';

  // Dimension scaling
  const dimensions = {
    sm: { height: 26, markSize: 26, fontSize: 18 },
    md: { height: 34, markSize: 34, fontSize: 22 },
    lg: { height: 44, markSize: 44, fontSize: 28 },
    xl: { height: 56, markSize: 56, fontSize: 36 },
  }[size] || { height: 34, markSize: 34, fontSize: 22 };

  const primaryColor = '#C85A32'; // Terracotta
  const secondaryColor = isLight ? '#FAF8F5' : '#1C1C1C'; // Charcoal or Cream
  const accentColor = '#E67E22'; // Warm amber highlight

  return (
    <div 
      className={`paintora-logo paintora-logo-${size} paintora-logo-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: `${Math.round(dimensions.height * 0.28)}px`,
        textDecoration: 'none',
        lineHeight: 1,
      }}
      aria-label="Paintora Logo"
    >
      {/* Dynamic SVG Mark: Stylized Paint Roller + Brush Arc forming "P" */}
      <svg
        width={dimensions.markSize}
        height={dimensions.markSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id={`pGradient-${variant}`} x1="4" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor={primaryColor} />
            <stop offset="1" stopColor={accentColor} />
          </linearGradient>
          <filter id={`pDropShadow-${variant}`} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* Roller Handle / Stem forming left side of "P" */}
        <rect
          x="8"
          y="8"
          width="7"
          height="32"
          rx="3.5"
          fill={secondaryColor}
        />

        {/* Roller Bracket / Wire Arm */}
        <path
          d="M12 18 C12 12 18 8 26 8 L32 8 C38.6274 8 44 13.3726 44 20 C44 26.6274 38.6274 32 32 32 L15 32"
          stroke={`url(#pGradient-${variant})`}
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#pDropShadow-${variant})`}
        />

        {/* Wet Paint Droplet Accent */}
        <path
          d="M32 17 C32 17 34 20 34 21.5 C34 22.6046 33.1046 23.5 32 23.5 C30.8954 23.5 30 22.6046 30 21.5 C30 20 32 17 32 17 Z"
          fill={isLight ? '#FFFFFF' : '#FFFFFF'}
          opacity="0.9"
        />

        {/* Inner Roller Sheen */}
        <circle cx="28" cy="20" r="2" fill="#FFFFFF" opacity="0.65" />
      </svg>

      {/* Wordmark */}
      {!isMarkOnly && (
        <span
          style={{
            fontFamily: 'var(--font-serif, "Fraunces", Georgia, serif)',
            fontSize: `${dimensions.fontSize}px`,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: secondaryColor,
            userSelect: 'none',
          }}
        >
          Paintora
        </span>
      )}
    </div>
  );
}
