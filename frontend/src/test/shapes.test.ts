import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { InstancedMesh, LineSegments, Group, MeshStandardMaterial } from 'three';
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

describe('neural costume', () => {
  it('builds a Group with instanced nodes + line edges; listed in SHAPE_NAMES', () => {
    expect(SHAPE_NAMES).toContain('neural');
    const n = buildShapes().neural.mesh;
    expect(n).toBeInstanceOf(Group);
    const inst = n.children.find((c) => c instanceof InstancedMesh) as InstancedMesh;
    const edges = n.children.find((c) => c instanceof LineSegments);
    expect(inst).toBeTruthy();
    expect(inst.count).toBe(12);
    expect(edges).toBeTruthy();
  });
});

describe('crown costume', () => {
  it('is a Group of band + spikes + jewels with a pulsable emissive material', () => {
    const c = buildShapes().crown;
    expect(c.mesh).toBeInstanceOf(Group);
    // 1 band + 8 spikes + 8 jewels = 17 children
    expect(c.mesh.children.length).toBe(17);
    expect(c.material).toBeInstanceOf(MeshStandardMaterial);
    expect((c.material as MeshStandardMaterial).emissive).toBeTruthy();
  });
});
