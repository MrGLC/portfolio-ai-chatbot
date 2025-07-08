import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Box } from '@chakra-ui/react';

// Modern torus knot shape with glass-like material
function GlassKnot({ position, scale = 1, speed = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002 * speed;
      meshRef.current.rotation.y += 0.003 * speed;
      
      // Gentle floating animation
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(time * speed * 0.3) * 0.3;
    }
  });

  return (
    <Float speed={speed * 0.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <MeshTransmissionMaterial
          ref={materialRef}
          backside
          samples={16}
          resolution={512}
          transmission={0.95}
          roughness={0.1}
          thickness={0.5}
          ior={1.5}
          chromaticAberration={0.06}
          anisotropy={0.1}
          distortion={0.0}
          distortionScale={0.3}
          temporalDistortion={0.1}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#DC143C"
          color="#DC143C"
          envMapIntensity={0.5}
        />
      </mesh>
    </Float>
  );
}

// Modern sphere with iridescent material
function IridescentSphere({ position, size = 1, speed = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.001 * speed;
      meshRef.current.rotation.y += 0.002 * speed;
      
      const time = state.clock.elapsedTime;
      meshRef.current.position.x = position[0] + Math.sin(time * speed * 0.2) * 0.5;
      meshRef.current.position.z = position[2] + Math.cos(time * speed * 0.2) * 0.5;
    }
  });

  return (
    <Float speed={speed * 0.5} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[size, 64, 64]} />
        <meshPhysicalMaterial
          roughness={0}
          metalness={0.5}
          thickness={2}
          transmission={0.6}
          envMapIntensity={3}
          clearcoat={1}
          clearcoatRoughness={0}
          color="#FFD700"
          ior={1.3}
          specularIntensity={1}
          specularColor="#ffffff"
          reflectivity={0.2}
        />
      </mesh>
    </Float>
  );
}

// DNA-like helix structure
function DNAHelix({ position }: any) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const spheres = useMemo(() => {
    const temp: { position: [number, number, number]; color: string; scale?: number }[] = [];
    const count = 20;
    
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const angle = t * Math.PI * 4;
      const y = (t - 0.5) * 8;
      
      // First helix
      temp.push({
        position: [Math.cos(angle) * 1.5, y, Math.sin(angle) * 1.5] as [number, number, number],
        color: '#DC143C'
      });
      
      // Second helix
      temp.push({
        position: [Math.cos(angle + Math.PI) * 1.5, y, Math.sin(angle + Math.PI) * 1.5] as [number, number, number],
        color: '#FFD700'
      });
      
      // Connections
      if (i % 3 === 0) {
        temp.push({
          position: [Math.cos(angle) * 0.75, y, Math.sin(angle) * 0.75] as [number, number, number],
          color: '#FFFFFF',
          scale: 0.3
        });
      }
    }
    
    return temp;
  }, []);

  return (
    <group ref={groupRef} position={position}>
      {spheres.map((sphere, i) => (
        <mesh key={i} position={sphere.position} scale={sphere.scale || 0.2}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={sphere.color}
            emissive={sphere.color}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

// Modern particle system with flowing motion
function FlowingParticles() {
  const count = 500;
  const mesh = useRef<THREE.Points>(null);
  
  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 10 + Math.random() * 10;
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Gradient colors
      const t = i / count;
      if (t < 0.5) {
        colors[i * 3] = 0.86;     // Crimson
        colors[i * 3 + 1] = 0.08;
        colors[i * 3 + 2] = 0.24;
      } else {
        colors[i * 3] = 1.0;      // Gold
        colors[i * 3 + 1] = 0.84;
        colors[i * 3 + 2] = 0.0;
      }
      
      sizes[i] = Math.random() * 0.1 + 0.05;
    }
    
    return [positions, colors, sizes];
  }, []);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
      
      // Animate particles in a flowing motion
      const positions = mesh.current.geometry.attributes.position.array as Float32Array;
      const time = state.clock.elapsedTime;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const x = positions[i3];
        const y = positions[i3 + 1];
        const z = positions[i3 + 2];
        
        // Create a flowing, spiral motion
        const angle = Math.atan2(z, x);
        const radius = Math.sqrt(x * x + z * z);
        const newAngle = angle + time * 0.1;
        
        positions[i3] = radius * Math.cos(newAngle);
        positions[i3 + 1] = y + Math.sin(time + i * 0.1) * 0.02;
        positions[i3 + 2] = radius * Math.sin(newAngle);
      }
      
      mesh.current.geometry.attributes.position.needsUpdate = true;
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
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Modern grid floor
function ModernGrid() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.z = time * 0.01;
      
      // Wave effect on the grid
      const positions = meshRef.current.geometry.attributes.position;
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const waveHeight = Math.sin(x * 0.1 + time) * 0.5 + Math.cos(z * 0.1 + time * 0.8) * 0.5;
        positions.setY(i, waveHeight * 0.3);
      }
      positions.needsUpdate = true;
    }
  });
  
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]}>
      <planeGeometry args={[50, 50, 50, 50]} />
      <meshStandardMaterial
        color="#1a1a1a"
        wireframe
        emissive="#DC143C"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

