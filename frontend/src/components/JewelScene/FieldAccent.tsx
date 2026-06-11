import React, { Suspense, lazy } from 'react';
import { Box } from '@chakra-ui/react';
import { usePerfProfile } from '../../hooks/usePerfProfile';

// Lazy: the three.js graph only downloads when the full tier mounts it.
const FieldAccentCanvas = lazy(() => import('./FieldAccentCanvas'));

/**
 * FieldAccent — site-wide ambient accent layer (tier gate, three-free).
 *
 * Lite tier (phones / reduced motion): a static CSS radial gradient stands in
 * for the particle stream — no Canvas, no three.js chunk ever requested.
 * Full tier: lazy-mounts FieldAccentCanvas (the real particle layer).
 */
export const FieldAccent: React.FC = () => {
  const profile = usePerfProfile();
  if (profile.tier === 'lite') {
    return (
      <Box
        position="fixed"
        inset={0}
        zIndex={0}
        pointerEvents="none"
        aria-hidden="true"
        bgGradient="radial(rgba(220,20,60,0.06) 0%, transparent 60%)"
      />
    );
  }
  return (
    <Suspense fallback={null}>
      <FieldAccentCanvas />
    </Suspense>
  );
};

export default FieldAccent;
