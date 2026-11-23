import React from 'react';
import { m, useReducedMotion } from 'framer-motion';

/**
 * Shared Motion System for Soch College of IT Portal
 * Lightweight domAnimation configuration using `m` components
 * Easing: cubic-bezier(0.22, 1, 0.36, 1)
 * Standard durations: 0.5s - 0.7s
 * Strictly GPU-accelerated: transform + opacity
 */

export const MOTION_EASE = [0.22, 1, 0.36, 1];

export const fadeUp = (delay = 0, distance = 20) => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: MOTION_EASE },
  },
});

export const fadeIn = (delay = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, delay, ease: MOTION_EASE },
  },
});

export const scaleIn = (delay = 0, scale = 0.95) => ({
  hidden: { opacity: 0, scale },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, delay, ease: MOTION_EASE },
  },
});

export const staggerContainer = (staggerDelay = 0.08, delayChildren = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren,
    },
  },
});

/**
 * Accessible Viewport Reveal Wrapper Component
 * Uses `m.div` for ultra-lean bundle size via LazyMotion.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 20,
  margin = '-80px',
  style = {},
  ...props
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return React.createElement('div', { className, style, ...props }, children);
  }

  const y = direction === 'up' ? distance : direction === 'down' ? -distance : 0;
  const x = direction === 'left' ? distance : direction === 'right' ? -distance : 0;

  return React.createElement(
    m.div,
    {
      className,
      style,
      initial: { opacity: 0, x, y },
      whileInView: { opacity: 1, x: 0, y: 0 },
      viewport: { once: true, margin },
      transition: { duration: 0.6, delay, ease: MOTION_EASE },
      ...props,
    },
    children
  );
}

/**
 * Checks whether the current device is a high-precision desktop cursor with hover capability.
 * Strictly returns false on touch screens (smartphones, tablets, touch laptops).
 */
export function isDesktopPointer() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: fine) and (hover: hover)').matches;
}
