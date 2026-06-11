import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Box } from '@chakra-ui/react';
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
  return (
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
              <JewelRig />
            </Suspense>
          </Canvas>
        </JewelStoryProvider>
      </SceneErrorBoundary>
    </Box>
  );
};

export default JewelScene;
