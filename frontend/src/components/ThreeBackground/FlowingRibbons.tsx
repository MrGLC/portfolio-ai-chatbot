import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Tube, GradientTexture, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { Box } from '@chakra-ui/react';

// Create flowing ribbon paths
function createRibbonPath(offset: number) {
  const points = [];
  for (let i = 0; i < 100; i++) {
    const t = i / 100;
    const x = Math.sin(t * Math.PI * 2 + offset) * 3;
    const y = (t - 0.5) * 6;
    const z = Math.cos(t * Math.PI * 3 + offset) * 2;
    points.push(new THREE.Vector3(x, y, z));
  }
  return new THREE.CatmullRomCurve3(points, true);
}

// Animated ribbon component
function FlowingRibbon({ curve, color1, color2, speed = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002 * speed;
    }
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime * speed;
    }
  });
  
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(color1) },
        color2: { value: new THREE.Color(color2) },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          float gradient = sin(vUv.x * 10.0 + time * 2.0) * 0.5 + 0.5;
          vec3 color = mix(color1, color2, gradient);
          float alpha = 0.6 + sin(vUv.x * 20.0 + time * 3.0) * 0.2;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
    });
  }, [color1, color2]);
  
  return (
    <mesh ref={meshRef}>
      <tubeGeometry args={[curve, 64, 0.3, 8, false]} />
      <primitive object={shaderMaterial} ref={materialRef} attach="material" />
    </mesh>
  );
}

// Glowing orbs
function GlowingOrb({ position, color, size = 0.5 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale * size);
    }
  });
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
        toneMapped={false}
      />
    </mesh>
  );
}

// Background gradient mesh
function BackgroundGradient() {
  return (
    <mesh position={[0, 0, -10]}>
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial>
        <GradientTexture
          stops={[0, 0.5, 1]}
          colors={['#0D0E0E', '#1A0000', '#0D0E0E']}
          size={1024}
        />
      </meshBasicMaterial>
    </mesh>
  );
}

export const FlowingRibbons: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const curves = useMemo(() => [
    createRibbonPath(0),
    createRibbonPath(Math.PI / 3),
    createRibbonPath(2 * Math.PI / 3),
  ], []);
  
  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      right={0}
      bottom={0}
      zIndex={0}
      opacity={intensity}
      overflow="hidden"
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        }}
      >
        <fog attach="fog" args={['#0D0E0E', 8, 20]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.5} color="#FFD700" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#DC143C" />
        
        <BackgroundGradient />
        
        {/* Flowing ribbons */}
        <FlowingRibbon curve={curves[0]} color1="#DC143C" color2="#FFD700" speed={1} />
        <FlowingRibbon curve={curves[1]} color1="#B91C3C" color2="#FFED4E" speed={0.8} />
        <FlowingRibbon curve={curves[2]} color1="#E85D75" color2="#FFD700" speed={1.2} />
        
        {/* Glowing orbs */}
        <GlowingOrb position={[3, 2, 0]} color="#FFD700" size={0.3} />
        <GlowingOrb position={[-3, -2, 1]} color="#DC143C" size={0.4} />
        <GlowingOrb position={[0, 0, -2]} color="#E85D75" size={0.35} />
        
        <Environment preset="night" />
      </Canvas>
    </Box>
  );
};