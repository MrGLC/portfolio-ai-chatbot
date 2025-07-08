import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, OrbitControls, Environment, Sphere, Torus, Box as DreiBox } from '@react-three/drei';
import * as THREE from 'three';
import { Box } from '@chakra-ui/react';

// Elegant floating ring with glass material
function GlassRing({ position, scale = 1, rotation = [0, 0, 0], speed = 1 }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.002 * speed;
      meshRef.current.rotation.z += 0.001 * speed;
      
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(time * speed * 0.4) * 0.2;
    }
  });

  return (
    <Float speed={speed * 0.3} rotationIntensity={0.2} floatIntensity={0.3}>
      <Torus ref={meshRef} args={[1, 0.3, 32, 100]} position={position} scale={scale} rotation={rotation}>
        <MeshTransmissionMaterial
          backside
          samples={16}
          resolution={512}
          transmission={0.98}
          roughness={0.05}
          thickness={0.3}
          ior={1.5}
          chromaticAberration={0.03}
          anisotropy={0.3}
          distortion={0.0}
          distortionScale={0.2}
          temporalDistortion={0.1}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#DC143C"
          color="#ffffff"
          envMapIntensity={0.4}
        />
      </Torus>
    </Float>
  );
}

// Metallic sphere cluster
function SphereCluster({ position, count = 5 }: any) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
      const time = state.clock.elapsedTime;
      groupRef.current.position.x = position[0] + Math.sin(time * 0.2) * 0.3;
    }
  });

  const spheres = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 0.8;
      temp.push({
        position: [
          Math.cos(angle) * radius,
          Math.sin(i * 0.5) * 0.3,
          Math.sin(angle) * radius
        ],
        size: 0.2 + Math.random() * 0.2,
        color: i % 2 === 0 ? '#DC143C' : '#FFD700'
      });
    }
    return temp;
  }, [count]);

  return (
    <Float speed={0.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <group ref={groupRef} position={position}>
        {spheres.map((sphere, i) => (
          <Sphere key={i} args={[sphere.size, 32, 32]} position={sphere.position as [number, number, number]}>
            <meshPhysicalMaterial
              color={sphere.color}
              metalness={0.9}
              roughness={0.1}
              clearcoat={1}
              clearcoatRoughness={0}
              reflectivity={1}
              envMapIntensity={2}
            />
          </Sphere>
        ))}
      </group>
    </Float>
  );
}

// Abstract geometric structure
function GeometricStructure({ position }: any) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += 0.001;
      groupRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Float speed={0.4} rotationIntensity={0.5} floatIntensity={0.6}>
      <group ref={groupRef} position={position}>
        {/* Central core */}
        <mesh>
          <octahedronGeometry args={[0.5, 0]} />
          <meshPhysicalMaterial
            color="#FFD700"
            metalness={1}
            roughness={0}
            envMapIntensity={2}
            clearcoat={1}
          />
        </mesh>
        
        {/* Orbiting elements */}
        {[0, 1, 2, 3].map((i) => {
          const angle = (i / 4) * Math.PI * 2;
          return (
            <group key={i} rotation={[0, angle, 0]}>
              <mesh position={[1.5, 0, 0]}>
                <boxGeometry args={[0.3, 0.3, 0.3]} />
                <meshStandardMaterial
                  color="#DC143C"
                  emissive="#DC143C"
                  emissiveIntensity={0.5}
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
              <mesh position={[1.5, 0, 0]}>
                <ringGeometry args={[0.5, 0.6, 32]} />
                <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} />
              </mesh>
            </group>
          );
        })}
      </group>
    </Float>
  );
}

