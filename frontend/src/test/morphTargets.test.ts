import { describe, it, expect } from 'vitest';
import { buildMorphTargets, TARGET_NAMES } from '../components/JewelScene/morphTargets';

describe('morphTargets', () => {
  const targets = buildMorphTargets();

  it('registers gem, gemBreath, neural, lattice, and growth', () => {
    expect(TARGET_NAMES).toEqual(['gem', 'gemBreath', 'neural', 'lattice', 'growth']);
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

  it('growth forms ascending columns', () => {
    const g = targets.growth.positions;
    // columns sit at x = -2, -1, 0, 1, 2 → band k covers [k-2.5, k-1.5)
    // max y per band must be (near) non-decreasing left→right: rising bars
    const bands: number[] = new Array(5).fill(-Infinity);
    for (let i = 0; i < g.length; i += 3) {
      const band = Math.min(4, Math.max(0, Math.floor((g[i] + 2.5) / 1.0)));
      bands[band] = Math.max(bands[band], g[i + 1]);
    }
    for (let k = 1; k < 5; k++) expect(bands[k]).toBeGreaterThan(bands[k - 1] - 0.15);
    expect(bands[4]).toBeGreaterThan(1.5); // tallest bar is tall
  });

  it('growth columns are narrow and share a common floor', () => {
    const g = targets.growth.positions;
    const COLUMN_X = [-2, -1, 0, 1, 2];
    let minY = Infinity;
    for (let i = 0; i < g.length; i += 3) {
      // every vertex hugs its column center (width ~0.55 + jitter, never bleeds into neighbor band)
      const nearest = COLUMN_X.reduce((a, b) => (Math.abs(g[i] - b) < Math.abs(g[i] - a) ? b : a));
      expect(Math.abs(g[i] - nearest)).toBeLessThan(0.5);
      // z compressed — bars read flat like a chart
      expect(Math.abs(g[i + 2])).toBeLessThan(1.1);
      minY = Math.min(minY, g[i + 1]);
    }
    expect(minY).toBeGreaterThan(-1.6); // bars rise from a common base near -1.2
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
