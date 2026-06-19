import { describe, it, expect } from 'vitest';
import { neutralizeVariant, resolveVariant } from '../theme/motion';

const sample = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
};

describe('motion policy', () => {
  it('neutralizeVariant strips transforms and zeroes duration', () => {
    const n = neutralizeVariant(sample);
    expect(n.initial).toEqual({ opacity: 1 });
    expect(n.animate).toEqual({ opacity: 1 });
    expect(n.transition).toEqual({ duration: 0 });
  });

  it('resolveVariant returns the original when not reduced', () => {
    expect(resolveVariant(sample, false)).toBe(sample);
  });

  it('resolveVariant neutralizes when reduced', () => {
    expect(resolveVariant(sample, true).transition).toEqual({ duration: 0 });
  });
});