// Energy field particles
function EnergyField() {
  const count = 1500;
  const mesh = useRef<THREE.Points>(null);
  
  const [positions, colors, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      // Create particles in multiple distribution patterns
      const pattern = i % 3;
      
      if (pattern === 0) {
        // Spherical distribution
        const radius = 6 + Math.random() * 10;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = (radius * Math.sin(phi) * Math.sin(theta)) * 0.6;
        positions[i * 3 + 2] = radius * Math.cos(phi);
      } else if (pattern === 1) {
        // Spiral distribution
        const t = (i / count) * 4 * Math.PI;
        const radius = 3 + t * 0.5;
        
        positions[i * 3] = radius * Math.cos(t);
        positions[i * 3 + 1] = (t - 2 * Math.PI) * 0.5;
        positions[i * 3 + 2] = radius * Math.sin(t);
      } else {
        // Ring distribution
        const ring = Math.floor(Math.random() * 3);
        const angle = Math.random() * Math.PI * 2;
        const ringRadius = 5 + ring * 3;
        const height = (Math.random() - 0.5) * 4;
        
        positions[i * 3] = ringRadius * Math.cos(angle);
        positions[i * 3 + 1] = height;
        positions[i * 3 + 2] = ringRadius * Math.sin(angle);
      }
      
      // Color gradient with more variety
      const t = i / count;
      const colorChoice = Math.random();
      if (colorChoice < 0.3) {
        colors[i * 3] = 0.86;     // Crimson
        colors[i * 3 + 1] = 0.08;
        colors[i * 3 + 2] = 0.24;
      } else if (colorChoice < 0.6) {
        colors[i * 3] = 1.0;      // Gold
        colors[i * 3 + 1] = 0.84;
        colors[i * 3 + 2] = 0.0;
      } else if (colorChoice < 0.8) {
        colors[i * 3] = 0.0;      // Cyan
        colors[i * 3 + 1] = 0.67;
        colors[i * 3 + 2] = 0.89;
      } else {
        colors[i * 3] = 1.0;      // White
        colors[i * 3 + 1] = 1.0;
        colors[i * 3 + 2] = 1.0;
      }
      
      sizes[i] = Math.random() * 0.06 + 0.02;
    }
    
    return [positions, colors, sizes];
  }, []);
  
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.05;
      
      // Pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      mesh.current.scale.setScalar(scale);
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
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Flowing ribbon
function FlowingRibbon({ position, color }: any) {
  const curveRef = useRef<THREE.Mesh>(null);
  
  const curve = useMemo(() => {
    const points = [];
    for (let i = 0; i < 50; i++) {
      const t = i / 49;
      const x = Math.sin(t * Math.PI * 2) * 3;
      const y = (t - 0.5) * 4;
      const z = Math.cos(t * Math.PI * 2) * 3;
      points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points, true);
  }, []);

  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 100, 0.1, 8, true);
  }, [curve]);

  useFrame((state) => {
    if (curveRef.current) {
      curveRef.current.rotation.y += 0.003;
      curveRef.current.rotation.z += 0.001;
      
      // Undulating motion
      const time = state.clock.elapsedTime;
      curveRef.current.position.y = position[1] + Math.sin(time * 0.3) * 0.5;
    }
  });

  return (
    <Float speed={0.3} rotationIntensity={0.4} floatIntensity={0.4}>
      <mesh ref={curveRef} geometry={geometry} position={position}>
        <meshPhysicalMaterial
          color={color}
          metalness={0.8}
          roughness={0.2}
          envMapIntensity={1}
          clearcoat={1}
          clearcoatRoughness={0}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
    </Float>
  );
}

