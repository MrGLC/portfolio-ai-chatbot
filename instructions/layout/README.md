# Layout Components Documentation

## Overview

The Layout system provides the structural foundation for the portfolio application, wrapping all page content with consistent navigation, footer, and utility components. It implements a fixed navigation header, animated background effects, and responsive design patterns that work across mobile and desktop viewports.

The Layout system consists of five core components:
- **Layout** (index.tsx) - Main wrapper component
- **Navigation** - Fixed header with navigation links
- **Footer** - Site footer with links and branding
- **ScrollToTop** - Floating button to return to page top
- **LanguageSwitcher** - Dropdown for language selection

---

## Component Details

### 1. Layout (index.tsx)

**Purpose:** Acts as the root wrapper for all page content, establishing the visual foundation and structural hierarchy.

**Location:** `/home/user/portfolio-ai-chatbot/frontend/src/components/Layout/index.tsx`

**Structure:**

```tsx
<>
  <RedJewelBackground />           // 3D animated background
  <Box (red tint overlay) />       // Global color overlay
  <Box minH="100vh">
    <Navigation />                 // Fixed header
    <Box as="main">
      {children}                   // Page content
    </Box>
    <Footer />                     // Site footer
    <ScrollToTop />                // Scroll-to-top button
  </Box>
</>
```

**Key Features:**
- Imports and renders `RedJewelBackground` from ThreeBackground for 3D visual effects
- Applies a fixed red gradient overlay (`rgba(139, 0, 0, 0.15)`) across the entire viewport
- Sets `pointerEvents="none"` on overlay to allow user interaction with content beneath
- Main content area has top padding of `92px` to account for fixed navigation height
- Uses `zIndex` layering: background (0) < overlay (1) < content (2) < navigation (1000)

---

### 2. Navigation

**Purpose:** Provides fixed-position site navigation with responsive behavior for mobile and desktop, including scroll-aware styling changes.

**Location:** `/home/user/portfolio-ai-chatbot/frontend/src/components/Layout/Navigation.tsx`

**Navigation Items:**

| Key | Path | Translation Key |
|-----|------|-----------------|
| home | `/` | `nav.home` |
| consulting | `/consulting` | `nav.consulting` |
| projects | `/projects` | `nav.projects` |
| about | `/about` | `nav.about` |
| contact | `/contact` | `nav.contact` |

**Scroll Behavior:**

The navigation transforms when the user scrolls past 100 pixels:

| Property | Initial State | Scrolled State |
|----------|---------------|----------------|
| Background | Gradient (crimson to semi-transparent) | Solid (`rgba(220, 20, 60, 0.95)`) |
| Height | 60px | 50px |
| Padding (py) | 4 | 3 |
| Box Shadow | None | `0 4px 20px rgba(0, 0, 0, 0.1)` |

**Active State Detection:**
- Uses `useLocation()` from React Router to determine current path
- Active links display in `brand.accent` color with bold font weight
- Underline indicator appears below active navigation items

**Desktop Layout:**
- Logo on left with hover scale effect (1.05x)
- Navigation links centered with flex layout
- "Get Started" CTA button and language switcher on right

**Mobile Layout:**
- Hamburger menu icon triggers right-side drawer
- Drawer includes all navigation links, language switcher, and CTA button
- Footer tagline displayed at bottom of drawer

**Hover Effects:**
- Navigation links have animated underline that scales from 0 to 100% width
- Uses Framer Motion for smooth `scaleX` transition
- Color transitions to `brand.accent` on hover

---

### 3. Footer

**Purpose:** Displays site branding, categorized navigation links, social media links, and legal information.

**Location:** `/home/user/portfolio-ai-chatbot/frontend/src/components/Layout/Footer.tsx`

**Structure:**

The footer uses a 4-column grid layout (responsive: 1 column on mobile, 2 on tablet, 4 on desktop):

**Column 1 - Brand Section:**
- Brand name and tagline
- Description text
- Social media icon buttons (LinkedIn, GitHub, Research Gate, Email)

**Columns 2-4 - Link Categories:**

| Services | Gallery | Resources |
|----------|---------|-----------|
| Royal Strategy | Medical Innovations | Royal Assessment |
| AI Excellence | Business Intelligence | Case Studies |
| Vision Systems | Automation Luxury | Royal Blog |
| Natural Intelligence | Research Excellence | Whitepapers |

