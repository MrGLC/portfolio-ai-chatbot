import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box } from '@chakra-ui/react';

// Floating dots pattern
function FloatingDots() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.children.forEach((child, i) => {
        child.position.y += Math.sin(state.clock.elapsedTime + i) * 0.001;
        child.position.x += Math.cos(state.clock.elapsedTime + i) * 0.001;
      });
    }
  });
  
  return (
    <group ref={groupRef}>
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 5,
          ]}
        >
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color="#DC143C" opacity={0.2} transparent />
        </mesh>
      ))}
    </group>
  );
}

// Geometric line pattern
function GeometricLines() {
  const linesRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.rotation.z = state.clock.elapsedTime * 0.05;
    }
  });
  
  return (
    <group ref={linesRef}>
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh key={i} rotation={[0, 0, angle]}>
            <boxGeometry args={[0.01, 20, 0.01]} />
            <meshBasicMaterial color="#FFD700" opacity={0.1} transparent />
          </mesh>
        );
      })}
    </group>
  );
}

export const LightPattern: React.FC<{ intensity?: number }> = ({ intensity = 0.3 }) => {
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
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <ambientLight intensity={0.5} />
        
        <FloatingDots />
        <GeometricLines />
      </Canvas>
    </Box>
  );
};