import React, { useRef } from 'react';
import { m, useSpring, useReducedMotion } from 'framer-motion';
import { isDesktopPointer } from '../lib/motion';

/**
 * MagneticButton
 * Creates a subtle magnetic attraction effect following the cursor within the button radius.
 * Disabled on touch screens and when prefers-reduced-motion is enabled.
 * Uses lightweight `m` component via LazyMotion.
 */
export function MagneticButton({
  children,
  className = '',
  style = {},
  strength = 0.22,
  ...props
}) {
  const btnRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const springConfig = { stiffness: 220, damping: 18, mass: 0.2 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !isDesktopPointer() || !btnRef.current) return;

    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;

    // Constrain maximum translation to prevent extreme offsets
    const maxOffset = 8;
    const clampedX = Math.max(-maxOffset, Math.min(maxOffset, distanceX));
    const clampedY = Math.max(-maxOffset, Math.min(maxOffset, distanceY));

    x.set(clampedX);
    y.set(clampedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.div
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x,
        y,
        display: 'inline-block',
        ...style,
      }}
      className={className}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </m.div>
  );
}

export default MagneticButton;
