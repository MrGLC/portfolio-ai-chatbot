import { useReducedMotion } from 'framer-motion';
import { variants } from './animations';

export type MotionVariant = {
  initial?: Record<string, unknown>;
  animate?: Record<string, unknown>;
  exit?: Record<string, unknown>;
  transition?: Record<string, unknown>;
};

// Collapse any entrance/exit to an instant, transform-free cut so motion-sensitive
// users get no movement — only the final composed layout.
export function neutralizeVariant(_v: MotionVariant): MotionVariant {
  return {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 1 },
    transition: { duration: 0 },
  };
}

export function resolveVariant(v: MotionVariant, reduced: boolean): MotionVariant {
  return reduced ? neutralizeVariant(v) : v;
}

// Hook for components: returns the reduced flag + a getter that yields a named
// base variant already resolved for the current motion preference.
export function useMotion() {
  const reduced = !!useReducedMotion();
  return {
    reduced,
    variant: (name: keyof typeof variants) =>
      resolveVariant(variants[name] as MotionVariant, reduced),
  };
}
