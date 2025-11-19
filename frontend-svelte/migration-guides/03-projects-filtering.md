# Migration Guide: Projects Page & Filtering

**React Source:** `frontend/src/pages/ProjectsPage.tsx`

## What You'll Learn
- Reactive statements (`$:`)
- Each blocks with keys
- Conditional rendering
- Component animations
- Modal/dialog patterns

---

## State and Filtering

### React Version
```tsx
const [selectedCategory, setSelectedCategory] = useState('all');
const [selectedProject, setSelectedProject] = useState<Project | null>(null);

// Filter projects
const filteredProjects = selectedCategory === 'all'
  ? projects
  : projects.filter(p => p.category === selectedCategory);
```

### Svelte Version
```svelte
<script>
  let selectedCategory = 'all';
  let selectedProject = null;

  // Reactive derived value - recalculates when dependencies change
  $: filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(p => p.category === selectedCategory);
</script>
```

**Key Difference:** `$:` creates a reactive statement that automatically updates when `selectedCategory` or `projects` changes. No need for `useMemo` or manual dependency tracking.

---

## Complete Projects Page

### React Version (Key Parts)
```tsx
const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = ['all', 'nlp', 'cv', 'ml', 'data'];

  return (
    <>
      {/* Filter buttons */}
      <HStack>
        {categories.map(cat => (
          <Button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            variant={selectedCategory === cat ? 'solid' : 'outline'}
          >
            {t(`projects.categories.${cat}`)}
          </Button>
        ))}
      </HStack>

      {/* Project grid */}
      <AnimatePresence mode="wait">
        <motion.div key={selectedCategory}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }}>
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <ProjectCard
                  project={project}
                  onClick={() => {
                    setSelectedProject(project);
                    onOpen();
                  }}
                />
              </motion.div>
            ))}
          </SimpleGrid>
        </motion.div>
      </AnimatePresence>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        {selectedProject && <ProjectDetails project={selectedProject} />}
      </Modal>
    </>
  );
};
```

### Svelte Version
```svelte
<!-- src/routes/projects/+page.svelte -->
<script>
  import { t } from '$lib/i18n';
  import { fade, fly } from 'svelte/transition';
  import { flip } from 'svelte/animate';
  import ProjectCard from '$lib/components/ProjectCard.svelte';
  import Modal from '$lib/components/Modal.svelte';

  // Data
  const categories = [
    { id: 'all', label: 'all' },
    { id: 'nlp', label: 'nlp' },
    { id: 'cv', label: 'computerVision' },
    { id: 'ml', label: 'machineLearning' },
    { id: 'data', label: 'dataAnalysis' }
  ];

  const projects = [
    {
      id: 'sentiment',
      title: 'sentimentAnalysis',
      description: 'sentimentDesc',
      category: 'nlp',
      technologies: ['Python', 'TensorFlow', 'BERT'],
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'vision',
      title: 'objectDetection',
      description: 'objectDesc',
      category: 'cv',
      technologies: ['Python', 'PyTorch', 'YOLO'],
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    // ... more projects
  ];

  // State
  let selectedCategory = 'all';
  let selectedProject = null;
  let isModalOpen = false;

  // Reactive filtering
  $: filteredProjects = selectedCategory === 'all'
    ? projects
    : projects.filter(p => p.category === selectedCategory);

  // Functions
  function selectCategory(category) {
    selectedCategory = category;
  }

  function openProject(project) {
    selectedProject = project;
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
    selectedProject = null;
  }
</script>

<main>
  <!-- Hero Section -->
  <section class="hero">
    <h1>{$t('projects.title')}</h1>
    <p>{$t('projects.subtitle')}</p>
  </section>

  <!-- Filter Buttons -->
  <section class="filters">
    <div class="filter-group">
      {#each categories as category}
        <button
          class="filter-btn"
          class:active={selectedCategory === category.id}
          on:click={() => selectCategory(category.id)}
        >
          {$t(`projects.categories.${category.label}`)}
        </button>
      {/each}
    </div>
  </section>

  <!-- Project Grid -->
  <section class="projects">
    <div class="grid">
      {#each filteredProjects as project, i (project.id)}
        <div
          class="project-wrapper"
          in:fly={{ y: 30, duration: 300, delay: i * 100 }}
          out:fade={{ duration: 200 }}
          animate:flip={{ duration: 300 }}
        >
          <ProjectCard
            {project}
            on:click={() => openProject(project)}
          />
        </div>
      {/each}
    </div>

    {#if filteredProjects.length === 0}
      <p class="no-results" in:fade>
        {$t('projects.noResults')}
      </p>
    {/if}
  </section>
</main>

<!-- Modal -->
{#if isModalOpen && selectedProject}
  <Modal on:close={closeModal}>
    <div class="modal-content">
      <div
        class="modal-header"
        style="background: {selectedProject.gradient}"
      >
        <h2>{$t(`projects.items.${selectedProject.title}`)}</h2>
      </div>

      <div class="modal-body">
        <p>{$t(`projects.items.${selectedProject.description}`)}</p>

        <h3>{$t('projects.technologies')}</h3>
        <div class="tech-badges">
          {#each selectedProject.technologies as tech}
            <span class="badge">{tech}</span>
          {/each}
        </div>

        <div class="modal-actions">
          <a href="#" class="btn primary">
            {$t('projects.viewDemo')}
          </a>
          <a href="#" class="btn secondary">
            {$t('projects.viewCode')}
          </a>
        </div>
      </div>
    </div>
  </Modal>
{/if}

<style>
  .hero {
    text-align: center;
    padding: 4rem 1rem;
    background: linear-gradient(135deg, rgba(139, 0, 0, 0.3), transparent);
  }

  .hero h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .filters {
    padding: 2rem 1rem;
    display: flex;
    justify-content: center;
  }

  .filter-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
  }

  .filter-btn {
    padding: 0.75rem 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 9999px;
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    transition: all 0.2s;
  }

  .filter-btn:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .filter-btn.active {
    background: var(--color-accent);
    border-color: var(--color-accent);
    color: white;
  }

  .projects {
    padding: 2rem 1rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 2rem;
  }

  .no-results {
    text-align: center;
    color: var(--color-text-secondary);
    padding: 3rem;
  }

  /* Modal styles */
  .modal-content {
    background: var(--color-surface);
    border-radius: 12px;
    overflow: hidden;
    max-width: 600px;
    width: 100%;
  }

  .modal-header {
    padding: 3rem 2rem;
    color: white;
  }

  .modal-header h2 {
    font-size: 1.75rem;
    margin: 0;
  }

  .modal-body {
    padding: 2rem;
  }

  .modal-body h3 {
    margin: 1.5rem 0 1rem;
    font-size: 1rem;
    color: var(--color-text-secondary);
  }

  .tech-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    font-size: 0.875rem;
  }

  .modal-actions {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    transition: transform 0.2s;
  }

  .btn:hover {
    transform: translateY(-2px);
  }

  .btn.primary {
    background: var(--color-accent);
    color: white;
  }

  .btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-text);
  }
</style>
```

