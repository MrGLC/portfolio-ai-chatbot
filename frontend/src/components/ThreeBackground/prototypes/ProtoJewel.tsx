/**
 * Prototype hero scene A — "Refined Royal Jewel"
 *
 * One art-directed centerpiece: a single faceted ruby gem catching gold rim
 * light, floating over a deep-red radial-gradient void with sparse gold dust.
 * Restraint by design — 1 gem, 3 lights, 1 particle system, 1 backdrop.
 */
import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { usePerfProfile } from '../../../hooks/usePerfProfile';
import type { PerfProfile } from '../../../hooks/usePerfProfile';

/* ------------------------------------------------------------------ */
/* Backdrop — static radial gradient, near-black red edges -> deep red */
/* ------------------------------------------------------------------ */

const BG_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const BG_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uEdgeColor;
  uniform vec3 uCenterColor;
  uniform vec2 uFocus;
  void main() {
    // Radial falloff from the glow focus (sits behind the gem).
    float d = distance(vUv, uFocus);
    float t = smoothstep(0.05, 0.62, d);
    vec3 color = mix(uCenterColor, uEdgeColor, t);
    gl_FragColor = vec4(color, 1.0);
  }
`;

interface BackdropProps {
  focusX: number; // uv-space x of the glow center (0..1)
}

const Backdrop: React.FC<BackdropProps> = ({ focusX }) => {
  const uniforms = useMemo(
    () => ({
      uEdgeColor: { value: new THREE.Color('#1A0508') },
      uCenterColor: { value: new THREE.Color('#4A0A14') },
      uFocus: { value: new THREE.Vector2(focusX, 0.5) },
    }),
    // Rebuild only if composition changes (full <-> lite).
    [focusX]
  );

  return (
    <mesh position={[0, 0, -18]} frustumCulled={false}>
      <planeGeometry args={[90, 50]} />
      <shaderMaterial
        key={focusX}
        vertexShader={BG_VERTEX}
        fragmentShader={BG_FRAGMENT}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  );
};

/* ------------------------------------------------------------ */
/* Gem — single flat-shaded icosahedron, physical ruby material  */
/* ------------------------------------------------------------ */

const ROTATION_SPEED = (Math.PI * 2) / 60; // one revolution ~60s

interface GemProps {
  position: [number, number, number];
  scale: number;
  animate: boolean;
}

const Gem: React.FC<GemProps> = ({ position, scale, animate }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!animate || !groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * ROTATION_SPEED;
    groupRef.current.position.y = position[1] + Math.sin(t * 0.4) * 0.18;
  });

  return (
    <group ref={groupRef} position={position} scale={scale} rotation={[0.35, 0, -0.15]}>
      <mesh>
        <icosahedronGeometry args={[1.7, 0]} />
        {/* The ONE physical material in the scene. */}
        <meshPhysicalMaterial
          color="#8B0000"
          emissive="#DC143C"
          emissiveIntensity={0.06}
          transmission={0.9}
          thickness={2}
          ior={2.4}
          roughness={0.08}
          metalness={0}
          flatShading
          specularIntensity={1}
          specularColor="#DC143C"
        />
      </mesh>
    </group>
  );
};

/* --------------------------------------------------------------- */
/* Dust — sparse gold/cream particles, drift fully in vertex shader */
/* --------------------------------------------------------------- */

const DUST_VERTEX = /* glsl */ `
  attribute float aSeed;
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uTime;
  varying vec3 vColor;
  varying float vSeed;
  void main() {
    vColor = aColor;
    vSeed = aSeed;
    vec3 p = position;
    // Slow bounded drift — all motion lives here, zero per-frame JS loops.
    p.x += sin(uTime * 0.05 + aSeed * 6.2832) * 0.7;
    p.y += sin(uTime * 0.035 + aSeed * 12.566) * 0.9;
    p.z += cos(uTime * 0.04 + aSeed * 9.4248) * 0.5;
    vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * (220.0 / -mvPosition.z);
  }
`;

const DUST_FRAGMENT = /* glsl */ `
  uniform float uTime;
  varying vec3 vColor;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float twinkle = 0.65 + 0.35 * sin(uTime * 0.6 + vSeed * 31.4159);
    float alpha = smoothstep(0.5, 0.05, d) * twinkle * 0.55;
    gl_FragColor = vec4(vColor * alpha, alpha);
  }
`;

const DUST_PALETTE = ['#FFD700', '#F5E6C8', '#E8C547', '#FFF4D6'];
const DUST_BASE_COUNT = 300;

interface DustProps {
  count: number;
  animate: boolean;
}

const Dust: React.FC<DustProps> = ({ count, animate }) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const { positions, seeds, sizes, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const size = new Float32Array(count);
    const col = new Float32Array(count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8 - 2;
      seed[i] = Math.random();
      size[i] = 0.012 + Math.random() * 0.035;
      c.set(DUST_PALETTE[Math.floor(Math.random() * DUST_PALETTE.length)]);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, seeds: seed, sizes: size, colors: col };
  }, [count]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame(({ clock }) => {
    if (!animate || !materialRef.current) return;
    materialRef.current.uniforms.uTime.value = clock.getElapsedTime();
  });

  if (count <= 0) return null;

  return (
    <points key={count} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={DUST_VERTEX}
        fragmentShader={DUST_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

/* ------------------------------------------------------------ */
/* Scene composition                                              */
/* ------------------------------------------------------------ */

const Scene: React.FC<{ profile: PerfProfile }> = ({ profile }) => {
  const lite = profile.tier === 'lite';
  const gemX = lite ? 0 : 1.5;
  const gemScale = lite ? 0.7 : 1;
  // uv x of the backdrop glow so it sits behind the gem.
  const focusX = lite ? 0.5 : 0.62;
  const dustCount = Math.round(DUST_BASE_COUNT * profile.particleScale);

  return (
    <>
      {/* Lighting: gold key (upper-left), cool fill, deep red ambient */}
      <directionalLight color="#FFD700" intensity={3.2} position={[-5, 6, 4]} />
      <directionalLight color="#7E9BC4" intensity={0.45} position={[4, -3, 2]} />
      <ambientLight color="#3A0A0E" intensity={0.6} />

      <Backdrop focusX={focusX} />
      <Gem position={[gemX, 0, 0]} scale={gemScale} animate={profile.animate} />
      <Dust count={dustCount} animate={profile.animate} />
    </>
  );
};

/* ------------------------------------------------------------ */
/* Export — fills parent (position absolute, inset 0)            */
/* ------------------------------------------------------------ */

export const ProtoJewel: React.FC = () => {
  const profile = usePerfProfile();

  return (
    <div style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
      <Canvas
        dpr={profile.dpr}
        frameloop={profile.animate ? 'always' : 'never'}
        gl={{
          antialias: profile.tier === 'full',
          alpha: false,
          powerPreference: 'high-performance',
        }}
        camera={{ fov: 40, position: [0, 0, 8] }}
      >
        <Scene profile={profile} />
      </Canvas>
    </div>
  );
};

export default ProtoJewel;
