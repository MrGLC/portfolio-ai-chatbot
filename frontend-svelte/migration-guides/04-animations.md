# Migration Guide: Animations & Transitions

**React Source:** Uses Framer Motion throughout

## What You'll Learn
- Built-in Svelte transitions
- Custom transitions
- Animation directive
- Deferred transitions
- Spring/tweened stores

---

## Framer Motion vs Svelte Transitions

| Framer Motion | Svelte | Notes |
|--------------|--------|-------|
| `initial`, `animate` | `in:` transition | Entry animations |
| `exit` | `out:` transition | Exit animations |
| `AnimatePresence` | `{#if}` block | Automatic with conditionals |
| `whileHover` | CSS `:hover` or `on:mouseenter` | Hover states |
| `variants` | Custom transition functions | Reusable configs |
| `useAnimation` | Tweened/Spring stores | Imperative control |

---

## Basic Transitions

### React (Framer Motion)
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

### Svelte
```svelte
<script>
  import { fade, fly } from 'svelte/transition';

  let visible = true;
</script>

{#if visible}
  <div
    in:fly={{ y: 20, duration: 300 }}
    out:fly={{ y: -20, duration: 300 }}
  >
    Content
  </div>
{/if}
```

---

## Built-in Transitions

```svelte
<script>
  import {
    fade,      // opacity
    fly,       // opacity + x/y movement
    slide,     // height collapse
    scale,     // transform scale
    blur,      // filter blur
    draw       // SVG stroke
  } from 'svelte/transition';

  import { flip } from 'svelte/animate';  // For list reordering
</script>

<!-- Fade -->
<div transition:fade={{ duration: 200 }}>

<!-- Fly from bottom -->
<div in:fly={{ y: 50, duration: 400 }}>

<!-- Slide down -->
<div transition:slide={{ duration: 300 }}>

<!-- Scale from center -->
<div in:scale={{ start: 0.8, duration: 250 }}>

<!-- Blur in -->
<div in:blur={{ amount: 10, duration: 400 }}>
```

---

## Page Transitions

### React (with Framer Motion)
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <Routes>...</Routes>
  </motion.div>
</AnimatePresence>
```

### Svelte (+layout.svelte)
```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
</script>

