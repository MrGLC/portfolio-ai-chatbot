# Portfolio AI Chatbot Design System

This document defines the comprehensive design system for the portfolio AI chatbot application, extracted from the existing implementation and aligned with the project's design principles.

## Design Philosophy

The design embraces a **perfect balance between minimalism and functionality**, prioritizing simplicity while maintaining high usability. The interface features clean layouts with purposeful elements, soft refreshing gradients, ample whitespace, clear information hierarchy, refined corners, and delicate micro-interactions.

## Color Palette (60-30-10 Rule)

### Primary Colors
```css
/* Dominant Neutral (≈60%) - Main backgrounds */
--color-bg: #0D0E0E;           /* Tech Black - Primary background */
--color-bg-secondary: #1A1A1A; /* Charcoal - Secondary background */

/* Secondary Color (≈30%) - Surface elements */
--color-surface: #2A2A2A;      /* Surface Dark Gray - Cards/panels */
--color-surface-alt: #3A3A3A;  /* Alt Surface - Hover states */

/* Accent Colors (≈10%) - Interactive elements */
--color-accent: #00ABE4;       /* Bright Blue - Primary accent */
--color-accent-alt: #7ACFD6;   /* Cyan Blue - Secondary accent */
```

### Text Colors
```css
--color-text: #F0F0F0;              /* Off-White - Primary text */
--color-text-secondary: #B3B3B3;    /* Muted Gray - Secondary text */
--color-text-tertiary: #808080;     /* Dim Gray - Tertiary text */
--color-text-inverse: #0D0E0E;     /* Tech Black - For light backgrounds */
```

### Semantic Colors
```css
--color-success: #4CAF50;    /* Success green */
--color-warning: #FF9800;    /* Warning orange */
--color-error: #F44336;      /* Error red */
--color-info: #00ABE4;       /* Info blue (matches accent) */
```

### Gradients
```css
/* Primary gradient for CTAs and emphasis */
--gradient-primary: linear-gradient(90deg, #00ABE4, #7ACFD6);

/* Subtle background gradients */
--gradient-bg-subtle: linear-gradient(180deg, #0D0E0E 0%, #1A1A1A 100%);
--gradient-surface: linear-gradient(135deg, #2A2A2A 0%, #3A3A3A 100%);
```

## Typography System

### Font Family
```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Courier New', monospace;
```

### Font Sizes (Modular Scale)
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### Line Heights
```css
--leading-tight: 1.25;
--leading-normal: 1.5;   /* Default for body text */
--leading-relaxed: 1.75;
--leading-loose: 2;
```

### Typography Styles
```css
/* Headings */
.heading-hero {
  font-size: var(--text-4xl);
  font-weight: var(--font-extrabold);
  line-height: var(--leading-tight);
  margin-bottom: calc(var(--spacing-unit) * 3);
}

.heading-1 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  margin-bottom: calc(var(--spacing-unit) * 2);
}

.heading-2 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  margin-bottom: calc(var(--spacing-unit) * 1.5);
}

.heading-3 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-normal);
  margin-bottom: var(--spacing-unit);
}

/* Body Text */
.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  margin-bottom: calc(var(--spacing-unit) * 2);
}

.text-small {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}
```

## Spacing System (8px Grid)

```css
/* Base unit */
--spacing-unit: 8px;

/* Spacing scale */
--space-0: 0;
--space-1: 4px;      /* 0.5 × base */
--space-2: 8px;      /* 1 × base */
--space-3: 12px;     /* 1.5 × base */
--space-4: 16px;     /* 2 × base */
--space-5: 20px;     /* 2.5 × base */
--space-6: 24px;     /* 3 × base */
--space-8: 32px;     /* 4 × base */
--space-10: 40px;    /* 5 × base */
--space-12: 48px;    /* 6 × base */
--space-16: 64px;    /* 8 × base */
--space-20: 80px;    /* 10 × base */
--space-24: 96px;    /* 12 × base */
--space-32: 128px;   /* 16 × base */
--space-40: 160px;   /* 20 × base */
```

