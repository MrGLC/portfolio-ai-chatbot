import { describe, it, expect } from 'vitest';
import { buildMorphTargets, TARGET_NAMES } from '../components/JewelScene/morphTargets';

describe('morphTargets', () => {
  const targets = buildMorphTargets();

  it('registers gem and gemBreath', () => {
    expect(TARGET_NAMES).toEqual(['gem', 'gemBreath']);
    expect(Object.keys(targets)).toEqual([...TARGET_NAMES]);
  });

  it('all targets share identical vertex count', () => {
    const counts = TARGET_NAMES.map((n) => targets[n].positions.length);
    expect(new Set(counts).size).toBe(1);
    expect(counts[0] % 9).toBe(0); // non-indexed triangles: 3 verts * 3 components
  });

  it('gemBreath differs from gem but stays bounded', () => {
    const a = targets.gem.positions, b = targets.gemBreath.positions;
    let maxDelta = 0, sumDelta = 0;
    for (let i = 0; i < a.length; i++) {
      const d = Math.abs(a[i] - b[i]);
      maxDelta = Math.max(maxDelta, d); sumDelta += d;
    }
    expect(sumDelta).toBeGreaterThan(0);
    expect(maxDelta).toBeLessThan(0.5);
  });

  it('is deterministic', () => {
    const again = buildMorphTargets();
    expect(again.gemBreath.positions).toEqual(targets.gemBreath.positions);
  });
});
