import React, { useRef, useState } from 'react';
import { m, useSpring, useReducedMotion } from 'framer-motion';
import { isDesktopPointer } from '../lib/motion';

/**
 * TiltCard
 * Provides a subtle 3D card tilt following the cursor on desktop devices only.
 * Disabled on touch screens and when prefers-reduced-motion is active.
 * Uses lightweight `m` component via LazyMotion.
 */
export function TiltCard({
  children,
  className = '',
  style = {},
  maxTilt = 4,
  perspective = 900,
  ...props
}) {
  const cardRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  const springConfig = { stiffness: 220, damping: 20, mass: 0.4 };
  const rotateX = useSpring(0, springConfig);
  const rotateY = useSpring(0, springConfig);

  const handleMouseMove = (e) => {
    if (shouldReduceMotion || !isDesktopPointer() || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to center of card (-1 to +1)
    const mouseX = (e.clientX - rect.left - width / 2) / (width / 2);
    const mouseY = (e.clientY - rect.top - height / 2) / (height / 2);

    rotateX.set(-mouseY * maxTilt);
    rotateY.set(mouseX * maxTilt);
  };

  const handleMouseEnter = () => {
    if (!shouldReduceMotion && isDesktopPointer()) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <m.div
      ref={cardRef}
      className={`tilt-card-wrapper ${className} ${isHovered ? 'tilt-hovered' : ''}`}
      style={{
        perspective,
        transformStyle: 'preserve-3d',
        ...style,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <m.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          width: '100%',
          height: '100%',
        }}
      >
        {children}
      </m.div>
    </m.div>
  );
}

export default TiltCard;
