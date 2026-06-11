import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Box } from '@chakra-ui/react';
import { usePerfProfile } from '../../hooks/usePerfProfile';
import FieldLayer from './FieldLayer';

/**
 * HalfRateDriver — caps the accent canvas at ~30fps.
 *
 * The Canvas runs frameloop="demand"; this child invalidates every 33ms so
 * render calls are genuinely halved versus 'always'. FieldLayer advances
 * uTime by real frame delta, so motion speed is unchanged — frames are just
 * coarser, which is invisible on a background accent.
 */
const HalfRateDriver: React.FC = () => {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const id = setInterval(() => invalidate(), 33);
    return () => clearInterval(id);
  }, [invalidate]);
  return null;
};

/**
 * FieldAccentCanvas — the three.js half of the site-wide ambient accent.
 *
 * Split out of FieldAccent so the gate module stays three-free: this chunk
 * (and the three.js graph it drags in) only downloads on the 'full' tier.
 * Sparse, non-interactive FieldLayer on a transparent fixed canvas.
 */
export const FieldAccentCanvas: React.FC = () => {
  const profile = usePerfProfile();
  return (
    <Box position="fixed" inset={0} zIndex={0} pointerEvents="none" aria-hidden="true">
      <Canvas
        dpr={profile.dpr}
        frameloop="demand"
        gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
        camera={{ position: [0, 0, 8], fov: 40 }}
      >
        {profile.animate && <HalfRateDriver />}
        <Suspense fallback={null}>
          <FieldLayer density={0.15} interactive={false} />
        </Suspense>
      </Canvas>
    </Box>
  );
};

export default FieldAccentCanvas;
