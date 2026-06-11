import { describe, it, expect } from 'vitest';
import { resolveFrameloop } from '../components/JewelScene/visibility';

describe('resolveFrameloop', () => {
  it('never when reduced motion', () => {
    expect(resolveFrameloop(false, true)).toBe('never');
    expect(resolveFrameloop(true, true)).toBe('never');
  });
  it('never when offscreen', () => {
    expect(resolveFrameloop(false, false)).toBe('never');
  });
  it('always when visible and animating', () => {
    expect(resolveFrameloop(true, false)).toBe('always');
  });
});
