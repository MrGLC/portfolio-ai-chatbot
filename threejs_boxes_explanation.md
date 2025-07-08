# Three.js 3D Animated Background Implementation

## Overview
This implementation creates a dynamic 3D background using Three.js and React Three Fiber, featuring floating geometric shapes, particle systems, and a grid pattern that responds to user scroll with a parallax effect.

## Technology Stack
- **Three.js**: Core 3D graphics library
- **React Three Fiber (R3F)**: React renderer for Three.js
- **@react-three/drei**: Helper components for R3F
- **Framer Motion**: Animation library for React components

## Key Files

### 1. `/frontend/src/components/ThreeBackground/AnimatedBackground.tsx`
The main 3D scene component containing:
- Animated octahedron shapes
- Particle field system
- Grid pattern with animated lines
- Scroll-responsive camera
- Mouse-following light

### 2. `/frontend/src/components/Layout/index.tsx`
Layout wrapper that includes the persistent 3D background across all pages.

### 3. `/frontend/src/pages/HomePage.tsx`
Home page with transparent red overlay sections that allow the 3D background to show through.

## Core Concepts

### 1. **React Three Fiber Components**
```jsx
<Canvas>           // WebGL canvas wrapper
<mesh>            // 3D object container
<octahedronGeometry> // 8-sided polyhedron shape
<meshPhongMaterial>  // Material with shiny/reflective properties
```

### 2. **Animated Shapes**
Each floating shape consists of:
- **Geometry**: Octahedron (8-faced polyhedron)
- **Material**: PhongMaterial with customizable color and shininess
- **Wireframe**: White edge lines for definition
- **Animation**: Rotation and floating motion using `useFrame` hook

### 3. **Lighting System**
- **Ambient Light**: Base illumination (0.4 intensity)
- **Hemisphere Light**: Natural sky/ground lighting
- **Directional Light**: Main light source with shadows
- **Spot Light**: Focused beam for highlights
- **Mouse Light**: Interactive light that follows cursor

### 4. **Particle System**
- 800 particles with dark red and gray colors
- Rotating particle field for depth
- Buffer geometry for performance

### 5. **Grid Pattern**
- 20x20 grid lines at the bottom
- Cross pattern with thicker accent lines
- Diagonal lines for visual interest
- Floating animation with rotation

### 6. **Parallax Effect**
- Camera moves backward as user scrolls down
- Creates "looking through a window" effect
- Implemented via `ScrollCamera` component

## Color Scheme
- **Dark Theme**: Very dark reds (#2C0000, #4B0000, #1A0000)
- **Contrast Colors**: Grays (#CCCCCC, #999999, #666666)
- **Accent**: Pure black (#000000) for maximum contrast
- **Particles**: Dark red and gray gradients

## Material Properties
```jsx
<meshPhongMaterial
  color={color}           // Base color
  shininess={100}         // Specular highlight intensity
  specular={0xffffff}     // Color of highlights
/>
```

## Performance Optimizations
- `powerPreference: "high-performance"` for GPU usage
- Mounted state check before rendering
- Optimized particle count and size
- Efficient buffer geometry usage

## Key Animation Techniques

### 1. **Float Animation** (using drei)
```jsx
<Float speed={speed} rotationIntensity={0.8} floatIntensity={0.8}>
```

### 2. **Manual Animation** (using useFrame)
```jsx
useFrame((state) => {
  groupRef.current.rotation.x += 0.01 * speed;
  groupRef.current.rotation.y += 0.01 * speed;
});
```

### 3. **Scroll-based Animation**
```jsx
const targetZ = 5 + scrollY * 0.003;
camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1);
```

## Common Issues & Solutions

### 1. **Dark Colors Not Visible**
- **Problem**: meshStandardMaterial requires proper lighting
- **Solution**: Use meshPhongMaterial or meshBasicMaterial

### 2. **Color Space Issues**
- **Problem**: Colors appear washed out
- **Solution**: Proper lighting setup with hemisphereLight

### 3. **TypeScript Errors**
- **Problem**: Complex union types with motion components
- **Solution**: Use native motion elements (motion.div instead of motion(Component))

## Integration Pattern
The 3D background is integrated as a fixed position element behind all content:
```jsx
<AnimatedBackground intensity={1} variant="dark" />
<Box position="relative" zIndex={1}>
  {/* Page content */}
</Box>
```

Red sections use transparent overlays to show the 3D background, while white sections have their own light pattern background.