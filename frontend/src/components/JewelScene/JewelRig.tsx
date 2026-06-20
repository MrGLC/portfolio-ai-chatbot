import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { easing } from 'maath';
import { usePerfProfile } from '../../hooks/usePerfProfile';
import {
  chapterChanged,
  fractionToWorld,
  worldToFraction,
  VIS_H,
} from './chapterResolver';
import type { SectionRange, ShapeName } from './chapterResolver';
import { resolvePose, BEAT_IDS } from './storyTimeline';
import { buildShapes, SHAPE_NAMES } from './shapes';

/**
 * JewelRig — sticky-scrub engine (jewel engine v3, storyTimeline choreography).
 *
 * One Group holds seven costume meshes (shapes.ts); morph weights scrub
 * continuously with scroll progress via storyTimeline.resolvePose(). The group
 * eases toward the scrubbed pose (kEase 0.18) so motion feels smooth but always
 * tracks scroll position — no dash-to-nearest-chapter jump.
 *
 * All engine state lives in refs and is advanced inside useFrame — React
 * renders this component only on mount/profile change.
 *
 * Position easing happens in viewport-FRACTION space (curRef.x/y):
 * fractionToWorld converts to world units only at write time. The hit proxy
 * goes the other way (worldToFraction) — one shared helper pair, no unit drift.
 *
 * Interaction arrives from OUTSIDE the canvas: the composition root mounts a
 * screen-space hit-proxy <div> (the canvas itself is pointer-events: none)
 * and forwards its PLAIN DOM PointerEvents through registerPointerHandlers.
 * No r3f raycasting is involved.
 */

export interface JewelPointerHandlers {
  /** el = the proxy div; pointer capture is set on it (native DOM API). */
  down(e: PointerEvent, el: HTMLElement): void;
  move(e: PointerEvent): void;
  up(e: PointerEvent, el: HTMLElement): void;
  /** lostpointercapture / pointercancel — abort the drag, never stick. */
  cancel(): void;
}

interface JewelRigProps {
  /** Called once on the first pointerdown (dismisses the hint pill). */
  onFirstInteraction?: () => void;
  /**
   * Screen-space jewel circle for the hit proxy, in canvas CSS px:
   * center (x, y) + radius r. Called ~every 6th frame; the receiver mutates
   * the proxy div's style directly (no setState in the frame loop).
   */
  onProxyRect?: (x: number, y: number, r: number) => void;
  /** Callback-registry handle: rig hands its pointer handlers up on mount. */
  registerPointerHandlers?: (handlers: JewelPointerHandlers | null) => void;
  /** Fired with the active chapter id ONLY when it changes (≈4×/scroll).
   *  Never per frame — drives the DOM ChapterLabel. */
  onChapterChange?: (id: string) => void;
}

/** Generous bounding radius of the largest costume in world units (growth
 * columns reach ~2.3 in x); multiplied by the live group scale for the proxy. */
const JEWEL_WORLD_RADIUS = 1.3;

interface DragState {
  active: boolean;
  lastX: number;
  lastY: number;
  moved: number;
}

