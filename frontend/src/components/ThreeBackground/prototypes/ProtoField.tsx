import React, { useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePerfProfile } from '../../../hooks/usePerfProfile';

/**
 * Prototype hero scene B: "Generative Intelligence Field"
 *
 * Flowing curl-noise particle field, fully GPU-animated. 6000 points
 * (scaled down by perf profile) drift along an analytic curl of a
 * sin-based vector potential, forming a loose horizontal data-stream
 * band across the lower 2/3 of the viewport. All motion lives in the
 * vertex shader; JS only writes a single shared uTime uniform per frame.
 */

const PARTICLE_BASE_COUNT = 6000;
const BAND_SPAN_X = 18; // world-units width of the wrapped stream

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------

const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;

  attribute float aSeed;
  attribute float aSize;

  varying float vSeed;
  varying float vFade;
  varying float vDepth;

  // Analytic curl of a sin/cos vector potential -> divergence-free flow.
  // Potential A:
  //   Ax = sin(y*e1 + t*0.40) + cos(z*e2 - t*0.30)
  //   Ay = sin(z*e3 + t*0.30) + cos(x*e1 + t*0.20)
  //   Az = sin(x*e2 - t*0.35) + cos(y*e3 + t*0.25)
  vec3 curlField(vec3 p, float t) {
    const float e1 = 1.6;
    const float e2 = 2.2;
    const float e3 = 1.1;

    float dAz_dy = -e3 * sin(p.y * e3 + t * 0.25);
    float dAy_dz =  e3 * cos(p.z * e3 + t * 0.30);
    float dAx_dz = -e2 * sin(p.z * e2 - t * 0.30);
    float dAz_dx =  e2 * cos(p.x * e2 - t * 0.35);
    float dAy_dx = -e1 * sin(p.x * e1 + t * 0.20);
    float dAx_dy =  e1 * cos(p.y * e1 + t * 0.40);

    return vec3(dAz_dy - dAy_dz, dAx_dz - dAz_dx, dAy_dx - dAx_dy);
  }

  void main() {
    vec3 pos = position;
    float span = ${BAND_SPAN_X.toFixed(1)};

    // Continuous horizontal stream: each particle drifts right at its own
    // speed and wraps around the band.
    float speed = 0.25 + aSeed * 0.35;
    pos.x = mod(pos.x + uTime * speed + span * 0.5, span) - span * 0.5;

    // Slow travelling wave shapes the band into a neural-current ribbon.
    pos.y += sin(pos.x * 0.35 + uTime * 0.4 + aSeed * 6.2831) * 0.45;

    // Curl-noise displacement (anisotropic: flatter in y to keep the band).
    vec3 c = curlField(pos * 0.45, uTime * 0.3);
    pos += c * vec3(0.55, 0.38, 0.5);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);

    // Subtle per-particle pulse + depth size attenuation.
    float pulse = 1.0 + 0.25 * sin(uTime * 2.0 + aSeed * 31.4159);
    gl_PointSize = aSize * uPixelRatio * pulse * (140.0 / -mv.z);

    // Fade out near the wrap seam so respawns are invisible.
    vFade = smoothstep(span * 0.5, span * 0.5 - 2.0, abs(pos.x));
    vSeed = aSeed;
    vDepth = clamp((-mv.z - 4.0) / 10.0, 0.0, 1.0);

    gl_Position = projectionMatrix * mv;
  }
