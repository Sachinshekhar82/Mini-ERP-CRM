import React from 'react';

interface NexoraLogoProps {
  variant?: 'full' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  light?: boolean;
  className?: string;
}

export const NexoraLogo: React.FC<NexoraLogoProps> = ({
  variant = 'full',
  size = 'md',
  light = true,
  className = '',
}) => {
  const dimensions = {
    sm: { icon: 28, fontSize: '1.125rem', gap: '0.5rem' },
    md: { icon: 36, fontSize: '1.375rem', gap: '0.625rem' },
    lg: { icon: 48, fontSize: '1.75rem', gap: '0.75rem' },
  }[size];

  const textColor = light ? '#F9FAFB' : '#111827';
  const subtextColor = light ? '#9CA3AF' : '#6B7280';

  return (
    <div
      className={`nexora-logo ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: dimensions.gap,
        userSelect: 'none',
      }}
    >
      {/* Abstract Geometric "N" Symbol with Business Nodes */}
      <div
        style={{
          width: `${dimensions.icon}px`,
          height: `${dimensions.icon}px`,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="nexoraGrad1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#4F46E5" />
            </linearGradient>
            <linearGradient id="nexoraGrad2" x1="40" y1="0" x2="0" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#818CF8" />
            </linearGradient>
            <filter id="nexoraGlow" x="-2" y="-2" width="44" height="44" filterUnits="userSpaceOnUse">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366F1" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Background Rounded Geometric Shield */}
          <rect width="40" height="40" rx="10" fill="url(#nexoraGrad1)" filter="url(#nexoraGlow)" />

          {/* Geometric Connected "N" Nodes & Directional Vectors */}
          {/* Left Vertical Node Bar */}
          <path
            d="M12 11V29"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Diagonal Connecting Bridge */}
          <path
            d="M12 11L28 29"
            stroke="url(#nexoraGrad2)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Right Vertical Node Bar */}
          <path
            d="M28 11V29"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Connected Business Nodes Points */}
          <circle cx="12" cy="11" r="2.5" fill="#38BDF8" />
          <circle cx="28" cy="29" r="2.5" fill="#38BDF8" />
          <circle cx="28" cy="11" r="2" fill="#FFFFFF" />
          <circle cx="12" cy="29" r="2" fill="#FFFFFF" />
        </svg>
      </div>

      {variant === 'full' && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span
            style={{
              fontSize: dimensions.fontSize,
              fontWeight: 800,
              color: textColor,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
            }}
          >
            NEXORA
          </span>
          {size !== 'sm' && (
            <span
              style={{
                fontSize: size === 'lg' ? '0.75rem' : '0.6875rem',
                color: subtextColor,
                fontWeight: 500,
                letterSpacing: '0.02em',
                lineHeight: 1,
                marginTop: '0.2rem',
              }}
            >
              Operations Portal
            </span>
          )}
        </div>
      )}
    </div>
  );
};