export const JewelRig: React.FC<JewelRigProps> = ({
  onFirstInteraction,
  onProxyRect,
  registerPointerHandlers,
  onChapterChange,
}) => {
  const profile = usePerfProfile();
  const invalidate = useThree((state) => state.invalidate);
  const size = useThree((state) => state.size);
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const lite = profile.tier === 'lite';
  const reduced = !profile.animate;

  const groupRef = useRef<THREE.Group>(null);

  /* ---- The cast: six meshes + dust, built once ---- */
  const shapes = useMemo(() => buildShapes(), []);
  const dust = useMemo(() => {
    // Gold-dust court: 200 points on a flattened spherical shell (y * 0.72),
    // 50/50 gold #e6b964 / crimson #d11e44, size 0.042 (handoff spec).
    const n = 200;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const cA = new THREE.Color(0xe6b964);
    const cB = new THREE.Color(0xd11e44);
    for (let i = 0; i < n; i++) {
      const r = 2.1 + Math.random() * 1.3;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.72;
      pos[i * 3 + 2] = r * Math.cos(ph);
      const c = Math.random() < 0.5 ? cA : cB;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.042,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    return points;
  }, []);

  useEffect(() => {
    return () => {
      // Dispose GPU resources on unmount (route change away from Home).
      for (const name of SHAPE_NAMES) {
        const { mesh, material } = shapes[name];
        (mesh as THREE.Mesh).geometry?.dispose();
        material.dispose();
        for (const child of mesh.children) {
          const line = child as THREE.LineSegments;
          line.geometry?.dispose();
          (line.material as THREE.Material)?.dispose();
        }
      }
      dust.geometry.dispose();
      (dust.material as THREE.Material).dispose();
    };
  }, [shapes, dust]);

  /* ---- Engine state: refs only, no React state in the loop ---- */
  // Eased pose in viewport-fraction space (prototype's `cur`).
  // Starts at the beat-0 (hero) pose from storyTimeline STOPS[0] — no grow-in.
  const cur0 = resolvePose(0, false);
  const curRef = useRef({ x: cur0.x, y: cur0.y, s: cur0.s, spin: cur0.spin, p: cur0.p });
  // Crossfade weights per costume.
  const weightsRef = useRef<Record<ShapeName, number>>({
    ico: 1, octa: 0, sphere: 0, knot: 0, crown: 0, growth: 0, neural: 0,
  });
  const elapsedRef = useRef(0);
  const tiltZRef = useRef(0);

  // Scroll: passive listener + moving-average velocity.
  const scrollRef = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const lastSyRef = useRef(scrollRef.current);
  const velRef = useRef(0);

  // Mouse, centered (-0.5..0.5) — parallax + tilt.
  const mouseRef = useRef({ x: 0, y: 0 });

  // Section ranges in document coordinates.
  const rangesRef = useRef<SectionRange[]>([]);

  // Drag/tap.
  const dragRef = useRef<DragState>({ active: false, lastX: 0, lastY: 0, moved: 0 });
  const dragTiltXRef = useRef(0); // user-applied x tilt, decays back to choreography
  const angularVelRef = useRef({ x: 0, y: 0 }); // drag inertia
  const pulseRef = useRef(0); // 1 on tap, decays in the loop
  const firstInteractionFiredRef = useRef(false);
  const frameCountRef = useRef(0);
  const lastChapterRef = useRef<string | null>(null);

  /* ---- Listeners: scroll, mouse, section measurement ---- */
  useEffect(() => {
    const measure = () => {
      const ranges: SectionRange[] = [];
      for (const id of BEAT_IDS) {
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
    const onPointerMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth - 0.5;
      mouseRef.current.y = e.clientY / window.innerHeight - 0.5;
    };
    onScroll();
    measure();
    // Lazy-loaded content (chatbot canvas chunk) shifts section offsets after
    // mount — re-measure once the layout has had time to settle.
    const remeasure = window.setTimeout(measure, 1500);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      window.clearTimeout(remeasure);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, []);

  /* ---- Pointer handlers — plain DOM events forwarded by the hit proxy ---- */
  useEffect(() => {
    if (!registerPointerHandlers) return;
    const handlers: JewelPointerHandlers = {
      down: (e, el) => {
        // The proxy is a real <div>: native setPointerCapture works directly
        // (unlike r3f's Object3D polyfill in the retired raycast handlers).
        try {
          el.setPointerCapture(e.pointerId);
        } catch {
          // Capture can fail if the pointer is already gone — drag still works.
        }
        dragRef.current = { active: true, lastX: e.clientX, lastY: e.clientY, moved: 0 };
        document.body.style.cursor = 'grabbing';
        el.style.cursor = 'grabbing';
        if (!firstInteractionFiredRef.current) {
          firstInteractionFiredRef.current = true;
          onFirstInteraction?.();
        }
      },
      move: (e) => {
        const drag = dragRef.current;
        if (!drag.active) return;
        const dx = e.clientX - drag.lastX;
        const dy = e.clientY - drag.lastY;
        drag.moved += Math.abs(dx) + Math.abs(dy);
        const group = groupRef.current;
        if (group) group.rotation.y += dx * 0.005;
        dragTiltXRef.current += dy * 0.005;
        angularVelRef.current = { x: dy * 0.002, y: dx * 0.002 };
        drag.lastX = e.clientX;
        drag.lastY = e.clientY;
        invalidate(); // reduced motion runs frameloop 'never' — render the drag
      },
      up: (e, el) => {
        const drag = dragRef.current;
        if (!drag.active) return;
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          // Capture may already be released.
        }
        if (drag.moved < 6) {
          pulseRef.current = 1; // tap: scale flash (morph toggle is retired)
          invalidate();
        }
        drag.active = false;
        document.body.style.cursor = '';
        el.style.cursor = 'grab';
      },
      cancel: () => {
        dragRef.current.active = false;
        document.body.style.cursor = '';
      },
    };
    registerPointerHandlers(handlers);
    return () => {
      registerPointerHandlers(null);
      document.body.style.cursor = '';
    };
  }, [registerPointerHandlers, onFirstInteraction, invalidate]);

  /* ---- The loop ---- */
  // document.hidden needs no special handling: rAF (and therefore useFrame)
  // auto-pauses in hidden tabs.
  useFrame((_, rawDelta) => {
    const group = groupRef.current;
    if (!group) return;
    const dt = Math.min(rawDelta, 0.05);
    elapsedRef.current += dt;
    const t = elapsedRef.current;
    const cur = curRef.current;
    const { width, height } = sizeRef.current;
    const aspect = width / Math.max(1, height);

    // Scroll velocity: moving average of the per-frame delta.
    const sy = scrollRef.current;
    velRef.current = velRef.current * 0.92 + (sy - lastSyRef.current) * 0.08;
    lastSyRef.current = sy;
    const vel = velRef.current;
    const m = mouseRef.current;

    // 1. Scroll progress across the story span (first beat top → last beat bottom).
    const ranges = rangesRef.current;
    let progress = 0;
    if (ranges.length > 0) {
      const top = ranges[0].top;
      const bottom = ranges[ranges.length - 1].bottom;
      const span = Math.max(1, bottom - top - window.innerHeight);
      progress = (sy - top) / span;
    }
    const pose = resolvePose(progress, lite);

    // Emit the active beat to React only on change — drives the DOM label.
    const beatId = BEAT_IDS[pose.beat];
    if (onChapterChange && chapterChanged(lastChapterRef.current, beatId)) {
      lastChapterRef.current = beatId;
      onChapterChange(beatId);
    }

    // 2. Cinematic damp toward the scrubbed pose: maath's frame-rate-independent
    //    exponential easing (smooth attack, long gentle settle, interruptible) —
    //    replaces the old linear lerp that felt mechanical. Reduced motion snaps.
    if (reduced) {
      cur.x = pose.x; cur.y = pose.y; cur.s = pose.s; cur.spin = pose.spin; cur.p = pose.p;
    } else {
      easing.damp(cur, 'x', pose.x, 0.34, dt);
      easing.damp(cur, 'y', pose.y, 0.34, dt);
      easing.damp(cur, 's', pose.s, 0.5, dt);
      easing.damp(cur, 'spin', pose.spin, 0.5, dt);
      easing.damp(cur, 'p', pose.p, 0.5, dt);
    }
    const dist = Math.hypot(pose.x - cur.x, pose.y - cur.y);
    const settled = Math.max(0, 1 - dist * 9);

    // 3. Fraction -> world position (+ mouse parallax, + settled y-bob).
    const world = fractionToWorld(cur.x, cur.y, aspect);
    const bob = reduced ? 0 : Math.sin(t * 0.7) * 0.07 * cur.s;
    group.position.x = world.x + m.x * 0.22;
    group.position.y = world.y + bob - m.y * 0.16;

    // 4. Yields in transit (shrinks), breathes when settled; tap pulse on top.
    //    vpScale keeps the gem from overflowing small/short viewports (it was
    //    near full-height at 1080p) — shrinks below ~900px min dimension.
    const vpScale = Math.min(1, Math.max(0.55, Math.min(width, height) / 900));
    const yieldF = 1 - Math.min(0.3, dist * 1.25);
    const breath = reduced ? 1 : 1 + Math.sin(t * 1.15) * 0.028 * settled;
    group.scale.setScalar(Math.max(0.0001, cur.s * vpScale * yieldF * breath * (1 + pulseRef.current * 0.12)));
    pulseRef.current *= Math.pow(0.85, dt * 60);

    // 5. Spin: rest drift + scroll impulse + extra while dashing; mouse tilt;
    //    scroll-velocity z lean. Drag adds rotation.y directly in the handler;
    //    its x tilt rides on top and decays back to the choreography.
    const av = angularVelRef.current;
    if (!dragRef.current.active) {
      group.rotation.y += av.y;
      dragTiltXRef.current += av.x;
    }
    const inertiaDecay = Math.pow(0.95, dt * 60);
    av.x *= inertiaDecay;
    av.y *= inertiaDecay;
    if (!dragRef.current.active) {
      dragTiltXRef.current *= Math.pow(0.985, dt * 60); // hand the tilt back
    }
    if (!reduced) {
      group.rotation.y += dt * cur.spin + vel * 0.0006 + dist * dt * 2.6;
      group.rotation.x = Math.sin(t * 0.3) * 0.1 + m.y * 0.25 + dragTiltXRef.current;
      tiltZRef.current +=
        (Math.max(-140, Math.min(140, vel)) * -0.0007 - tiltZRef.current) * 0.08;
      group.rotation.z = tiltZRef.current;
    } else {
      group.rotation.x = dragTiltXRef.current;
    }

    // 6. Costume crossfade — weights scrub directly with scroll progress.
    const w = weightsRef.current;
    for (const name of SHAPE_NAMES) {
      const target = pose.weights[name];
      w[name] += (target - w[name]) * (reduced ? 1 : 0.13);
      const mesh = shapes[name].mesh;
      mesh.visible = w[name] > 0.015;
      mesh.scale.setScalar(Math.max(0.0001, w[name]));
    }
    // Secondary idle motion (prototype): octa precesses, knot rolls.
    if (!reduced) {
      shapes.octa.mesh.rotation.y += dt * 0.25;
      shapes.knot.mesh.rotation.x += dt * 0.18;
    }
    // Crown: pulsing crimson emissive, scaled by its crossfade weight.
    (shapes.crown.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.18 + w.crown * (0.3 + Math.sin(t * 2.2) * 0.16);

    // 7. Dust trails behind its monarch; visible only where it adds (kf.p),
    //    dimmed further while in transit.
    dust.position.x += (group.position.x - dust.position.x) * 0.05;
    dust.position.y += (group.position.y - dust.position.y) * 0.05;
    dust.scale.setScalar(0.5 + cur.s * 0.65);
    if (!reduced) dust.rotation.y += dt * 0.04 + vel * 0.0002;
    const dustOpacity = Math.max(0, cur.p * (0.3 + 0.7 * settled));
    (dust.material as THREE.PointsMaterial).opacity = dustOpacity;
    dust.visible = dustOpacity > 0.02;

    // 8. Hit proxy: project the group center to canvas CSS px every 6th frame
    //    (direct DOM style mutation happens in the receiver — no setState).
    frameCountRef.current += 1;
    if (onProxyRect && frameCountRef.current % 6 === 1) {
      const frac = worldToFraction(group.position.x, group.position.y, aspect);
      const r = ((JEWEL_WORLD_RADIUS * cur.s * yieldF) / VIS_H) * height;
      // Cap the proxy so it never blankets a phone hero (a giant touchAction
      // surface was eating vertical swipes — found by the touch battery).
      const rCapped = Math.min(r, Math.min(width, height) * 0.28);
      onProxyRect(frac.fx * width, frac.fy * height, Math.max(24, rCapped));
    }
  });

  /* ---- Scene ---- */
  return (
    <>
      {/* Lighting — handoff values: warm key, gold point, pink rim. */}
      <ambientLight color="#ffffff" intensity={0.55} />
      <directionalLight color="#fff1d6" intensity={1.5} position={[-3, 4, 5]} />
      <pointLight color="#e8b765" intensity={1.25} distance={22} position={[-2.6, 2.6, 3.2]} />
      <directionalLight color="#ff5a7a" intensity={0.75} position={[4, -2, -3]} />

      <group ref={groupRef}>
        {SHAPE_NAMES.map((name) => (
          <primitive key={name} object={shapes[name].mesh} />
        ))}
      </group>

      <primitive object={dust} />
    </>
  );
};

export default JewelRig;
