# Migration Guide: Layout Components

**React Source:** `frontend/src/components/Layout/`

## What You'll Learn
- Basic Svelte component structure
- Slots (React's children equivalent)
- Scoped styles
- Event handling

---

## Layout Wrapper

### React Version
```tsx
// frontend/src/components/Layout/index.tsx
export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box minH="100vh" position="relative">
      <RedJewelBackground />
      <Box position="absolute" inset={0} bg="rgba(139, 0, 0, 0.15)" />
      <Box position="relative" zIndex={1}>
        <Navigation />
        {children}
        <Footer />
      </Box>
    </Box>
  );
};
```

### Svelte Version
```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import Navigation from '$lib/components/Layout/Navigation.svelte';
  import Footer from '$lib/components/Layout/Footer.svelte';
  import RedJewelBackground from '$lib/components/ThreeBackground/RedJewelBackground.svelte';
</script>

<div class="layout">
  <RedJewelBackground />
  <div class="overlay" />
  <div class="content">
    <Navigation />
    <slot /> <!-- This replaces {children} -->
    <Footer />
  </div>
</div>

<style>
  .layout {
    min-height: 100vh;
    position: relative;
  }

  .overlay {
    position: absolute;
    inset: 0;
    background: rgba(139, 0, 0, 0.15);
    pointer-events: none;
  }

  .content {
    position: relative;
    z-index: 1;
  }
</style>
```

**Key Differences:**
- `{children}` becomes `<slot />`
- Styles are scoped automatically (no CSS-in-JS needed)
- No need for `React.FC` type annotations

---

## Navigation

### React Version (Key Parts)
```tsx
// frontend/src/components/Layout/Navigation.tsx
const Navigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  // ...
};
```

### Svelte Version
```svelte
<!-- src/lib/components/Layout/Navigation.svelte -->
<script>
  import { page } from '$app/stores';
  import { t } from '$lib/i18n';
  import { onMount, onDestroy } from 'svelte';

  let isScrolled = false;
  let isDrawerOpen = false;

  // Reactive statement - like useEffect with dependency
  $: isActive = (path) => $page.url.pathname === path;

  function handleScroll() {
    isScrolled = window.scrollY > 100;
  }

  onMount(() => {
    window.addEventListener('scroll', handleScroll);
  });

  onDestroy(() => {
    window.removeEventListener('scroll', handleScroll);
  });
</script>

<header class:scrolled={isScrolled}>
  <nav>
    <a href="/" class="logo">Portfolio</a>

    <!-- Desktop nav -->
    <div class="nav-links">
      {#each navItems as item}
        <a
          href={item.path}
          class:active={isActive(item.path)}
        >
          {$t(item.labelKey)}
        </a>
      {/each}
    </div>

    <!-- Mobile menu button -->
    <button
      class="menu-btn"
      on:click={() => isDrawerOpen = true}
      aria-label="Open menu"
    >
      <MenuIcon />
    </button>
  </nav>
</header>

<!-- Mobile drawer -->
{#if isDrawerOpen}
  <div class="drawer-overlay" on:click={() => isDrawerOpen = false} />
  <aside class="drawer">
    {#each navItems as item}
      <a
        href={item.path}
        on:click={() => isDrawerOpen = false}
      >
        {$t(item.labelKey)}
      </a>
    {/each}
  </aside>
{/if}

<style>
  header {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 100;
    transition: background 0.3s, box-shadow 0.3s;
  }

  header.scrolled {
    background: rgba(10, 10, 10, 0.95);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .active {
    color: var(--color-accent);
  }

  /* More styles... */
</style>
```

**Key Differences:**
- `useState` + `useEffect` → `let` + `onMount`/`onDestroy`
- `useLocation` → `$page` store
- `useDisclosure` → simple `let isOpen = false`
- `className={isScrolled ? 'scrolled' : ''}` → `class:scrolled={isScrolled}`
- Event cleanup is explicit in `onDestroy`

---

## Footer

### React Version (Key Parts)
```tsx
const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <Box as="footer" bg="brand.dark" py={12}>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
        {/* Columns */}
      </SimpleGrid>
    </Box>
  );
};
```

### Svelte Version
```svelte
<!-- src/lib/components/Layout/Footer.svelte -->
<script>
  import { t } from '$lib/i18n';

  const socialLinks = [
    { href: 'https://github.com/...', icon: 'github', label: 'GitHub' },
    { href: 'https://linkedin.com/...', icon: 'linkedin', label: 'LinkedIn' }
  ];
</script>

<footer>
  <div class="grid">
    <!-- Brand column -->
    <div class="col">
      <h3>{$t('footer.brand')}</h3>
      <p>{$t('footer.tagline')}</p>
    </div>

    <!-- Links columns -->
    <div class="col">
      <h4>{$t('footer.services')}</h4>
      <ul>
        <li><a href="/consulting">{$t('footer.aiConsulting')}</a></li>
        <!-- ... -->
      </ul>
    </div>

    <!-- Social links -->
    <div class="col">
      <h4>{$t('footer.connect')}</h4>
      <div class="social">
        {#each socialLinks as link}
          <a href={link.href} target="_blank" rel="noopener" aria-label={link.label}>
            <Icon name={link.icon} />
          </a>
        {/each}
      </div>
    </div>
  </div>

  <div class="bottom">
    <p>&copy; {new Date().getFullYear()} Portfolio</p>
  </div>
</footer>

<style>
  footer {
    background: var(--color-dark);
    padding: 3rem 1rem;
  }

  .grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
```

**Key Differences:**
- No Chakra `SimpleGrid` - use CSS Grid directly
- Responsive breakpoints in CSS, not component props
- More explicit, but also more control

---

## ScrollToTop Button

### React Version
```tsx
const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
          <IconButton onClick={scrollToTop} icon={<ArrowUpIcon />} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

### Svelte Version
```svelte
<!-- src/lib/components/Layout/ScrollToTop.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import { scale } from 'svelte/transition';
  import { ArrowUp } from 'lucide-svelte';

  let isVisible = false;

  function toggleVisibility() {
    isVisible = window.scrollY > 300;
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onMount(() => {
    window.addEventListener('scroll', toggleVisibility);
  });

  onDestroy(() => {
    window.removeEventListener('scroll', toggleVisibility);
  });
</script>

{#if isVisible}
  <button
    class="scroll-btn"
    on:click={scrollToTop}
    aria-label="Scroll to top"
    transition:scale={{ duration: 200 }}
  >
    <ArrowUp size={20} />
  </button>
{/if}

<style>
  .scroll-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: var(--color-accent);
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 50;
  }

  .scroll-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }
</style>
```

**Key Differences:**
- `AnimatePresence` + `motion.div` → `transition:scale`
- Built-in transitions, no library needed
- Much cleaner syntax

---

## Exercise

1. Create the `+layout.svelte` file
2. Build the Navigation component with:
   - Scroll detection
   - Active link highlighting
   - Mobile drawer
3. Build the Footer with responsive grid
4. Add ScrollToTop with built-in transition

Reference the original React files for content and styling details.
