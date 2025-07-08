import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Float, MeshDistortMaterial, OrbitControls, Environment, shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { Box } from '@chakra-ui/react';

// Custom shader for royal glowing particles
const GlowParticleMaterial = shaderMaterial(
  {
    time: 0,
    color: new THREE.Color(0.1, 0.3, 0.6),
    opacity: 0.8
  },
  // Vertex shader
  `
    uniform float time;
    attribute float aScale;
    attribute float aLife;
    varying float vLife;
    varying vec3 vPosition;
    
    void main() {
      vLife = aLife;
      vPosition = position;
      
      vec3 pos = position;
      // More elegant, slower movement for royal feel
      pos.x += sin(time * 0.2 + position.y * 0.05) * 0.2;
      pos.y += cos(time * 0.15 + position.x * 0.05) * 0.15;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      gl_Position = projectionMatrix * mvPosition;
      
      // Softer pulsing for elegance
      gl_PointSize = aScale * (300.0 / -mvPosition.z) * (0.7 + 0.3 * sin(aLife * 0.5 + time * 0.5));
    }
  `,
  // Fragment shader with golden glow
  `
    uniform vec3 color;
    uniform float opacity;
    varying float vLife;
    varying vec3 vPosition;
    
    void main() {
      float dist = length(gl_PointCoord - vec2(0.5));
      if (dist > 0.5) discard;
      
      float strength = 1.0 - smoothstep(0.0, 0.5, dist);
      
      // Royal golden glow
      vec3 goldGlow = vec3(1.0, 0.84, 0.0) * 0.3;
      vec3 finalColor = color + goldGlow * (1.0 - dist);
      
      gl_FragColor = vec4(finalColor, strength * opacity * vLife);
    }
  `
);

extend({ GlowParticleMaterial });

// Enhanced animated shape with glow effect
function EnhancedAnimatedShape({ position, color, size = 1, speed = 1 }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (groupRef.current && meshRef.current) {
      // Elegant, slow rotation for royal feel
      groupRef.current.rotation.x += 0.003 * speed;
      groupRef.current.rotation.y += 0.004 * speed;
      
      // Graceful floating animation
      const time = state.clock.elapsedTime;
      groupRef.current.position.y = position[1] + Math.sin(time * speed * 0.5 + position[0]) * 0.5;
      
      // Subtle breathing effect
      const pulse = 1 + Math.sin(time * speed) * 0.05;
      meshRef.current.scale.setScalar(size * pulse);
      
      // Royal glow animation
      if (glowRef.current) {
        glowRef.current.scale.setScalar(size * pulse * 1.2);
        (glowRef.current.material as any).opacity = 0.4 + Math.sin(time * 2) * 0.1;
      }
    }
  });

  const glowMaterial = useMemo(() => 
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(color).multiplyScalar(2),
      transparent: true,
      opacity: 0.3,
      side: THREE.BackSide
    }), [color]
  );

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      <group ref={groupRef} position={position}>
        {/* Glow effect */}
        <mesh ref={glowRef} scale={1.2}>
          <octahedronGeometry args={[size * 1.2, 0]} />
          <primitive object={glowMaterial} attach="material" />
        </mesh>
        
        {/* Main mesh with royal materials */}
        <mesh ref={meshRef} castShadow receiveShadow>
          <octahedronGeometry args={[size, 0]} />
          <meshPhysicalMaterial
            color={color}
            metalness={0.95}
            roughness={0.05}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive={color}
            emissiveIntensity={0.3}
            envMapIntensity={1}
          />
        </mesh>
        
        {/* Wireframe overlay */}
        <lineSegments>
          <edgesGeometry args={[new THREE.OctahedronGeometry(size, 0)]} />
          <lineBasicMaterial color="#FFFFFF" opacity={0.8} transparent linewidth={2} />
        </lineSegments>
      </group>
    </Float>
  );
}

