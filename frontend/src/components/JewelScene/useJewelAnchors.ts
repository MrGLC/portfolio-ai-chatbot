// Discovers [data-jewel-anchor] slots and keeps fresh viewport rects for them.
// All mutation happens in refs; consumers poll getRect() from frame loops.
import { useCallback, useEffect, useRef } from 'react';
import { ANCHOR_NAMES } from './anchorPose';

export function useJewelAnchors(): { getRect: (name: string) => DOMRect | null } {
  const elsRef = useRef<Map<string, HTMLElement>>(new Map());
  const rectsRef = useRef<Map<string, DOMRect>>(new Map());

  useEffect(() => {
    let rafPending = false;
    let retryId: number | undefined;

    const measure = () => {
      rafPending = false;
      for (const [name, el] of elsRef.current) {
        rectsRef.current.set(name, el.getBoundingClientRect());
      }
    };
    const requestMeasure = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(measure);
    };
    const discover = () => {
      const found = document.querySelectorAll<HTMLElement>('[data-jewel-anchor]');
      elsRef.current.clear();
      found.forEach((el) => elsRef.current.set(el.dataset.jewelAnchor as string, el));
      measure();
      // HomePage is lazy: keep retrying until the three named anchors exist.
      const haveAll = ANCHOR_NAMES.every((n) => elsRef.current.has(n));
      if (!haveAll) retryId = window.setTimeout(discover, 500);
    };

    discover();
    window.addEventListener('scroll', requestMeasure, { passive: true });
    window.addEventListener('resize', requestMeasure);
    return () => {
      window.clearTimeout(retryId);
      window.removeEventListener('scroll', requestMeasure);
      window.removeEventListener('resize', requestMeasure);
    };
  }, []);

  const getRect = useCallback((name: string): DOMRect | null => {
    const r = rectsRef.current.get(name);
    if (!r || r.width <= 0 || r.height <= 0) return null;
    return r;
  }, []);

  return { getRect };
}
