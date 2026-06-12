export interface SectionRange { id: string; top: number; bottom: number; }
export type ShapeName = 'ico' | 'octa' | 'sphere' | 'knot' | 'crown' | 'growth';

export interface Keyframe {
  x: number; y: number; s: number;        // viewport fractions + scale (desktop)
  shape: ShapeName; spin: number; p: number; // rest spin rad/s, particle target opacity
  mx: number; my: number; ms: number;     // mobile overrides
}

// Adapted from the handoff's 7-chapter table to our 4 Home chapters.
// Story: raw stone (potential) -> engineering knot (AI mind) -> growth columns
// (results) -> glowing crown (transformed business).
export const KEYFRAMES: Record<string, Keyframe> = {
  'story-hero':      { x: 0.72, y: 0.47, s: 1.00, shape: 'ico',    spin: 0.30, p: 0.50, mx: 0.50, my: 0.74, ms: 0.60 },
  'story-chatbot':   { x: 0.12, y: 0.42, s: 0.50, shape: 'knot',   spin: 0.55, p: 0.00, mx: 0.16, my: 0.08, ms: 0.26 },
  'story-portfolio': { x: 0.88, y: 0.40, s: 0.45, shape: 'growth', spin: 0.35, p: 0.00, mx: 0.86, my: 0.08, ms: 0.24 },
  'story-cta':       { x: 0.70, y: 0.45, s: 0.55, shape: 'crown',  spin: 0.35, p: 0.75, mx: 0.50, my: 0.10, ms: 0.32 },
};

export interface ChapterPick { id: string; kf: { x: number; y: number; s: number; shape: ShapeName; spin: number; p: number }; }

export function resolveChapter(
  scrollY: number, ranges: SectionRange[], viewportH: number, mobile = false
): ChapterPick {
  const probe = scrollY + viewportH / 2;
  let best = ranges[0], bestDist = Infinity;
  for (const r of ranges) {
    const center = (r.top + r.bottom) / 2;
    const d = Math.abs(probe - center);
    if (d <= bestDist) { best = r; bestDist = d; } // <= so later section wins ties
  }
  const k = KEYFRAMES[best.id] ?? KEYFRAMES['story-hero'];
  return {
    id: best.id,
    kf: mobile
      ? { x: k.mx, y: k.my, s: k.ms, shape: k.shape, spin: k.spin, p: k.p }
      : { x: k.x, y: k.y, s: k.s, shape: k.shape, spin: k.spin, p: k.p },
  };
}

/* ------------------------------------------------------------------ */
/* Fraction <-> world conversion (camera fov 42, z 5)                  */
/*                                                                     */
/* The dash engine eases position in FRACTION space (the handoff's     */
/* formulas — dist, kDash, shrink — are all specified in viewport      */
/* fractions). These two helpers are the ONLY place the conversion     */
/* math lives; both the rig (fraction -> world each frame) and the     */
/* hit-proxy projection (world -> fraction -> px) use them, so the     */
/* units can never drift apart.                                        */
/* ------------------------------------------------------------------ */

export const CAMERA_FOV = 42;
export const CAMERA_Z = 5;
/** Visible world height at z=0: 2 * tan(fov/2) * cameraZ. */
export const VIS_H = 2 * Math.tan((CAMERA_FOV / 2) * (Math.PI / 180)) * CAMERA_Z;

/** Viewport fraction (x: 0=left..1=right, y: 0=top..1=bottom) -> world units at z=0. */
export function fractionToWorld(fx: number, fy: number, aspect: number): { x: number; y: number } {
  return { x: (fx - 0.5) * VIS_H * aspect, y: -(fy - 0.5) * VIS_H };
}

/** World units at z=0 -> viewport fraction. Exact inverse of fractionToWorld. */
export function worldToFraction(wx: number, wy: number, aspect: number): { fx: number; fy: number } {
  return { fx: wx / (VIS_H * aspect) + 0.5, fy: -wy / VIS_H + 0.5 };
}