## Border Radius

```css
--radius-none: 0;
--radius-sm: 4px;
--radius-base: 6px;    /* Default for buttons, inputs */
--radius-md: 8px;      /* Cards, modals */
--radius-lg: 10px;     /* Large containers */
--radius-xl: 12px;     /* Extra large elements */
--radius-2xl: 16px;    /* Hero sections */
--radius-full: 9999px; /* Pills, circles */
```

## Shadow/Elevation System

```css
/* Elevation levels */
--shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
--shadow-base: 0 4px 8px rgba(0, 0, 0, 0.15);
--shadow-md: 0 6px 12px rgba(0, 0, 0, 0.2);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.25);
--shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.3);
--shadow-2xl: 0 16px 32px rgba(0, 0, 0, 0.35);

/* Colored shadows for hover states */
--shadow-accent: 0 4px 16px rgba(0, 171, 228, 0.2);
--shadow-accent-hover: 0 8px 24px rgba(0, 171, 228, 0.3);
```

## Component Patterns

### Buttons

```css
/* Base button styles */
.button {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-base);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 44px; /* Accessibility */
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}

/* Primary button */
.button-primary {
  background: var(--gradient-primary);
  color: white;
  border: none;
  box-shadow: var(--shadow-sm);
}

.button-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-accent-hover);
}

.button-primary:active {
  transform: translateY(0);
  opacity: 0.9;
}

.button-primary:focus {
  outline: 2px solid rgba(255, 255, 255, 0.4);
  outline-offset: 2px;
}

/* Secondary button */
.button-secondary {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-surface);
}

.button-secondary:hover {
  background: var(--color-surface);
  border-color: var(--color-surface-alt);
}

/* Ghost button */
.button-ghost {
  background: transparent;
  color: var(--color-accent);
  border: none;
}

.button-ghost:hover {
  background: rgba(0, 171, 228, 0.1);
}
```

### Cards

```css
.card {
  background: var(--color-surface);
  padding: var(--space-6);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-base);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  background: var(--gradient-surface);
}

.card-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  margin-bottom: var(--space-2);
  color: var(--color-text);
}

.card-description {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-4);
}
```

### Input Fields

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface);
  border: 1px solid transparent;
  border-radius: var(--radius-base);
  color: var(--color-text);
  font-size: var(--text-base);
  transition: all 0.2s ease;
  min-height: 44px; /* Accessibility */
}

.input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(0, 171, 228, 0.1);
}

.input::placeholder {
  color: var(--color-text-tertiary);
}
```

### Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  border-radius: var(--radius-full);
  transition: all 0.2s ease;
}

.badge-primary {
  background: var(--color-accent);
  color: white;
}

.badge-secondary {
  background: var(--color-surface);
  color: var(--color-text-secondary);
}

.badge-subtle {
  background: rgba(0, 171, 228, 0.1);
  color: var(--color-accent);
}
```

## Animation Patterns

### Transitions
```css
/* Standard transition durations */
--transition-fast: 0.15s;
--transition-base: 0.2s;
--transition-slow: 0.3s;

/* Easing functions */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
```

### Micro-interactions
```css
/* Hover lift effect */
@keyframes hover-lift {
  to { transform: translateY(-4px); }
}

/* Fade in up animation */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading shimmer */
@keyframes shimmer {
  to {
    background-position: 200% center;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    var(--color-surface) 25%,
    var(--color-surface-alt) 50%,
    var(--color-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### Standard Animation Classes
```css
.animate-fade-in {
  animation: fade-in-up 0.3s ease-out;
}

.hover-lift {
  transition: transform var(--transition-base) var(--ease-out);
}

.hover-lift:hover {
  transform: translateY(-4px);
}

