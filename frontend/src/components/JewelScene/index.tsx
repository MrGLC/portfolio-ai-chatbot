import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Box, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePerfProfile } from '../../hooks/usePerfProfile';
import { CAMERA_FOV, CAMERA_Z } from './chapterResolver';
import JewelRig from './JewelRig';
import type { JewelPointerHandlers } from './JewelRig';

class SceneErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      // WebGL unavailable — render nothing. The hero paints its own cream
      // background under the (now empty) canvas slot, so the page still
      // composes; a full-viewport stand-in would tint every section below.
      return null;
    }
    return this.props.children;
  }
}

/**
 * JewelScene — fixed transparent canvas ABOVE the content (jewel engine v2).
 *
 * Stacking contract (handoff): content sections sit at zIndex 1, this canvas
 * at zIndex 5 with pointerEvents none (content shows through — the canvas is
 * transparent — and receives every click EXCEPT under the small hit proxy),
 * Navigation at zIndex 1000 stays above the jewel.
 *
 * Hit proxy: the canvas never intercepts pointers; instead a circular <div>
 * tracks the jewel's screen position (JewelRig projects the group center and
 * calls onProxyRect ~every 6th frame; we mutate the div's style DIRECTLY —
 * no setState in the frame loop). The proxy carries the pointer handlers,
 * which the rig registers through a callback registry (registerPointerHandlers
 * prop -> handlersRef): plain DOM PointerEvents, native setPointerCapture on
 * the div. The proxy lives INSIDE the canvas wrapper so it shares the canvas
 * coordinate origin in both wrapper modes (fixed / reduced-motion absolute).
 *
 * Frameloop: rAF already pauses when document.hidden, so 'always' is safe;
 * reduced-motion gets 'never' plus an absolute (non-fixed) wrapper so the
 * static first frame scrolls away with the hero instead of sticking to the
 * viewport over later sections (drag still re-renders via invalidate()).
 */
