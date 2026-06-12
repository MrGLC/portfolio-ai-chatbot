import type { TargetName } from './morphTargets';

export interface SectionRange { id: string; top: number; bottom: number; }
export interface StoryFrame {
  from: TargetName; to: TargetName; progress: number;
  position: [number, number, number]; scale: number;
  /** sin(e·π) across a blend — 0 settled, peaks 1 mid-transition (rotation flourish). */
  flourish: number;
}

export const STORY_SECTIONS: Record<string, TargetName> = {
  'story-hero': 'gem',
  'story-chatbot': 'neural',
  'story-portfolio': 'growth',
  'story-cta': 'gem',
};

interface Keyframe { target: TargetName; pos: [number, number, number]; mobilePos: [number, number, number]; scale: number; mobileScale: number; }

const KEYFRAMES: Record<string, Keyframe> = {
  'story-hero':      { target: 'gem',     pos: [1.5, 0, 0],    mobilePos: [0, -2.05, 0],  scale: 1,   mobileScale: 0.8 },
  'story-chatbot':   { target: 'neural',  pos: [-2.2, 0, 0],   mobilePos: [-0.8, -1.6, 0], scale: 0.7, mobileScale: 0.55 },
  'story-portfolio': { target: 'growth',  pos: [2.2, 0, 0],    mobilePos: [0.8, -1.6, 0],  scale: 0.8, mobileScale: 0.6 },
  // cta: low-right beside the centered copy (doesn't cover the buttons), but
  // the NARRATIVE payoff is "transformed business" — the closing gem must beat
  // the hero gem visually: scale 1.0 + z 1.5 pulls it toward the camera so it
  // reads bigger than the hero's scale-1-at-z0 without swallowing the CTA.
  'story-cta':       { target: 'gem',     pos: [2.1, -1.4, 1.5], mobilePos: [0, -3.0, 0],  scale: 1.0, mobileScale: 0.45 },
};

const BLEND = 0.2; // fraction of viewport height on EACH side of a boundary

export function resolveStoryFrame(
  scrollY: number, ranges: SectionRange[], viewportH: number, mobile: boolean
): StoryFrame {
  const probe = scrollY + viewportH / 2;
  const zone = BLEND * viewportH;
  // Curved purposeful motion: position travels a quadratic bezier whose control
  // point is the path midpoint lifted by [0, +1.2, +0.8] — an arc with a depth
  // swing toward the camera instead of a flat linear slide.
  const bezier3 = (a: number[], b: number[], e: number): [number, number, number] => {
    const c = [
      (a[0] + b[0]) / 2 + 0,
      (a[1] + b[1]) / 2 + 1.2,
      (a[2] + b[2]) / 2 + 0.8,
    ];
    const u = 1 - e;
    const w0 = u * u, w1 = 2 * u * e, w2 = e * e;
    return [
      w0 * a[0] + w1 * c[0] + w2 * b[0],
      w0 * a[1] + w1 * c[1] + w2 * b[1],
      w0 * a[2] + w1 * c[2] + w2 * b[2],
    ];
  };
  const kf = (id: string) => KEYFRAMES[id] ?? KEYFRAMES['story-hero'];
  const pick = (k: Keyframe) => ({ pos: mobile ? k.mobilePos : k.pos, scale: mobile ? k.mobileScale : k.scale });

  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    const next = ranges[i + 1];
    if (next && probe >= next.top - zone && probe <= next.top + zone) {
      // inside the blend window around the boundary between r and next
      const t = Math.min(1, Math.max(0, (probe - (next.top - zone)) / (2 * zone)));
      const e = t * t * (3 - 2 * t); // smoothstep ease — drives position/scale/morph
      const a = kf(r.id), b = kf(next.id);
      const pa = pick(a), pb = pick(b);
      return {
        from: a.target, to: b.target, progress: e,
        position: bezier3(pa.pos, pb.pos, e),
        scale: pa.scale + (pb.scale - pa.scale) * e,
        flourish: Math.sin(e * Math.PI), // 0→1→0, peaks mid-transition
      };
    }
    if (probe >= r.top && probe < r.bottom) {
      const k = kf(r.id); const p = pick(k);
      return { from: k.target, to: k.target, progress: 0, position: [...p.pos] as [number, number, number], scale: p.scale, flourish: 0 };
    }
  }
  const last = kf(ranges[ranges.length - 1]?.id ?? 'story-cta'); const p = pick(last);
  return { from: last.target, to: last.target, progress: 0, position: [...p.pos] as [number, number, number], scale: p.scale, flourish: 0 };
}
