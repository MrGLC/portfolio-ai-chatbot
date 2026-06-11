import { describe, it, expect } from 'vitest';
import { getPerfProfile } from '../hooks/usePerfProfile';

describe('getPerfProfile', () => {
  it('full profile on desktop without reduced motion', () => {
    expect(getPerfProfile(1280, false)).toEqual({
      tier: 'full', dpr: [1, 2], particleScale: 1, animate: true,
    });
  });
  it('lite profile on mobile width', () => {
    expect(getPerfProfile(390, false)).toEqual({
      tier: 'lite', dpr: [1, 1.5], particleScale: 0.25, animate: true,
    });
  });
  it('static when prefers-reduced-motion', () => {
    expect(getPerfProfile(1280, true)).toEqual({
      tier: 'lite', dpr: [1, 1.5], particleScale: 0.25, animate: false,
    });
  });
});
