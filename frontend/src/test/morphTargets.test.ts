import { describe, it, expect } from 'vitest';
import { buildMorphTargets, TARGET_NAMES } from '../components/JewelScene/morphTargets';

describe('morphTargets', () => {
  const targets = buildMorphTargets();

  it('registers gem, gemBreath, neural, and lattice', () => {
    expect(TARGET_NAMES).toEqual(['gem', 'gemBreath', 'neural', 'lattice']);
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

  it('neural is organic — smoothly displaced, bounded', () => {
    const a = targets.gem.positions, b = targets.neural.positions;
    let maxR = 0;
    for (let i = 0; i < b.length; i += 3) {
      maxR = Math.max(maxR, Math.hypot(b[i], b[i + 1], b[i + 2]));
    }
    expect(maxR).toBeGreaterThan(1.2);
    expect(maxR).toBeLessThan(2.6);
    expect(b).not.toEqual(a);
  });

  it('lattice clusters vertices toward snap points', () => {
    const b = targets.lattice.positions;
    // every vertex sits within 0.45 of a 1.1-spaced grid point (cluster snapping)
    for (let i = 0; i < b.length; i += 3) {
      for (const c of [b[i], b[i + 1], b[i + 2]]) {
        const d = Math.abs(c - Math.round(c / 1.1) * 1.1);
        expect(d).toBeLessThanOrEqual(0.45 + 1e-6);
      }
    }
  });
});
