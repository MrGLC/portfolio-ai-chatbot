import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Box } from '@chakra-ui/react';

// Sharp diamond-shaped jewel with extreme shine
function RedDiamond({ position, scale = 1, rotation = [0, 0, 0], speed = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003 * speed;
      meshRef.current.rotation.z += 0.001 * speed;
      
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(time * speed * 0.3) * 0.2;
    }
  });

  return (
    <Float speed={speed * 0.3} rotationIntensity={0.4} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position} scale={scale} rotation={rotation}>
        <octahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color="#DC143C"
          metalness={1}
          roughness={0}
          envMapIntensity={8}
          clearcoat={1}
          clearcoatRoughness={0}
          reflectivity={1}
          transmission={0.95}
          thickness={0.8}
          ior={2.8}
          specularIntensity={1}
          specularColor="#FFFFFF"
          emissive="#DC143C"
          emissiveIntensity={0.4}
        />
      </mesh>
    </Float>
  );
}

// Ruby-like jewel cluster
function RubyCluster({ position, count = 5 }: any) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      const time = state.clock.elapsedTime;
      groupRef.current.position.x = position[0] + Math.sin(time * 0.2) * 0.3;
    }
  });

  const rubies = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.8;
      temp.push({
        position: [
          Math.cos(angle) * radius,
          Math.sin(i * 0.5) * 0.3,
          Math.sin(angle) * radius
        ] as [number, number, number],
        size: 0.3 + Math.random() * 0.2,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI] as [number, number, number]
      });
    }
    return temp;
  }, [count]);

  return (
    <Float speed={0.4} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={groupRef} position={position}>
        {rubies.map((ruby, i) => (
          <mesh key={i} position={ruby.position} scale={ruby.size} rotation={ruby.rotation}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshPhysicalMaterial
              color="#8B0000"
              metalness={1}
              roughness={0}
              envMapIntensity={6}
              clearcoat={1}
              clearcoatRoughness={0}
              reflectivity={1}
              transmission={0.8}
              thickness={0.3}
              ior={2.5}
              emissive="#FF0000"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Crystalline formation with sharp edges
function CrystalSpike({ position, height = 2, color = "#DC143C" }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.y += 0.001;
      meshRef.current.position.y = position[1] + Math.sin(time * 0.4) * 0.15;
      
      // Pulsing emissive effect
      const material = meshRef.current.material as THREE.MeshPhysicalMaterial;
      material.emissiveIntensity = 0.3 + Math.sin(time * 2) * 0.2;
    }
  });

  return (
    <Float speed={0.3} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef} position={position}>
        <coneGeometry args={[0.5, height, 4, 1]} />
        <meshPhysicalMaterial
          color={color}
          metalness={1}
          roughness={0}
          envMapIntensity={7}
          clearcoat={1}
          clearcoatRoughness={0}
          reflectivity={1}
          transmission={0.95}
          thickness={1}
          ior={2.8}
          specularIntensity={1}
          specularColor="#FFFFFF"
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

// Faceted gem with extreme shine
function FacetedGem({ position, scale = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002;
      meshRef.current.rotation.y += 0.003;
      
      // Sparkle effect
      const time = state.clock.elapsedTime;
      const material = meshRef.current.material as THREE.MeshPhysicalMaterial;
      material.envMapIntensity = 5 + Math.sin(time * 3) * 2;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.5} floatIntensity={0.6}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <icosahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color="#FF1493"
          metalness={1}
          roughness={0}
          envMapIntensity={7}
          clearcoat={1}
          clearcoatRoughness={0}
          reflectivity={1}
          transmission={0.85}
          thickness={0.8}
          ior={3.0}
          specularIntensity={1}
          specularColor="#FFFFFF"
          emissive="#DC143C"
          emissiveIntensity={0.4}
        />
      </mesh>
    </Float>
  );
}

// Sparkling particles
function SparkleField() {
  const count = 2000;
  const mesh = useRef<THREE.Points>(null);
  
  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Create sparkles throughout the scene
      const spread = 20;
      positions[i * 3] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 1] = (Math.random() - 0.5) * spread;
      positions[i * 3 + 2] = (Math.random() - 0.5) * spread;
      
      // Red-tinted sparkles
      const intensity = 0.5 + Math.random() * 0.5;
      colors[i * 3] = 1.0;
      colors[i * 3 + 1] = intensity * 0.3;
      colors[i * 3 + 2] = intensity * 0.3;
      
      sizes[i] = Math.random() * 0.05 + 0.01;
    }
    
    return [positions, colors, sizes];
  }, []);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
      
      // Twinkling effect
      const time = state.clock.elapsedTime;
      const positions = mesh.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(time + i) * 0.001;
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
        size={0.03}
        vertexColors
        transparent
        opacity={0.9}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Central crown jewel
function CrownJewel() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
      
      // Breathing effect
      const time = state.clock.elapsedTime;
      const scale = 1 + Math.sin(time * 0.5) * 0.05;
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main jewel - bigger and shinier */}
      <mesh>
        <octahedronGeometry args={[1.8, 0]} />
        <meshPhysicalMaterial
          color="#DC143C"
          metalness={1}
          roughness={0}
          envMapIntensity={10}
          clearcoat={1}
          clearcoatRoughness={0}
          reflectivity={1}
          transmission={0.98}
          thickness={3}
          ior={3.5}
          specularIntensity={1}
          specularColor="#FFFFFF"
          emissive="#FF0000"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Surrounding smaller gems */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(angle) * 3, 0, Math.sin(angle) * 3]}>
            <tetrahedronGeometry args={[0.6, 0]} />
            <meshPhysicalMaterial
              color="#8B0000"
              metalness={1}
              roughness={0}
              envMapIntensity={8}
              clearcoat={1}
              clearcoatRoughness={0}
              reflectivity={1}
              transmission={0.9}
              thickness={1}
              ior={2.8}
              emissive="#DC143C"
              emissiveIntensity={0.5}
            />
          </mesh>
        );
      })}
    </group>
  );
}

