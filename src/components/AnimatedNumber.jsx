import React, { useEffect, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

/**
 * AnimatedNumber
 * Counts up smoothly when scrolled into view.
 * Respects prefers-reduced-motion.
 */
export function AnimatedNumber({ value, duration = 850, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const shouldReduceMotion = useReducedMotion();
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (!isInView || hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    const strVal = String(value ?? 0);
    const match = strVal.match(/^([^0-9.-]*)([0-9.-]+)(.*)$/);
    if (!match || !ref.current) return;

    const prefix = match[1] || '';
    const numTarget = parseFloat(match[2]);
    const suffix = match[3] || '';
    if (isNaN(numTarget)) return;

    const decimals = match[2].includes('.') ? match[2].split('.')[1].length : 0;
    const startTime = performance.now();
    let animationFrameId;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = numTarget * ease;
      const formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current);

      if (ref.current) {
        ref.current.textContent = `${prefix}${formatted}${suffix}`;
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else if (ref.current) {
        ref.current.textContent = `${prefix}${numTarget.toFixed(decimals > 0 ? decimals : 0)}${suffix}`;
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [isInView, value, duration, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return <span className={className}>{value}</span>;
  }

  const strVal = String(value ?? 0);
  const match = strVal.match(/^([^0-9.-]*)([0-9.-]+)(.*)$/);
  const initialText = match ? `${match[1] || ''}0${match[3] || ''}` : String(value);

  return (
    <span ref={ref} className={className}>
      {initialText}
    </span>
  );
}

export default AnimatedNumber;