/* Different lift heights */
.hover-lift-sm:hover { transform: translateY(-2px); }
.hover-lift-md:hover { transform: translateY(-4px); }
.hover-lift-lg:hover { transform: translateY(-8px); }
```

## Responsive Breakpoints

```css
/* Mobile first approach */
--screen-xs: 480px;   /* Extra small devices */
--screen-sm: 640px;   /* Small devices */
--screen-md: 768px;   /* Medium devices */
--screen-lg: 1024px;  /* Large devices */
--screen-xl: 1280px;  /* Extra large devices */
--screen-2xl: 1536px; /* 2X large devices */

/* Media queries */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }
@media (min-width: 1536px) { /* 2xl */ }
```

## Grid System

```css
.container {
  width: 100%;
  margin-inline: auto;
  padding-inline: var(--space-4);
}

@media (min-width: 640px) {
  .container { max-width: 640px; }
}

@media (min-width: 768px) {
  .container { max-width: 768px; }
}

@media (min-width: 1024px) {
  .container { max-width: 1024px; }
}

@media (min-width: 1280px) {
  .container { max-width: 1280px; }
}

/* Grid layouts */
.grid {
  display: grid;
  gap: var(--space-4);
}

.grid-cols-1 { grid-template-columns: repeat(1, 1fr); }
.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }

/* Responsive grids */
@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
}
```

## Accessibility Guidelines

### Touch Targets
- Minimum size: 44×44 CSS pixels
- Adequate spacing between interactive elements
- Clear focus states for keyboard navigation

### Color Contrast
- Text on dark backgrounds: minimum 4.5:1 ratio
- Large text: minimum 3:1 ratio
- Interactive elements: clear visual distinction

### Focus States
```css
/* Standard focus outline */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

/* Custom focus styles */
.focus-ring {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-bg), 0 0 0 4px var(--color-accent);
}
```

## Z-Index Scale

```css
--z-negative: -1;
--z-0: 0;
--z-10: 10;      /* Dropdowns */
--z-20: 20;      /* Fixed headers */
--z-30: 30;      /* Overlays */
--z-40: 40;      /* Sidebars */
--z-50: 50;      /* Modals */
--z-60: 60;      /* Popovers */
--z-70: 70;      /* Tooltips */
--z-80: 80;      /* Toasts */
--z-90: 90;      /* Loading indicators */
--z-max: 9999;   /* Critical UI */
```

## Implementation Guidelines

1. **Always use design tokens** - Reference CSS variables instead of hardcoding values
2. **Follow the spacing grid** - Use multiples of 8px for all spacing
3. **Maintain color hierarchy** - 60% neutral, 30% secondary, 10% accent
4. **Ensure accessibility** - Meet WCAG AA standards for contrast and touch targets
5. **Use semantic HTML** - Proper heading hierarchy and ARIA labels
6. **Mobile-first approach** - Design for small screens, then enhance
7. **Consistent animations** - Use standard transitions and micro-interactions
8. **Component composition** - Build complex UI from simple, reusable components

## Example Component Implementation

```tsx
// Example: Well-structured card component following design system
import React from 'react';
import { FiArrowRight } from 'react-icons/fi';

interface CardProps {
  title: string;
  description: string;
  href?: string;
  variant?: 'default' | 'featured';
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  description, 
  href,
  variant = 'default' 
}) => {
  const CardWrapper = href ? 'a' : 'div';
  
  return (
    <CardWrapper
      href={href}
      className={`
        card
        ${variant === 'featured' ? 'card-featured' : ''}
        ${href ? 'hover-lift-md' : ''}
      `}
    >
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
      {href && (
        <span className="card-link">
          Learn more 
          <FiArrowRight className="icon-sm" />
        </span>
      )}
    </CardWrapper>
  );
};
```

This design system provides a complete foundation for building consistent, accessible, and visually appealing UI components that align with the portfolio's minimalist yet functional aesthetic.