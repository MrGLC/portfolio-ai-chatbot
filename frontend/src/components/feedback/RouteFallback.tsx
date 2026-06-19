import React from 'react';
import { Box, Spinner } from '@chakra-ui/react';
import { useReducedMotion } from 'framer-motion';

// Quiet branded loading skin sized to the viewport so lazy-route navigation
// never flashes blank. Honors reduced-motion (static dot instead of spinner).
export const RouteFallback: React.FC = () => {
  const reduced = useReducedMotion();
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="brand.cream"
      aria-busy="true"
      aria-live="polite"
    >
      {reduced ? (
        <Box w={2.5} h={2.5} borderRadius="full" bg="brand.secondary" />
      ) : (
        <Spinner
          thickness="2px"
          speed="0.7s"
          size="lg"
          color="brand.secondary"
          emptyColor="rgba(24,20,40,.08)"
        />
      )}
    </Box>
  );
};

export default RouteFallback;