{#key $page.url.pathname}
  <main in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>
    <slot />
  </main>
{/key}
```

The `{#key}` block destroys and recreates content when the key changes, triggering transitions.

---

## Staggered List Animations

### React
```tsx
<motion.div variants={container} initial="hidden" animate="visible">
  {items.map((item, i) => (
    <motion.div
      key={item.id}
      variants={itemVariant}
      custom={i}
      transition={{ delay: i * 0.1 }}
    >
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

### Svelte
```svelte
<script>
  import { fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
</script>

<div class="list">
  {#each items as item, i (item.id)}
    <div
      in:fly={{ y: 20, duration: 300, delay: i * 100 }}
      animate:flip={{ duration: 300 }}
    >
      {item.name}
    </div>
  {/each}
</div>
```

---

## Scroll-triggered Animations

### React (with Framer Motion)
```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
>
  Content
</motion.div>
```

### Svelte (using Intersection Observer)
```svelte
<script>
  import { fly } from 'svelte/transition';

  let visible = false;
  let element;

  function handleIntersect(entries) {
    if (entries[0].isIntersecting) {
      visible = true;
    }
  }

  $: if (element) {
    const observer = new IntersectionObserver(handleIntersect, {
      threshold: 0.1,
      rootMargin: '-50px'
    });
    observer.observe(element);

    return () => observer.disconnect();
  }
</script>

<div bind:this={element}>
  {#if visible}
    <div in:fly={{ y: 50, duration: 500 }}>
      Content
    </div>
  {/if}
</div>
```

### Reusable Action for Scroll Animations
```javascript
// src/lib/actions/inview.js
export function inview(node, params = {}) {
  let observer;

  const handleIntersect = (entries) => {
    const entry = entries[0];
    if (entry.isIntersecting) {
      node.dispatchEvent(new CustomEvent('inview'));
      if (params.once) {
        observer.disconnect();
      }
    }
  };

  observer = new IntersectionObserver(handleIntersect, {
    threshold: params.threshold || 0.1,
    rootMargin: params.rootMargin || '0px'
  });

  observer.observe(node);

  return {
    destroy() {
      observer.disconnect();
    }
  };
}
```

```svelte
<script>
  import { fly } from 'svelte/transition';
  import { inview } from '$lib/actions/inview';

  let visible = false;
</script>

<div use:inview={{ once: true }} on:inview={() => visible = true}>
  {#if visible}
    <div in:fly={{ y: 50 }}>
      Content
    </div>
  {/if}
</div>
```

---

## Hover Animations

### React
```tsx
<motion.div
  whileHover={{ scale: 1.05, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
  transition={{ duration: 0.2 }}
>
  Card
</motion.div>
```

### Svelte (CSS is often better)
```svelte
<div class="card">
  Card
</div>

<style>
  .card {
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .card:hover {
    transform: scale(1.05);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
</style>
```

### Svelte (with JavaScript control)
```svelte
<script>
  import { spring } from 'svelte/motion';

  const scale = spring(1, { stiffness: 300, damping: 20 });
</script>

<div
  style="transform: scale({$scale})"
  on:mouseenter={() => scale.set(1.05)}
  on:mouseleave={() => scale.set(1)}
>
  Card
</div>
```

---

## Spring & Tweened Values

### Spring (physics-based)
```svelte
<script>
  import { spring } from 'svelte/motion';

  // Create a spring store
  const coords = spring({ x: 0, y: 0 }, {
    stiffness: 0.1,
    damping: 0.5
  });

  function handleMove(e) {
    coords.set({ x: e.clientX, y: e.clientY });
  }
</script>

<svelte:window on:mousemove={handleMove} />

<div style="transform: translate({$coords.x}px, {$coords.y}px)">
  Follow cursor
</div>
```

### Tweened (duration-based)
```svelte
<script>
  import { tweened } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  const progress = tweened(0, {
    duration: 400,
    easing: cubicOut
  });
</script>

<button on:click={() => progress.set(100)}>
  Complete
</button>

<div class="bar" style="width: {$progress}%" />
```

---

## Custom Transitions

### Basic Custom Transition
```javascript
// src/lib/transitions/custom.js
import { cubicOut } from 'svelte/easing';

export function typewriter(node, { speed = 1 }) {
  const text = node.textContent;
  const duration = text.length / (speed * 0.01);

  return {
    duration,
    tick: (t) => {
      const i = Math.trunc(text.length * t);
      node.textContent = text.slice(0, i);
    }
  };
}

export function expandFromCenter(node, { duration = 300, easing = cubicOut }) {
  const style = getComputedStyle(node);
  const width = parseFloat(style.width);
  const height = parseFloat(style.height);

  return {
    duration,
    easing,
    css: (t) => `
      width: ${t * width}px;
      height: ${t * height}px;
      opacity: ${t};
      overflow: hidden;
    `
  };
}
```

```svelte
<script>
  import { typewriter, expandFromCenter } from '$lib/transitions/custom';
</script>

<h1 in:typewriter={{ speed: 2 }}>Hello World</h1>

<div in:expandFromCenter={{ duration: 500 }}>
  Expanding content
</div>
```

---

## Deferred Transitions (Crossfade)

For items moving between containers:

```svelte
<script>
  import { crossfade } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';

  const [send, receive] = crossfade({
    duration: 400,
    easing: quintOut,
    fallback: (node) => {
      return {
        duration: 300,
        css: (t) => `opacity: ${t}`
      };
    }
  });

  let items = [
    { id: 1, name: 'Item 1', done: false },
    { id: 2, name: 'Item 2', done: false },
    { id: 3, name: 'Item 3', done: true }
  ];

  $: pending = items.filter(i => !i.done);
  $: completed = items.filter(i => i.done);
</script>

<div class="columns">
  <div class="column">
    <h2>Pending</h2>
    {#each pending as item (item.id)}
      <div
        in:receive={{ key: item.id }}
        out:send={{ key: item.id }}
      >
        <button on:click={() => item.done = true}>
          {item.name}
        </button>
      </div>
    {/each}
  </div>

  <div class="column">
    <h2>Completed</h2>
    {#each completed as item (item.id)}
      <div
        in:receive={{ key: item.id }}
        out:send={{ key: item.id }}
      >
        <button on:click={() => item.done = false}>
          {item.name}
        </button>
      </div>
    {/each}
  </div>
</div>
```

---

## Exercise

1. Add page transitions to your layout
2. Create a scroll-triggered animation action
3. Build a card with spring-based hover effects
4. Create a custom typewriter transition
5. Implement a crossfade for a todo list

Tip: Start with CSS transitions for simple hovers, use Svelte transitions for enter/exit, and springs for interactive elements.
