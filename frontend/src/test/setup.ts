import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// three.js needs WebGL; jsdom has none — stub the canvas context
HTMLCanvasElement.prototype.getContext = vi.fn() as never;

// jsdom lacks matchMedia (Chakra color-mode uses it)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// jsdom lacks IntersectionObserver/ResizeObserver (framer-motion, Chakra)
class MockObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
(globalThis as never as Record<string, unknown>).IntersectionObserver = MockObserver;
(globalThis as never as Record<string, unknown>).ResizeObserver = MockObserver;
