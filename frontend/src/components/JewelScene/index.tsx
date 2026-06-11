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
      // WebGL unavailable — static CSS stand-in keeps the hero composed
      return <Box position="absolute" inset={0} bgGradient="radial(#5A1020 20%, #1A0508 75%)" />;
    }
    return this.props.children;
  }
}

export const JewelScene: React.FC = () => {
  const profile = usePerfProfile();
  return (
    <Box position="absolute" inset={0} aria-hidden="true">
      <SceneErrorBoundary>
        <JewelStoryProvider>
          <Canvas
            dpr={profile.dpr}
            frameloop={profile.animate ? 'always' : 'never'}
            gl={{ antialias: profile.tier === 'full', alpha: false, powerPreference: 'high-performance' }}
            camera={{ position: [0, 0, 8], fov: 40 }}
          >
            <color attach="background" args={['#140306']} />
            <Suspense fallback={null}>
              <FieldLayer />
              <JewelRig />
            </Suspense>
          </Canvas>
        </JewelStoryProvider>
      </SceneErrorBoundary>
    </Box>
  );
};

export default JewelScene;
