<script>
  import { fly } from 'svelte/transition';
  import { ArrowRight } from 'lucide-svelte';

  // This is your starting point!
  // Compare with: frontend/src/pages/HomePage.tsx
</script>

<div class="hero">
  <div class="container">
    <div class="hero-content" in:fly={{ y: 30, duration: 500 }}>
      <h1>
        AI Consulting
        <span class="accent">Portfolio</span>
      </h1>

      <p class="subtitle">
        Building intelligent solutions for complex problems
      </p>

      <div class="cta-group">
        <a href="/projects" class="btn primary">
          View Projects
          <ArrowRight size={20} />
        </a>
        <a href="/contact" class="btn secondary">
          Get in Touch
        </a>
      </div>
    </div>
  </div>
</div>

<section class="features">
  <div class="container">
    <h2>What I Do</h2>

    <div class="feature-grid">
      {#each features as feature, i}
        <div
          class="feature-card"
          in:fly={{ y: 30, duration: 400, delay: 200 + i * 100 }}
        >
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<script context="module">
  const features = [
    {
      title: 'Machine Learning',
      description: 'Custom ML models tailored to your business needs'
    },
    {
      title: 'Natural Language Processing',
      description: 'Text analysis, chatbots, and language understanding'
    },
    {
      title: 'Computer Vision',
      description: 'Image recognition and visual data processing'
    },
    {
      title: 'Data Strategy',
      description: 'Turn your data into actionable insights'
    }
  ];
</script>

<style>
  .hero {
    min-height: 80vh;
    display: flex;
    align-items: center;
    background: linear-gradient(
      135deg,
      rgba(196, 30, 58, 0.2) 0%,
      transparent 50%
    );
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--space-4);
  }

  .hero-content {
    max-width: 600px;
  }

  h1 {
    font-size: clamp(2.5rem, 8vw, 4.5rem);
    margin-bottom: var(--space-4);
    line-height: 1.1;
  }

  .accent {
    color: var(--color-accent);
  }

  .subtitle {
    font-size: 1.25rem;
    color: var(--color-text-secondary);
    margin-bottom: var(--space-6);
  }

  .cta-group {
    display: flex;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    border-radius: var(--radius-md);
    font-weight: 500;
    transition: transform var(--transition-fast), box-shadow var(--transition-fast);
  }

  .btn:hover {
    transform: translateY(-2px);
  }

  .btn.primary {
    background: var(--color-accent);
    color: white;
  }

  .btn.primary:hover {
    box-shadow: 0 4px 12px rgba(196, 30, 58, 0.4);
  }

  .btn.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-text);
  }

  .btn.secondary:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  /* Features section */
  .features {
    padding: var(--space-12) 0;
  }

  .features h2 {
    text-align: center;
    margin-bottom: var(--space-8);
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-6);
  }

  .feature-card {
    background: var(--color-surface);
    padding: var(--space-6);
    border-radius: var(--radius-lg);
    transition: transform var(--transition-base), box-shadow var(--transition-base);
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }

  .feature-card h3 {
    margin-bottom: var(--space-3);
    color: var(--color-accent);
  }

  .feature-card p {
    color: var(--color-text-secondary);
    margin: 0;
  }
</style>
