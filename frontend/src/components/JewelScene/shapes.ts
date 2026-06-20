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
  mesh: THREE.Object3D;
  /** Crown material exposed for the rig's pulsing-emissive formula. */
  material: THREE.Material;
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

// Rough crystalline stone: detail-1 icosahedron with deterministic per-vertex
// radial displacement (no Math.random — geometry identical across loads).
function buildStoneGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1.7, 1).toNonIndexed();
  const pos = geo.getAttribute('position').array as Float32Array;
  for (let i = 0; i < pos.length; i += 3) {
    const x = pos[i], y = pos[i + 1], z = pos[i + 2];
    const d = 0.78 + pseudoNoise(x, y, z) * 0.34; // radial scale 0.78..1.12
    pos[i] = x * d; pos[i + 1] = y * d; pos[i + 2] = z * d;
  }
  geo.computeVertexNormals();
  return geo;
}

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
/* neural — gold instanced node-spheres on a sphere shell + crimson    */
/* edge lines to each node's two nearest neighbours. Deterministic     */
/* Fibonacci-sphere placement (no Math.random).                        */
/* ------------------------------------------------------------------ */

function buildNeural(): { group: THREE.Group; material: THREE.Material } {
  const N = 12;
  const R = 1.3;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < N; i++) {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / N);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    pts.push(new THREE.Vector3(
      R * Math.sin(phi) * Math.cos(theta),
      R * Math.sin(phi) * Math.sin(theta),
      R * Math.cos(phi),
    ));
  }
  const nodeMat = new THREE.MeshStandardMaterial({
    color: 0xe6b964, metalness: 0.6, roughness: 0.3,
    emissive: new THREE.Color(0x7e0a23), emissiveIntensity: 0.15,
  });
  const nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 12, 12), nodeMat, N);
  const m = new THREE.Matrix4();
  pts.forEach((v, i) => { m.makeTranslation(v.x, v.y, v.z); nodes.setMatrixAt(i, m); });
  nodes.instanceMatrix.needsUpdate = true;

  const linePos: number[] = [];
  pts.forEach((p, i) => {
    const near = pts
      .map((q, j) => ({ j, d: p.distanceTo(q) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2);
    for (const { j } of near) {
      linePos.push(p.x, p.y, p.z, pts[j].x, pts[j].y, pts[j].z);
    }
  });
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  const edges = new THREE.LineSegments(
    lineGeo,
    new THREE.LineBasicMaterial({ color: 0xc10e35, transparent: true, opacity: 0.6 }),
  );

  const group = new THREE.Group();
  group.add(nodes);
  group.add(edges);
  return { group, material: nodeMat };
}

/* ------------------------------------------------------------------ */
/* crown — open cylinder band + radial cone spikes + crimson set-jewels */
/* The band's gold material carries the emissive the rig pulses.        */
/* ------------------------------------------------------------------ */

function buildCrown(): { group: THREE.Group; material: THREE.MeshStandardMaterial } {
  const SPIKES = 8;
  const RING = 1.0;
  const gold = new THREE.MeshStandardMaterial({
    color: 0xe8b765, metalness: 0.85, roughness: 0.3, flatShading: true,
    emissive: new THREE.Color(0xc10e35), emissiveIntensity: 0.25,
  });
  const jewelMat = new THREE.MeshStandardMaterial({ color: 0xc10e35, metalness: 0.4, roughness: 0.2 });
  const group = new THREE.Group();
  group.add(new THREE.Mesh(new THREE.CylinderGeometry(RING, RING, 0.8, 12, 1, true), gold)); // band
  for (let i = 0; i < SPIKES; i++) {
    const a = (i / SPIKES) * Math.PI * 2;
    const x = Math.cos(a) * RING, z = Math.sin(a) * RING;
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.8, 4), gold);
    spike.position.set(x, 0.6, z);
    group.add(spike);
    const jewel = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), jewelMat);
    jewel.position.set(x, 1.05, z);
    group.add(jewel);
  }
  return { group, material: gold };
}

/* ------------------------------------------------------------------ */
/* The cast                                                            */
/* ------------------------------------------------------------------ */

export function buildShapes(): Record<ShapeName, BuiltShape> {
  // 1. ico — piedra en bruto (hero): roughened crystal
  const icoGeo = buildStoneGeometry();
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

  // 5. crown — joya de la corona: real faceted crown. The pulsing emissive
  // (0.18 + w * (0.3 + sin(t*2.2) * 0.16)) is driven in the rig's loop.
  const crownBuilt = buildCrown();

  // 6. growth — our chapter shape: crimson flatShading like ico, gold edges.
  const growthGeo = buildGrowthGeometry();
  const growthMat = new THREE.MeshStandardMaterial({
    color: 0xc10e35, flatShading: true, metalness: 0.38, roughness: 0.34,
  });
  const growth = new THREE.Mesh(growthGeo, growthMat);
  growth.add(mkEdges(growthGeo, 0xc2a05c, 0.45));

  // 7. neural — gold instanced node-spheres + crimson edge lines (see buildNeural).
  const neural = buildNeural();

  return {
    ico: { mesh: ico, material: icoMat },
    octa: { mesh: octa, material: octaMat },
    sphere: { mesh: sphere, material: sphMat },
    knot: { mesh: knot, material: knotMat },
    crown: { mesh: crownBuilt.group, material: crownBuilt.material },
    growth: { mesh: growth, material: growthMat },
    neural: { mesh: neural.group, material: neural.material },
  };
}

export const SHAPE_NAMES: ShapeName[] = ['ico', 'octa', 'sphere', 'knot', 'crown', 'growth', 'neural'];
