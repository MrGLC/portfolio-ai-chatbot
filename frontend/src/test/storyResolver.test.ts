import { describe, it, expect } from 'vitest';
import { resolveStoryFrame, STORY_SECTIONS } from '../components/JewelScene/storyResolver';

// sections: hero 0-2000, chatbot 2000-4000, portfolio 4000-6000, cta 6000-7000; viewport 800
const ranges = [
  { id: 'story-hero', top: 0, bottom: 2000 },
  { id: 'story-chatbot', top: 2000, bottom: 4000 },
  { id: 'story-portfolio', top: 4000, bottom: 6000 },
  { id: 'story-cta', top: 6000, bottom: 7000 },
];

describe('resolveStoryFrame', () => {
  it('exposes the section→target map', () => {
    expect(STORY_SECTIONS).toEqual({
      'story-hero': 'gem',
      'story-chatbot': 'neural',
      'story-portfolio': 'lattice',
      'story-cta': 'gem',
    });
  });
  it('deep inside hero: pure gem, progress 0', () => {
    const f = resolveStoryFrame(100, ranges, 800, false);
    expect(f.from).toBe('gem'); expect(f.to).toBe('gem'); expect(f.progress).toBe(0);
  });
  it('mid-blend between hero and chatbot', () => {
    // boundary at 2000; blend zone = ±0.2*viewport (160px); center of viewport at boundary → scrollY = 2000-400=1600
    const f = resolveStoryFrame(1600, ranges, 800, false);
    expect(f.from).toBe('gem'); expect(f.to).toBe('neural');
    expect(f.progress).toBeGreaterThan(0.4); expect(f.progress).toBeLessThan(0.6);
  });
  it('deep inside portfolio: lattice settled', () => {
    const f = resolveStoryFrame(4600, ranges, 800, false);
    expect(f.from).toBe('lattice'); expect(f.to).toBe('lattice'); expect(f.progress).toBe(0);
  });
  it('positions: hero right lane desktop, lower-center mobile', () => {
    const d = resolveStoryFrame(0, ranges, 800, false);
    expect(d.position[0]).toBeCloseTo(1.5, 1);
    const m = resolveStoryFrame(0, ranges, 800, true);
    expect(m.position[0]).toBeCloseTo(0, 1);
    expect(m.position[1]).toBeLessThan(-1.5);
  });
  it('chatbot section: left lane desktop, mobile center-offset', () => {
    const d = resolveStoryFrame(2800, ranges, 800, false);
    expect(d.position[0]).toBeLessThan(-1);
    const m = resolveStoryFrame(2800, ranges, 800, true);
    expect(Math.abs(m.position[0])).toBeLessThanOrEqual(0.8 + 1e-6);
  });
  it('clamps beyond last section to cta frame (tucked low-right, sub-hero scale)', () => {
    const f = resolveStoryFrame(99999, ranges, 800, false);
    expect(f.to).toBe('gem'); expect(f.scale).toBeCloseTo(0.75, 1);
    expect(f.position[1]).toBeLessThan(-0.5);
  });
});
