import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { usePerfProfile } from '../../hooks/usePerfProfile';
import { buildMorphTargets } from './morphTargets';
import type { TargetName } from './morphTargets';
import { useJewelStory } from './useJewelStory';
import type { JewelStoryState } from './useJewelStory';
import { resolveStoryFrame, STORY_SECTIONS } from './storyResolver';
import type { SectionRange, StoryFrame } from './storyResolver';

/**
 * JewelRig — production "Living Jewel" scene layer.
 *
 * Evolved from prototypes/ProtoJewel: same art-directed centerpiece (ruby gem,
 * gold key/rim lights, radial backdrop, sparse gold dust) but the gem is now
 * alive — it morphs between story targets (gem <-> gemBreath) via a GPU
 * vertex-shader blend, responds to drag with inertia, and pulses on tap.
 *
 * Scene-graph-only component: the composition root owns the <Canvas>.
 *
 * Morph driver handshake (two drivers, scroll wins):
 *   TAP (settled gem sections only): story.setTarget(B) -> 'state' event
 *     (from=A, to=B, progress=0) -> subscription writes A into
 *     position/normal, B into aTarget*, sets animatingRef. useFrame advances
 *     progressRef (uMorph) until 1 -> story.setProgress(1) -> controller
 *     promotes B->A, emits state (from=to=B, progress=0) -> subscription
 *     rewrites both attribute sets to B; uMorph drops to 0 with identical
 *     A/B arrays, so there is no visual pop.
 *   SCROLL: useFrame resolves a StoryFrame from window.scrollY. Inside a
 *     blend zone the rig aligns the controller pair to (frame.from,
 *     frame.to) — via setTarget(frame.from); setTarget(frame.to) when needed
 *     — then writes frame.progress into progressRef DIRECTLY and clears
 *     animatingRef: scroll owns morph progress during transitions. On
 *     settling, the pair is promoted (setProgress(1)) or rested at 0,
 *     whichever side of the zone the scroll exited. 'gemBreath' is treated
 *     as an alias of 'gem' so the tap toggle survives scroll round-trips.
 */

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
  uniform float uFade;
  void main() {
    // Radial falloff from the glow focus (sits behind the gem).
    float d = distance(vUv, uFocus);
    float t = smoothstep(0.05, 0.62, d);
    vec3 color = mix(uCenterColor, uEdgeColor, t);
    // uFade: hero scenery — fully opaque in the hero, gone below it.
    gl_FragColor = vec4(color, uFade);
  }
`;

const Backdrop: React.FC<{
  focusX: number;
  focusY: number;
  fade: THREE.IUniform<number>;
}> = ({ focusX, focusY, fade }) => {
  const uniforms = useMemo(
    () => ({
      uEdgeColor: { value: new THREE.Color('#1A0508') },
      uCenterColor: { value: new THREE.Color('#5A1020') },
      uFocus: { value: new THREE.Vector2(focusX, focusY) },
      uFade: fade, // shared reference — JewelRig's useFrame writes it
    }),
    // Rebuild only if composition changes (full <-> lite).
    [focusX, focusY, fade]
  );

  return (
    <mesh position={[0, 0, -18]} frustumCulled={false}>
      <planeGeometry args={[90, 50]} />
      <shaderMaterial
        key={`${focusX}-${focusY}`}
        vertexShader={BG_VERTEX}
        fragmentShader={BG_FRAGMENT}
        uniforms={uniforms}
        transparent
        depthWrite={false}
      />
    </mesh>
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
  uniform float uFade;
  varying vec3 vColor;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float twinkle = 0.65 + 0.35 * sin(uTime * 0.6 + vSeed * 31.4159);
    // uFade: dust is hero scenery like the backdrop — fades out with it.
    float alpha = smoothstep(0.5, 0.05, d) * twinkle * 0.82 * uFade;
    gl_FragColor = vec4(vColor * alpha, alpha);
  }
`;

const DUST_PALETTE = ['#FFD700', '#F5E6C8', '#E8C547', '#FFF4D6'];
const DUST_BASE_COUNT = 300;

