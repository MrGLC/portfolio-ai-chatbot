import type { ShapeName } from './chapterResolver';
import { SHAPE_NAMES } from './shapes';

export const BEAT_IDS = ['story-hero', 'story-chatbot', 'story-portfolio', 'story-cta'];

interface Stop {
  x: number; y: number; s: number; shape: ShapeName; spin: number; p: number;
  mx: number; my: number; ms: number; // mobile pose variants
}

// The approved choreography: anchored right for beats 0-1, migrating to centre
// and growing for beats 2-3 (crown climax). Sizes kept modest so the hero gem
// never overflows a 1080p viewport (the rig also applies a responsive vpScale);
// crown stays the largest as the payoff. Final values tuned on dev.
const STOPS: Stop[] = [
  { x: 0.78, y: 0.46, s: 0.62, shape: 'ico',    spin: 0.30, p: 0.50, mx: 0.50, my: 0.30, ms: 0.52 },
  { x: 0.78, y: 0.46, s: 0.58, shape: 'neural', spin: 0.45, p: 0.00, mx: 0.50, my: 0.30, ms: 0.50 },
  { x: 0.58, y: 0.52, s: 0.66, shape: 'growth', spin: 0.35, p: 0.10, mx: 0.50, my: 0.34, ms: 0.56 },
  { x: 0.50, y: 0.50, s: 0.82, shape: 'crown',  spin: 0.30, p: 0.80, mx: 0.50, my: 0.32, ms: 0.66 },
];

export interface Pose {
  x: number; y: number; s: number; spin: number; p: number;
  weights: Record<ShapeName, number>;
  beat: number;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function activeBeat(progress: number): number {
  return Math.round(clamp01(progress) * (STOPS.length - 1));
}

export function resolvePose(progress: number, mobile = false): Pose {
  const segs = STOPS.length - 1;          // 3 segments for 4 stops
  const g = clamp01(progress) * segs;
  const i = Math.min(segs - 1, Math.floor(g));
  const t = g - i;                         // 0..1 within the segment
  const a = STOPS[i], b = STOPS[i + 1];

  const weights = {} as Record<ShapeName, number>;
  for (const name of SHAPE_NAMES) weights[name] = 0;
  weights[a.shape] += 1 - t;
  weights[b.shape] += t;                   // same shape on both stops sums to 1

  return {
    x: lerp(mobile ? a.mx : a.x, mobile ? b.mx : b.x, t),
    y: lerp(mobile ? a.my : a.y, mobile ? b.my : b.y, t),
    s: lerp(mobile ? a.ms : a.s, mobile ? b.ms : b.s, t),
    spin: lerp(a.spin, b.spin, t),
    p: lerp(a.p, b.p, t),
    weights,
    beat: activeBeat(progress),
  };
}
