import { useEffect, useState, type RefObject } from 'react';

/**
 * Measures a container element and returns centered bar positioning.
 * Uses ResizeObserver + scroll listener to stay in sync.
 */
export function useFloatingBarStyle(ref: RefObject<HTMLDivElement | null>) {
  const [barStyle, setBarStyle] = useState<{ left: number; width: number }>({ left: 0, width: 680 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      const barWidth = rect.width * 0.8;
      setBarStyle({ left: rect.left + (rect.width - barWidth) / 2, width: barWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('scroll', measure);
    return () => { ro.disconnect(); window.removeEventListener('scroll', measure); };
  }, [ref]);

  return barStyle;
}
