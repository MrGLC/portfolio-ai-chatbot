import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildShapes, SHAPE_NAMES } from '../components/JewelScene/shapes';

describe('shapes', () => {
  it('stone (ico) is roughened and deterministic across builds', () => {
    const a = buildShapes().ico.mesh as THREE.Mesh;
    const b = buildShapes().ico.mesh as THREE.Mesh;
    const pa = (a.geometry.getAttribute('position').array as Float32Array);
    const pb = (b.geometry.getAttribute('position').array as Float32Array);
    expect(pa.length).toBeGreaterThan(0);
    expect(Array.from(pa)).toEqual(Array.from(pb)); // deterministic: no Math.random
    // roughened: vertex radii vary (not all equal to a single sphere radius)
    const radii = new Set<number>();
    for (let i = 0; i < pa.length; i += 3) {
      radii.add(Math.round(Math.hypot(pa[i], pa[i + 1], pa[i + 2]) * 100) / 100);
    }
    expect(radii.size).toBeGreaterThan(3);
  });
});
