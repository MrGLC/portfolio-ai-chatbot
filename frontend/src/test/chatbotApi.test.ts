import { describe, it, expect, vi } from 'vitest';

// Capture the config each axios instance is created with.
const created = vi.hoisted(() => [] as Array<{ baseURL: string; timeout?: number }>);
vi.mock('axios', () => ({
  default: {
    create: (cfg: { baseURL: string; timeout?: number }) => {
      created.push(cfg);
      return { get: vi.fn(), post: vi.fn() };
    },
  },
}));

describe('chatbot API timeout', () => {
  it('sets a finite timeout on both the demo and provider clients', async () => {
    await import('../services/api');
    expect(created).toHaveLength(2);
    for (const cfg of created) {
      expect(cfg.timeout).toBeGreaterThan(0);
      expect(cfg.timeout).toBeLessThanOrEqual(30000);
    }
  });
});