export const JewelScene: React.FC = () => {
  const profile = usePerfProfile();
  const fixed = profile.animate;
  const { t } = useTranslation();

  // Hint pill state: visible while hero is in view AND not yet dismissed.
  const [heroVisible, setHeroVisible] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(() => {
    try {
      return !!localStorage.getItem('jewelHintDismissed');
    } catch {
      return false;
    }
  });

  // Observe #story-hero visibility with an IntersectionObserver. We can't use
  // the shared useInViewport hook because that hook returns a ref to attach to
  // a new element — here we need to observe an existing DOM element by id.
  const ioRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    const attach = () => {
      const el = document.getElementById('story-hero');
      if (!el) return false;
      ioRef.current?.disconnect();
      ioRef.current = new IntersectionObserver(
        ([entry]) => setHeroVisible(entry.isIntersecting),
        { threshold: 0.1 }
      );
      ioRef.current.observe(el);
      return true;
    };
    // story-hero may not exist until HomePage mounts (lazy-loaded).
    if (!attach()) {
      const id = window.setTimeout(attach, 500);
      return () => {
        window.clearTimeout(id);
        ioRef.current?.disconnect();
      };
    }
    return () => {
      ioRef.current?.disconnect();
    };
  }, []);

  // Called by JewelRig on first pointerdown: dismiss and persist the flag.
  const handleFirstInteraction = useCallback(() => {
    if (hintDismissed) return;
    try {
      localStorage.setItem('jewelHintDismissed', '1');
    } catch {
      // Storage may be blocked in private mode — dismiss for this session only.
    }
    setHintDismissed(true);
  }, [hintDismissed]);

  /* ---- Hit proxy plumbing ---- */
  const proxyRef = useRef<HTMLDivElement>(null);
  const handlersRef = useRef<JewelPointerHandlers | null>(null);

  // Callback registry: the rig hands its pointer handlers up on mount.
  const registerPointerHandlers = useCallback((h: JewelPointerHandlers | null) => {
    handlersRef.current = h;
  }, []);

  // ~Every 6th frame the rig reports the jewel's screen circle (canvas CSS px).
  // Direct DOM style mutation — the frame loop must never setState.
  const handleProxyRect = useCallback((x: number, y: number, r: number) => {
    const el = proxyRef.current;
    if (!el) return;
    const d = r * 2;
    el.style.width = `${d}px`;
    el.style.height = `${d}px`;
    el.style.transform = `translate3d(${x - r}px, ${y - r}px, 0)`;
  }, []);

  const showHint = heroVisible && !hintDismissed;

  return (
    <>
      <Box
        position={fixed ? 'fixed' : 'absolute'}
        top={0}
        left={0}
        right={0}
        bottom={fixed ? 0 : undefined}
        height={fixed ? undefined : '100vh'}
        zIndex={5}
        pointerEvents="none"
        aria-hidden="true"
      >
        <SceneErrorBoundary>
          <Canvas
            dpr={profile.dpr}
            frameloop={profile.animate ? 'always' : 'never'}
            gl={{ antialias: profile.tier === 'full', alpha: true, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV }}
          >
            <Suspense fallback={null}>
              <JewelRig
                onFirstInteraction={handleFirstInteraction}
                onProxyRect={handleProxyRect}
                registerPointerHandlers={registerPointerHandlers}
              />
            </Suspense>
          </Canvas>
        </SceneErrorBoundary>

        {/* Hit proxy — the only interactive surface of the jewel layer.
            Starts at size 0 (no hits) until the rig reports the first rect.
            touchAction none: pointermove drives the drag on touch too (the
            rest of the viewport scrolls normally — the canvas ignores input). */}
        <div
          ref={proxyRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            borderRadius: '50%',
            pointerEvents: 'auto',
            touchAction: 'none',
            cursor: 'grab',
            zIndex: 6,
          }}
          onPointerDown={(e) => handlersRef.current?.down(e.nativeEvent, e.currentTarget)}
          onPointerMove={(e) => handlersRef.current?.move(e.nativeEvent)}
          onPointerUp={(e) => handlersRef.current?.up(e.nativeEvent, e.currentTarget)}
          onPointerCancel={() => handlersRef.current?.cancel()}
          onLostPointerCapture={() => handlersRef.current?.cancel()}
        />
      </Box>

      {/* Drag hint pill — DOM overlay near the gem's hero position.
          pointerEvents none: it's a pure signpost, never captures input.
          Responsive position: desktop right-centre, mobile bottom-centre.
          Uses a plain motion.div for framer-motion float; a style tag below
          handles the responsive positioning via a media query so we avoid
          the Chakra `as` prop type collision with framer-motion's transition. */}
      {showHint && (
        <>
          <style>{`
            /* Centering uses left/right 0 + flex, NOT translateX(-50%):
               framer-motion's y float writes its own inline transform on the
               inner motion.div, and a transform here on a single-sided anchor
               would leave the pill off-center on mobile. */
            .jewel-hint-pill {
              position: fixed;
              /* 16%: sits over the gem, clear of the hero CTA buttons above
                 and the scroll chevron below at scrollY 0 on a 390x844 view */
              bottom: 16%;
              left: 0;
              right: 0;
              display: flex;
              justify-content: center;
              z-index: 7; /* above the z5 canvas + z6 hit proxy */
              pointer-events: none;
            }
            @media (min-width: 768px) {
              .jewel-hint-pill {
                right: 18%;
                top: 52%;
                bottom: auto;
                left: auto;
                display: block;
              }
            }
          `}</style>
          <div className="jewel-hint-pill">
          <motion.div
            animate={{ y: [0, -4, 0, 4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Box
              px={3}
              py={1.5}
              borderRadius="full"
              bg="rgba(255, 255, 255, 0.65)"
              backdropFilter="blur(8px)"
              border="1px solid"
              borderColor="rgba(194, 160, 92, 0.35)"
              boxShadow="0 2px 12px rgba(24, 20, 40, 0.08)"
            >
              <Text
                fontSize="xs"
                color="blackAlpha.700"
                fontWeight="medium"
                letterSpacing="0.03em"
                whiteSpace="nowrap"
              >
                {t('home.jewel.hint')}
              </Text>
            </Box>
          </motion.div>
          </div>
        </>
      )}
    </>
  );
};

export default JewelScene;
