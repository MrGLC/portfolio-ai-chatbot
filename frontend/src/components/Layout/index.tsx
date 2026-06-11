import React, { Suspense, lazy } from 'react';
import { Box, Container } from '@chakra-ui/react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';

const FieldAccent = lazy(() => import('../JewelScene/FieldAccent'));

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      {/* Site-wide sparse particle accent layer */}
      <Suspense fallback={null}>
        <FieldAccent />
      </Suspense>
      
      {/* Global red tint overlay */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        pointerEvents="none"
        bgGradient="linear(to-b, rgba(139, 0, 0, 0.15), rgba(220, 20, 60, 0.1), rgba(139, 0, 0, 0.15))"
        zIndex={1}
      />
      
      <Box minH="100vh" position="relative">
        <Navigation />
        
        <Box as="main" pt={{ base: "92px", md: "92px" }} position="relative" zIndex={2}>
          {children}
        </Box>
        
        {/* Above <main> (zIndex 2): the Home scroll-story canvas is fixed
            inside main and would otherwise intercept clicks on footer links */}
        <Box position="relative" zIndex={3}>
          <Footer />
        </Box>

        {/* Fixed Position Elements */}
        <ScrollToTop />
      </Box>
    </>
  );
};