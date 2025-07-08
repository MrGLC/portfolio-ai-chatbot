import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree, extend } from '@react-three/fiber';
import { Float, OrbitControls, Environment, shaderMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { Box } from '@chakra-ui/react';

// Enhanced gem shader material with proper reflections
const RoyalGemMaterial = shaderMaterial(
  {
    time: 0,
    baseColor: new THREE.Color(0.5, 0.0, 0.0),
    highlightColor: new THREE.Color(1.0, 0.84, 0.0),
    fresnelPower: 2.0
  },
  // Vertex shader
  `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment shader with Fresnel effect
  `
    uniform float time;
    uniform vec3 baseColor;
    uniform vec3 highlightColor;
    uniform float fresnelPower;
    
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    
    void main() {
      vec3 viewDir = normalize(vViewPosition);
      float fresnel = pow(1.0 - dot(viewDir, vNormal), fresnelPower);
      
      // Create faceted look with sharp transitions
      float facetPattern = step(0.5, sin(vUv.x * 20.0) * sin(vUv.y * 20.0));
      
      vec3 color = mix(baseColor, highlightColor, fresnel + facetPattern * 0.2);
      
      // Add sparkle effect
      float sparkle = sin(time * 2.0 + vUv.x * 40.0) * sin(time * 3.0 + vUv.y * 40.0);
      sparkle = smoothstep(0.95, 1.0, sparkle);
      color += vec3(1.0, 0.9, 0.7) * sparkle;
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
);

extend({ RoyalGemMaterial });

// Crown Jewel Component - A properly faceted gem shape
function CrownJewel({ position, size = 1, color, speed = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);
  
  // Create a more complex gem geometry
  const geometry = useMemo(() => {
    const geo = new THREE.OctahedronGeometry(size, 0);
    // Scale it to look more like a cut gem
    geo.scale(1, 0.7, 1);
    return geo;
  }, [size]);
  
  useFrame((state) => {
    if (meshRef.current && materialRef.current) {
      // Slow, majestic rotation
      meshRef.current.rotation.y += 0.002 * speed;
      
      // Gentle bobbing
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(time * speed * 0.3) * 0.2;
      
      // Update shader time
      materialRef.current.uniforms.time.value = time;
    }
  });
  
  return (
    <Float speed={speed * 0.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group position={position}>
        {/* Main gem */}
        <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
          {/* @ts-ignore */}
          <royalGemMaterial
            ref={materialRef}
            baseColor={color}
            highlightColor="#FFD700"
            fresnelPower={2.5}
          />
        </mesh>
        
        {/* Gold setting/crown base */}
        <mesh position={[0, -size * 0.7, 0]} castShadow>
          <cylinderGeometry args={[size * 0.8, size * 0.9, size * 0.2, 16]} />
          <meshStandardMaterial
            color="#FFD700"
            metalness={0.95}
            roughness={0.05}
            envMapIntensity={1}
          />
        </mesh>
        
        {/* Crown prongs */}
        {[0, 72, 144, 216, 288].map((angle, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((angle * Math.PI) / 180) * size * 0.7,
              0,
              Math.sin((angle * Math.PI) / 180) * size * 0.7
            ]}
            rotation={[0, (angle * Math.PI) / 180, Math.PI / 6]}
          >
            <coneGeometry args={[size * 0.1, size * 0.8, 4]} />
            <meshStandardMaterial
              color="#FFD700"
              metalness={0.95}
              roughness={0.05}
            />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

// Royal Ornamental Pattern
function OrnamentalPattern({ position, size = 1 }: any) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // Very slow rotation for elegance
      groupRef.current.rotation.z += 0.001;
    }
  });
  
  // Create a fleur-de-lis like pattern
  return (
    <group ref={groupRef} position={position}>
      {/* Central vertical element */}
      <mesh castShadow>
        <boxGeometry args={[size * 0.1, size * 2, size * 0.1]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.9}
          roughness={0.1}
          emissive="#FFD700"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Horizontal crossbar */}
      <mesh position={[0, size * 0.5, 0]} castShadow>
        <boxGeometry args={[size * 1.5, size * 0.1, size * 0.1]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={0.9}
          roughness={0.1}
          emissive="#FFD700"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Decorative ends */}
      {[-1, 1].map((dir) => (
        <mesh key={dir} position={[dir * size * 0.7, size * 0.5, 0]} castShadow>
          <sphereGeometry args={[size * 0.2, 16, 16]} />
          <meshStandardMaterial
            color="#8B0000"
            metalness={0.3}
            roughness={0.7}
          />
        </mesh>
      ))}
    </group>
  );
}

// Grand architectural arch
function RoyalArch({ position, size = 1 }: any) {
  const archRef = useRef<THREE.Mesh>(null);
  
  return (
    <mesh ref={archRef} position={position} rotation={[0, 0, Math.PI]}>
      <torusGeometry args={[size * 15, size * 1, 8, 16, Math.PI]} />
      <meshStandardMaterial
        color="#1A1A1A"
        metalness={0.3}
        roughness={0.8}
        emissive="#8B0000"
        emissiveIntensity={0.02}
      />
    </mesh>
  );
}

// Elegant particle system - like golden dust motes
function RoyalDustMotes() {
  const count = 200; // Much fewer particles for elegance
  const mesh = useRef<THREE.Points>(null);
  
  const [positions, scales] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      
      scales[i] = Math.random() * 2 + 1;
    }
    
    return [positions, scales];
  }, []);
  
  useFrame((state) => {
    if (mesh.current) {
      // Very slow, majestic movement
      mesh.current.rotation.y = state.clock.elapsedTime * 0.02;
      
      // Gentle vertical drift
      const positions = mesh.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        const y = positions[i * 3 + 1];
        positions[i * 3 + 1] = ((y + 0.02) + 10) % 20 - 10;
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
          attach="attributes-scale"
          count={count}
          array={scales}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color="#FFD700"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// Mouse light for dramatic effect
function DramaticLight() {
  const { viewport, mouse } = useThree();
  const light = useRef<THREE.PointLight>(null);
  
  useFrame(() => {
    if (light.current) {
      const targetX = mouse.x * viewport.width / 2;
      const targetY = mouse.y * viewport.height / 2;
      
      light.current.position.x = THREE.MathUtils.lerp(light.current.position.x, targetX, 0.05);
      light.current.position.y = THREE.MathUtils.lerp(light.current.position.y, targetY, 0.05);
    }
  });
  
  return (
    <pointLight 
      ref={light} 
      intensity={0.5} 
      color="#FFEECC" 
      distance={30}
      castShadow
      shadow-mapSize={[512, 512]}
    />
  );
}

// Main Royal Background Component
export const RoyalAnimatedBackground: React.FC<{ intensity?: number }> = ({ 
  intensity = 1 
}) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
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
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2
        }}
        shadows
        style={{ width: '100%', height: '100%' }}
      >
        {/* Deep, rich background */}
        <color attach="background" args={['#0A0A0A']} />
        <fog attach="fog" args={['#0A0A0A', 15, 40]} />
        
        {/* Dramatic lighting setup */}
        <ambientLight intensity={0.1} color="#400080" />
        
        {/* Key light - main dramatic lighting */}
        <spotLight
          position={[10, 15, 10]}
          intensity={2}
          color="#FFEECC"
          angle={0.6}
          penumbra={0.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        
        {/* Rim light for edge definition */}
        <directionalLight
          position={[-5, 5, -5]}
          intensity={0.5}
          color="#FFD700"
        />
        
        {/* Fill light to soften shadows */}
        <pointLight
          position={[0, -10, 5]}
          intensity={0.3}
          color="#8B0000"
        />
        
        <DramaticLight />
        
        {/* Crown Jewels - Main focal points */}
        <CrownJewel position={[0, 0, 0]} size={1.5} color="#8B0000" speed={1} />
        <CrownJewel position={[-4, 2, -2]} size={0.8} color="#4B0082" speed={0.8} />
        <CrownJewel position={[4, -2, -2]} size={0.8} color="#8B0000" speed={1.2} />
        <CrownJewel position={[0, -3, -4]} size={0.6} color="#800020" speed={0.9} />
        
        {/* Ornamental patterns */}
        <OrnamentalPattern position={[-6, 0, -3]} size={1} />
        <OrnamentalPattern position={[6, 0, -3]} size={1} />
        
        {/* Grand arches in background */}
        <RoyalArch position={[0, -5, -20]} size={1} />
        <RoyalArch position={[0, -5, -30]} size={0.8} />
        
        {/* Elegant dust particles */}
        <RoyalDustMotes />
        
        {/* Even more subtle sparkles */}
        <Sparkles 
          count={50}
          size={2}
          scale={[20, 20, 20]}
          speed={0.2}
          color="#FFD700"
          opacity={0.3}
        />
        
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