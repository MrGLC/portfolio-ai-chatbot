import * as THREE from 'three';

export interface MorphTarget {
  positions: Float32Array;
  normals: Float32Array;
}

export const TARGET_NAMES = ['gem', 'gemBreath'] as const;
export type TargetName = (typeof TARGET_NAMES)[number];

// Deterministic pseudo-noise (no Math.random — targets must be identical across loads)
function pseudoNoise(x: number, y: number, z: number): number {
  return Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 0.5 + 0.5;
}

function baseGeometry(): THREE.BufferGeometry {
  // detail 1 icosahedron, non-indexed: every face owns its vertices (flat shading + per-face morph freedom)
  return new THREE.IcosahedronGeometry(1.7, 1).toNonIndexed();
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

  const result: Record<TargetName, MorphTarget> = {
    gem: { positions: gemPos.slice(), normals: gemNorm.slice() },
    gemBreath: { positions: breathPos, normals: breathNorm },
  };
  gemGeo.dispose(); breathGeo.dispose();
  return result;
}
