import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useJewelAnchors } from '../components/JewelScene/useJewelAnchors';
import { REMEASURE_EVENT } from '../components/JewelScene/anchorPose';

describe('useJewelAnchors', () => {
  it('re-measures on REMEASURE_EVENT when a transform changed the rect without a resize', () => {
    const el = document.createElement('div');
    el.dataset.jewelAnchor = 'cta';
    let top = 60;
    el.getBoundingClientRect = () => ({ left: 0, top, width: 100, height: 100 }) as DOMRect;
    document.body.appendChild(el);
    const { result, unmount } = renderHook(() => useJewelAnchors());
    expect(result.current.getRect('cta')?.top).toBe(60);
    top = 0; // reveal finished: y 60 → 0, layout box (and ResizeObserver) untouched
    window.dispatchEvent(new Event(REMEASURE_EVENT));
    expect(result.current.getRect('cta')?.top).toBe(0);
    unmount();
    top = 30;
    window.dispatchEvent(new Event(REMEASURE_EVENT));
    expect(result.current.getRect('cta')?.top).toBe(0); // listener removed
    el.remove();
  });
});
