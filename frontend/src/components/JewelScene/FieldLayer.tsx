import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { usePerfProfile } from '../../hooks/usePerfProfile';

/**
 * FieldLayer — "Generative Intelligence Field" production layer.
 *
 * Evolved from prototypes/ProtoField: a flowing curl-noise particle band
 * plus depth glow sprites, fully GPU-animated. This is a scene-graph-only
 * component (renders a <group>; the composition root owns the Canvas and
 * background). Adds pointer parting: particles are pushed away from the
 * cursor's projection onto the z=0 plane via a uPointer uniform.
 *
 * All motion lives in the vertex shaders; JS writes a single shared uTime
 * uniform (plus a smoothed uPointer vec3) per frame for every material.
 */

const PARTICLE_BASE_COUNT = 3500;
const MIN_PARTICLE_COUNT = 50;
const BAND_SPAN_X = 18; // world-units width of the wrapped stream

// ---------------------------------------------------------------------------
// Shaders (carried from ProtoField; particle vertex gains pointer parting)
// ---------------------------------------------------------------------------

const particleVertex = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3 uPointer; // xy = world coords on z=0 plane, z = strength 0..1

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
    vec3 p = position;
    float span = ${BAND_SPAN_X.toFixed(1)};

    // Continuous horizontal stream: each particle drifts right at its own
    // speed and wraps around the band.
    float speed = 0.25 + aSeed * 0.35;
    p.x = mod(p.x + uTime * speed + span * 0.5, span) - span * 0.5;

    // Slow travelling wave shapes the band into a neural-current ribbon.
    p.y += sin(p.x * 0.35 + uTime * 0.4 + aSeed * 6.2831) * 0.45;

    // Curl-noise displacement (anisotropic: flatter in y to keep the band).
    vec3 c = curlField(p * 0.45, uTime * 0.3);
    p += c * vec3(0.55, 0.38, 0.5);

    // Pointer parting: push particles radially away from the cursor's
    // world-space position on the z=0 plane, scaled by strength (uPointer.z).
    vec2 toPointer = p.xy - uPointer.xy;
    float dist = length(toPointer);
    float push = uPointer.z * smoothstep(2.2, 0.0, dist);
    p.xy += normalize(toPointer + vec2(1e-4)) * push * 0.9;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);

    // Subtle per-particle pulse + depth size attenuation.
    float pulse = 1.0 + 0.25 * sin(uTime * 2.0 + aSeed * 31.4159);
    gl_PointSize = aSize * uPixelRatio * pulse * (84.0 / -mv.z);

    // Fade out near the wrap seam so respawns are invisible.
    vFade = smoothstep(span * 0.5, span * 0.5 - 2.0, abs(p.x));
    vSeed = aSeed;
    vDepth = clamp((-mv.z - 4.0) / 10.0, 0.0, 1.0);

    gl_Position = projectionMatrix * mv;
  }
`;

const particleFragment = /* glsl */ `
  uniform float uFade; // hero-scroll fade (1 = hero in view, 0 = scrolled out)

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

    float alpha = circle * vFade * (0.35 - 0.18 * vDepth) * uFade;
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col * 0.55, alpha);
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
  uniform float uFade;

  varying vec2 vUv;

  void main() {
    float d = length(vUv - 0.5);
    float alpha = smoothstep(0.5, 0.0, d);
    alpha *= alpha * uIntensity; // quadratic falloff = blurry core
    alpha *= uFade; // hero-scroll fade
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// ---------------------------------------------------------------------------
// Shared uniforms
// ---------------------------------------------------------------------------

type TimeUniform = THREE.IUniform<number>;
type PointerUniform = THREE.IUniform<THREE.Vector3>;

interface SharedUniforms {
  uTime: TimeUniform;
  uPointer: PointerUniform;
  uFade: TimeUniform; // 1 in the hero, ->0 as the hero scrolls out (fadeWithHero)
}

// One module-scope scratch vector for pointer unprojection (no per-frame allocs).
const scratch = new THREE.Vector3();

// ---------------------------------------------------------------------------
// Scene internals
// ---------------------------------------------------------------------------

interface ParticlesProps {
  count: number;
  shared: SharedUniforms;
}

const FieldParticles: React.FC<ParticlesProps> = ({ count, shared }) => {
  const pixelRatio = useThree((state) => state.gl.getPixelRatio());

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      // Loose horizontal band: gaussian-ish vertical spread around y=-2.8
      // so the field occupies the lower 2/3 of the hero.
      const gauss = (Math.random() + Math.random() + Math.random()) / 3 - 0.5;
      positions[i * 3 + 0] = (Math.random() - 0.5) * BAND_SPAN_X;
      positions[i * 3 + 1] = -2.8 + gauss * 1.4;
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
    const uniforms: {
      uTime: TimeUniform;
      uPointer: PointerUniform;
      uFade: TimeUniform;
      uPixelRatio: THREE.IUniform<number>;
    } = {
      uTime: shared.uTime, // shared reference -> single write animates all
      uPointer: shared.uPointer,
      uFade: shared.uFade,
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
  }, [shared, pixelRatio]);

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
  { color: '#DC143C', position: [-4.5, -2.8, -4], scale: 9, phase: 0.0, intensity: 0.08 },
  { color: '#FFD700', position: [3.5, -2.2, -5], scale: 7, phase: 2.4, intensity: 0.04 },
  { color: '#DC143C', position: [1.0, -3.4, -3], scale: 6, phase: 4.6, intensity: 0.06 },
];

