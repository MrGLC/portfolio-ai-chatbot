import { describe, it, expect } from 'vitest';
import { resolveChapter, KEYFRAMES, type SectionRange } from '../components/JewelScene/chapterResolver';

const ranges: SectionRange[] = [
  { id: 'story-hero', top: 0, bottom: 2000 },
  { id: 'story-chatbot', top: 2000, bottom: 4000 },
  { id: 'story-portfolio', top: 4000, bottom: 6000 },
  { id: 'story-cta', top: 6000, bottom: 7000 },
];

describe('resolveChapter', () => {
  it('keyframe table covers our four chapters with handoff fields', () => {
    for (const id of ['story-hero', 'story-chatbot', 'story-portfolio', 'story-cta']) {
      const k = KEYFRAMES[id];
      expect(k).toBeDefined();
      for (const f of ['x', 'y', 's', 'shape', 'spin', 'p', 'mx', 'my', 'ms'] as const) {
        expect(k).toHaveProperty(f);
      }
    }
    expect(KEYFRAMES['story-hero'].shape).toBe('ico');
    expect(KEYFRAMES['story-chatbot'].shape).toBe('knot');
    expect(KEYFRAMES['story-portfolio'].shape).toBe('growth');
    expect(KEYFRAMES['story-cta'].shape).toBe('crown');
  });
  it('picks the section whose center is nearest the viewport center', () => {
    expect(resolveChapter(100, ranges, 800).id).toBe('story-hero');     // probe 500 → hero center 1000 closest
    expect(resolveChapter(2600, ranges, 800).id).toBe('story-chatbot'); // probe 3000 = chatbot center
    expect(resolveChapter(9999, ranges, 800).id).toBe('story-cta');     // beyond end clamps to last
  });
  it('boundary: exactly between two centers picks the later (>=)', () => {
    // hero center 1000, chatbot center 3000 → midpoint probe 2000 → scrollY 1600
    expect(resolveChapter(1600, ranges, 800).id).toBe('story-chatbot');
  });
  it('returns desktop vs mobile fractions', () => {
    const d = resolveChapter(100, ranges, 800, false);
    const m = resolveChapter(100, ranges, 800, true);
    expect(d.kf.x).not.toBe(m.kf.x); // hero: x .72 desktop vs .50 mobile
    expect(m.kf.x).toBe(KEYFRAMES['story-hero'].mx);
  });
});
