import React, { useEffect, useState, useRef } from 'react';

/**
 * AnimatedNumber
 * Counts up smoothly when first mounted or when the value changes.
 * Keeps the effect brief (~500ms - 700ms) with ease-out quad.
 * Automatically respects prefers-reduced-motion.
 */
export function AnimatedNumber({ value, duration = 650, className = '' }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    // Check for prefers-reduced-motion
    const prefersReducedMotion = 
      typeof window !== 'undefined' && 
      window.matchMedia && 
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    // Parse target number and format (e.g., "98%", "4.8", 14)
    const strVal = String(value ?? 0);
    const match = strVal.match(/^([^0-9.-]*)([0-9.-]+)(.*)$/);

    if (!match) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    const prefix = match[1] || '';
    const numTarget = parseFloat(match[2]);
    const suffix = match[3] || '';

    if (isNaN(numTarget)) {
      setDisplayValue(value);
      prevValueRef.current = value;
      return;
    }

    // Determine decimal precision if present
    const decimals = match[2].includes('.') ? match[2].split('.')[1].length : 0;

    // Previous numeric value
    const prevStr = String(prevValueRef.current ?? 0);
    const prevMatch = prevStr.match(/^([^0-9.-]*)([0-9.-]+)(.*)$/);
    const startNum = prevMatch && !isNaN(parseFloat(prevMatch[2])) ? parseFloat(prevMatch[2]) : 0;

    const startTime = performance.now();
    let animationFrameId;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic curve: fast start, soft gentle landing
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startNum + (numTarget - startNum) * ease;

      const formatted = decimals > 0 ? current.toFixed(decimals) : Math.round(current);
      setDisplayValue(`${prefix}${formatted}${suffix}`);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(`${prefix}${numTarget.toFixed(decimals > 0 ? decimals : 0)}${suffix}`);
        prevValueRef.current = value;
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [value, duration]);

  return <span className={className}>{displayValue}</span>;
}
