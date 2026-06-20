import { describe, it, expect } from 'vitest';
import { resolvePose, activeBeat, BEAT_IDS } from '../components/JewelScene/storyTimeline';

describe('storyTimeline', () => {
  it('beat0 at progress 0: stone dominant, anchored right', () => {
    const p = resolvePose(0);
    expect(p.weights.ico).toBeCloseTo(1);
    expect(p.x).toBeGreaterThanOrEqual(0.7); // anchored right
    expect(p.beat).toBe(0);
  });
  it('beat3 at progress 1: crown dominant, centered, largest', () => {
    const p = resolvePose(1);
    expect(p.weights.crown).toBeCloseTo(1);
    expect(p.x).toBeGreaterThan(0.42);
    expect(p.x).toBeLessThan(0.58); // centered
    expect(p.s).toBeGreaterThan(resolvePose(0).s); // climax is larger
    expect(p.beat).toBe(3);
  });
  it('midway between two beats blends weights and interpolates position', () => {
    const p = resolvePose(1 / 6); // halfway through segment 0→1
    expect(p.weights.ico).toBeGreaterThan(0);
    expect(p.weights.neural).toBeGreaterThan(0);
    expect(p.weights.ico + p.weights.neural).toBeCloseTo(1);
  });
  it('clamps out-of-range progress', () => {
    expect(resolvePose(-1).beat).toBe(0);
    expect(resolvePose(2).beat).toBe(3);
  });
  it('mobile variants differ from desktop', () => {
    expect(resolvePose(0, true).x).not.toBe(resolvePose(0, false).x);
  });
  it('activeBeat is the nearest stop index; BEAT_IDS has 4 ids', () => {
    expect(BEAT_IDS).toHaveLength(4);
    expect(activeBeat(0)).toBe(0);
    expect(activeBeat(0.5)).toBe(2);
    expect(activeBeat(1)).toBe(3);
  });
});