// Enhanced particle system with custom shader
function EnhancedParticleField() {
  const count = 1200;
  const mesh = useRef<THREE.Points>(null);
  const materialRef = useRef<any>(null);
  
  const [positions, scales, lives] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const lives = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
      
      scales[i] = Math.random() * 3 + 1;
      lives[i] = Math.random();
    }
    
    return [positions, scales, lives];
  }, []);
  
  useFrame((state) => {
    if (mesh.current && materialRef.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.015;
      mesh.current.rotation.x = state.clock.elapsedTime * 0.008;
      
      // Update shader time
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
      
      // Update particle lives
      const livesArray = mesh.current.geometry.attributes.aLife.array as Float32Array;
      for (let i = 0; i < count; i++) {
        livesArray[i] = (livesArray[i] + 0.005) % 1;
      }
      mesh.current.geometry.attributes.aLife.needsUpdate = true;
    }
  });
  
  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScale"
          count={count}
          array={scales}
          itemSize={1}
        />
        <bufferAttribute
          attach="attributes-aLife"
          count={count}
          array={lives}
          itemSize={1}
        />
      </bufferGeometry>
      {/* @ts-ignore */}
      <glowParticleMaterial 
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        color="#FFD700"
        opacity={0.7}
      />
    </points>
  );
}