**Bottom Section:**
- Copyright notice (left-aligned on desktop)
- Legal links: Privacy Policy, Terms of Service
- "regal excellence" accent link

**Social Links Configuration:**
```typescript
const socialLinks = [
  { name: 'LinkedIn', url: 'https://linkedin.com/in/placeholder' },
  { name: 'GitHub', url: 'https://github.com/placeholder' },
  { name: 'Research Gate', url: 'https://researchgate.net/profile/placeholder' },
  { name: 'Email', url: 'mailto:luis@example.com' },
];
```

**Animation:**
- Footer fades in when it enters viewport using `whileInView` from Framer Motion
- `viewport={{ once: true }}` ensures animation only triggers once

---

### 4. ScrollToTop

**Purpose:** Provides a floating button that smoothly scrolls the page to the top when clicked.

**Location:** `/home/user/portfolio-ai-chatbot/frontend/src/components/Layout/ScrollToTop.tsx`

**Visibility Logic:**
- Button appears when `window.scrollY > 300` pixels
- Uses `AnimatePresence` for enter/exit animations

**Positioning:**
- Fixed position: bottom 20px, right 20px
- Z-index: 999 (below navigation at 1000)

**Animations:**
- Entry: Fade in + scale from 0 to 1
- Exit: Fade out + scale from 1 to 0
- Hover: Scale to 1.1x
- Tap/Click: Scale to 0.9x

**Scroll Behavior:**
```typescript
window.scrollTo({
  top: 0,
  behavior: 'smooth',
});
```

**Accessibility:**
- Uses `aria-label` with translation key `common.scrollToTop`
- Large touch target with `size="lg"`

---

### 5. LanguageSwitcher

**Purpose:** Allows users to switch between English and Spanish translations using a dropdown menu.

**Location:** `/home/user/portfolio-ai-chatbot/frontend/src/components/LanguageSwitcher.tsx`

**Supported Languages:**
```typescript
const languages = [
  { code: 'en', name: 'English', flag: '...' },
  { code: 'es', name: 'Espanol', flag: '...' }
];
```

**Integration:**
- Uses `useTranslation` hook from `react-i18next`
- Calls `i18n.changeLanguage(langCode)` on selection
- Current language determined by matching `i18n.language` with language codes

**Visual Design:**
- Button displays flag emoji of current language
- Dropdown menu with crimson accent border (`brand.accent`)
- Selected language highlighted with `brand.cream` background
- Hover effect includes slight horizontal translation (`translateX(4px)`)

**Menu Styling:**
- Background: `brand.primary`
- Border: `brand.accent` with 2px width
- Shadow: `0 8px 32px rgba(220, 20, 60, 0.15)`

---

## Styling Approach

### Theme System

The components use Chakra UI's theming system with custom brand colors:

| Token | Usage |
|-------|-------|
| `brand.primary` | Footer background, menu background |
| `brand.accent` | Active states, highlights, borders |
| `brand.cream` | Primary text on dark backgrounds |
| `brand.text` | Dark text color |
| `brand.textSecondary` | Muted/secondary text |
| `brand.surface` | Card/drawer backgrounds |
| `brand.border` | Dividers, borders |

### Animation System

Imports from `/home/user/portfolio-ai-chatbot/frontend/src/theme/animations`:
- `durations` - Timing values (fast, normal)
- `easings` - Cubic bezier curves
- `transitions` - Predefined transition strings
- `variants` - Framer Motion animation variants

### Framer Motion Usage

Motion components are created by wrapping Chakra components:
```typescript
const MotionBox = motion(Box);
const MotionDiv = motion.div;
```

Common animation patterns:
- `whileHover` for hover effects
- `whileInView` for scroll-triggered animations
- `AnimatePresence` for enter/exit animations

### Responsive Design

Uses Chakra UI's responsive object syntax:
```typescript
fontSize={{ base: "xl", md: "2xl" }}
display={{ base: 'none', md: 'flex' }}
columns={{ base: 1, md: 2, lg: 4 }}
```

---

## Routing Integration

### React Router v6

- Uses `Link as RouterLink` from `react-router-dom`
- Navigation links use `Button as={RouterLink}` pattern
- Footer links use `Link as={RouterLink}` pattern
- Active state detection via `useLocation().pathname`

### Hash Links

Footer links include hash fragments for in-page navigation:
- `/consulting#strategy`
- `/projects#medical`
- etc.

