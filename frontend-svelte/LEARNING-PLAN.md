# Svelte Portfolio - Learning Plan

This guide will help you learn Svelte/SvelteKit by rebuilding your React portfolio from scratch.

## Why Svelte?

- **No virtual DOM** - Compiles to vanilla JS at build time
- **Less boilerplate** - No useState, useEffect, etc.
- **Built-in reactivity** - Just use `$:` for reactive statements
- **Smaller bundle size** - Typically 30-40% smaller than React
- **Built-in transitions** - Native animation support

---

## React to Svelte Concept Mapping

| React | Svelte | Notes |
|-------|--------|-------|
| `useState` | `let variable = value` | Variables are reactive by default |
| `useEffect` | `$:` reactive statement | Runs when dependencies change |
| `useEffect([], ...)` | `onMount()` | Lifecycle function |
| `props` | `export let prop` | Exported variables are props |
| `{children}` | `<slot />` | Content projection |
| `useContext` | `getContext/setContext` | Or use stores |
| `useRef` | `bind:this` | Direct element binding |
| `className` | `class` | Standard HTML attribute |
| `onClick` | `on:click` | Event directive |
| `styled-components` | `<style>` block | Scoped by default |
| React Router | SvelteKit routing | File-based routing |
| Framer Motion | `transition:` directive | Built-in transitions |

---

## Project Structure

```
frontend-svelte/
├── src/
│   ├── routes/              # Pages (file-based routing)
│   │   ├── +page.svelte     # Home page
│   │   ├── +layout.svelte   # Shared layout
│   │   ├── about/
│   │   │   └── +page.svelte
│   │   ├── projects/
│   │   │   └── +page.svelte
│   │   ├── consulting/
│   │   │   └── +page.svelte
│   │   └── contact/
│   │       └── +page.svelte
│   ├── lib/
│   │   ├── components/      # Reusable components
│   │   │   ├── Layout/
│   │   │   ├── Chatbot/
│   │   │   └── ThreeBackground/
│   │   ├── stores/          # Global state
│   │   ├── i18n/            # Translations
│   │   └── utils/           # Helper functions
│   └── app.html             # HTML template
├── static/                  # Static assets
├── svelte.config.js
├── vite.config.js
└── package.json
```

---

## Learning Path - Section by Section

### Phase 1: Foundation (Week 1)

#### 1.1 Project Setup
**Learn:** SvelteKit basics, project structure, Vite

```bash
npm create svelte@latest frontend-svelte
cd frontend-svelte
npm install
npm run dev
```

Choose these options:
- Skeleton project
- TypeScript
- ESLint + Prettier

#### 1.2 Layout Component
**Learn:** Components, slots, basic styling

**Migrate:** `components/Layout/index.tsx`

**Key concepts:**
```svelte
<!-- +layout.svelte -->
<script>
  import Navigation from '$lib/components/Layout/Navigation.svelte';
  import Footer from '$lib/components/Layout/Footer.svelte';
</script>

<Navigation />
<slot /> <!-- This is like {children} in React -->
<Footer />

<style>
  /* Styles are scoped to this component by default */
</style>
```

#### 1.3 Navigation
**Learn:** Routing, active states, responsive design

**Migrate:** `components/Layout/Navigation.tsx`

**Key concepts:**
```svelte
<script>
  import { page } from '$app/stores';

  // Reactive - updates when $page changes
  $: isActive = (path) => $page.url.pathname === path;
</script>

<nav>
  <a href="/" class:active={isActive('/')}>Home</a>
  <a href="/about" class:active={isActive('/about')}>About</a>
</nav>

<style>
  .active {
    color: var(--color-accent);
  }
</style>
```

---

### Phase 2: Pages (Week 2)

#### 2.1 Home Page
**Learn:** Props, events, CSS variables

**Migrate:** `pages/HomePage.tsx`