const Dust: React.FC<{ count: number; animate: boolean; fade: THREE.IUniform<number> }> = ({
  count,
  animate,
  fade,
}) => {
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
      size[i] = 0.025 + Math.random() * 0.07;
      c.set(DUST_PALETTE[Math.floor(Math.random() * DUST_PALETTE.length)]);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    return { positions: pos, seeds: seed, sizes: size, colors: col };
  }, [count]);

  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uFade: fade }), [fade]);

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
/* JewelRig                                                       */
/* ------------------------------------------------------------ */

const ROTATION_SPEED = (Math.PI * 2) / 60; // one revolution ~60s

interface MorphShader {
  uniforms: { uMorph: { value: number } };
}

interface DragState {
  active: boolean;
  lastX: number;
  lastY: number;
  moved: number;
}

interface JewelRigProps {
  /** Called once on the first gem pointerdown (used to dismiss the hint pill). */
  onFirstInteraction?: () => void;
}

export const JewelRig: React.FC<JewelRigProps> = ({ onFirstInteraction }) => {
  const profile = usePerfProfile();
  const story = useJewelStory();

  const lite = profile.tier === 'lite';
  // Lite (mobile): gem sits in the hero's lower third, below the CTA buttons,
  // among the field particles — visible and clearly tappable instead of hiding
  // behind the centered copy. Full (desktop): offset right of the text column.
  const gemX = lite ? 0 : 1.5;
  const gemY = lite ? -2.05 : 0;
  const baseScale = lite ? 0.8 : 1;
  const floatAmplitude = lite ? 0.08 : 0.15;
  // Glow focus tracks the gem so its silhouette reads against the backdrop.
  const focusX = lite ? 0.5 : 0.62;
  const focusY = lite ? 0.3 : 0.5;
  const dustCount = Math.round(DUST_BASE_COUNT * profile.particleScale);

  const gemGroupRef = useRef<THREE.Group>(null);
  // Inner group for magnetic lean — wraps the mesh so lean rotation doesn't
  // fight the outer group's drag/inertia/scroll rotation.
  const leanRef = useRef<THREE.Group>(null);
  const leanXRef = useRef(0); // current smoothed lean x
  const leanYRef = useRef(0); // current smoothed lean y
  // Ensure onFirstInteraction fires at most once per mount.
  const firstInteractionFiredRef = useRef(false);
  const progressRef = useRef(0); // 0..1 morph blend (uMorph)
  const animatingRef = useRef(false);
  const pulseRef = useRef(0); // 1 on tap, decays in useFrame
  const angularVelRef = useRef({ x: 0, y: 0 }); // drag inertia
  const dragRef = useRef<DragState>({ active: false, lastX: 0, lastY: 0, moved: 0 });
  const lastPairRef = useRef<{ from: TargetName; to: TargetName }>({ from: 'gem', to: 'gem' });

  // Scroll story plumbing — all refs/uniforms, zero React re-renders.
  const scrollRef = useRef(0);
  const rangesRef = useRef<SectionRange[]>([]);
  const frameRef = useRef<StoryFrame | null>(null); // last resolved frame (tap gating)
  const scaleRef = useRef(baseScale); // smoothed story scale (pulse multiplies on top)
  const fadeUniform = useMemo<THREE.IUniform<number>>(() => ({ value: 1 }), []);

  /* ---- Geometry + morph attributes (built once) ---- */
  const { geometry, targets } = useMemo(() => {
    const built = buildMorphTargets();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(built.gem.positions.slice(), 3));
    geo.setAttribute('normal', new THREE.BufferAttribute(built.gem.normals.slice(), 3));
    geo.setAttribute('aTargetPosition', new THREE.BufferAttribute(built.gem.positions.slice(), 3));
    geo.setAttribute('aTargetNormal', new THREE.BufferAttribute(built.gem.normals.slice(), 3));
    return { geometry: geo, targets: built };
  }, []);

  /* ---- Material — ProtoJewel's screenshot-validated ruby + morph injection ---- */
  const material = useMemo(() => {
    const m = new THREE.MeshPhysicalMaterial({
      color: '#8B0000',
      metalness: 0,
      roughness: 0.05,
      transmission: 0.9,
      thickness: 2,
      ior: 2.4,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      emissive: '#6B0F1F',
      emissiveIntensity: 0.18,
      specularIntensity: 1.2,
      specularColor: new THREE.Color('#FFD700'),
      envMapIntensity: 2.8,
      flatShading: true,
    });
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uMorph = { value: 0 };
      shader.vertexShader =
        'uniform float uMorph;\nattribute vec3 aTargetPosition;\nattribute vec3 aTargetNormal;\n' +
        shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        'vec3 objectNormal = normalize(mix(normal, aTargetNormal, uMorph));'
      );
      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        'vec3 transformed = mix(position, aTargetPosition, uMorph);'
      );
      m.userData.shader = shader;
    };
    m.customProgramCacheKey = () => 'jewel-morph';
    return m;
  }, []);

  /* ---- Story subscription: attribute rewrites only on target change ---- */
  useEffect(() => {
    const applyState = (state: JewelStoryState) => {
      const last = lastPairRef.current;
      if (state.from !== last.from || state.to !== last.to) {
        const from = targets[state.from];
        const to = targets[state.to];
        const pos = geometry.getAttribute('position') as THREE.BufferAttribute;
        const norm = geometry.getAttribute('normal') as THREE.BufferAttribute;
        const tPos = geometry.getAttribute('aTargetPosition') as THREE.BufferAttribute;
        const tNorm = geometry.getAttribute('aTargetNormal') as THREE.BufferAttribute;
        (pos.array as Float32Array).set(from.positions);
        (norm.array as Float32Array).set(from.normals);
        (tPos.array as Float32Array).set(to.positions);
        (tNorm.array as Float32Array).set(to.normals);
        pos.needsUpdate = true;
        norm.needsUpdate = true;
        tPos.needsUpdate = true;
        tNorm.needsUpdate = true;
        lastPairRef.current = { from: state.from, to: state.to };
      }
      progressRef.current = state.progress;
      if (state.from !== state.to) animatingRef.current = true;
    };

    applyState(story.state); // sync in case a target was set before mount
    const unsubscribe = story.subscribe((kind, state) => {
      if (kind === 'pulse') {
        pulseRef.current = 1;
        return;
      }
      applyState(state);
    });
    return unsubscribe;
  }, [story, targets, geometry]);

  /* ---- Restore cursor on unmount ---- */
  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
    };
  }, []);

  /* ---- Scroll story: passive scroll listener + section range measurement ---- */
  useEffect(() => {
    const measure = () => {
      const ranges: SectionRange[] = [];
      for (const id of Object.keys(STORY_SECTIONS)) {
        const el = document.getElementById(id);
        if (!el) continue;
        // Document coordinates via rect + scrollY: offsetTop would be relative
        // to the positioned <main> wrapper (92px header offset) — wrong frame.
        const rect = el.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        ranges.push({ id, top, bottom: top + rect.height });
      }
      rangesRef.current = ranges;
    };
    const onScroll = () => {
      scrollRef.current = window.scrollY;
    };
    onScroll();
    measure();
    // Lazy-loaded content (chatbot canvas chunk) shifts section offsets after
    // mount — re-measure once the layout has had time to settle.
    const remeasure = window.setTimeout(measure, 1500);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.clearTimeout(remeasure);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  /* ---- Single per-frame driver ---- */
  useFrame(({ clock, pointer: statePointer }, delta) => {
    const group = gemGroupRef.current;
    if (!group) return;

    // Resolve the story frame for the current scroll position. Until the
    // sections are measured (first effect tick) fall back to the hero pose.
    const ranges = rangesRef.current;
    const frame =
      ranges.length > 0
        ? resolveStoryFrame(scrollRef.current, ranges, window.innerHeight, lite)
        : null;
    frameRef.current = frame;

    // Hero scenery fade: backdrop + dust are gone once the hero scrolls out.
    const heroBottom = ranges.length > 0 ? ranges[0].bottom : Number.POSITIVE_INFINITY;
    fadeUniform.value = Number.isFinite(heroBottom)
      ? Math.min(1, Math.max(0, 1 - scrollRef.current / (heroBottom * 0.8)))
      : 1;

    // Scroll-driven morph: align the controller pair, then own progress.
    // 'gemBreath' counts as 'gem' so the tap toggle survives scrolling.
    if (frame) {
      const st = story.state;
      if (frame.from !== frame.to) {
        // Inside a blend zone.
        const fromMatches =
          st.from === frame.from || (frame.from === 'gem' && st.from === 'gemBreath');
        if (!(fromMatches && st.to === frame.to)) {
          const fromCompatible =
            st.to === frame.from || (frame.from === 'gem' && st.to === 'gemBreath');
          if (!fromCompatible) story.setTarget(frame.from); // realign A first
          story.setTarget(frame.to);
        }
        animatingRef.current = false; // tap driver yields to scroll
        progressRef.current = frame.progress;
      } else if (!animatingRef.current) {
        // Settled in a section (and no tap morph in flight).
        const t = frame.to;
        const breathAlias = t === 'gem' && (st.to === 'gemBreath' || st.from === 'gemBreath');
        if (!breathAlias && (st.from !== t || st.to !== t)) {
          if (st.to === t) {
            story.setProgress(1); // exited a blend zone forward -> promote
          } else if (st.from === t) {
            progressRef.current = 0; // exited backward -> rest on the from shape
          } else {
            story.setTarget(t); // teleport (resize / anchor jump): snap to target
            story.setProgress(1);
          }
        }
      }
    }

    // Tap morph driver: advance until 1, then hand back to the controller —
    // setProgress(1) promotes B->A and the subscription rewrites attributes.
    if (animatingRef.current) {
      progressRef.current = Math.min(1, progressRef.current + delta * 1.5);
      if (progressRef.current >= 1) {
        animatingRef.current = false;
        story.setProgress(1);
      }
    }
    const shader = material.userData.shader as MorphShader | undefined;
    if (shader) shader.uniforms.uMorph.value = progressRef.current;

    const dragging = dragRef.current.active;

    // Ambient rotation — suppressed for reduced motion; drag stays user-initiated.
    if (profile.animate && !dragging) {
      group.rotation.y += delta * ROTATION_SPEED;
    }

    // Drag inertia: velocity applies when the finger is off, always decays.
    const vel = angularVelRef.current;
    if (!dragging) {
      group.rotation.y += vel.y;
      group.rotation.x += vel.x;
    }
    const inertiaDecay = Math.pow(0.95, delta * 60);
    vel.x *= inertiaDecay;
    vel.y *= inertiaDecay;

    // Magnetic lean: gem mesh leans gently toward the pointer on full tier
    // when not being dragged. An inner group (leanRef) isolates this rotation
    // from the outer group's drag/inertia rotation so they don't fight.
    const lean = leanRef.current;
    if (lean) {
      const leanK = 1 - Math.exp(-4 * delta);
      if (!lite && !dragging) {
        // state.pointer is in NDC [-1,1]; scale to ±0.14 rad.
        const targetLeanX = statePointer.y * 0.14;
        const targetLeanY = statePointer.x * 0.14;
        leanXRef.current += (targetLeanX - leanXRef.current) * leanK;
        leanYRef.current += (targetLeanY - leanYRef.current) * leanK;
      } else {
        // Lite tier or dragging: lerp lean back to zero.
        leanXRef.current += (0 - leanXRef.current) * leanK;
        leanYRef.current += (0 - leanYRef.current) * leanK;
      }
      lean.rotation.x = leanXRef.current;
      lean.rotation.y = leanYRef.current;
    }

    // Position: exponential approach toward the story frame (float bob rides
    // on top of the frame's y as before).
    const k = 1 - Math.exp(-5 * delta);
    const floatY = profile.animate
      ? Math.sin(clock.getElapsedTime() * 0.5) * floatAmplitude
      : 0;
    const tx = frame ? frame.position[0] : gemX;
    const ty = (frame ? frame.position[1] : gemY) + floatY;
    const tz = frame ? frame.position[2] : 0;
    group.position.x += (tx - group.position.x) * k;
    group.position.y += (ty - group.position.y) * k;
    group.position.z += (tz - group.position.z) * k;

    // Scale: smoothed story scale; tap pulse swells multiplicatively on top.
    const targetScale = frame ? frame.scale : baseScale;
    scaleRef.current += (targetScale - scaleRef.current) * k;
    group.scale.setScalar(scaleRef.current * (1 + pulseRef.current * 0.12));
    pulseRef.current *= Math.pow(0.85, delta * 60);
  });

  /* ---- Pointer handlers (gem mesh only) ---- */
  const handlePointerOver = () => {
    if (!dragRef.current.active) document.body.style.cursor = 'grab';
  };

  const handlePointerOut = () => {
    if (!dragRef.current.active) document.body.style.cursor = '';
  };

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const el = e.target as Element & { setPointerCapture(id: number): void };
    el.setPointerCapture(e.pointerId);
    // r3f's MeshProps has no onLostPointerCapture — listen on the capturing
    // DOM element so an OS-interrupted drag can never get stuck active.
    el.addEventListener(
      'lostpointercapture',
      () => {
        dragRef.current.active = false;
      },
      { once: true }
    );
    dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY, moved: 0 };
    document.body.style.cursor = 'grabbing';
    // Notify parent that the user has interacted for the first time (hint dismiss).
    if (!firstInteractionFiredRef.current) {
      firstInteractionFiredRef.current = true;
      onFirstInteraction?.();
    }
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = e.clientX - drag.lastX;
    const dy = e.clientY - drag.lastY;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    const group = gemGroupRef.current;
    if (group) {
      group.rotation.y += dx * 0.005;
      group.rotation.x += dy * 0.005;
    }
    angularVelRef.current = { x: dy * 0.002, y: dx * 0.002 };
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    try {
      (e.target as Element & { releasePointerCapture(id: number): void }).releasePointerCapture(
        e.pointerId
      );
    } catch {
      // Capture may already be released (e.g. lost capture fired first).
    }
    if (drag.moved < 6) {
      // Tap (not a drag): always pulse; toggle the breath morph ONLY when the
      // story is settled on the gem (hero/CTA) — elsewhere scroll owns the
      // shape and a toggle would fight the story.
      story.pulse();
      const frame = frameRef.current;
      const settledOnGem = !frame || (frame.from === frame.to && frame.to === 'gem');
      if (settledOnGem) {
        story.setTarget(story.state.to === 'gem' ? 'gemBreath' : 'gem');
      }
    }
    drag.active = false;
    document.body.style.cursor = 'grab';
  };

  return (
    <>
      {/* Lighting: gold key (upper-left), gold rimlight (behind-right), cool fill, deep red ambient */}
      <directionalLight color="#FFD700" intensity={3.8} position={[-5, 6, 4]} />
      <directionalLight color="#FFD060" intensity={2.0} position={[5, 2, -4]} />
      <directionalLight color="#7E9BC4" intensity={0.45} position={[4, -3, 2]} />
      <ambientLight color="#3A0A0E" intensity={0.6} />

      {/* Procedural royal environment — full tier only, zero network requests */}
      {profile.tier === 'full' && (
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={4} color="#FFD700" position={[-3, 2, 2]} scale={[3, 2, 1]} />
          <Lightformer intensity={2} color="#F5E6D3" position={[3, 1, -2]} scale={[2, 3, 1]} />
          <Lightformer
            intensity={1.5}
            color="#DC143C"
            position={[0, -3, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            scale={[4, 4, 1]}
          />
        </Environment>
      )}

      <Backdrop focusX={focusX} focusY={focusY} fade={fadeUniform} />

      <group ref={gemGroupRef} position={[gemX, gemY, 0]} rotation={[0.35, 0, -0.15]}>
        {/* Inner group for magnetic lean — isolated so lean doesn't fight
            the outer group's drag/inertia/ambient-rotation. */}
        <group ref={leanRef}>
          <mesh
            geometry={geometry}
            material={material}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </group>
      </group>

      <Dust count={dustCount} animate={profile.animate} fade={fadeUniform} />
    </>
  );
};

export default JewelRig;