// Ground plane with grid
function GroundGrid() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && meshRef.current.material) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      if (material.uniforms && material.uniforms.time) {
        material.uniforms.time.value = state.clock.elapsedTime;
      }
    }
  });

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#1a1a1a') },
        color2: { value: new THREE.Color('#DC143C') },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec2 vUv;
        
        void main() {
          vec2 center = vec2(0.5, 0.5);
          float dist = distance(vUv, center);
          float pulse = sin(dist * 20.0 - time * 2.0) * 0.5 + 0.5;
          
          vec3 color = mix(color1, color2, pulse * 0.1);
          float alpha = 1.0 - dist;
          
          gl_FragColor = vec4(color, alpha * 0.3);
        }
      `,
      transparent: true,
    });
  }, []);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} material={shaderMaterial}>
      <planeGeometry args={[50, 50, 1, 1]} />
    </mesh>
  );
}

// Floating crystal formation
function CrystalFormation({ position }: any) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.002;
      const time = state.clock.elapsedTime;
      groupRef.current.position.y = position[1] + Math.sin(time * 0.3) * 0.3;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={groupRef} position={position}>
        {/* Main crystal */}
        <mesh>
          <coneGeometry args={[0.5, 2, 4]} />
          <meshPhysicalMaterial
            color="#00ABE4"
            metalness={0.9}
            roughness={0.1}
            transmission={0.6}
            thickness={0.5}
            envMapIntensity={3}
            clearcoat={1}
            clearcoatRoughness={0}
            ior={2.3}
          />
        </mesh>
        
        {/* Inverted crystal */}
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.5, 2, 4]} />
          <meshPhysicalMaterial
            color="#00ABE4"
            metalness={0.9}
            roughness={0.1}
            transmission={0.6}
            thickness={0.5}
            envMapIntensity={3}
            clearcoat={1}
            clearcoatRoughness={0}
            ior={2.3}
          />
        </mesh>
        
        {/* Smaller orbiting crystals */}
        {[0, 1, 2].map((i) => {
          const angle = (i / 3) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(angle) * 1.2, 0, Math.sin(angle) * 1.2]}>
              <octahedronGeometry args={[0.3, 0]} />
              <meshStandardMaterial
                color="#FFD700"
                emissive="#FFD700"
                emissiveIntensity={0.3}
                metalness={0.8}
                roughness={0.2}
              />
            </mesh>
          );
        })}
      </group>
    </Float>
  );
}

// Central focal element
function CentralFocus() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
      
      // Breathing effect
      const time = state.clock.elapsedTime;
      const scale = 1 + Math.sin(time * 0.5) * 0.1;
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Core sphere */}
      <Sphere args={[0.8, 64, 64]}>
        <meshPhysicalMaterial
          color="#DC143C"
          metalness={0.5}
          roughness={0}
          transmission={0.8}
          thickness={2}
          envMapIntensity={2}
          clearcoat={1}
          clearcoatRoughness={0}
          ior={2.5}
        />
      </Sphere>
      
      {/* Orbiting rings */}
      <mesh rotation={[0, 0, Math.PI / 4]}>
        <torusGeometry args={[1.5, 0.05, 16, 100]} />
        <meshBasicMaterial color="#FFD700" />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[1.7, 0.05, 16, 100]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh rotation={[0, Math.PI / 3, Math.PI / 6]}>
        <torusGeometry args={[1.9, 0.05, 16, 100]} />
        <meshBasicMaterial color="#DC143C" />
      </mesh>
    </group>
  );
}

// Dynamic lighting system
function LightingSystem() {
  const light1 = useRef<THREE.PointLight>(null);
  const light2 = useRef<THREE.PointLight>(null);
  const spotRef = useRef<THREE.SpotLight>(null);
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (light1.current) {
      light1.current.position.x = Math.sin(time * 0.3) * 8;
      light1.current.position.z = Math.cos(time * 0.3) * 8;
      light1.current.position.y = 2 + Math.sin(time * 0.5) * 2;
      light1.current.intensity = 1.5 + Math.sin(time * 2) * 0.5;
    }
    
    if (light2.current) {
      light2.current.position.x = Math.sin(time * 0.3 + Math.PI) * 8;
      light2.current.position.z = Math.cos(time * 0.3 + Math.PI) * 8;
      light2.current.position.y = 2 + Math.cos(time * 0.5) * 2;
      light2.current.intensity = 1.5 + Math.cos(time * 2) * 0.5;
    }
    
    if (spotRef.current) {
      spotRef.current.position.y = 8 + Math.sin(time * 0.2) * 2;
      spotRef.current.intensity = 2 + Math.sin(time * 1.5) * 0.5;
    }
  });
  
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight ref={light1} color="#DC143C" intensity={1.5} distance={20} />
      <pointLight ref={light2} color="#FFD700" intensity={1.5} distance={20} />
      <spotLight
        ref={spotRef}
        position={[0, 8, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={2}
        color="#FFFFFF"
        castShadow
      />
      <directionalLight
        position={[5, 5, 5]}
        intensity={0.5}
        color="#FFFFFF"
        castShadow
      />
    </>
  );
}

// Camera controller with smooth movements
function CameraController({ scrollY }: { scrollY: number }) {
  const { camera } = useThree();
  
  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Base position with scroll
    const targetZ = 10 + scrollY * 0.002;
    const targetY = 2 + scrollY * 0.001;
    
    // Subtle orbit motion
    const orbitX = Math.sin(time * 0.1) * 0.5;
    const orbitZ = Math.cos(time * 0.1) * 0.5;
    
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, orbitX, 0.02);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ + orbitZ, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.05);
    
    // Look at center with offset
    camera.lookAt(0, 0, 0);
  });
  
  return null;
}

// Main component
export const ModernAnimatedBackgroundV2: React.FC<{ intensity?: number }> = ({ 
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
        camera={{ position: [0, 1, 12], fov: 65 }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.3
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 8, 25]} />
        
        <LightingSystem />
        <Environment preset="city" />
        
        <CameraController scrollY={scrollY} />
        
        {/* Central focal point */}
        <CentralFocus />
        
        {/* Glass rings - better positioned in 3D space */}
        <GlassRing position={[-6, 2, -3]} scale={1.8} rotation={[0.5, 0, 0.2]} speed={0.8} />
        <GlassRing position={[5, -2, -4]} scale={1.4} rotation={[0, 0.5, 0.3]} speed={1.2} />
        <GlassRing position={[0, 4, -6]} scale={1.0} rotation={[0.3, 0.3, 0]} speed={1} />
        <GlassRing position={[-3, -3, 1]} scale={0.9} rotation={[0.7, 0.2, 0.4]} speed={0.9} />
        
        {/* Sphere clusters - better distributed around the scene */}
        <SphereCluster position={[-4, 1, 3]} count={5} />
        <SphereCluster position={[4, 2, 2]} count={4} />
        <SphereCluster position={[0, -3, 4]} count={6} />
        <SphereCluster position={[-2, 3, -2]} count={3} />
        
        {/* Geometric structures - positioned at diagonal corners */}
        <GeometricStructure position={[-7, 1, -2]} />
        <GeometricStructure position={[7, -1, 1]} />
        <GeometricStructure position={[0, -4, -3]} />
        
        {/* Flowing ribbons - creating depth layers */}
        <FlowingRibbon position={[-3, 0, -5]} color="#DC143C" />
        <FlowingRibbon position={[3, 1, -4]} color="#FFD700" />
        <FlowingRibbon position={[0, -2, -6]} color="#FFFFFF" />
        
        {/* Crystal formations - adding vertical interest */}
        <CrystalFormation position={[-5, 3, -3]} />
        <CrystalFormation position={[5, -3, -2]} />
        <CrystalFormation position={[0, 0, -7]} />
        
        {/* Energy field particles */}
        <EnergyField />
        
        {/* Ground grid */}
        <GroundGrid />
        
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