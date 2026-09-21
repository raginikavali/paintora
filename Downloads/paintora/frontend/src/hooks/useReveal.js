import { useEffect, useRef } from 'react';

/**
 * Hook to animate elements when scrolled into view using IntersectionObserver.
 * Automatically respects prefers-reduced-motion.
 *
 * @param {Object} options - IntersectionObserver options
 * @returns {React.RefObject} ref to attach to the animated container
 */
export function useReveal(options = { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) {
  const ref = useRef(null);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const element = ref.current;

    if (!element) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      element.classList.add('is-revealed');
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target);
        }
      });
    }, options);

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [options]);

  return ref;
}

export default useReveal;
