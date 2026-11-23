import React from 'react';

/**
 * Reusable accessible skeleton shimmer loader
 */
export function SkeletonLoader({
  width = '100%',
  height = '20px',
  borderRadius = '6px',
  className = '',
  style = {},
  count = 1,
}) {
  const items = Array.from({ length: count });

  return (
    <>
      {items.map((_, i) => (
        <div
          key={i}
          className={`skeleton-shimmer-box ${className}`}
          style={{
            width,
            height,
            borderRadius,
            backgroundColor: '#E2E8F0',
            marginBottom: count > 1 && i < count - 1 ? '10px' : 0,
            position: 'relative',
            overflow: 'hidden',
            ...style,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

export default SkeletonLoader;
