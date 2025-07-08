import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { ScrollToTop } from './ScrollToTop';
import { AnimatedBackground, EnhancedAnimatedBackground, RoyalAnimatedBackground, ModernAnimatedBackground, ModernAnimatedBackgroundV2, RedJewelBackground } from '../ThreeBackground';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <>
      {/* Red Jewel Background with sharp, shiny red crystals */}
      <RedJewelBackground intensity={1} />
      
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
        
        <Footer />
        
        {/* Fixed Position Elements */}
        <ScrollToTop />
      </Box>
    </>
  );
};