// Dynamic lighting
function DynamicLights() {
  const light1 = useRef<THREE.PointLight>(null);
  const light2 = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (light1.current) {
      light1.current.position.x = Math.sin(time * 0.5) * 10;
      light1.current.position.z = Math.cos(time * 0.5) * 10;
      light1.current.intensity = 2 + Math.sin(time * 2) * 0.5;
    }
    
    if (light2.current) {
      light2.current.position.x = Math.sin(time * 0.5 + Math.PI) * 10;
      light2.current.position.z = Math.cos(time * 0.5 + Math.PI) * 10;
      light2.current.intensity = 2 + Math.cos(time * 2) * 0.5;
    }
  });
  
  return (
    <>
      <pointLight ref={light1} color="#DC143C" intensity={2} distance={30} />
      <pointLight ref={light2} color="#FFD700" intensity={2} distance={30} />
      <pointLight position={[0, 10, 0]} color="#FFFFFF" intensity={1} />
    </>
  );
}

// Scroll-aware camera
function ScrollCamera({ scrollY }: { scrollY: number }) {
  const { camera } = useThree();
  
  useFrame(() => {
    const targetZ = 8 + scrollY * 0.002;
    const targetY = 0 + scrollY * 0.001;
    const targetRotation = -scrollY * 0.0001;
    
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRotation, 0.05);
  });
  
  return null;
}

// Main modern background component
export const ModernAnimatedBackground: React.FC<{ intensity?: number }> = ({ 
  intensity = 1
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
      <Canvas
        camera={{ position: [0, 0, 8], fov: 75 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.5
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#0a0a0a']} />
        <fog attach="fog" args={['#0a0a0a', 5, 30]} />
        
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <DynamicLights />
        
        {/* Environment for reflections */}
        <Environment preset="city" />
        
        <ScrollCamera scrollY={scrollY} />
        
        {/* Glass knots */}
        <GlassKnot position={[-3, 0, 0]} scale={1.2} speed={1} />
        <GlassKnot position={[3, 1, -2]} scale={0.8} speed={1.3} />
        
        {/* Iridescent spheres */}
        <IridescentSphere position={[0, -1, 1]} size={1.5} speed={0.8} />
        <IridescentSphere position={[-2, 2, -1]} size={0.8} speed={1.1} />
        <IridescentSphere position={[2, -2, 0]} size={1} speed={0.9} />
        
        {/* DNA Helix */}
        <DNAHelix position={[5, 0, -3]} />
        
        {/* Flowing particles */}
        <FlowingParticles />
        
        {/* Modern grid */}
        <ModernGrid />
        
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