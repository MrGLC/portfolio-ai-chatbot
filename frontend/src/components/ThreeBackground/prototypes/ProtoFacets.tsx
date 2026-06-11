/**
 * ProtoFacets — Hero prototype C: "Interactive Facet Surface"
 *
 * A low-poly faceted crystalline surface (like looking down at a cut gem's
 * table) covering the lower half of the hero. Vertices are displaced in a
 * custom vertex shader by layered sin waves (uTime) plus a radial bump that
 * follows the pointer (desktop only). Flat-shaded facet look is achieved with
 * screen-space derivative normals (dFdx/dFdy) in the fragment shader, with
 * gold specular glints from a slowly orbiting light direction and a cream fog
 * fading the far edge into the page background.
 */
import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import { usePerfProfile } from '../../../hooks/usePerfProfile';

// Palette
const PAGE_CREAM = '#F5E6D3'; // page background / fog
const DEEP_RED = '#6B0F1F'; // facet base
const GOLD = '#FFD700'; // glints / accents

// Surface dimensions (world units)
const PLANE_WIDTH = 28;
const PLANE_HEIGHT = 18;

const facetVertexShader = /* glsl */ `
  uniform float uTime;
  // uPointer: x,y = pointer position in plane-local units, z = influence strength (0..1)
  uniform vec3 uPointer;

  varying vec3 vWorldPos;
  varying float vHeight;

  float surfaceHeight(vec2 p) {
    float h = 0.0;
    // Layered slow auto-waves (always on)
    h += sin(p.x * 0.45 + uTime * 0.50) * 0.40;
    h += sin(p.y * 0.60 - uTime * 0.35) * 0.32;
    h += sin((p.x + p.y) * 0.85 + uTime * 0.65) * 0.22;
    h += sin(p.x * 1.9 - p.y * 1.4 + uTime * 0.25) * 0.12;

    // Radial bump following the (smoothly lerped) pointer
    float d = length(p - uPointer.xy);
    h += exp(-d * d * 0.30) * 1.05 * uPointer.z;

    return h;
  }

  void main() {
    vec3 pos = position;
    pos.z += surfaceHeight(position.xy);

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;
    vHeight = pos.z;

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const facetFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform vec3 uGoldColor;
  uniform vec3 uFogColor;

  varying vec3 vWorldPos;
  varying float vHeight;

  void main() {
    // Flat facet normals from screen-space derivatives: world position varies
    // linearly across each (displaced) triangle, so the derivative cross
    // product is constant per face — true flat shading without normal attrs.
    vec3 normal = normalize(cross(dFdx(vWorldPos), dFdy(vWorldPos)));
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    if (dot(normal, viewDir) < 0.0) normal = -normal;

    // Slowly orbiting light direction so facet edges catch moving glints
    vec3 lightDir = normalize(vec3(sin(uTime * 0.15) * 0.7, 1.0, cos(uTime * 0.15) * 0.7));
    float diff = max(dot(normal, lightDir), 0.0);

    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(normal, halfDir), 0.0), 56.0);

    vec3 color = uBaseColor * (0.42 + 0.62 * diff);
    color += uGoldColor * spec * 0.85; // gold glints on facets catching the light
    color += uGoldColor * clamp(vHeight, 0.0, 2.0) * 0.04; // faint gold lift on wave crests

    // Cream fog fading the far edge into the page background
    float fogFactor = smoothstep(8.5, 16.0, length(cameraPosition - vWorldPos));
    color = mix(color, uFogColor, fogFactor);

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface FacetSurfaceProps {
  tier: 'full' | 'lite';
}

/** The displaced, flat-shaded crystalline plane. */
const FacetSurface: React.FC<FacetSurfaceProps> = ({ tier }) => {
  const segments = tier === 'lite' ? ([24, 14] as const) : ([40, 24] as const);

  const geometry = useMemo(
    () => new THREE.PlaneGeometry(PLANE_WIDTH, PLANE_HEIGHT, segments[0], segments[1]),
    [segments]
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: facetVertexShader,
        fragmentShader: facetFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uPointer: { value: new THREE.Vector3(0, 0, 0) },
          uBaseColor: { value: new THREE.Color(DEEP_RED) },
          uGoldColor: { value: new THREE.Color(GOLD) },
          uFogColor: { value: new THREE.Color(PAGE_CREAM) },
        },
      }),
    []
  );

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // useFrame writes ONLY: uTime advance + smoothly lerped uPointer uniform.
  useFrame((state, delta) => {
    const uniforms = material.uniforms;
    uniforms.uTime.value += delta;

    const pointer = uniforms.uPointer.value as THREE.Vector3;
    // Frame-rate independent damping
    const damp = 1 - Math.exp(-delta * 4);

    if (tier === 'full') {
      // Map normalized pointer (-1..1) to plane-local coordinates.
      // Screen x -> plane local x; screen y -> plane local y (depth after tilt).
      const targetX = state.pointer.x * PLANE_WIDTH * 0.4;
      const targetY = state.pointer.y * PLANE_HEIGHT * 0.35;
      pointer.x += (targetX - pointer.x) * damp;
      pointer.y += (targetY - pointer.y) * damp;
      pointer.z += (1 - pointer.z) * damp; // fade bump in
    } else {
      pointer.z += (0 - pointer.z) * damp; // mobile/lite: auto-wave only
    }
  });

  return (
    <mesh
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 3, 0, 0]} // tilted back ~60 deg, receding into the distance
      position={[0, -1.3, 0]} // lower half of the frame
      frustumCulled={false} // bounds change in the vertex shader
    />
  );
};

/** Two small flat-shaded gem shards drifting above the surface (accent only). */
const GemShards: React.FC = () => {
  const shardGeometry = useMemo(() => new THREE.OctahedronGeometry(0.26, 0), []);

  useEffect(() => {
    return () => {
      shardGeometry.dispose();
    };
  }, [shardGeometry]);

  return (
    <>
      <Float speed={1.1} rotationIntensity={0.5} floatIntensity={0.7} floatingRange={[-0.15, 0.15]}>
        <mesh geometry={shardGeometry} position={[-2.3, 0.9, 1.8]} rotation={[0.4, 0.7, 0.2]}>
          <meshStandardMaterial
            color={DEEP_RED}
            emissive={DEEP_RED}
            emissiveIntensity={0.25}
            metalness={0.55}
            roughness={0.3}
            flatShading
          />
        </mesh>
      </Float>
      <Float speed={0.8} rotationIntensity={0.6} floatIntensity={0.5} floatingRange={[-0.12, 0.12]}>
        <mesh
          geometry={shardGeometry}
          position={[2.6, 1.4, 0.6]}
          rotation={[0.1, 0.3, 0.5]}
          scale={0.7}
        >
          <meshStandardMaterial
            color={GOLD}
            emissive={GOLD}
            emissiveIntensity={0.15}
            metalness={0.7}
            roughness={0.25}
            flatShading
          />
        </mesh>
      </Float>
    </>
  );
};

/** Full-viewport hero background: interactive faceted crystalline surface. */
export const ProtoFacets: React.FC = () => {
  const profile = usePerfProfile();
  const cameraTarget = useRef(new THREE.Vector3(0, -0.4, 0));

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} aria-hidden="true">
      <Canvas
        dpr={profile.dpr}
        frameloop={profile.animate ? 'always' : 'never'}
        gl={{ antialias: profile.tier === 'full', alpha: false }}
        camera={{ fov: 45, position: [0, 2.2, 7], near: 0.1, far: 60 }}
        onCreated={({ camera }) => camera.lookAt(cameraTarget.current)}
      >
        <color attach="background" args={[PAGE_CREAM]} />
        {/* Scene fog affects the standard-material shards; the surface shader fogs itself */}
        <fog attach="fog" args={[PAGE_CREAM, 8.5, 16]} />

        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 5, 3]} intensity={1.1} color="#FFE9B0" />

        <FacetSurface tier={profile.tier} />
        <GemShards />
      </Canvas>
    </div>
  );
};

export default ProtoFacets;