---

## Reusable Modal Component

```svelte
<!-- src/lib/components/Modal.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  import { fade, scale } from 'svelte/transition';

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') close();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div
  class="backdrop"
  on:click={close}
  transition:fade={{ duration: 200 }}
>
  <div
    class="modal"
    on:click|stopPropagation
    transition:scale={{ start: 0.95, duration: 200 }}
    role="dialog"
    aria-modal="true"
  >
    <button class="close-btn" on:click={close} aria-label="Close">
      &times;
    </button>
    <slot />
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 1000;
  }

  .modal {
    position: relative;
    max-height: 90vh;
    overflow-y: auto;
  }

  .close-btn {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 32px;
    height: 32px;
    border: none;
    background: rgba(0, 0, 0, 0.5);
    color: white;
    border-radius: 50%;
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }
</style>
```

---

## ProjectCard Component

```svelte
<!-- src/lib/components/ProjectCard.svelte -->
<script>
  import { t } from '$lib/i18n';

  export let project;
</script>

<button class="card" on:click style="--gradient: {project.gradient}">
  <div class="card-image">
    <div class="gradient-bg" />
  </div>

  <div class="card-content">
    <h3>{$t(`projects.items.${project.title}`)}</h3>
    <p>{$t(`projects.items.${project.description}`)}</p>

    <div class="tech-list">
      {#each project.technologies.slice(0, 3) as tech}
        <span class="tech">{tech}</span>
      {/each}
    </div>
  </div>
</button>

<style>
  .card {
    display: block;
    width: 100%;
    text-align: left;
    background: var(--color-surface);
    border: none;
    border-radius: 12px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.3);
  }

  .card-image {
    height: 160px;
    position: relative;
  }

  .gradient-bg {
    position: absolute;
    inset: 0;
    background: var(--gradient);
  }

  .card-content {
    padding: 1.5rem;
  }

  h3 {
    font-size: 1.25rem;
    margin: 0 0 0.5rem;
  }

  p {
    color: var(--color-text-secondary);
    font-size: 0.875rem;
    margin: 0 0 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .tech-list {
    display: flex;
    gap: 0.5rem;
  }

  .tech {
    padding: 0.25rem 0.5rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    font-size: 0.75rem;
  }
</style>
```

---

## Key Animation Patterns

### List Animations with flip
```svelte
<!-- The (project.id) is the key - required for flip to work -->
{#each filteredProjects as project (project.id)}
  <div
    in:fly={{ y: 30, duration: 300 }}
    out:fade={{ duration: 200 }}
    animate:flip={{ duration: 300 }}
  >
    <ProjectCard {project} />
  </div>
{/each}
```

### Staggered Entrance
```svelte
{#each items as item, i (item.id)}
  <div in:fly={{ y: 30, delay: i * 100 }}>
    {item.name}
  </div>
{/each}
```

### Custom Transitions
```javascript
// src/lib/transitions.js
import { cubicOut } from 'svelte/easing';

export function scaleAndFade(node, { duration = 300, delay = 0 }) {
  return {
    duration,
    delay,
    css: (t) => {
      const eased = cubicOut(t);
      return `
        transform: scale(${0.95 + 0.05 * eased});
        opacity: ${eased};
      `;
    }
  };
}
```

---

## Exercise

1. Create the projects page with filtering
2. Build the ProjectCard component
3. Create a reusable Modal component
4. Add staggered entrance animations
5. Implement the flip animation when filtering changes

Bonus: Add URL-based filtering (e.g., `/projects?category=nlp`).
