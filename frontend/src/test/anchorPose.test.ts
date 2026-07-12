import { describe, it, expect } from 'vitest';
import { rectToPose } from '../components/JewelScene/anchorPose';
import { VIS_H } from '../components/JewelScene/chapterResolver';

describe('rectToPose', () => {
  const view = { w: 1920, h: 1080 };

  it('centers the pose on the rect center, in viewport fractions', () => {
    const pose = rectToPose({ left: 960, top: 270, width: 480, height: 540 }, view.w, view.h);
    expect(pose.x).toBeCloseTo((960 + 240) / 1920); // 0.625
    expect(pose.y).toBeCloseTo((270 + 270) / 1080); // 0.5
  });

  it('scales the 2.6-world-unit jewel to 88% of the smaller rect dimension', () => {
    const rect = { left: 0, top: 0, width: 480, height: 540 };
    const pose = rectToPose(rect, view.w, view.h);
    // smaller dim = 480 CSS px → world units: (480/1080)*VIS_H; jewel dia 2.6
    const expected = ((480 / 1080) * VIS_H * 0.88) / 2.6;
    expect(pose.s).toBeCloseTo(expected, 5);
  });

  it('clamps degenerate rects to s=0 (treated as missing upstream)', () => {
    expect(rectToPose({ left: 0, top: 0, width: 0, height: 100 }, view.w, view.h).s).toBe(0);
  });
});
