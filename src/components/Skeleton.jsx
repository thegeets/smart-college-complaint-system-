import React from 'react';

/**
 * Skeleton Loader Components
 * Lightweight, accessible placeholder loading animations with a smooth shimmer.
 */
export function Skeleton({ 
  variant = 'text', // 'text', 'rect', 'circle', 'card'
  width, 
  height, 
  borderRadius,
  className = '', 
  style = {} 
}) {
  const customStyles = {
    ...style,
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...(borderRadius ? { borderRadius } : {}),
  };

  return (
    <div 
      className={`skeleton skeleton-${variant} ${className}`} 
      style={customStyles}
      aria-hidden="true"
    />
  );
}

export function SkeletonCard({ lines = 3, className = '' }) {
  return (
    <div className={`card skeleton-card-container ${className}`} aria-hidden="true" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <Skeleton variant="circle" width="40px" height="40px" />
        <div style={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height="16px" style={{ marginBottom: '6px' }} />
          <Skeleton variant="text" width="40%" height="12px" />
        </div>
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          variant="text" 
          width={i === lines - 1 ? '70%' : '100%'} 
          height="14px" 
          style={{ marginBottom: '8px' }} 
        />
      ))}
    </div>
  );
}

export function SkeletonTableRows({ rows = 5, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rIdx) => (
        <tr key={rIdx} className="skeleton-table-row" aria-hidden="true">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <td key={cIdx} style={{ padding: '1rem' }}>
              <Skeleton 
                variant="text" 
                height="16px" 
                width={cIdx === 0 ? '70px' : cIdx === 1 ? '85%' : '60%'} 
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