interface GlowProps {
  spec: GlowSpec;
  timeUniform: TimeUniform;
  fadeUniform: TimeUniform;
}

const GlowSprite: React.FC<GlowProps> = ({ spec, timeUniform, fadeUniform }) => {
  const material = useMemo(() => {
    const uniforms: {
      uTime: TimeUniform;
      uFade: TimeUniform;
      uPhase: THREE.IUniform<number>;
      uColor: THREE.IUniform<THREE.Color>;
      uIntensity: THREE.IUniform<number>;
    } = {
      uTime: timeUniform, // shared reference -> single write animates all
      uFade: fadeUniform,
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
  }, [spec, timeUniform, fadeUniform]);

  return (
    <mesh position={spec.position} scale={spec.scale} material={material} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  );
};

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export interface FieldLayerProps {
  /** Particle density multiplier (1 = full hero field; <0.5 skips glows). */
  density?: number;
  /** Enable cursor parting (only active on the 'full' perf tier). */
  interactive?: boolean;
  /**
   * Fade the whole layer out as the #story-hero section scrolls away (the
   * hero jewel scene uses this). MUST stay off for the site-wide FieldAccent
   * canvas, which shares this component and must persist below the hero.
   */
  fadeWithHero?: boolean;
}

export const FieldLayer: React.FC<FieldLayerProps> = ({
  density = 1,
  interactive = true,
  fadeWithHero = false,
}) => {
  const profile = usePerfProfile();

  // Shared uniform objects: one JS write per frame drives every material.
  const shared = useMemo<SharedUniforms>(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector3(0, 0, 0) },
      uFade: { value: 1 },
    }),
    []
  );

  // Hero bottom edge in document coordinates (Infinity = no hero on the page).
  const heroBottomRef = useRef(Number.POSITIVE_INFINITY);
  useEffect(() => {
    if (!fadeWithHero) return;
    const measure = () => {
      const el = document.getElementById('story-hero');
      if (!el) {
        heroBottomRef.current = Number.POSITIVE_INFINITY;
        return;
      }
      const rect = el.getBoundingClientRect();
      heroBottomRef.current = rect.top + window.scrollY + rect.height;
    };
    measure();
    const remeasure = window.setTimeout(measure, 1500); // lazy content shifts offsets
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(remeasure);
      window.removeEventListener('resize', measure);
    };
  }, [fadeWithHero]);

  useFrame((state, delta) => {
    shared.uTime.value += delta;

    if (fadeWithHero) {
      const heroBottom = heroBottomRef.current;
      shared.uFade.value = Number.isFinite(heroBottom)
        ? Math.min(1, Math.max(0, 1 - window.scrollY / (heroBottom * 0.8)))
        : 1;
    }

    const pointer = shared.uPointer.value;
    const k = 1 - Math.exp(-6 * delta);

    if (interactive && profile.tier === 'full') {
      // Unproject NDC pointer to a ray, intersect the z=0 plane.
      scratch.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      scratch.sub(state.camera.position).normalize();
      const t = -state.camera.position.z / scratch.z; // intersect z=0
      const px = state.camera.position.x + scratch.x * t;
      const py = state.camera.position.y + scratch.y * t;

      pointer.x += (px - pointer.x) * k;
      pointer.y += (py - pointer.y) * k;
      pointer.z += (1 - pointer.z) * k;
    } else {
      pointer.z += (0 - pointer.z) * k;
    }
  });

  const count = Math.max(
    MIN_PARTICLE_COUNT,
    Math.round(PARTICLE_BASE_COUNT * density * profile.particleScale)
  );
  const showGlows = density >= 0.5;
  const glows = profile.tier === 'full' ? GLOWS : GLOWS.slice(0, 2);

  return (
    <group>
      <FieldParticles count={count} shared={shared} />
      {showGlows &&
        glows.map((spec) => (
          <GlowSprite
            key={`${spec.color}-${spec.phase}`}
            spec={spec}
            timeUniform={shared.uTime}
            fadeUniform={shared.uFade}
          />
        ))}
    </group>
  );
};

export default FieldLayer;