**Key concepts:**
```svelte
<script>
  // Props
  export let title = 'Default Title';

  // State (just regular variables)
  let count = 0;

  // Event handler
  function handleClick() {
    count += 1;
  }
</script>

<button on:click={handleClick}>
  Clicked {count} times
</button>
```

#### 2.2 About Page
**Learn:** Each blocks, component composition

**Migrate:** `pages/AboutPage.tsx`

**Key concepts:**
```svelte
<script>
  let skills = ['JavaScript', 'Python', 'Svelte'];
</script>

<!-- Similar to .map() in React -->
{#each skills as skill, index}
  <span>{skill}</span>
{/each}
```

#### 2.3 Projects Page
**Learn:** Conditional rendering, filtering

**Migrate:** `pages/ProjectsPage.tsx`

**Key concepts:**
```svelte
<script>
  let projects = [...];
  let filter = 'all';

  // Reactive derived value
  $: filtered = filter === 'all'
    ? projects
    : projects.filter(p => p.category === filter);
</script>

{#if filtered.length > 0}
  {#each filtered as project}
    <ProjectCard {project} />
  {/each}
{:else}
  <p>No projects found</p>
{/if}
```

#### 2.4 Consulting Page
**Learn:** Complex layouts, CSS Grid in Svelte

**Migrate:** `pages/ConsultingPage.tsx`

#### 2.5 Contact Page
**Learn:** Form handling, two-way binding

**Migrate:** `pages/ContactPage.tsx`

**Key concepts:**
```svelte
<script>
  let formData = {
    name: '',
    email: '',
    message: ''
  };

  function handleSubmit() {
    console.log(formData);
  }
</script>

<form on:submit|preventDefault={handleSubmit}>
  <input bind:value={formData.name} />
  <input bind:value={formData.email} type="email" />
  <textarea bind:value={formData.message} />
  <button type="submit">Send</button>
</form>
```

---

### Phase 3: Interactivity (Week 3)

#### 3.1 Animations & Transitions
**Learn:** Built-in transitions, custom animations

**Replace:** Framer Motion

**Key concepts:**
```svelte
<script>
  import { fade, fly, slide } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';

  let visible = true;
</script>

{#if visible}
  <div
    in:fly={{ y: 20, duration: 300, easing: cubicOut }}
    out:fade
  >
    Animated content
  </div>
{/if}

<!-- For lists -->
{#each items as item (item.id)}
  <div animate:flip={{ duration: 300 }}>
    {item.name}
  </div>
{/each}
```

#### 3.2 Stores (Global State)
**Learn:** Writable stores, derived stores

**Replace:** React Context, useState at top level

**Key concepts:**
```javascript
// src/lib/stores/theme.js
import { writable, derived } from 'svelte/store';

export const theme = writable('dark');

// Derived store
export const isDark = derived(theme, $theme => $theme === 'dark');
```

```svelte
<script>
  import { theme, isDark } from '$lib/stores/theme';
</script>

<!-- Auto-subscribe with $ prefix -->
<button on:click={() => $theme = $isDark ? 'light' : 'dark'}>
  Toggle ({$theme})
</button>
```

#### 3.3 Internationalization
**Learn:** Stores for i18n, locale switching

**Replace:** react-i18next

```javascript
// src/lib/i18n/index.js
import { writable, derived } from 'svelte/store';

export const locale = writable('en');

const translations = {
  en: { greeting: 'Hello' },
  es: { greeting: 'Hola' }
};

export const t = derived(locale, $locale =>
  key => translations[$locale][key] || key
);
```

```svelte
<script>
  import { t, locale } from '$lib/i18n';
</script>

<h1>{$t('greeting')}</h1>
<button on:click={() => $locale = 'es'}>Español</button>
```

---

### Phase 4: Advanced (Week 4)

#### 4.1 Three.js Integration
**Learn:** Using external libraries, onMount, onDestroy

**Migrate:** `components/ThreeBackground/`

