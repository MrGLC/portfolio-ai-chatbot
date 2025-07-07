import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Box } from '@chakra-ui/react';

// Animated geometric shape component
function AnimatedShape({ position, color, size = 1, speed = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01 * speed;
      meshRef.current.rotation.y += 0.01 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <octahedronGeometry args={[size, 0]} />
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

// Particle field component
function ParticleField() {
  const count = 500;
  const mesh = useRef<THREE.Points>(null);
  
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      // Royal red to gold gradient colors
      const t = Math.random();
      colors[i * 3] = 0.86 + t * 0.14; // R: 220-255
      colors[i * 3 + 1] = 0.08 + t * 0.72; // G: 20-215
      colors[i * 3 + 2] = 0.24 - t * 0.24; // B: 60-0
    }
    
    return [positions, colors];
  }, []);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.05;
      mesh.current.rotation.x = state.clock.elapsedTime * 0.03;
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

// Wave mesh component
function WaveMesh() {
  const mesh = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (mesh.current) {
      const { geometry } = mesh.current;
      const { attributes } = geometry;
      const { position } = attributes;
      const positionArray = position.array as Float32Array;
      
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i);
        const y = position.getY(i);
        const wave = Math.sin(x * 2 + state.clock.elapsedTime) * 0.1 + 
                    Math.sin(y * 2 + state.clock.elapsedTime * 0.8) * 0.1;
        position.setZ(i, wave);
      }
      position.needsUpdate = true;
    }
  });
  
  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[10, 10, 32, 32]} />
      <meshStandardMaterial
        color="#DC143C"
        wireframe
        opacity={0.3}
        transparent
        emissive="#DC143C"
        emissiveIntensity={0.2}
      />
    </mesh>
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
  
  return <pointLight ref={light} intensity={1} color="#FFD700" distance={10} />;
}

// Main 3D scene component
export const AnimatedBackground: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={0}
      opacity={intensity}
      pointerEvents="none"
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <fog attach="fog" args={['#0D0E0E', 5, 15]} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[10, 10, 5]} intensity={0.5} />
        <MouseLight />
        
        {/* Floating geometric shapes */}
        <AnimatedShape position={[-2, 1, 0]} color="#DC143C" size={0.4} speed={1} />
        <AnimatedShape position={[2, -1, 0]} color="#FFD700" size={0.3} speed={0.8} />
        <AnimatedShape position={[0, 0, -2]} color="#B91C3C" size={0.5} speed={1.2} />
        <AnimatedShape position={[-1.5, -0.5, 1]} color="#FFED4E" size={0.35} speed={0.9} />
        <AnimatedShape position={[1.5, 0.5, -1]} color="#E85D75" size={0.25} speed={1.1} />
        
        {/* Particle field */}
        <ParticleField />
        
        {/* Wave mesh at bottom */}
        <WaveMesh />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </Box>
  );
};