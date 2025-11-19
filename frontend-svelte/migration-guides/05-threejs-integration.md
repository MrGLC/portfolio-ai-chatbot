# Migration Guide: Three.js Integration

**React Source:** `frontend/src/components/ThreeBackground/`

## What You'll Learn
- Using external libraries with lifecycle hooks
- Canvas element binding
- Animation loops
- Cleanup and memory management
- Reactive Three.js properties

---

## Basic Three.js Setup

### React Version
```tsx
const ThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    containerRef.current.appendChild(renderer.domElement);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} />;
};
```

### Svelte Version
```svelte
<!-- src/lib/components/ThreeBackground/ThreeBackground.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';

  let container;
  let animationId;

  // Three.js objects
  let scene;
  let camera;
  let renderer;

  onMount(() => {
    // Scene setup
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    // Handle resize
    window.addEventListener('resize', handleResize);

    // Start animation
    animate();
  });

  onDestroy(() => {
    // Stop animation
    cancelAnimationFrame(animationId);

    // Remove event listeners
    window.removeEventListener('resize', handleResize);

    // Dispose Three.js resources
    renderer?.dispose();

    // Remove canvas
    if (container && renderer) {
      container.removeChild(renderer.domElement);
    }
  });

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    // Animation logic here

    renderer.render(scene, camera);
  }
</script>

<div class="canvas-container" bind:this={container}></div>

<style>
  .canvas-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
  }

  .canvas-container :global(canvas) {
    display: block;
  }
</style>
```

---

## Adding Animated Objects

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';

  let container;
  let animationId;
  let scene, camera, renderer;

  // Animated objects
  let particles;
  let geometries = [];

  onMount(() => {
    initScene();
    createParticles();
    createGeometries();
    animate();

    window.addEventListener('resize', handleResize);
  });

  onDestroy(() => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', handleResize);

    // Dispose all geometries and materials
    geometries.forEach(obj => {
      obj.geometry?.dispose();
      obj.material?.dispose();
    });

    particles?.geometry?.dispose();
    particles?.material?.dispose();

    renderer?.dispose();
  });

  function initScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight);
    camera.position.z = 30;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xff0000, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
  }

  function createParticles() {
    const count = 1000;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xc41e3a,
      transparent: true,
      opacity: 0.8
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  function createGeometries() {
    // Floating shapes
    const shapes = [
      new THREE.OctahedronGeometry(1),
      new THREE.TetrahedronGeometry(1),
      new THREE.IcosahedronGeometry(1)
    ];

    shapes.forEach((geometry, i) => {
      const material = new THREE.MeshStandardMaterial({
        color: 0xc41e3a,
        metalness: 0.7,
        roughness: 0.2
      });

      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.x = (Math.random() - 0.5) * 30;
      mesh.position.y = (Math.random() - 0.5) * 30;
      mesh.position.z = (Math.random() - 0.5) * 30;

      // Store rotation speed
      mesh.userData = {
        rotationSpeed: {
          x: Math.random() * 0.01,
          y: Math.random() * 0.01
        }
      };

      scene.add(mesh);
      geometries.push(mesh);
    });
  }

  function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    // Rotate particles
    if (particles) {
      particles.rotation.y += 0.001;
    }

    // Animate geometries
    geometries.forEach(mesh => {
      mesh.rotation.x += mesh.userData.rotationSpeed.x;
      mesh.rotation.y += mesh.userData.rotationSpeed.y;
    });

    renderer.render(scene, camera);
  }
</script>

<div class="canvas-container" bind:this={container}></div>
```

---

## Mouse Interaction

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';

  let container;
  let mouse = { x: 0, y: 0 };
  let targetRotation = { x: 0, y: 0 };

  // ... other Three.js setup

  function handleMouseMove(event) {
    // Normalize to -1 to 1
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Set target rotation based on mouse
    targetRotation.x = mouse.y * 0.5;
    targetRotation.y = mouse.x * 0.5;
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    // Smooth camera follow
    if (camera) {
      camera.rotation.x += (targetRotation.x - camera.rotation.x) * 0.05;
      camera.rotation.y += (targetRotation.y - camera.rotation.y) * 0.05;
    }

    renderer.render(scene, camera);
  }

  onMount(() => {
    // ... setup
    window.addEventListener('mousemove', handleMouseMove);
  });

  onDestroy(() => {
    window.removeEventListener('mousemove', handleMouseMove);
    // ... cleanup
  });
</script>
```

---

## Reactive Props

Make Three.js respond to Svelte props:

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';

  // Props
  export let color = '#c41e3a';
  export let particleCount = 1000;
  export let speed = 1;

  let scene, camera, renderer;
  let particles;
  let material;

  // Reactive - update material when color changes
  $: if (material) {
    material.color.set(color);
  }

  // Reactive - recreate particles when count changes
  $: if (scene && particleCount) {
    recreateParticles(particleCount);
  }

  function recreateParticles(count) {
    // Remove old
    if (particles) {
      scene.remove(particles);
      particles.geometry.dispose();
    }

    // Create new
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 100;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  function animate() {
    animationId = requestAnimationFrame(animate);

    if (particles) {
      particles.rotation.y += 0.001 * speed;
    }

    renderer.render(scene, camera);
  }
</script>
```

Usage:
```svelte
<ThreeBackground
  color="#00ABE4"
  particleCount={2000}
  speed={2}
/>
```

---

## Using Threlte (Svelte + Three.js)

For a more Svelte-like experience, consider [Threlte](https://threlte.xyz/):

```svelte
<script>
  import { Canvas } from '@threlte/core';
  import { OrbitControls } from '@threlte/extras';
  import Scene from './Scene.svelte';
</script>

<Canvas>
  <Scene />
  <OrbitControls />
</Canvas>
```

```svelte
<!-- Scene.svelte -->
<script>
  import { T, useFrame } from '@threlte/core';

  let mesh;
  let rotation = 0;

  useFrame(() => {
    rotation += 0.01;
    if (mesh) mesh.rotation.y = rotation;
  });
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 5]} />

<T.AmbientLight intensity={0.5} />
<T.PointLight position={[10, 10, 10]} />

<T.Mesh bind:ref={mesh}>
  <T.BoxGeometry args={[1, 1, 1]} />
  <T.MeshStandardMaterial color="#c41e3a" />
</T.Mesh>
```

Threlte provides:
- Declarative Three.js components
- Automatic disposal
- Svelte-native reactivity
- Better TypeScript support

---

## Performance Tips

1. **Limit draw calls**: Merge geometries when possible
2. **Use instancing** for repeated objects
3. **Dispose properly**: Always clean up geometries, materials, textures
4. **Throttle resize**: Don't update on every pixel
5. **Use `devicePixelRatio` cap**: `Math.min(window.devicePixelRatio, 2)`
6. **Lazy load Three.js**: It's a large library

```svelte
<script>
  import { onMount } from 'svelte';

  let ThreeScene;

  onMount(async () => {
    // Dynamic import for code splitting
    const module = await import('./ThreeScene.svelte');
    ThreeScene = module.default;
  });
</script>

{#if ThreeScene}
  <svelte:component this={ThreeScene} />
{:else}
  <div class="loading">Loading 3D scene...</div>
{/if}
```

---

## Exercise

1. Create a basic Three.js background with particles
2. Add floating geometric shapes
3. Implement mouse-following camera rotation
4. Make the color reactive to a prop
5. Add proper cleanup in onDestroy

Bonus: Try using Threlte for a more Svelte-idiomatic approach.
