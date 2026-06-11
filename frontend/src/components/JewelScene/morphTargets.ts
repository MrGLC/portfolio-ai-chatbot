import * as THREE from 'three';

export interface MorphTarget {
  positions: Float32Array;
  normals: Float32Array;
}

export const TARGET_NAMES = ['gem', 'gemBreath', 'neural', 'lattice'] as const;
export type TargetName = (typeof TARGET_NAMES)[number];

// Deterministic pseudo-noise (no Math.random — targets must be identical across loads)
function pseudoNoise(x: number, y: number, z: number): number {
  return Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 0.5 + 0.5;
}

function baseGeometry(): THREE.BufferGeometry {
  // detail 1 icosahedron, non-indexed: every face owns its vertices (flat shading + per-face morph freedom)
  return new THREE.IcosahedronGeometry(1.7, 1).toNonIndexed();
}

// neural: vertices pushed onto a unit-ish sphere then displaced by layered deterministic
// noise — organic thinking-blob. Same vertex array length as gem by construction.
function buildNeural(gemPos: Float32Array): Float32Array {
  const out = new Float32Array(gemPos.length);
  for (let i = 0; i < gemPos.length; i += 3) {
    const x = gemPos[i], y = gemPos[i + 1], z = gemPos[i + 2];
    const len = Math.hypot(x, y, z) || 1;
    const nx = x / len, ny = y / len, nz = z / len;
    const n1 = pseudoNoise(nx * 2.1, ny * 2.1, nz * 2.1) - 0.5;
    const n2 = pseudoNoise(nx * 5.3 + 7.7, ny * 5.3, nz * 5.3) - 0.5;
    const r = 1.55 + n1 * 0.7 + n2 * 0.25;
    out[i] = nx * r; out[i + 1] = ny * r; out[i + 2] = nz * r;
  }
  return out;
}

// lattice: each face's centroid snaps toward the nearest point of a 1.1-spaced grid,
// face shrinks toward its centroid — reads as a cluster of small crystals.
function buildLattice(gemPos: Float32Array): Float32Array {
  const out = new Float32Array(gemPos.length);
  const SNAP = 1.1, SHRINK = 0.38;
  for (let f = 0; f < gemPos.length; f += 9) {
    const cx = (gemPos[f] + gemPos[f + 3] + gemPos[f + 6]) / 3;
    const cy = (gemPos[f + 1] + gemPos[f + 4] + gemPos[f + 7]) / 3;
    const cz = (gemPos[f + 2] + gemPos[f + 5] + gemPos[f + 8]) / 3;
    const sx = Math.round((cx * 1.35) / SNAP) * SNAP;
    const sy = Math.round((cy * 1.35) / SNAP) * SNAP;
    const sz = Math.round((cz * 1.35) / SNAP) * SNAP;
    for (let v = 0; v < 9; v += 3) {
      out[f + v] = sx + (gemPos[f + v] - cx) * SHRINK;
      out[f + v + 1] = sy + (gemPos[f + v + 1] - cy) * SHRINK;
      out[f + v + 2] = sz + (gemPos[f + v + 2] - cz) * SHRINK;
    }
  }
  return out;
}

export function buildMorphTargets(): Record<TargetName, MorphTarget> {
  const gemGeo = baseGeometry();
  gemGeo.computeVertexNormals();
  const gemPos = gemGeo.getAttribute('position').array as Float32Array;
  const gemNorm = gemGeo.getAttribute('normal').array as Float32Array;

  const breathPos = new Float32Array(gemPos.length);
  for (let i = 0; i < gemPos.length; i += 3) {
    const n = pseudoNoise(gemPos[i], gemPos[i + 1], gemPos[i + 2]) * 0.22;
    breathPos[i] = gemPos[i] + gemNorm[i] * n;
    breathPos[i + 1] = gemPos[i + 1] + gemNorm[i + 1] * n;
    breathPos[i + 2] = gemPos[i + 2] + gemNorm[i + 2] * n;
  }
  const breathGeo = new THREE.BufferGeometry();
  breathGeo.setAttribute('position', new THREE.BufferAttribute(breathPos, 3));
  breathGeo.computeVertexNormals();
  const breathNorm = breathGeo.getAttribute('normal').array as Float32Array;

  const neuralPos = buildNeural(gemPos);
  const neuralGeo = new THREE.BufferGeometry();
  neuralGeo.setAttribute('position', new THREE.BufferAttribute(neuralPos, 3));
  neuralGeo.computeVertexNormals();
  const neuralNorm = neuralGeo.getAttribute('normal').array as Float32Array;

  const latticePos = buildLattice(gemPos);
  const latticeGeo = new THREE.BufferGeometry();
  latticeGeo.setAttribute('position', new THREE.BufferAttribute(latticePos, 3));
  latticeGeo.computeVertexNormals();
  const latticeNorm = latticeGeo.getAttribute('normal').array as Float32Array;

  const result: Record<TargetName, MorphTarget> = {
    gem: { positions: gemPos.slice(), normals: gemNorm.slice() },
    gemBreath: { positions: breathPos, normals: breathNorm },
    neural: { positions: neuralPos, normals: neuralNorm },
    lattice: { positions: latticePos, normals: latticeNorm },
  };
  gemGeo.dispose(); breathGeo.dispose(); neuralGeo.dispose(); latticeGeo.dispose();
  return result;
}
