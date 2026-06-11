import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Box, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePerfProfile } from '../../hooks/usePerfProfile';
import { JewelStoryProvider } from './useJewelStory';
import FieldLayer from './FieldLayer';
import JewelRig from './JewelRig';

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
      // WebGL unavailable — render nothing. The hero paints its own #140306
      // background under the (now empty) canvas slot, so the page still
      // composes; a full-viewport stand-in would darken every section below.
      return null;
    }
    return this.props.children;
  }
}

/**
 * JewelScene — fixed, transparent scroll-story canvas.
 *
 * The canvas spans the viewport at zIndex 0; Home sections sit above it at
 * zIndex >= 1 (so all content receives clicks first), while the hero's dark
 * background paints below it. The jewel travels and morphs with scroll
 * (JewelRig reads window.scrollY against the story-* section ranges).
 *
 * Frameloop: rAF already pauses when document.hidden, so 'always' is safe;
 * reduced-motion gets 'never' plus an absolute (non-fixed) wrapper so the
 * static first frame scrolls away with the hero instead of sticking to the
 * viewport over later sections.
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
        zIndex={0}
        aria-hidden="true"
      >
        <SceneErrorBoundary>
          <JewelStoryProvider>
            <Canvas
              dpr={profile.dpr}
              frameloop={profile.animate ? 'always' : 'never'}
              gl={{ antialias: profile.tier === 'full', alpha: true, powerPreference: 'high-performance' }}
              camera={{ position: [0, 0, 8], fov: 40 }}
            >
              <Suspense fallback={null}>
                <FieldLayer fadeWithHero />
                <JewelRig onFirstInteraction={handleFirstInteraction} />
              </Suspense>
            </Canvas>
          </JewelStoryProvider>
        </SceneErrorBoundary>
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
            .jewel-hint-pill {
              position: fixed;
              bottom: 22%;
              left: 50%;
              transform: translateX(-50%);
              z-index: 1;
              pointer-events: none;
            }
            @media (min-width: 768px) {
              .jewel-hint-pill {
                right: 18%;
                top: 52%;
                bottom: auto;
                left: auto;
                transform: none;
              }
            }
          `}</style>
          <motion.div
            className="jewel-hint-pill"
            animate={{ y: [0, -4, 0, 4, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Box
              px={3}
              py={1.5}
              borderRadius="full"
              bg="whiteAlpha.100"
              backdropFilter="blur(8px)"
              border="1px solid"
              borderColor="whiteAlpha.200"
              boxShadow="0 2px 12px rgba(0,0,0,0.3)"
            >
              <Text
                fontSize="xs"
                color="whiteAlpha.700"
                fontWeight="medium"
                letterSpacing="0.03em"
                whiteSpace="nowrap"
              >
                {t('home.jewel.hint')}
              </Text>
            </Box>
          </motion.div>
        </>
      )}
    </>
  );
};

export default JewelScene;