`;

const particleFragment = /* glsl */ `
  varying float vSeed;
  varying float vFade;
  varying float vDepth;

  void main() {
    // Soft circular sprite.
    float d = length(gl_PointCoord - 0.5);
    float circle = smoothstep(0.5, 0.08, d);

    vec3 cream = vec3(0.961, 0.902, 0.827); // #F5E6D3
    vec3 red   = vec3(0.863, 0.078, 0.235); // #DC143C
    vec3 gold  = vec3(1.0,   0.843, 0.0);   // #FFD700

    // Mostly cream<->red by seed + depth; sparse gold (~10%) overrides.
    float mixT = clamp(fract(vSeed * 7.31) * 0.8 + vDepth * 0.4, 0.0, 1.0);
    vec3 col = mix(cream, red, mixT);
    col = mix(col, gold, step(0.9, fract(vSeed * 13.7)));

    float alpha = circle * vFade * (0.85 - 0.45 * vDepth);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

const glowVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 world = modelMatrix * vec4(position, 1.0);
    // VERY slow drift for depth parallax.
    world.x += sin(uTime * 0.05 + uPhase) * 1.2;
    world.y += cos(uTime * 0.04 + uPhase * 1.7) * 0.8;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;

  varying vec2 vUv;

  void main() {
    float d = length(vUv - 0.5);
    float alpha = smoothstep(0.5, 0.0, d);
    alpha *= alpha * uIntensity; // quadratic falloff = blurry core
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// ---------------------------------------------------------------------------
// Scene internals
// ---------------------------------------------------------------------------

type TimeUniform = THREE.IUniform<number>;

interface ParticlesProps {
  count: number;
  timeUniform: TimeUniform;
}

const FieldParticles: React.FC<ParticlesProps> = ({ count, timeUniform }) => {
  const pixelRatio = useThree((state) => state.gl.getPixelRatio());

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      // Loose horizontal band: gaussian-ish vertical spread around y=-1.4
      // so the field occupies the lower 2/3 of the hero.
      const gauss = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
      positions[i * 3 + 0] = (Math.random() - 0.5) * BAND_SPAN_X;
      positions[i * 3 + 1] = -1.4 + gauss * 2.6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      seeds[i] = Math.random();
      sizes[i] = 1.5 + Math.random() * 2.5;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    return geo;
  }, [count]);

  const material = useMemo(() => {
    const uniforms: { uTime: TimeUniform; uPixelRatio: THREE.IUniform<number> } = {
      uTime: timeUniform,
      uPixelRatio: { value: pixelRatio },
    };
    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [timeUniform, pixelRatio]);

  return <points geometry={geometry} material={material} frustumCulled={false} />;
};

interface GlowSpec {
  color: string;
  position: [number, number, number];
  scale: number;
  phase: number;
  intensity: number;
}

const GLOWS: GlowSpec[] = [
  { color: '#DC143C', position: [-4.5, -1.8, -4], scale: 9, phase: 0.0, intensity: 0.16 },
  { color: '#FFD700', position: [3.5, -0.6, -5], scale: 7, phase: 2.4, intensity: 0.08 },
  { color: '#DC143C', position: [1.0, -2.6, -3], scale: 6, phase: 4.6, intensity: 0.12 },
];

interface GlowProps {
  spec: GlowSpec;
  timeUniform: TimeUniform;
}

const GlowSprite: React.FC<GlowProps> = ({ spec, timeUniform }) => {
  const material = useMemo(() => {
    const uniforms: {
      uTime: TimeUniform;
      uPhase: THREE.IUniform<number>;
      uColor: THREE.IUniform<THREE.Color>;
      uIntensity: THREE.IUniform<number>;
    } = {
      uTime: timeUniform, // shared reference -> single write animates all
      uPhase: { value: spec.phase },
      uColor: { value: new THREE.Color(spec.color) },
      uIntensity: { value: spec.intensity },
    };
    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: glowVertex,
      fragmentShader: glowFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [spec, timeUniform]);

  return (
    <mesh position={spec.position} scale={spec.scale} material={material} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
};

interface FieldSceneProps {
  particleScale: number;
  tier: 'full' | 'lite';
}

const FieldScene: React.FC<FieldSceneProps> = ({ particleScale, tier }) => {
  // Single shared time uniform: one JS uniform write per frame drives
  // every material (particles + glows reference the same object).
  const timeUniform = useMemo<TimeUniform>(() => ({ value: 0 }), []);

  useFrame(({ clock }) => {
    timeUniform.value = clock.getElapsedTime();
  });

  const count = Math.max(1, Math.round(PARTICLE_BASE_COUNT * particleScale));
  const glows = tier === 'full' ? GLOWS : GLOWS.slice(0, 2);

  return (
    <>
      <FieldParticles count={count} timeUniform={timeUniform} />
      {glows.map((spec) => (
        <GlowSprite key={`${spec.color}-${spec.phase}`} spec={spec} timeUniform={timeUniform} />
      ))}
    </>
  );
};

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export const ProtoField: React.FC = () => {
  const profile = usePerfProfile();

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }} aria-hidden>
      <Canvas
        dpr={profile.dpr}
        frameloop={profile.animate ? 'always' : 'never'}
        gl={{ antialias: false, alpha: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0.6, 9], fov: 55, near: 0.1, far: 60 }}
      >
        <color attach="background" args={['#140306']} />
        <FieldScene particleScale={profile.particleScale} tier={profile.tier} />
      </Canvas>
    </div>
  );
};

export default ProtoField;
