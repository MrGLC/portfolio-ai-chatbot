// Unified animation configuration for consistent, smooth animations across the app

// Standard easing functions
export const easings = {
  // Smooth acceleration and deceleration - best for most animations
  smooth: [0.4, 0, 0.2, 1] as const,
  // Quick start, slow end - good for enter animations
  easeOut: [0, 0, 0.2, 1] as const,
  // Slow start, quick end - good for exit animations
  easeIn: [0.4, 0, 1, 1] as const,
  // Gentle bounce - for playful micro-interactions
  bounce: [0.68, -0.25, 0.32, 1.25] as const,
  // Spring-like motion
  spring: [0.43, 0.13, 0.23, 0.96] as const,
} as const;

// Standard duration values (in seconds)
export const durations = {
  // Instant feedback (hover states, active states)
  instant: 0.1,
  // Quick micro-interactions (buttons, small hovers)
  fast: 0.2,
  // Standard transitions (most UI elements)
  normal: 0.3,
  // Deliberate animations (page transitions, modals)
  slow: 0.5,
  // Major transitions (hero animations, page loads)
  slower: 0.8,
} as const;

// Animation delay values for staggered effects
export const delays = {
  // Tight stagger for related items
  stagger: 0.05,
  // Standard stagger for lists
  staggerNormal: 0.1,
  // Relaxed stagger for emphasis
  staggerSlow: 0.15,
} as const;

// Framer Motion animation variants
export const variants = {
  // Page-level fade in animations
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: durations.slow, ease: easings.smooth },
  },

  // Hero section animations
  heroFadeIn: {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: durations.slower, ease: easings.smooth },
  },

  // Standard fade in up animation
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: durations.normal, ease: easings.smooth },
  },

  // Quick fade in for UI elements
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: durations.fast, ease: easings.smooth },
  },

  // Card hover animation
  cardHover: {
    rest: { y: 0, scale: 1 },
    hover: { y: -8, scale: 1.02 },
    transition: { duration: durations.normal, ease: easings.smooth },
  },

  // Button interactions
  buttonHover: {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
    transition: { duration: durations.fast, ease: easings.smooth },
  },

  // Stagger container for lists
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: delays.staggerNormal,
      },
    },
  },

  // Slide animations
  slideInLeft: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: durations.normal, ease: easings.smooth },
  },

  slideInRight: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: durations.normal, ease: easings.smooth },
  },

  // Scale animations for modals/popups
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
    transition: { duration: durations.fast, ease: easings.smooth },
  },

  // Smooth scale for widgets
  widgetOpen: {
    initial: { opacity: 0, scale: 0.95, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 10 },
    transition: { duration: durations.normal, ease: easings.smooth },
  },
};

// CSS transition strings for non-Framer components
export const transitions = {
  // Base transitions
  fast: `all ${durations.fast}s cubic-bezier(${easings.smooth.join(',')})`,
  normal: `all ${durations.normal}s cubic-bezier(${easings.smooth.join(',')})`,
  slow: `all ${durations.slow}s cubic-bezier(${easings.smooth.join(',')})`,
  
  // Specific property transitions (more performant)
  opacity: `opacity ${durations.fast}s cubic-bezier(${easings.smooth.join(',')})`,
  transform: `transform ${durations.normal}s cubic-bezier(${easings.smooth.join(',')})`,
  transformFast: `transform ${durations.fast}s cubic-bezier(${easings.smooth.join(',')})`,
  colors: `background-color ${durations.fast}s cubic-bezier(${easings.smooth.join(',')}), color ${durations.fast}s cubic-bezier(${easings.smooth.join(',')}), border-color ${durations.fast}s cubic-bezier(${easings.smooth.join(',')})`,
};

// Spring configurations for physics-based animations
export const springs = {
  // Gentle spring for smooth motion
  gentle: { type: "spring", stiffness: 100, damping: 15 },
  // Snappy spring for responsive feedback
  snappy: { type: "spring", stiffness: 300, damping: 30 },
  // Bouncy spring for playful elements
  bouncy: { type: "spring", stiffness: 400, damping: 10 },
  // Stiff spring for quick responses
  stiff: { type: "spring", stiffness: 500, damping: 40 },
};

// Helper function to create consistent hover animations
export const createHoverAnimation = (
  translateY = -4,
  scale = 1.01,
  duration = durations.normal
) => ({
  whileHover: {
    y: translateY,
    scale,
    transition: { duration, ease: easings.smooth },
  },
  whileTap: {
    scale: scale * 0.98,
    transition: { duration: durations.instant },
  },
});

// Helper for staggered children animations
export const createStaggerAnimation = (
  staggerDelay: number = delays.staggerNormal,
  childVariant: any = variants.fadeInUp
) => ({
  parent: {
    animate: {
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  },
  child: childVariant,
});