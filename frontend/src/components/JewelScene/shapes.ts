import * as THREE from 'three';
import type { ShapeName } from './chapterResolver';

/**
 * shapes — the jewel's six costumes (handoff "La joya 3D — el reparto" + our
 * `growth` chapter shape). All six meshes live in one Group; the rig
 * crossfades them by scaling each between 0 and 1 (never two at full scale).
 *
 * Geometry/material values are CANONICAL from the handoff README — do not
 * tune here without updating the reference.
 */

export interface BuiltShape {
  mesh: THREE.Mesh;
  /** Crown material exposed for the rig's pulsing-emissive formula. */
  material: THREE.MeshStandardMaterial;
}

function mkEdges(geo: THREE.BufferGeometry, color: number, opacity: number): THREE.LineSegments {
  return new THREE.LineSegments(
    new THREE.EdgesGeometry(geo),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity })
  );
}

/* ------------------------------------------------------------------ */
/* growth — 5 ascending crystalline columns (business-growth bars).    */
/* PORTED from the retired morphTargets.ts vertex-morph engine: same   */
/* deterministic face-bucketing algorithm, now a standalone geometry   */
/* instead of a morph target.                                          */
/* ------------------------------------------------------------------ */

// Deterministic pseudo-noise (no Math.random — geometry identical across loads)
function pseudoNoise(x: number, y: number, z: number): number {
  return Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 0.5 + 0.5;
}

const GROWTH_COLUMN_X = [-2, -1, 0, 1, 2];
const GROWTH_HEIGHTS = [0.8, 1.4, 2.0, 2.6, 3.2];
const GROWTH_BASE_Y = -1.2;
const GROWTH_SHRINK = 0.5; // face shrink toward snapped centroid (width ~0.55)
const GROWTH_Z_SQUASH = 0.4;
const GROWTH_JITTER = 0.12; // ± x jitter from centroid hash

function buildGrowthGeometry(): THREE.BufferGeometry {
  // Source vertices: detail-1 icosahedron, non-indexed so every face owns its
  // vertices (flat shading + per-face freedom) — same base the morph used.
  const base = new THREE.IcosahedronGeometry(1.7, 1).toNonIndexed();
  const gemPos = base.getAttribute('position').array as Float32Array;
  const out = new Float32Array(gemPos.length);
  const faceCount = gemPos.length / 9;

  // Face centroids + quantile bucketing by centroid X (stable sort on x, then index).
  const centroids: { f: number; cx: number; cy: number; cz: number }[] = [];
  for (let f = 0; f < gemPos.length; f += 9) {
    centroids.push({
      f,
      cx: (gemPos[f] + gemPos[f + 3] + gemPos[f + 6]) / 3,
      cy: (gemPos[f + 1] + gemPos[f + 4] + gemPos[f + 7]) / 3,
      cz: (gemPos[f + 2] + gemPos[f + 5] + gemPos[f + 8]) / 3,
    });
  }
  const sorted = [...centroids].sort((a, b) => a.cx - b.cx || a.f - b.f);
  const columnOf = new Map<number, number>();
  sorted.forEach((c, rank) => {
    columnOf.set(c.f, Math.min(4, Math.floor((rank * 5) / faceCount)));
  });

  // Per-column centroid-y range so the remap fills [-1.2, -1.2 + height] fully.
  const minCy = [Infinity, Infinity, Infinity, Infinity, Infinity];
  const maxCy = [-Infinity, -Infinity, -Infinity, -Infinity, -Infinity];
  for (const c of centroids) {
    const col = columnOf.get(c.f)!;
    minCy[col] = Math.min(minCy[col], c.cy);
    maxCy[col] = Math.max(maxCy[col], c.cy);
  }

  for (const c of centroids) {
    const col = columnOf.get(c.f)!;
    const span = maxCy[col] - minCy[col] || 1;
    const yNorm = (c.cy - minCy[col]) / span;
    const jitter = (pseudoNoise(c.cx, c.cy, c.cz) - 0.5) * 2 * GROWTH_JITTER;
    const sx = GROWTH_COLUMN_X[col] + jitter;
    const sy = GROWTH_BASE_Y + yNorm * GROWTH_HEIGHTS[col];
    const sz = c.cz * GROWTH_Z_SQUASH;
    for (let v = 0; v < 9; v += 3) {
      out[c.f + v] = sx + (gemPos[c.f + v] - c.cx) * GROWTH_SHRINK;
      out[c.f + v + 1] = sy + (gemPos[c.f + v + 1] - c.cy) * GROWTH_SHRINK;
      out[c.f + v + 2] = sz + (gemPos[c.f + v + 2] - c.cz) * GROWTH_SHRINK;
    }
  }
  base.dispose();

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(out, 3));
  geo.computeVertexNormals();
  return geo;
}

