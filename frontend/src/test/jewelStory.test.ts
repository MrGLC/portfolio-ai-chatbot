import { describe, it, expect, vi } from 'vitest';
import { JewelStoryController } from '../components/JewelScene/useJewelStory';

describe('JewelStoryController', () => {
  it('starts on gem with progress 0', () => {
    const c = new JewelStoryController();
    expect(c.state).toEqual({ from: 'gem', to: 'gem', progress: 0 });
  });

  it('setTarget sets to-target and resets progress', () => {
    const c = new JewelStoryController();
    c.setTarget('gemBreath');
    expect(c.state.to).toBe('gemBreath');
    expect(c.state.progress).toBe(0);
  });

  it('setProgress clamps 0..1 and promotes at 1', () => {
    const c = new JewelStoryController();
    c.setTarget('gemBreath');
    c.setProgress(1.7);
    expect(c.state).toEqual({ from: 'gemBreath', to: 'gemBreath', progress: 0 });
    c.setProgress(-3);
    expect(c.state.progress).toBe(0);
  });

  it('notifies subscribers on every change and on pulse', () => {
    const c = new JewelStoryController();
    const fn = vi.fn();
    c.subscribe(fn);
    c.setTarget('gemBreath');
    c.setProgress(0.5);
    c.pulse();
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn.mock.calls[2][0]).toBe('pulse');
  });

  it('unsubscribe stops notifications', () => {
    const c = new JewelStoryController();
    const fn = vi.fn();
    const off = c.subscribe(fn);
    off();
    c.pulse();
    expect(fn).not.toHaveBeenCalled();
  });
});
