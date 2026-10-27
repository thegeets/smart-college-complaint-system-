import React, { useId } from 'react';
import { COLLEGE_CONFIG } from '../config/collegeConfig';

/**
 * BrandLogo - Institutional Branding & Academic Crest Component
 * 
 * Displays the institutional identity for "Soch College of IT, Pokhara".
 * Features an academic shield crest with computing and scholarship symbols.
 * Fully configurable and easily replaceable via collegeConfig.js.
 */
export function BrandLogo({ 
  size = 38, 
  variant = 'default', // 'default' | 'light' (for dark sidebars/footers)
  showText = true,
  collegeName = COLLEGE_CONFIG.name,
  subtitle = null,
  className = '',
  accessibleName = COLLEGE_CONFIG.logo.accessibleName,
  imageUrl = COLLEGE_CONFIG.logo.imageUrl,
}) {
  const isLight = variant === 'light';
  const logoTitleId = useId();

  return (
    <div 
      className={`brand-identity ${className}`} 
      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
    >
      {/* Crest Container */}
      <div 
        className="brand-logo-mark"
        role="img"
        aria-label={accessibleName}
        title={COLLEGE_CONFIG.logo.isTemporaryMark ? "Replaceable logo placeholder (configurable in collegeConfig.js)" : accessibleName}
        style={{
          width: size,
          height: size,
          minWidth: size,
          minHeight: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          backgroundColor: isLight ? '#FFFFFF' : '#15365B',
          border: isLight ? '1px solid rgba(255, 255, 255, 0.3)' : '1px solid #0F2847',
          boxShadow: isLight ? '0 1px 3px rgba(0,0,0,0.12)' : '0 1px 2px rgba(15,23,42,0.15)',
          color: isLight ? '#15365B' : '#FFFFFF',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={accessibleName}
            style={{ width: '85%', height: '85%', objectFit: 'contain' }} 
          />
        ) : (
          <svg 
            width={Math.round(size * 0.64)} 
            height={Math.round(size * 0.64)} 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            aria-labelledby={logoTitleId}
          >
            <title id={logoTitleId}>{accessibleName}</title>
            {/* Academic Shield Outline */}
            <path 
              d="M12 2.5L4 5.5V11.5C4 16.5 7.4 20.8 12 22C16.6 20.8 20 16.5 20 11.5V5.5L12 2.5Z" 
              stroke="currentColor" 
              strokeWidth="1.6" 
              strokeLinejoin="round"
              fill={isLight ? '#F8FAFC' : '#102A49'}
            />
            {/* Open Book / Pages */}
            <path 
              d="M7.5 14.5C9 13.8 10.5 13.8 12 14.5C13.5 13.8 15 13.8 16.5 14.5V9.5C15 8.8 13.5 8.8 12 9.5C10.5 8.8 9 8.8 7.5 9.5V14.5Z" 
              stroke={isLight ? '#15365B' : '#E2E8F0'} 
              strokeWidth="1.2" 
              strokeLinejoin="round"
            />
            <line 
              x1="12" 
              y1="9.5" 
              x2="12" 
              y2="14.5" 
              stroke={isLight ? '#15365B' : '#E2E8F0'} 
              strokeWidth="1.2" 
            />
            {/* Computing Tech / Resolution Checkpoint */}
            <path 
              d="M9.5 6.8L12 8.5L14.5 6.8" 
              stroke="#0D8178" 
              strokeWidth="1.8" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* College Typography */}
      {showText && (
        <div className="brand-text-block" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ 
            fontSize: size >= 36 ? '0.9375rem' : '0.875rem', 
            fontWeight: '800', 
            color: isLight ? '#FFFFFF' : '#0F172A',
            lineHeight: 1.2,
            letterSpacing: '-0.015em',
            whiteSpace: 'nowrap',
          }}>
            {collegeName}
          </div>
          <div style={{ 
            fontSize: size >= 36 ? '0.75rem' : '0.6875rem', 
            color: isLight ? '#94A3B8' : '#0F766E',
            fontWeight: '600',
            lineHeight: 1.25,
            marginTop: '2px',
            letterSpacing: '0.01em',
          }}>
            {subtitle || 'Complaint Management System'}
          </div>
        </div>
      )}
    </div>
  );
}

export default BrandLogo;
