import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box } from '@chakra-ui/react';
import { usePerfProfile } from '../../hooks/usePerfProfile';

// Floating dots pattern
function FloatingDots({ count }: { count: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Stable positions keyed on count so they don't re-randomize every render
  const positions = useMemo(() => {
    return Array.from({ length: count }, () => [
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 5,
    ] as [number, number, number]);
  }, [count]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
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
  const profile = usePerfProfile();
  const dotCount = Math.round(50 * profile.particleScale);

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
        dpr={profile.dpr}
        frameloop={profile.animate ? 'always' : 'never'}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance"
        }}
      >
        <ambientLight intensity={0.5} />

        <FloatingDots count={dotCount} />
        <GeometricLines />
      </Canvas>
    </Box>
  );
};