// Discovers [data-jewel-anchor] slots and keeps DOCUMENT-space rects for them.
//
// v2 of this hook (official-fix research, 2026-07-12): the original measured
// viewport rects inside a scroll listener — but on mobile, scrolling runs on
// the compositor thread and `scroll` events arrive late/irregularly during
// momentum, so the cache held stale positions while the page kept moving
// (Mozilla scroll-linked-effects doc). The verified pattern (r3f-scroll-rig
// useTracker) is: measure ONCE in document space, derive the viewport
// position per frame as `docTop - window.scrollY` inside the frame loop, and
// re-measure only when layout actually changes (ResizeObserver /
// visualViewport resize) — never on scroll.
import { useCallback, useEffect, useRef } from 'react';
import { ANCHOR_NAMES } from './anchorPose';
import type { RectLike } from './anchorPose';

interface DocRect {
  left: number;
  docTop: number; // document-space top (viewport top + scrollY at measure time)
  width: number;
  height: number;
}

export function useJewelAnchors(): { getRect: (name: string) => RectLike | null } {
  const elsRef = useRef<Map<string, HTMLElement>>(new Map());
  const docRectsRef = useRef<Map<string, DocRect>>(new Map());
  // Scratch rect reused across getRect calls — the frame loop consumes it
  // immediately (rectToPose), so a single mutable instance avoids per-frame
  // allocation.
  const scratchRef = useRef<RectLike>({ left: 0, top: 0, width: 0, height: 0 });

  useEffect(() => {
    let retryId: number | undefined;
    let ro: ResizeObserver | undefined;

    const measure = () => {
      const sy = window.scrollY;
      for (const [name, el] of elsRef.current) {
        const r = el.getBoundingClientRect();
        docRectsRef.current.set(name, {
          left: r.left,
          docTop: r.top + sy,
          width: r.width,
          height: r.height,
        });
      }
    };
    const discover = () => {
      const found = document.querySelectorAll<HTMLElement>('[data-jewel-anchor]');
      elsRef.current.clear();
      found.forEach((el) => elsRef.current.set(el.dataset.jewelAnchor as string, el));
      measure();
      // Re-observe: element size/layout changes (responsive breakpoints, fonts,
      // content growth above an anchor) are the ONLY reasons rects go stale now.
      ro?.disconnect();
      ro = new ResizeObserver(measure);
      found.forEach((el) => ro!.observe(el));
      ro.observe(document.body); // content above an anchor changing height moves its docTop
      // HomePage is lazy: keep retrying until the three named anchors exist.
      const haveAll = ANCHOR_NAMES.every((n) => elsRef.current.has(n));
      if (!haveAll) retryId = window.setTimeout(discover, 500);
    };

    discover();
    window.addEventListener('resize', measure);
    // URL bar show/hide + on-screen keyboard change the visual viewport without
    // a layout resize — MDN VisualViewport. Re-measure so docTops stay honest.
    window.visualViewport?.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(retryId);
      ro?.disconnect();
      window.removeEventListener('resize', measure);
      window.visualViewport?.removeEventListener('resize', measure);
    };
  }, []);

  const getRect = useCallback((name: string): RectLike | null => {
    const d = docRectsRef.current.get(name);
    if (!d || d.width <= 0 || d.height <= 0) return null;
    const s = scratchRef.current;
    s.left = d.left;
    s.top = d.docTop - window.scrollY; // derived fresh at call time (frame loop)
    s.width = d.width;
    s.height = d.height;
    return s;
  }, []);

  return { getRect };
}
