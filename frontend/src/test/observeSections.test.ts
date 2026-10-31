import { describe, it, expect, vi, afterEach } from 'vitest';
import { observeSections } from '../components/JewelScene/observeSections';

const original = globalThis.ResizeObserver;
afterEach(() => {
  globalThis.ResizeObserver = original;
  document.body.innerHTML = '';
});

describe('observeSections', () => {
  it('observes existing sections, re-measures on change, disconnects on cleanup', () => {
    document.body.innerHTML = '<div id="a"></div><div id="b"></div>';
    let trigger: () => void = () => {};
    const observe = vi.fn();
    const disconnect = vi.fn();
    globalThis.ResizeObserver = class {
      constructor(cb: () => void) { trigger = cb; }
      observe = observe;
      disconnect = disconnect;
      unobserve = vi.fn();
    } as never;
    const measure = vi.fn();
    const stop = observeSections(['a', 'missing', 'b'], measure);
    expect(observe).toHaveBeenCalledTimes(2);
    trigger();
    expect(measure).toHaveBeenCalledTimes(1);
    stop();
    expect(disconnect).toHaveBeenCalled();
  });
});
