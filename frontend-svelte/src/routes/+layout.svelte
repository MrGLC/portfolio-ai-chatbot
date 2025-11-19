<script>
  import '../app.css';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
</script>

<!-- Basic layout - expand this with Navigation and Footer components -->
<div class="app">
  <!-- Page content with transitions -->
  {#key $page.url.pathname}
    <main in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>
      <slot />
    </main>
  {/key}
</div>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  main {
    flex: 1;
  }
</style>
