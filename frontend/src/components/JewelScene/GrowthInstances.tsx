// src/components/JewelScene/GrowthInstances.tsx
// Beat-3 multiply engine: one mini growth chart per project card, docked at
// the card's [data-jewel-anchor="project-i"] slot. Bars grow when THEIR card
// enters the viewport (IntersectionObserver), not with global scroll.
// Full tier only; mounted by JewelRig.
//
// Spec deviation, accepted (task-6 brief): the spec's exit "convergence" (N
// instances flying into one body) is simplified to instances holding position
// while the section scrolls away (visibleRef gates count to 0 off-screen) +
// the main gem's glide-to-CTA selling the handoff. Do not build convergence
// animation here — see the brief for the follow-up note.
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { fractionToWorld } from './chapterResolver';
import { rectToPose } from './anchorPose';

const BAR_COUNT = 3;
const MAX_INSTANCES = 12; // up to 4 cards × 3 bars
const GOLD = new THREE.Color('#c2a05c');
const CRIMSON = new THREE.Color('#8a1626');

export const GrowthInstances: React.FC = () => {
  const size = useThree((s) => s.size);
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const slotsRef = useRef<HTMLElement[]>([]);
  const rectsRef = useRef<DOMRect[]>([]); // cached per-slot rects (useJewelAnchors pattern)
  const grownRef = useRef<number[]>([]); // 0..1 growth per card
  const visibleRef = useRef(false);

  const mesh = useMemo(() => {
    const geo = new THREE.BoxGeometry(0.16, 1, 0.16);
    geo.translate(0, 0.5, 0); // grow upward from the baseline
    const mat = new THREE.MeshStandardMaterial({ metalness: 0.6, roughness: 0.3 });
    const m = new THREE.InstancedMesh(geo, mat, MAX_INSTANCES);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    // Pre-allocate instanceColor: setColorAt would lazily create it with
    // StaticDrawUsage, but colors are rewritten every frame.
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_INSTANCES * 3), 3);
    m.instanceColor.setUsage(THREE.DynamicDrawUsage);
    m.count = 0;
    m.frustumCulled = false;
    return m;
  }, []);

  useEffect(() => () => { mesh.geometry.dispose(); (mesh.material as THREE.Material).dispose(); }, [mesh]);

  useEffect(() => {
    // Clamp discovery to the instance budget: a 5th card (i18n-only change)
    // must never overflow the buffer silently.
    const slots = Array.from(document.querySelectorAll<HTMLElement>('[data-jewel-anchor^="project-"]'))
      .slice(0, Math.floor(MAX_INSTANCES / BAR_COUNT));
    slotsRef.current = slots;
    grownRef.current = slots.map(() => 0);

    // Rect cache: measured once on discovery, then rAF-batched on scroll/resize
    // (same discipline as useJewelAnchors) — useFrame reads only the cache.
    let rafPending = false;
    const measure = () => {
      rafPending = false;
      rectsRef.current = slotsRef.current.map((el) => el.getBoundingClientRect());
    };
    const requestMeasure = () => {
      if (rafPending) return;
      rafPending = true;
      requestAnimationFrame(measure);
    };
    measure();

    const ios = slots.map((el, i) => {
      const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) grownRef.current[i] = grownRef.current[i] || 0.001; },
        { threshold: 0.4 });
      io.observe(el);
      return io;
    });
    const section = document.getElementById('story-portfolio');
    let sectionIo: IntersectionObserver | undefined;
    if (section) {
      sectionIo = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; }, { threshold: 0.05 });
      sectionIo.observe(section);
    }
    window.addEventListener('scroll', requestMeasure, { passive: true });
    window.addEventListener('resize', requestMeasure);
    return () => {
      window.removeEventListener('scroll', requestMeasure);
      window.removeEventListener('resize', requestMeasure);
      ios.forEach((io) => io.disconnect());
      sectionIo?.disconnect();
    };
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);

  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const { width, height } = sizeRef.current;
    const aspect = width / Math.max(1, height);
    const slots = slotsRef.current;
    if (!visibleRef.current || slots.length === 0) { mesh.count = 0; return; }

    let idx = 0;
    slots.forEach((_el, i) => {
      const rect = rectsRef.current[i];
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      // ease growth once triggered
      if (grownRef.current[i] > 0) {
        grownRef.current[i] = Math.min(1, grownRef.current[i] + dt * 1.6);
      }
      // easing.linear is the identity — skip the maath call and read the ref directly.
      const g = grownRef.current[i]; // 0..1
      const pose = rectToPose(rect, width, height);
      const world = fractionToWorld(pose.x, pose.y, aspect);
      const slotWorldH = pose.s * 2.6; // rectToPose fit: world size of the slot
      for (let b = 0; b < BAR_COUNT; b++) {
        const barH = slotWorldH * (0.35 + 0.3 * b) * g;
        dummy.position.set(world.x + (b - 1) * slotWorldH * 0.32, world.y - slotWorldH / 2, 0);
        dummy.scale.set(slotWorldH * 0.9, Math.max(0.0001, barH), slotWorldH * 0.9);
        dummy.updateMatrix();
        mesh.setMatrixAt(idx, dummy.matrix);
        color.copy(GOLD).lerp(CRIMSON, b / (BAR_COUNT - 1));
        mesh.setColorAt(idx, color);
        idx++;
      }
    });
    mesh.count = idx;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  return <primitive object={mesh} />;
};

export default GrowthInstances;
