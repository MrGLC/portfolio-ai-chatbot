import type { TargetName } from './morphTargets';

export interface SectionRange { id: string; top: number; bottom: number; }
export interface StoryFrame {
  from: TargetName; to: TargetName; progress: number;
  position: [number, number, number]; scale: number;
}

export const STORY_SECTIONS: Record<string, TargetName> = {
  'story-hero': 'gem',
  'story-chatbot': 'neural',
  'story-portfolio': 'lattice',
  'story-cta': 'gem',
};

interface Keyframe { target: TargetName; pos: [number, number, number]; mobilePos: [number, number, number]; scale: number; mobileScale: number; }

const KEYFRAMES: Record<string, Keyframe> = {
  'story-hero':      { target: 'gem',     pos: [1.5, 0, 0],    mobilePos: [0, -2.05, 0],  scale: 1,   mobileScale: 0.8 },
  'story-chatbot':   { target: 'neural',  pos: [-2.2, 0, 0],   mobilePos: [-0.8, -1.6, 0], scale: 0.7, mobileScale: 0.55 },
  'story-portfolio': { target: 'lattice', pos: [2.2, 0, 0],    mobilePos: [0.8, -1.6, 0],  scale: 0.8, mobileScale: 0.6 },
  // cta: tucked low-right and under heading scale so the gem reads as a
  // closing accent beside the centered copy instead of swallowing it (and
  // ducks behind the opaque footer sooner once the user scrolls past).
  'story-cta':       { target: 'gem',     pos: [1.4, -0.9, 0], mobilePos: [0, -3.0, 0],    scale: 0.85, mobileScale: 0.45 },
};

const BLEND = 0.2; // fraction of viewport height on EACH side of a boundary

export function resolveStoryFrame(
  scrollY: number, ranges: SectionRange[], viewportH: number, mobile: boolean
): StoryFrame {
  const probe = scrollY + viewportH / 2;
  const zone = BLEND * viewportH;
  const lerp3 = (a: number[], b: number[], t: number): [number, number, number] =>
    [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const kf = (id: string) => KEYFRAMES[id] ?? KEYFRAMES['story-hero'];
  const pick = (k: Keyframe) => ({ pos: mobile ? k.mobilePos : k.pos, scale: mobile ? k.mobileScale : k.scale });

  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    const next = ranges[i + 1];
    if (next && probe >= next.top - zone && probe <= next.top + zone) {
      // inside the blend window around the boundary between r and next
      const t = (probe - (next.top - zone)) / (2 * zone);
      const a = kf(r.id), b = kf(next.id);
      const pa = pick(a), pb = pick(b);
      return {
        from: a.target, to: b.target, progress: Math.min(1, Math.max(0, t)),
        position: lerp3(pa.pos, pb.pos, t),
        scale: pa.scale + (pb.scale - pa.scale) * t,
      };
    }
    if (probe >= r.top && probe < r.bottom) {
      const k = kf(r.id); const p = pick(k);
      return { from: k.target, to: k.target, progress: 0, position: [...p.pos] as [number, number, number], scale: p.scale };
    }
  }
  const last = kf(ranges[ranges.length - 1]?.id ?? 'story-cta'); const p = pick(last);
  return { from: last.target, to: last.target, progress: 0, position: [...p.pos] as [number, number, number], scale: p.scale };
}