// Enhanced animated grid with energy waves
function EnhancedWaveMesh() {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.015;
      
      // Wave motion
      const time = state.clock.elapsedTime;
      groupRef.current.position.y = -3 + Math.sin(time * 0.5) * 0.3;
      
      // Scale breathing
      const scale = 1 + Math.sin(time * 0.3) * 0.05;
      groupRef.current.scale.setScalar(scale);
    }
    
    // Animate grid vertices for wave effect
    if (meshRef.current) {
      const geometry = meshRef.current.geometry;
      const positions = geometry.attributes.position;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const waveHeight = Math.sin(x * 0.5 + time) * 0.2 + Math.cos(z * 0.5 + time * 0.7) * 0.2;
        positions.setY(i, waveHeight);
      }
      positions.needsUpdate = true;
    }
  });
  
  const gridGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(30, 30, 30, 30);
    geometry.rotateX(-Math.PI / 2);
    return geometry;
  }, []);
  
  return (
    <group ref={groupRef} position={[0, -3, 0]}>
      {/* Royal grid pattern with ornamental design */}
      <mesh ref={meshRef} geometry={gridGeometry}>
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.95}
          roughness={0.05}
          wireframe
          emissive="#FFD700"
          emissiveIntensity={0.4}
        />
      </mesh>
      
      {/* Royal crown-like beams */}
      <group>
        {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((angle, i) => (
          <mesh key={i} rotation={[0, angle, 0]} position={[0, 0.5, 0]}>
            <boxGeometry args={[30, 0.08, 0.08]} />
            <meshStandardMaterial
              color="#8B0000"
              emissive="#FFD700"
              emissiveIntensity={1.0}
              metalness={1}
              roughness={0}
            />
          </mesh>
        ))}
        
        {/* Crown jewels - decorative elements */}
        {[0, Math.PI / 3, 2 * Math.PI / 3, Math.PI, 4 * Math.PI / 3, 5 * Math.PI / 3].map((angle, i) => (
          <mesh key={`jewel-${i}`} position={[
            Math.cos(angle) * 8,
            0.8,
            Math.sin(angle) * 8
          ]}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={1.2}
              metalness={1}
              roughness={0}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Enhanced mouse light with trail effect
function EnhancedMouseLight() {
  const { viewport, mouse } = useThree();
  const light = useRef<THREE.PointLight>(null);
  const trail = useRef<THREE.Vector3[]>([]);
  const trailMeshes = useRef<THREE.Mesh[]>([]);
  
  useFrame(() => {
    if (light.current) {
      const targetX = mouse.x * viewport.width / 2;
      const targetY = mouse.y * viewport.height / 2;
      
      // Smooth movement with lerp
      light.current.position.x = THREE.MathUtils.lerp(light.current.position.x, targetX, 0.1);
      light.current.position.y = THREE.MathUtils.lerp(light.current.position.y, targetY, 0.1);
      
      // Dynamic intensity based on movement
      const movement = Math.abs(targetX - light.current.position.x) + Math.abs(targetY - light.current.position.y);
      light.current.intensity = 3 + movement * 10;
    }
  });
  
  return (
    <>
      <pointLight ref={light} intensity={3} color="#ff0066" distance={25} />
      <pointLight position={[0, 0, 5]} intensity={1} color="#00ffff" distance={20} />
    </>
  );
}

// Enhanced parallax camera with multi-layer movement
function EnhancedScrollCamera({ scrollY }: { scrollY: number }) {
  const { camera } = useThree();
  
  useFrame(() => {
    // Multi-layer parallax
    const targetZ = 5 + scrollY * 0.005;
    const targetY = -1 + scrollY * 0.002;
    const targetRotation = -scrollY * 0.0002;
    
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotation, 0.05);
  });
  
  return null;
}

// Main enhanced background component
export const EnhancedAnimatedBackground: React.FC<{ 
  intensity?: number; 
  variant?: 'dark' | 'royal' | 'neon' 
}> = ({ 
  intensity = 1,
  variant = 'royal' 
}) => {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      requestAnimationFrame(() => {
        setScrollY(window.scrollY);
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  if (!mounted) return null;
  
  const colorSchemes = {
    dark: {
      bg: '#0D0E0E',
      primary: '#2C0000',
      secondary: '#4B0000',
      accent: '#660000',
      particles: '#ff0066'
    },
    royal: {
      bg: '#0A0A0A',
      primary: '#8B0000',      // Dark crimson red
      secondary: '#FFD700',    // Royal gold
      accent: '#4B0082',       // Indigo
      particles: '#DC143C'     // Crimson
    },
    neon: {
      bg: '#0A0A0A',
      primary: '#FF006E',
      secondary: '#8338EC',
      accent: '#3A86FF',
      particles: '#FF006E'
    }
  };
  
  const colors = colorSchemes[variant];
  
  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      right={0}
      bottom={0}
      width="100%"
      height="100%"
      zIndex={0}
      opacity={intensity}
      pointerEvents="none"
      style={{
        background: `radial-gradient(ellipse at center, ${colors.bg}00 0%, ${colors.bg} 100%)`
      }}
    >
      <Canvas
        camera={{ position: [0, -1, 5], fov: 75 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={[colors.bg]} />
        <fog attach="fog" args={[colors.bg, 10, 35]} />
        
        {/* Enhanced lighting */}
        <ambientLight intensity={0.3} />
        <hemisphereLight
          color={0xffffff}
          groundColor={new THREE.Color(colors.accent)}
          intensity={0.5}
        />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.8} 
          color="#FFFFFF" 
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <spotLight
          position={[0, 8, 5]}
          intensity={2}
          color={colors.particles}
          angle={0.6}
          penumbra={0.8}
          castShadow
        />
        
        <EnhancedMouseLight />
        <EnhancedScrollCamera scrollY={scrollY} />
        
        {/* Enhanced floating shapes - larger and more prominent */}
        <EnhancedAnimatedShape position={[-3, 0.5, 0]} color={colors.primary} size={1.8} speed={1} />
        <EnhancedAnimatedShape position={[3, -0.5, 0]} color={colors.secondary} size={1.5} speed={0.8} />
        <EnhancedAnimatedShape position={[0, 1.5, -2]} color={colors.accent} size={2} speed={1.2} />
        <EnhancedAnimatedShape position={[-2, -1, 1]} color={colors.particles} size={1.3} speed={0.9} />
        <EnhancedAnimatedShape position={[2, 0, -1]} color={colors.primary} size={1.2} speed={1.1} />
        <EnhancedAnimatedShape position={[-4, 2, 0]} color={colors.secondary} size={1.6} speed={0.7} />
        <EnhancedAnimatedShape position={[4, -2, 0]} color={colors.accent} size={1.4} speed={1.3} />
        <EnhancedAnimatedShape position={[0, -1.5, 1.5]} color={colors.particles} size={1.4} speed={0.85} />
        
        {/* Enhanced particle system */}
        <EnhancedParticleField />
        
        {/* Enhanced wave grid */}
        <EnhancedWaveMesh />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </Box>
  );
};