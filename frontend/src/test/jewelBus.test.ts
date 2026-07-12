import { describe, it, expect, vi } from 'vitest';
import { jewelBus } from '../components/JewelScene/jewelBus';

describe('jewelBus', () => {
  it('starts idle and stores the latest activity', () => {
    expect(jewelBus.get()).toBe('idle');
    jewelBus.set('thinking');
    expect(jewelBus.get()).toBe('thinking');
    jewelBus.set('idle');
  });

  it('notifies subscribers on change only, and unsubscribes cleanly', () => {
    const fn = vi.fn();
    const off = jewelBus.subscribe(fn);
    jewelBus.set('answering');
    jewelBus.set('answering'); // same value → no second call
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('answering');
    off();
    jewelBus.set('idle');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