/* ------------------------------------------------------------------ */
/* The cast                                                            */
/* ------------------------------------------------------------------ */

export function buildShapes(): Record<ShapeName, BuiltShape> {
  // 1. ico — piedra en bruto (hero)
  const icoGeo = new THREE.IcosahedronGeometry(1.62, 1);
  const icoMat = new THREE.MeshStandardMaterial({
    color: 0xc10e35, flatShading: true, metalness: 0.38, roughness: 0.34,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.add(mkEdges(icoGeo, 0x7e0a23, 0.35));

  // 2. octa — diamante tallado
  const octaGeo = new THREE.OctahedronGeometry(1.5, 0);
  octaGeo.scale(1, 1.32, 1);
  const octaMat = new THREE.MeshStandardMaterial({
    color: 0xc10e35, flatShading: true, metalness: 0.55, roughness: 0.22,
  });
  const octa = new THREE.Mesh(octaGeo, octaMat);
  octa.add(mkEdges(octaGeo, 0xc2a05c, 0.55));

  // 3. sphere — esfera pulida (smooth: no flatShading, no edges)
  const sphGeo = new THREE.IcosahedronGeometry(1.42, 3);
  const sphMat = new THREE.MeshStandardMaterial({
    color: 0xc10e35, metalness: 0.72, roughness: 0.14,
  });
  const sphere = new THREE.Mesh(sphGeo, sphMat);

  // 4. knot — nudo de ingeniería
  const knotGeo = new THREE.TorusKnotGeometry(0.92, 0.27, 160, 24);
  const knotMat = new THREE.MeshStandardMaterial({
    color: 0xc2a05c, metalness: 0.9, roughness: 0.26,
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);

  // 5. crown — joya de la corona. The pulsing emissive intensity
  // (0.18 + w * (0.3 + sin(t*2.2) * 0.16)) is driven in the rig's loop.
  const crownGeo = new THREE.IcosahedronGeometry(1.62, 1);
  const crownMat = new THREE.MeshStandardMaterial({
    color: 0xe8b765, flatShading: true, metalness: 0.85, roughness: 0.3,
    emissive: new THREE.Color(0xc10e35), emissiveIntensity: 0.25,
  });
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.add(mkEdges(crownGeo, 0xf2c879, 0.5));

  // 6. growth — our chapter shape: crimson flatShading like ico, gold edges.
  const growthGeo = buildGrowthGeometry();
  const growthMat = new THREE.MeshStandardMaterial({
    color: 0xc10e35, flatShading: true, metalness: 0.38, roughness: 0.34,
  });
  const growth = new THREE.Mesh(growthGeo, growthMat);
  growth.add(mkEdges(growthGeo, 0xc2a05c, 0.45));

  return {
    ico: { mesh: ico, material: icoMat },
    octa: { mesh: octa, material: octaMat },
    sphere: { mesh: sphere, material: sphMat },
    knot: { mesh: knot, material: knotMat },
    crown: { mesh: crown, material: crownMat },
    growth: { mesh: growth, material: growthMat },
  };
}

export const SHAPE_NAMES: ShapeName[] = ['ico', 'octa', 'sphere', 'knot', 'crown', 'growth'];
