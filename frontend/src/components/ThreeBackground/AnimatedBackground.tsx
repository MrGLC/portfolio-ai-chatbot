import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Box } from '@chakra-ui/react';

// Animated geometric shape component
function AnimatedShape({ position, color, size = 1, speed = 1 }: any) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.01 * speed;
      groupRef.current.rotation.y += 0.01 * speed;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.8} floatIntensity={0.8}>
      <group ref={groupRef} position={position}>
        <mesh castShadow receiveShadow>
          <octahedronGeometry args={[size, 0]} />
          <meshPhongMaterial
            color={color}
            shininess={100}
            specular={0xffffff}
          />
        </mesh>
        {/* Wireframe edges for better definition */}
        <lineSegments>
          <edgesGeometry args={[new THREE.OctahedronGeometry(size, 0)]} />
          <lineBasicMaterial color="#FFFFFF" opacity={0.5} transparent />
        </lineSegments>
      </group>
    </Float>
  );
}

// Particle field component
function ParticleField() {
  const count = 800;
  const mesh = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      
      // Dark red and gray particles
      const t = Math.random();
      if (t < 0.5) {
        // Very dark reds
        colors[i * 3] = 0.2 + t * 0.2; // R: 51-102
        colors[i * 3 + 1] = 0; // G: 0
        colors[i * 3 + 2] = 0; // B: 0
      } else {
        // Dark grays
        const brightness = 0.2 + (t - 0.5) * 0.3; // 0.2-0.35
        colors[i * 3] = brightness;
        colors[i * 3 + 1] = brightness;
        colors[i * 3 + 2] = brightness;
      }
    }
    
    return [positions, colors];
  }, []);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
      mesh.current.rotation.x = state.clock.elapsedTime * 0.01;
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
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} vertexColors sizeAttenuation={false} opacity={0.6} transparent />
    </points>
  );
}

// Wave mesh component - elegant grid pattern
function WaveMesh() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      // Subtle floating motion
      groupRef.current.position.y = -3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    }
  });
  
  const gridLines = useMemo(() => {
    const points = [];
    const gridSize = 20;
    const divisions = 20;
    const step = gridSize / divisions;
    
    // Create grid lines in X direction
    for (let i = 0; i <= divisions; i++) {
      const x = -gridSize / 2 + i * step;
      points.push(new THREE.Vector3(x, 0, -gridSize / 2));
      points.push(new THREE.Vector3(x, 0, gridSize / 2));
    }
    
    // Create grid lines in Z direction
    for (let i = 0; i <= divisions; i++) {
      const z = -gridSize / 2 + i * step;
      points.push(new THREE.Vector3(-gridSize / 2, 0, z));
      points.push(new THREE.Vector3(gridSize / 2, 0, z));
    }
    
    return points;
  }, []);
  
  return (
    <group ref={groupRef} position={[0, -3, 0]}>
      {/* Main grid */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={gridLines.length}
            array={new Float32Array(gridLines.flatMap(p => [p.x, p.y, p.z]))}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#333333" opacity={0.5} transparent />
      </line>
      
      {/* Accent lines - thicker cross pattern */}
      <group>
        <mesh rotation={[0, 0, 0]}>
          <boxGeometry args={[20, 0.02, 0.02]} />
          <meshStandardMaterial
            color="#660000"
            metalness={0.9}
            roughness={0.1}
            emissive="#660000"
            emissiveIntensity={0.3}
          />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[20, 0.02, 0.02]} />
          <meshStandardMaterial
            color="#660000"
            metalness={0.9}
            roughness={0.1}
            emissive="#660000"
            emissiveIntensity={0.3}
          />
        </mesh>
        {/* Diagonal accent */}
        <mesh rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[28.28, 0.02, 0.02]} />
          <meshStandardMaterial
            color="#333333"
            metalness={0.8}
            roughness={0.2}
            emissive="#333333"
            emissiveIntensity={0.2}
          />
        </mesh>
        <mesh rotation={[0, -Math.PI / 4, 0]}>
          <boxGeometry args={[28.28, 0.02, 0.02]} />
          <meshStandardMaterial
            color="#333333"
            metalness={0.8}
            roughness={0.2}
            emissive="#333333"
            emissiveIntensity={0.2}
          />
        </mesh>
      </group>
    </group>
  );
}

// Mouse interaction component
function MouseLight() {
  const { viewport, mouse } = useThree();
  const light = useRef<THREE.PointLight>(null);
  
  useFrame(() => {
    if (light.current) {
      light.current.position.x = mouse.x * viewport.width / 2;
      light.current.position.y = mouse.y * viewport.height / 2;
    }
  });
  
  return <pointLight ref={light} intensity={2} color="#FFFFFF" distance={15} />;
}

// Scroll-aware camera controller
function ScrollCamera({ scrollY }: { scrollY: number }) {
  const { camera } = useThree();
  
  useFrame(() => {
    // Move camera back as user scrolls down
    const targetZ = 5 + scrollY * 0.003;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.1);
    
    // Also move camera up slightly
    const targetY = -1 + scrollY * 0.001;
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.1);
  });
  
  return null;
}

// Main 3D scene component
export const AnimatedBackground: React.FC<{ intensity?: number; variant?: 'dark' | 'light' }> = ({ 
  intensity = 1,
  variant = 'dark' 
}) => {
  const isDark = variant === 'dark';
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  if (!mounted) return null;
  
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
    >
      {mounted && (
        <Canvas
          camera={{ position: [0, -1, 5], fov: 75 }}
          gl={{ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
          }}
          style={{ width: '100%', height: '100%' }}
        >
        <color attach="background" args={['#0D0E0E']} />
        <fog attach="fog" args={[isDark ? '#0D0E0E' : '#FFFFFF', 10 + scrollY * 0.01, 30 + scrollY * 0.02]} />
        <ambientLight intensity={0.4} />
        <hemisphereLight
          color={0xffffff}
          groundColor={0x444444}
          intensity={0.6}
        />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1.5} 
          color="#FFFFFF" 
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <spotLight
          position={[0, 5, 5]}
          intensity={1.5}
          color="#FFFFFF"
          angle={0.6}
          penumbra={0.5}
          castShadow
        />
        <MouseLight />
        
        {/* Scroll-aware camera */}
        <ScrollCamera scrollY={scrollY} />
        
        {/* Floating geometric shapes - dark contrasting theme */}
        <AnimatedShape position={[-2.5, 0.5, 0]} color="#2C0000" size={0.8} speed={1} />
        <AnimatedShape position={[2.5, -0.5, 0]} color="#CCCCCC" size={0.7} speed={0.8} />
        <AnimatedShape position={[0, 1, -2]} color="#000000" size={1} speed={1.2} />
        <AnimatedShape position={[-1.5, -1, 1]} color="#4B0000" size={0.6} speed={0.9} />
        <AnimatedShape position={[1.5, 0, -1]} color="#999999" size={0.5} speed={1.1} />
        <AnimatedShape position={[-3, 2, 0]} color="#1A0000" size={0.9} speed={0.7} />
        <AnimatedShape position={[3, -2, 0]} color="#666666" size={0.8} speed={1.3} />
        <AnimatedShape position={[0, -1.5, 1.5]} color="#330000" size={0.7} speed={0.85} />
        
        {/* Particle field */}
        <ParticleField />
        
        {/* Wave mesh at bottom */}
        <WaveMesh />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
      )}
    </Box>
  );
};