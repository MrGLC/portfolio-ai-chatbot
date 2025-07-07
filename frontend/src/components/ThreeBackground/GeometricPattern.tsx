import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Instance, Instances, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Box } from '@chakra-ui/react';

// Animated instance component
function AnimatedInstance({ position, rotation, scale, color }: any) {
  const ref = useRef<any>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      ref.current.rotation.x = rotation[0] + Math.sin(t * 0.5) * 0.2;
      ref.current.rotation.y = rotation[1] + Math.cos(t * 0.3) * 0.2;
      ref.current.position.y = position[1] + Math.sin(t + position[0]) * 0.1;
    }
  });
  
  return (
    <Instance
      ref={ref}
      position={position}
      rotation={rotation}
      scale={scale}
      color={color}
    />
  );
}

// Grid of geometric shapes
function GeometricGrid() {
  const grid = [];
  const colors = ['#DC143C', '#FFD700', '#B91C3C', '#FFED4E', '#E85D75'];
  
  for (let x = -3; x <= 3; x++) {
    for (let z = -3; z <= 3; z++) {
      const position = [x * 1.5, 0, z * 1.5];
      const rotation = [Math.random() * Math.PI, Math.random() * Math.PI, 0];
      const scale = 0.3 + Math.random() * 0.2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      grid.push({
        position,
        rotation,
        scale,
        color,
        key: `${x}-${z}`
      });
    }
  }
  
  return (
    <Instances limit={100} position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial
        metalness={0.8}
        roughness={0.2}
        clearcoat={1}
        clearcoatRoughness={0}
      />
      {grid.map(({ key, ...props }) => (
        <AnimatedInstance key={key} {...props} />
      ))}
    </Instances>
  );
}

// Central focus element
function CentralElement() {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
    }
  });
  
  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshPhysicalMaterial
          color="#FFD700"
          metalness={1}
          roughness={0}
          clearcoat={1}
          clearcoatRoughness={0}
          reflectivity={1}
          emissive="#FFD700"
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0, 0, 0]} scale={1.5}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial color="#FFD700" wireframe opacity={0.2} transparent />
      </mesh>
    </group>
  );
}

// Light beams effect
function LightBeams() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });
  
  return (
    <group ref={groupRef}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
          <planeGeometry args={[0.1, 20]} />
          <meshBasicMaterial
            color="#FFD700"
            opacity={0.1}
            transparent
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

export const GeometricPattern: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={0}
      opacity={intensity}
    >
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <color attach="background" args={['#0D0E0E']} />
        <fog attach="fog" args={['#0D0E0E', 5, 20]} />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#FFD700" />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#DC143C" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={2}
          color="#FFD700"
          castShadow
        />
        
        <CentralElement />
        <GeometricGrid />
        <LightBeams />
        
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.3}
          scale={20}
          blur={2}
          far={10}
          color="#DC143C"
        />
        
        <Environment preset="city" />
      </Canvas>
    </Box>
  );
};