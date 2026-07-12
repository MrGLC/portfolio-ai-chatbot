// Pure math: DOM anchor rect (CSS px) → jewel pose in viewport-fraction space.
// Kept free of DOM/react imports so it unit-tests without jsdom gymnastics.
import { VIS_H } from './chapterResolver';

export const ANCHOR_NAMES = ['hero', 'chat', 'cta'] as const;
export type AnchorName = (typeof ANCHOR_NAMES)[number];

/** Jewel world diameter (2 × JEWEL_WORLD_RADIUS in JewelRig). */
export const JEWEL_WORLD_DIAMETER = 2.6;
/** Fill fraction: gem occupies 88% of the anchor's smaller dimension. */
const FILL = 0.88;

export interface RectLike { left: number; top: number; width: number; height: number }

export function rectToPose(rect: RectLike, viewW: number, viewH: number): { x: number; y: number; s: number } {
  if (rect.width <= 0 || rect.height <= 0 || viewW <= 0 || viewH <= 0) {
    return { x: 0.5, y: 0.5, s: 0 };
  }
  const x = (rect.left + rect.width / 2) / viewW;
  const y = (rect.top + rect.height / 2) / viewH;
  const smallerCssPx = Math.min(rect.width, rect.height);
  const worldSize = (smallerCssPx / viewH) * VIS_H;
  const s = (worldSize * FILL) / JEWEL_WORLD_DIAMETER;
  return { x, y, s };
}
