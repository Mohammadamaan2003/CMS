import React, { useState, useEffect, useRef } from 'react';

/**
 * CountUpNumber
 * Smoothly runs numbers from 0 up to their exact final value on mount/load,
 * with cubic ease-out deceleration.
 */
export default function CountUpNumber({ endValue, duration = 300, className = '', prefix = '', suffix = '' }) {
  const [displayValue, setDisplayValue] = useState(0);
  const currentValRef = useRef(0);
  const hasLoadedInitialRef = useRef(false);

  useEffect(() => {
    const target = Number(endValue);
    if (isNaN(target)) return;

    // Respect prefers-reduced-motion: if user prefers reduced motion, set final value immediately
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(target);
      currentValRef.current = target;
      return;
    }

    // Determine theme: default dark theme should run fast & smooth (around 200-300ms)
    const isDark =
      typeof document !== 'undefined'
        ? (document.documentElement.getAttribute('data-theme') !== 'light')
        : true;

    // First time this component receives a positive target, run strictly from 0 to target over duration!
    let startVal = currentValRef.current;
    let animDuration = isDark ? Math.min(duration, 300) : duration;

    if (!hasLoadedInitialRef.current && target > 0) {
      startVal = 0;
      currentValRef.current = 0;
      animDuration = isDark ? Math.min(duration, 300) : duration;
      hasLoadedInitialRef.current = true;
    }

    if (startVal === target) {
      setDisplayValue(target);
      return;
    }

    const startTime = performance.now();
    let frameId;

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / animDuration);
      // easeOutCubic: rapid start from 0, smooth deceleration into final target
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (target - startVal) * ease);

      currentValRef.current = current;
      setDisplayValue(current);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        currentValRef.current = target;
        setDisplayValue(target);
      }
    };

    frameId = requestAnimationFrame(tick);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [endValue, duration]);

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}