**Key concepts:**
```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';

  let container;
  let scene, camera, renderer;
  let animationId;

  onMount(() => {
    // Initialize Three.js
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
    renderer = new THREE.WebGLRenderer({ antialias: true });

    container.appendChild(renderer.domElement);

    function animate() {
      animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    }
    animate();
  });

  onDestroy(() => {
    // Cleanup
    cancelAnimationFrame(animationId);
    renderer?.dispose();
  });
</script>

<div bind:this={container}></div>
```

#### 4.2 Chatbot Component
**Learn:** Complex state, async operations, actions

**Migrate:** `components/Chatbot/ThreeJsChatbot.tsx`

**Key concepts:**
```svelte
<script>
  let messages = [];
  let input = '';
  let loading = false;

  async function sendMessage() {
    if (!input.trim()) return;

    messages = [...messages, { role: 'user', content: input }];
    input = '';
    loading = true;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: input })
      });
      const data = await response.json();
      messages = [...messages, { role: 'assistant', content: data.reply }];
    } finally {
      loading = false;
    }
  }
</script>

<div class="chat">
  {#each messages as msg}
    <div class={msg.role}>{msg.content}</div>
  {/each}

  {#if loading}
    <div class="typing">...</div>
  {/if}
</div>

<input
  bind:value={input}
  on:keydown={(e) => e.key === 'Enter' && sendMessage()}
/>
```

#### 4.3 API Integration
**Learn:** SvelteKit load functions, server routes

**Key concepts:**
```javascript
// src/routes/projects/+page.js
export async function load({ fetch }) {
  const response = await fetch('/api/projects');
  const projects = await response.json();

  return { projects };
}
```

```svelte
<!-- src/routes/projects/+page.svelte -->
<script>
  export let data; // Automatically receives load() result
</script>

{#each data.projects as project}
  <ProjectCard {project} />
{/each}
```

---

## Recommended Learning Resources

### Official Docs
- [Svelte Tutorial](https://learn.svelte.dev/) - Interactive tutorial (start here!)
- [SvelteKit Docs](https://kit.svelte.dev/docs)
- [Svelte API Reference](https://svelte.dev/docs)

### Video Courses
- [Joy of Code - Svelte](https://www.youtube.com/c/JoyofCode) - Free YouTube tutorials
- [Fireship - Svelte in 100 Seconds](https://www.youtube.com/watch?v=rv3Yq-B8qp4)

### Cheat Sheets
- [Svelte Society - Cheat Sheet](https://sveltesociety.dev/cheatsheet)

### Libraries
- **UI Components:** [Skeleton UI](https://www.skeleton.dev/) or [DaisyUI](https://daisyui.com/)
- **Icons:** [Lucide Svelte](https://lucide.dev/guide/packages/lucide-svelte)
- **Animations:** Built-in + [Motion One](https://motion.dev/)
- **i18n:** [svelte-i18n](https://github.com/kaisermann/svelte-i18n)

---

## Migration Order (Recommended)

Start with simpler components to build confidence:

1. **Layout** - Learn basics without complexity
2. **Footer** - Static content, simple styling
3. **Navigation** - Routing, active states
4. **About Page** - Lists, props
5. **Contact Page** - Forms, binding
6. **Projects Page** - Filtering, conditionals
7. **Home Page** - Composition, animations
8. **Consulting Page** - Complex layout
9. **Chatbot** - State management, async
10. **Three.js Backgrounds** - External libraries

---

## Tips for React Developers

1. **Don't overthink state** - Just use `let`, it's reactive
2. **Forget useEffect** - Use `$:` for derived values and side effects
3. **Embrace two-way binding** - `bind:value` is not evil in Svelte
4. **Use scoped styles** - No need for CSS-in-JS libraries
5. **Check the REPL** - [svelte.dev/repl](https://svelte.dev/repl) for quick experiments

---

## Next Steps

1. Complete the [official Svelte tutorial](https://learn.svelte.dev/)
2. Set up the SvelteKit project (Phase 1.1)
3. Start with the Layout component
4. Reference your React code in `frontend/src/` while building

Good luck! Svelte's simplicity will feel refreshing after React.
