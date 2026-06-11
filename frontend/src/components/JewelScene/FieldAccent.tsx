import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Box } from '@chakra-ui/react';
import { usePerfProfile } from '../../hooks/usePerfProfile';
import FieldLayer from './FieldLayer';

/**
 * FieldAccent — site-wide ambient accent layer.
 *
 * A sparse, non-interactive instance of the FieldLayer particle stream that
 * sits fixed behind every page (zIndex 0, pointer-events disabled). Transparent
 * canvas: page background shows through; density 0.15 keeps it subtle and
 * skips the glow sprites per FieldLayer's props contract.
 */
export const FieldAccent: React.FC = () => {
  const profile = usePerfProfile();
  return (
    <Box position="fixed" inset={0} zIndex={0} pointerEvents="none" aria-hidden="true">
      <Canvas
        dpr={profile.dpr}
        frameloop={profile.animate ? 'always' : 'never'}
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 8], fov: 40 }}
      >
        <Suspense fallback={null}>
          <FieldLayer density={0.15} interactive={false} />
        </Suspense>
      </Canvas>
    </Box>
  );
};

export default FieldAccent;