---

## Internationalization

### Translation Keys Used

**Navigation:**
- `nav.home`, `nav.consulting`, `nav.projects`, `nav.about`, `nav.contact`
- `common.getStarted`

**Footer:**
- `footer.brand.name`, `footer.brand.tagline`, `footer.brand.description`
- `footer.sections.*` for category headers
- `footer.links.*` for individual link names
- `footer.copyright`

**ScrollToTop:**
- `common.scrollToTop`

---

## Areas for Improvement

### 1. Overly Ornate Naming Conventions

The current naming uses excessively "royal" and "luxury" terminology that feels artificial:
- "Royal Strategy", "AI Excellence", "Vision Systems"
- "Medical Innovations", "Automation Luxury", "Research Excellence"
- "regal excellence" in footer

**Suggestion:** Use straightforward, professional labels that describe actual services without embellishment. For example: "Strategy Consulting", "Machine Learning", "Computer Vision".

### 2. Placeholder Content

Social links point to placeholder URLs:
- `https://linkedin.com/in/placeholder`
- `https://github.com/placeholder`
- `mailto:luis@example.com`

**Suggestion:** Replace with actual profile URLs or remove until real links are available.

### 3. Color Scheme Intensity

The aggressive red/crimson color scheme with multiple overlays can feel overwhelming:
- Fixed red tint overlay on all pages
- Crimson navigation background
- Red accents throughout

**Suggestion:** Consider a more subtle color palette or allow the accent color to be used more sparingly. The current approach reduces contrast and readability.

### 4. Hardcoded Brand Name

"Royal Portfolio" is hardcoded in the Navigation component rather than using a translation key:
```typescript
<Text>Royal Portfolio</Text>
```

**Suggestion:** Move to translation system for consistency: `t('brand.name')`.

### 5. Missing Icon Variety

Footer social links all use the same `ExternalLinkIcon` instead of platform-specific icons:
```typescript
icon={<ExternalLinkIcon />}
```

**Suggestion:** Use recognizable platform icons (LinkedIn logo, GitHub logo, etc.) for better user recognition.

### 6. Inconsistent Animation Timing

Some components use hardcoded transition values while others use theme tokens:
```typescript
// Inconsistent
transition="all 0.2s ease"
transition={transitions.normal}
```

**Suggestion:** Standardize all transitions to use theme tokens for maintainability.

### 7. Accessibility Considerations

- Language switcher uses flag emojis which may not be accessible to all screen readers
- Some hover effects don't have equivalent focus states for keyboard navigation
- Color contrast should be verified against WCAG guidelines given the heavy red color scheme

**Suggestion:** Add text labels alongside flag emojis, ensure all interactive elements have visible focus states.

### 8. Mobile Drawer Close Behavior

The mobile drawer's "Get Started" button includes `onClick={onClose}` but navigation links do not automatically close the drawer after clicking.

**Suggestion:** Add `onClick={onClose}` to NavLink components when `isMobile` is true.

### 9. Unused Motion Import

The LanguageSwitcher imports `motion` from Framer Motion but doesn't use it:
```typescript
import { motion } from 'framer-motion';
```

**Suggestion:** Remove unused imports to reduce bundle size.

### 10. Generic Footer Link Structure

Many footer links point to routes that may not exist (`/assessment`, `/case-studies`, `/blog`, `/resources`, `/privacy`, `/terms`).

**Suggestion:** Verify all routes exist or mark them as "coming soon", or simply remove non-functional links to avoid user frustration.

---

## File Dependencies

```
Layout/
  index.tsx
    - Navigation.tsx
    - Footer.tsx
    - ScrollToTop.tsx
    - ThreeBackground (RedJewelBackground)

Navigation.tsx
  - LanguageSwitcher.tsx
  - theme/animations
  - react-router-dom
  - react-i18next
  - framer-motion

Footer.tsx
  - react-router-dom
  - react-i18next
  - framer-motion

ScrollToTop.tsx
  - theme/animations
  - react-i18next
  - framer-motion

LanguageSwitcher.tsx
  - react-i18next
```

---

## Usage Example

```tsx
// App.tsx
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';

function App() {
  return (
    <Layout>
      <HomePage />
    </Layout>
  );
}
```

The Layout component should wrap all page content to ensure consistent navigation, footer, and background effects across the application.