// Dynamic lighting for maximum shine
function JewelLighting() {
  const light1 = useRef<THREE.SpotLight>(null);
  const light2 = useRef<THREE.SpotLight>(null);
  const light3 = useRef<THREE.PointLight>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (light1.current) {
      light1.current.position.x = Math.sin(time * 0.3) * 10;
      light1.current.position.z = Math.cos(time * 0.3) * 10;
      light1.current.intensity = 3 + Math.sin(time * 2) * 0.5;
    }
    
    if (light2.current) {
      light2.current.position.x = Math.sin(time * 0.3 + Math.PI) * 10;
      light2.current.position.z = Math.cos(time * 0.3 + Math.PI) * 10;
      light2.current.intensity = 3 + Math.cos(time * 2) * 0.5;
    }
    
    if (light3.current) {
      light3.current.intensity = 2 + Math.sin(time * 1.5) * 0.5;
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.8} />
      <spotLight
        ref={light1}
        position={[10, 10, 10]}
        angle={0.3}
        penumbra={0.3}
        intensity={5}
        color="#FFFFFF"
        castShadow
      />
      <spotLight
        ref={light2}
        position={[-10, 10, -10]}
        angle={0.3}
        penumbra={0.3}
        intensity={5}
        color="#FFFFFF"
        castShadow
      />
      <pointLight ref={light3} position={[0, 8, 0]} color="#FF0000" intensity={3} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={2}
        color="#FFFFFF"
      />
      {/* Additional lights for more shine */}
      <pointLight position={[0, 0, 5]} color="#FFFFFF" intensity={2} />
      <pointLight position={[0, 0, -5]} color="#FFFFFF" intensity={2} />
    </>
  );
}

// Camera controller
function CameraController({ scrollY }: { scrollY: number }) {
  const { camera } = useThree();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Base position with scroll
    const targetZ = 12 + scrollY * 0.002;
    const targetY = 1 + scrollY * 0.001;
    
    // Subtle orbit motion
    const orbitX = Math.sin(time * 0.1) * 0.5;
    const orbitZ = Math.cos(time * 0.1) * 0.5;
    
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, orbitX, 0.02);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ + orbitZ, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

// Main component
export const RedJewelBackground: React.FC<{ intensity?: number }> = ({ 
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
        camera={{ position: [0, 1, 8], fov: 70 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 2.0
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#2D0505']} />
        <fog attach="fog" args={['#4A0808', 5, 25]} />
        
        <JewelLighting />
        <Environment preset="sunset" />
        
        <CameraController scrollY={scrollY} />
        
        {/* Central crown jewel */}
        <CrownJewel />
        
        {/* Red diamonds distributed around - bigger and more separated */}
        <RedDiamond position={[-8, 3, -2]} scale={2.5} rotation={[0.5, 0, 0.2]} speed={0.8} />
        <RedDiamond position={[8, -3, -3]} scale={2.0} rotation={[0, 0.5, 0.3]} speed={1.2} />
        <RedDiamond position={[0, 5, -5]} scale={1.8} rotation={[0.3, 0.3, 0]} speed={1} />
        <RedDiamond position={[-4, -4, 2]} scale={1.5} rotation={[0.7, 0.2, 0.4]} speed={0.9} />
        <RedDiamond position={[4, 4, -1]} scale={1.2} rotation={[0.2, 0.7, 0.1]} speed={1.1} />
        
        {/* Ruby clusters - bigger and more separated */}
        <RubyCluster position={[-6, 1, 4]} count={7} />
        <RubyCluster position={[6, 3, 3]} count={5} />
        <RubyCluster position={[0, -4, 5]} count={8} />
        <RubyCluster position={[-3, 4, -3]} count={4} />
        <RubyCluster position={[3, -2, -4]} count={6} />
        
        {/* Crystal spikes - bigger and more separated */}
        <CrystalSpike position={[-9, 0, -3]} height={4} color="#DC143C" />
        <CrystalSpike position={[9, 0, 2]} height={3.5} color="#8B0000" />
        <CrystalSpike position={[0, -5, -4]} height={3} color="#FF1493" />
        <CrystalSpike position={[-7, 4, -4]} height={3.2} color="#DC143C" />
        <CrystalSpike position={[7, -4, -3]} height={3.8} color="#8B0000" />
        <CrystalSpike position={[0, 6, -2]} height={2.5} color="#FF1493" />
        
        {/* Faceted gems - bigger and more separated */}
        <FacetedGem position={[-5, 0, -6]} scale={1.8} />
        <FacetedGem position={[5, 1, -5]} scale={1.5} />
        <FacetedGem position={[0, -3, -7]} scale={1.6} />
        <FacetedGem position={[-7, -1, 3]} scale={1.3} />
        <FacetedGem position={[7, 2, 1]} scale={1.4} />
        <FacetedGem position={[0, 3, -1]} scale={1.2} />
        
        {/* Sparkling particles */}
        <SparkleField />
        
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableRotate={false}
          target={[0, 0, 0]}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </Box>
  );
};